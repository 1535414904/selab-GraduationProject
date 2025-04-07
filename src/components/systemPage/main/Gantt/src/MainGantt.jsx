import React, { useRef, useEffect, useState, useCallback } from "react";
import RoomSection from "./components/ROOM/RoomSection";
import TimeWrapper from "./components/Time/timeWrapper";
import GeneratePDFButton from "./components/Time/GeneratePDFButton";
import { fetchSurgeryData } from "./components/Data/ganttData";
import "./styles.css";
import GanttFilter from "./components/GanttFilter";
import { handleDragEnd, updateSurgeryInDatabase } from "./components/DragDrop/dragEndHandler";
import SurgeryModal from "./components/Modal/SurgeryModal";
import axios from "axios";
import { BASE_URL } from "/src/config";

// 主頁專用的甘特圖組件，預設只能查看，但可以切換到編輯模式
function MainGantt({ rows, setRows, mainGanttRef, user }) {
  const ganttChartRef = useRef(null);
  const timeScaleRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [filteredRows, setFilteredRows] = useState([]); // 儲存篩選後的結果
  const [readOnly, setReadOnly] = useState(true); // 預設為唯讀模式
  const [selectedSurgery, setSelectedSurgery] = useState(null); // 選中的手術
  const [modalError, setModalError] = useState(null); // 模態視窗錯誤
  const [hasChanges, setHasChanges] = useState(false); // 是否有未保存的變更
  const [isSaving, setIsSaving] = useState(false); // 是否正在保存
  const [userRole, setUserRole] = useState(user?.role || null); // 優先使用傳入的用戶角色
  const [tipsCollapsed, setTipsCollapsed] = useState(false);

  // 處理篩選結果 - 提前定義並使用 useCallback 包裝
  const handleFilterChange = useCallback((filteredData) => {
    setFilteredRows(filteredData);
  }, []);

  // 初始化數據
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await fetchSurgeryData(setRows, setLoading, setError, true);

        // 如果沒有通過props獲取到用戶角色，才嘗試從API獲取
        if (!user || user.role === undefined) {
          console.log("從props未獲取到用戶角色，嘗試從API獲取...");
          const username = localStorage.getItem('username');
          if (username) {
            try {
              const response = await axios.get(`${BASE_URL}/api/system/user/${username}`);
              setUserRole(response.data.role);
              console.log("從API獲取到用戶角色:", response.data.role);
            } catch (error) {
              console.error("獲取用戶信息失敗:", error);
            }
          }
        } else {
          console.log("從props獲取到用戶角色:", user.role);
        }
      } catch (error) {
        console.error("初始化數據失敗:", error);
        setError("初始化數據失敗");
        setLoading(false);
      }
    };

    initializeData();
  }, [user]);

  // 當傳入的user變化時，更新userRole
  useEffect(() => {
    if (user && user.role !== undefined) {
      console.log("用戶角色更新:", user.role);
      setUserRole(user.role);
    }
  }, [user]);

  // 當原始數據變更時，更新篩選後的結果
  useEffect(() => {
    setFilteredRows(rows);

    // 同時更新 mainGanttRef
    if (mainGanttRef && mainGanttRef.current) {
      mainGanttRef.current = {
        ...mainGanttRef.current,
        filteredRows: rows,
        setFilteredRows
      };
    }
  }, [rows, mainGanttRef]);

  // 監聽甘特圖數據更新事件
  useEffect(() => {
    const handleGanttDataUpdated = () => {
      console.log("收到甘特圖數據更新事件，強制重新渲染UI");

      // 確保狀態已更新
      if (mainGanttRef && mainGanttRef.current) {
        mainGanttRef.current.readOnly = true;
        mainGanttRef.current.hasChanges = false;
      }

      // 如果有篩選條件，則重新應用篩選
      if (filteredRows.length !== rows.length) {
        handleFilterChange([...rows]);
      }
    };

    window.addEventListener('ganttDataUpdated', handleGanttDataUpdated);

    return () => {
      window.removeEventListener('ganttDataUpdated', handleGanttDataUpdated);
    };
  }, [filteredRows, rows, handleFilterChange, mainGanttRef]);

  useEffect(() => {
    const handleResize = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 更新 mainGanttRef 以供 MainWrapper 訪問
  useEffect(() => {
    if (mainGanttRef && mainGanttRef.current) {
      mainGanttRef.current = {
        setHasChanges,
        filteredRows,
        setFilteredRows,
        readOnly,
        hasChanges
      };
    }
  }, [filteredRows, readOnly, mainGanttRef, setHasChanges, hasChanges]);

  // 額外監聽 hasChanges 的變化
  useEffect(() => {
    if (mainGanttRef && mainGanttRef.current) {
      console.log(`hasChanges 狀態變更為: ${hasChanges}`);
      mainGanttRef.current.hasChanges = hasChanges;
    }
  }, [hasChanges, mainGanttRef]);

  // 切換編輯模式
  const toggleEditMode = () => {
    // 記錄當前用戶角色
    console.log("切換編輯模式時的用戶角色:", userRole, "類型:", typeof userRole);
    console.log("直接從props獲取的用戶角色:", user?.role, "類型:", typeof user?.role);

    // 將角色轉換為數字進行比較
    const roleAsNumber = Number(userRole);

    // 檢查用戶權限，只有管理員(role=3)才能切換到編輯模式
    if (roleAsNumber !== 3) {
      alert("只有管理員才能進行編輯操作！");
      console.log("用戶角色檢查失敗，當前角色:", userRole, "轉換後:", roleAsNumber);
      return;
    }

    console.log("管理員權限檢查通過，當前角色:", userRole, "轉換後:", roleAsNumber);

    // 如果要從編輯模式切換到唯讀模式
    if (!readOnly) {
      console.log("切換到唯讀模式");

      // 直接調用保存函數
      confirmSaveChanges();
    } else {
      console.log("切換到編輯模式");
      setReadOnly(false);

      // 立即更新 mainGanttRef
      if (mainGanttRef && mainGanttRef.current) {
        mainGanttRef.current.readOnly = false;
        console.log("mainGanttRef 更新為編輯模式");
      }
    }
  };

  // 確認保存變更
  const confirmSaveChanges = async () => {
    console.log("開始執行保存變更...");
    setIsSaving(true);

    try {
      console.log("準備更新資料庫，filteredRows:", filteredRows);
      // 直接調用更新函數，一次性更新所有手術室資料
      const results = await updateSurgeryInDatabase(filteredRows);
      console.log("資料庫更新結果:", results);

      // 重新載入資料以確保顯示最新狀態
      try {
        console.log("開始重新載入最新資料...");

        // 先設置唯讀模式 - 避免用戶在資料載入過程中進行操作
        setReadOnly(true);

        // 清除現有數據，確保 UI 完全刷新
        setRows([]);
        setFilteredRows([]);

        // 標記無未保存變更
        setHasChanges(false);

        // 使用 fetchSurgeryData 函數重新載入並格式化數據
        await fetchSurgeryData(setRows, setLoading, setError, true);

        console.log("數據重新載入完成");

        // 更新 mainGanttRef
        if (mainGanttRef && mainGanttRef.current) {
          mainGanttRef.current.readOnly = true;
          mainGanttRef.current.hasChanges = false;
        }

        // 顯示通知
        alert("手術排程已成功保存！");

        // 強制觸發 UI 重新渲染
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('ganttDataUpdated'));

          // 保存成功後重新整理頁面
          window.location.reload();
        }, 500);

      } catch (error) {
        console.error('重新載入數據失敗:', error);
        throw error;
      }

    } catch (error) {
      console.error('保存或重新載入時發生錯誤:', error);
      console.error('錯誤詳情:', error.response?.data || error.message);
      alert(`保存失敗，請稍後再試。錯誤：${error.message}`);
      return false;
    } finally {
      setIsSaving(false);
      console.log("保存流程結束");
    }

    return true;
  };

  // 處理手術點擊事件，顯示詳細資訊
  const handleSurgeryClick = (surgery) => {
    console.log('主頁點擊的手術:', surgery);

    // 確保保留群組資訊
    if (surgery.isGroup) {
      console.log('這是一個群組手術，保留群組資訊');
    }

    setSelectedSurgery(surgery);
    setModalError(null);
  };

  // 處理拖拽結束事件，需要確保UI更新
  const onDragEndHandler = async (result) => {
    if (!result.destination || readOnly) return;

    console.log("主頁甘特圖拖曳結束，更新界面");

    // 處理拖曳結束
    const { updatedRows, hasChanges: dragHasChanges } = await handleDragEnd(result, filteredRows, setFilteredRows);

    // 確保UI更新
    window.dispatchEvent(new CustomEvent('ganttDragEnd'));

    if (dragHasChanges) {
      console.log("拖曳操作產生變更，更新 hasChanges 狀態");
      setHasChanges(true);

      // 確保 mainGanttRef 更新
      if (mainGanttRef && mainGanttRef.current) {
        mainGanttRef.current.hasChanges = true;
      }
    }
  };

  // 關閉模態視窗
  const handleCloseModal = () => {
    setSelectedSurgery(null);
  };

  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    setCurrentDate(formattedDate);
  }, []);

  // 初始化時讀取提示收合狀態
  useEffect(() => {
    const savedTipsState = localStorage.getItem('mainGanttTipsCollapsed');
    if (savedTipsState) {
      setTipsCollapsed(savedTipsState === 'true');
    }
  }, []);

  // 處理提示收合狀態變更
  const toggleTips = () => {
    const newState = !tipsCollapsed;
    setTipsCollapsed(newState);
    localStorage.setItem('mainGanttTipsCollapsed', newState.toString());
  };

  // 如果數據尚未載入，顯示載入中
  if (loading) {
    return (
      <div className="gantt-main-container">
        <div className="loading">
          <p>載入中，請稍候...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gantt-main-container">
      {/* 上方資訊區塊 */}
      <div className="gantt-header">
        <div className="gantt-title">
          <div className="gantt-date">
            <h2 className="gantt-title-text">{currentDate}手術排程甘特圖</h2>
            <p className="gantt-subtitle">顯示所有手術室的排程安排</p>
          </div>
        </div>

        {/* 手術室數量、編輯模式按鈕 & PDF 按鈕 */}
        <div className="gantt-actions">
          <div className="gantt-room-count">
            <svg className="gantt-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="gantt-room-count-text">共 {filteredRows.length} 間手術室</span>
          </div>

          <div className="gantt-buttons">
            {Number(userRole) === 3 && (
              <button
                className={`edit-mode-button ${!readOnly ? 'active' : ''}`}
                onClick={toggleEditMode}
                disabled={isSaving}
              >
                {readOnly ? '啟用移動修改' : '關閉移動修改'}
              </button>
            )}
            <GeneratePDFButton timeScaleRef={timeScaleRef} ganttChartRef={ganttChartRef} />
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className={`gantt-tips ${tipsCollapsed ? 'tips-collapsed' : ''}`}>
        <svg
          className="gantt-tips-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="currentColor"
        >
          <circle cx="12" cy="12" r="10" fill="#3B82F6" />
          <circle cx="12" cy="7" r="1.5" fill="white" />
          <rect x="11" y="9.5" width="2" height="6" rx="1" fill="white" />
        </svg>
        <div className="gantt-tips-content">
          <div className="tips-header">
            <p className="gantt-tips-title">使用提示</p>
            <button
              className="tips-toggle-button"
              onClick={toggleTips}
              aria-label={tipsCollapsed ? "展開說明" : "收合說明"}
            >
              {tipsCollapsed ? "展開" : "收合"}
            </button>
          </div>

          {!tipsCollapsed && (
            <ul className="gantt-tips-list">
              <li>可以橫向滾動查看不同時間段的排程</li>
              <li>點擊「生成 PDF」按鈕可將當前甘特圖生成 PDF 檔案</li>
              <li>點擊「啟用移動修改」按鈕可臨時調整排程位置</li>
              <li>點擊手術項目可查看詳細資訊</li>
              {!readOnly && <li><b style={{ color: "red" }}>完成修改後，點擊「關閉移動修改」按鈕會自動保存所有變更</b></li>}
            </ul>
          )}
        </div>
      </div>

      {/* 篩選器放在提示下方 */}
      {/* <GanttFilter
        originalRows={rows}
        onFilteredDataChange={handleFilterChange}
      />

      {/* 手術排程內容 */}
      {/* {!loading && !error && filteredRows.length > 0 && (
        <div className="gantt-content">
          <div ref={scrollContainerRef} className="scroll-container">
            <div ref={timeScaleRef} className="gantt-timescale-container">
              <TimeWrapper containerWidth={containerWidth}>
                <div ref={ganttChartRef} className="gantt-chart-container">
                  <div className="gantt-chart">
                    {filteredRows.map((room, roomIndex) => (
                      <div
                        key={room.room || roomIndex}
                        className={`row ${roomIndex % 2 === 0 ? "row-even" : "row-odd"}`}
                      >
                        <RoomSection
                          room={room}
                          roomIndex={roomIndex}
                          readOnly={readOnly}
                          onSurgeryClick={handleSurgeryClick}
                          isMainPage={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TimeWrapper>
            </div>
          </div>
        </div>
      )} */}

      {/* 當篩選後無符合的資料
      {!loading && !error && filteredRows.length === 0 && (
        <div className="no-data">
          <p className="no-data-title">尚無符合條件的排程資料</p>
          <p className="no-data-subtitle">請更改篩選條件或稍後再試</p>
        </div>
      )} */}







      <div className="flex w-full transition-all duration-500 ease-in-out">
        <GanttFilter
          originalRows={rows}
          onFilteredDataChange={handleFilterChange}
        />

        {!loading && !error && filteredRows.length > 0 && (
          <div className="gantt-content transition-all duration-500 ease-in-out" style={{ width: "2000000px" }}>
            <div ref={scrollContainerRef} className="scroll-container">
              <div ref={timeScaleRef} className="gantt-timescale-container">
                <TimeWrapper containerWidth={containerWidth}>
                  <div ref={ganttChartRef} className="gantt-chart-container">
                    <div className="gantt-chart">
                      {filteredRows.map((room, roomIndex) => (
                        <div
                          key={room.room || roomIndex}
                          className={`row ${roomIndex % 2 === 0 ? "row-even" : "row-odd"}`}
                        >
                          <RoomSection
                            room={room}
                            roomIndex={roomIndex}
                            readOnly={readOnly}
                            onSurgeryClick={handleSurgeryClick}
                            isMainPage={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </TimeWrapper>
              </div>
            </div>
          </div>
        )}
      </div>









      {/* 手術詳細資訊模態視窗 */}
      {selectedSurgery && (
        <SurgeryModal
          surgery={selectedSurgery}
          onClose={handleCloseModal}
          error={modalError}
        />
      )}
    </div>
  );
}

export default MainGantt;
