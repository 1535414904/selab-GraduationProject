import React, { useRef, useEffect, useState } from "react";
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
function MainGantt({ rows, setRows, mainGanttRef }) {
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // 是否顯示確認對話框

  // 初始化數據
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await fetchSurgeryData(setRows, setLoading, setError);
      } catch (error) {
        console.error("初始化數據失敗:", error);
        setError("初始化數據失敗");
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

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
        readOnly
      };
    }
  }, [filteredRows, readOnly, mainGanttRef, setHasChanges]);

  // 處理篩選結果
  const handleFilterChange = (filteredData) => {
    setFilteredRows(filteredData);
  };
  
  // 切換編輯模式
  const toggleEditMode = () => {
    // 如果要從編輯模式切換到唯讀模式，且有未保存的變更，則顯示確認對話框
    if (!readOnly && hasChanges) {
      setShowConfirmDialog(true);
      // 不要立即切換 readOnly 狀態，等待用戶在對話框中的選擇
    } else {
      // 否則直接切換模式
      const newReadOnlyState = !readOnly;
      setReadOnly(newReadOnlyState);
      
      // 如果是從唯讀模式切換到編輯模式，重置變更狀態
      if (readOnly) {
        setHasChanges(false);
      }
      
      // 立即更新 mainGanttRef
      if (mainGanttRef && mainGanttRef.current) {
        mainGanttRef.current = {
          ...mainGanttRef.current,
          readOnly: newReadOnlyState,
          hasChanges: readOnly ? false : hasChanges
        };
      }
    }
  };
  
  // 確認保存變更
  const confirmSaveChanges = async () => {
    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      // 遍歷所有手術房，更新每個手術的資料
      const updatePromises = [];
      
      for (const roomIndex in filteredRows) {
        if (filteredRows[roomIndex].data && filteredRows[roomIndex].data.length > 0) {
          const updatePromise = updateSurgeryInDatabase(filteredRows, parseInt(roomIndex))
            .then(results => {
              if (results) {
                successCount += results.length;
              }
              return results;
            })
            .catch(error => {
              console.error(`更新手術室 ${roomIndex} 失敗:`, error);
              errorCount++;
              return null;
            });
          
          updatePromises.push(updatePromise);
        }
      }
      
      // 等待所有更新完成
      await Promise.all(updatePromises);
      
      // 重新載入資料以確保顯示最新狀態
      try {
        const response = await fetch(`${BASE_URL}/api/surgery/getAllSurgery`);
        if (!response.ok) {
          throw new Error('重新載入數據失敗');
        }
        const newData = await response.json();
        
        // 更新所有相關狀態
        setRows(newData);
        setFilteredRows(newData);
        setHasChanges(false);
        setShowConfirmDialog(false);
        setReadOnly(true);
        
        // 立即更新 mainGanttRef
        if (mainGanttRef && mainGanttRef.current) {
          mainGanttRef.current = {
            ...mainGanttRef.current,
            filteredRows: newData,
            readOnly: true,
            hasChanges: false,
            setFilteredRows: (updatedRows) => {
              setFilteredRows(updatedRows);
              // 確保在更新 filteredRows 時同步更新 mainGanttRef
              if (mainGanttRef.current) {
                mainGanttRef.current.filteredRows = updatedRows;
              }
            }
          };
        }
        
        // 顯示成功訊息
        if (errorCount === 0) {
          alert(`所有變更已成功保存到資料庫！共更新了 ${successCount} 個手術。`);
        } else {
          alert(`部分變更已保存到資料庫。成功: ${successCount} 個，失敗: ${errorCount} 個。`);
        }
      } catch (error) {
        console.error('重新載入數據失敗:', error);
        throw new Error('重新載入數據失敗');
      }
      
    } catch (error) {
      console.error('保存變更時發生錯誤:', error);
      alert(`保存變更失敗: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // 取消保存變更，重新載入原始資料
  const cancelSaveChanges = async () => {
    setShowConfirmDialog(false);
    
    // 詢問用戶是否要放棄變更
    const confirmDiscard = window.confirm('確定要放棄所有未保存的變更嗎？這將重新載入原始資料。');
    
    if (confirmDiscard) {
      setLoading(true);
      try {
        // 首先立即重置狀態
        setHasChanges(false);
        setReadOnly(true);
        
        // 立即更新 mainGanttRef
        if (mainGanttRef && mainGanttRef.current) {
          mainGanttRef.current = {
            ...mainGanttRef.current,
            readOnly: true,
            hasChanges: false
          };
        }
        
        // 創建一個自訂的狀態更新函數，將同時更新 rows 和 filteredRows
        const customSetRows = (newRows) => {
          // 更新主數據
          setRows(newRows);
          
          // 直接更新過濾後的行，確保它們與 newRows 同步
          setFilteredRows(newRows);
          
          // 確保 mainGanttRef 也獲得更新
          if (mainGanttRef && mainGanttRef.current) {
            mainGanttRef.current = {
              ...mainGanttRef.current,
              filteredRows: newRows,
              readOnly: true,
              hasChanges: false
            };
          }
        };
        
        // 使用自訂的設置函數重新載入數據
        await fetchSurgeryData(customSetRows, setLoading, setError);
      } catch (error) {
        console.error('重新載入資料失敗:', error);
        setError('重新載入資料失敗');
      } finally {
        setLoading(false);
      }
    }
  };

  // 處理手術房釘選狀態變更
  const handleRoomPinStatusChange = (roomIndex, isPinned) => {
    if (readOnly) return; // 唯讀模式下不允許釘選
    
    const updatedRows = [...filteredRows];
    updatedRows[roomIndex] = {
      ...updatedRows[roomIndex],
      isPinned: isPinned
    };
    setFilteredRows(updatedRows);
    setHasChanges(true);
  };
  
  // 處理手術點擊事件，顯示詳細資訊
  const handleSurgeryClick = (surgery) => {
    setSelectedSurgery(surgery);
    setModalError(null);
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
  
  // 確保對話框顯示邏輯
  useEffect(() => {
    // 當有未保存的變更時，確保對話框顯示
    if (!readOnly && hasChanges && !showConfirmDialog) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
      };
      
      // 添加頁面離開提示
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [readOnly, hasChanges, showConfirmDialog]);

  // 監聽 hasChanges 的變化
  useEffect(() => {
    if (hasChanges) {
      console.log('檢測到未保存的變更');
    }
  }, [hasChanges]);

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
      {/* ✅ 上方資訊區塊 */}
      <div className="gantt-header">
        <div className="gantt-title">
        <div className="gantt-date">
          <h2 className="gantt-title-text">{currentDate}手術排程甘特圖</h2>
          <p className="gantt-subtitle">顯示所有手術室的排程安排</p>
        </div>
      </div>

        {/* ✅ 手術室數量、編輯模式按鈕 & PDF 按鈕 */}
        <div className="gantt-actions">
          <div className="gantt-room-count">
            <svg className="gantt-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="gantt-room-count-text">共 {filteredRows.length} 間手術室</span>
          </div>
          
          <div className="gantt-buttons">
            <button 
              className={`edit-mode-button ${!readOnly ? 'active' : ''}`} 
              onClick={toggleEditMode}
              disabled={isSaving}
            >
              {readOnly ? '啟用移動修改' : '關閉移動修改'}
            </button>
            <GeneratePDFButton timeScaleRef={timeScaleRef} ganttChartRef={ganttChartRef} />
          </div>
        </div>
      </div>

      {/* ✅ 使用提示 */}
    <div className="gantt-tips">
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
        <p className="gantt-tips-title">使用提示</p>
        <ul className="gantt-tips-list">
          <li>可以橫向滾動查看不同時間段的排程</li>
          <li>點擊「生成 PDF」按鈕可將當前甘特圖生成 PDF 檔案</li>
          <li>點擊「啟用移動修改」按鈕可臨時調整排程位置</li>
          <li>點擊手術項目可查看詳細資訊</li>
          {!readOnly && <li>完成修改後，點擊「關閉移動修改」按鈕時可選擇保存變更</li>}
        </ul>
      </div>
    </div>

      {/* 確認對話框 - 調整樣式確保它始終顯示在最上層 */}
      {showConfirmDialog && (
        <div className="confirm-dialog-overlay" style={{ zIndex: 9999 }}>
          <div className="confirm-dialog">
            <h3 className="confirm-dialog-title">保存變更</h3>
            <p className="confirm-dialog-message">您有未保存的變更，是否要保存到資料庫？</p>
            <div className="confirm-dialog-buttons">
              <button 
                className="confirm-dialog-button confirm-dialog-save" 
                onClick={confirmSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '保存變更'}
              </button>
              <button 
                className="confirm-dialog-button confirm-dialog-discard" 
                onClick={cancelSaveChanges}
                disabled={isSaving}
              >
                放棄變更
              </button>
              <button 
                className="confirm-dialog-button confirm-dialog-cancel" 
                onClick={() => {
                  setShowConfirmDialog(false);
                  // 取消時恢復到編輯模式
                  setReadOnly(false);
                  // 同步更新 mainGanttRef
                  if (mainGanttRef && mainGanttRef.current) {
                    mainGanttRef.current = {
                      ...mainGanttRef.current,
                      readOnly: false
                    };
                  }
                }}
                disabled={isSaving}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 篩選器放在提示下方 */}
      <GanttFilter 
        originalRows={rows} 
        onFilteredDataChange={handleFilterChange} 
      />

      {/* ✅ 手術排程內容 */}
      {!loading && !error && filteredRows.length > 0 && (
        <div className="gantt-content">
          <div ref={scrollContainerRef} className="scroll-container">
            <div ref={timeScaleRef} className="gantt-timescale-container">
              <TimeWrapper containerWidth={containerWidth}>
                <div ref={ganttChartRef} className="gantt-chart-container">
                  <div className="gantt-chart">
                    {filteredRows.map((room, roomIndex) => (
                      <div 
                        key={room.room || roomIndex} 
                        className={`row ${roomIndex % 2 === 0 ? "row-even" : "row-odd"} ${room.isPinned ? 'row-pinned' : ''}`}
                      >
                        <RoomSection 
                          room={room} 
                          roomIndex={roomIndex} 
                          onPinStatusChange={handleRoomPinStatusChange}
                          readOnly={readOnly}
                          onSurgeryClick={handleSurgeryClick}
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

      {/* ✅ 當篩選後無符合的資料 */}
      {!loading && !error && filteredRows.length === 0 && (
        <div className="no-data">
          <p className="no-data-title">尚無符合條件的排程資料</p>
          <p className="no-data-subtitle">請更改篩選條件或稍後再試</p>
        </div>
      )}
      
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
