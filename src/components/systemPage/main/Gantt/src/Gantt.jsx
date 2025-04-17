import React, { useRef, useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import RoomSection from "./components/ROOM/RoomSection";
import TimeWrapper from "./components/Time/timeWrapper";
import ConfirmScheduleButton from "./components/Time/ConfirmScheduleButton";
import ParametricSettings from "./components/Time/parametricSettings";
import { fetchSurgeryData, formatRoomData } from "./components/Data/ganttData";
import "./styles.css";
import GanttFilter from "./components/GanttFilter";
import { handleDragEnd } from "./components/DragDrop/dragEndHandler";
import { handleGroupDragEnd } from "./components/DragDrop/groupDragHandler";
import SurgeryModal from "./components/Modal/SurgeryModal";
import axios from "axios";
import { BASE_URL } from "/src/config";
import { clearTempTimeSettings } from "./components/Time/timeUtils";
import ORSMButton from "./components/Time/ORSMButton";
import GanttHeader from "./header/GanttHeader";

// 引入群組操作函數
import {
  createGroup,
  ungroup
} from "./components/ROOM/GroupOperations";

// 排班管理專用的甘特圖組件
function Gantt({ rows, setRows, initialTimeSettings, setInitialTimeSettings }) {
  const ganttChartRef = useRef(null);
  const timeScaleRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [filteredRows, setFilteredRows] = useState(rows);
  const [timeScaleWidth, setTimeScaleWidth] = useState("100%");
  const [isInitialized, setIsInitialized] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('gantt'); // 新增頁籤狀態，預設顯示甘特圖
  const [selectedSurgery, setSelectedSurgery] = useState(null); // 選中的手術
  const [modalError, setModalError] = useState(null); // 模態視窗錯誤
  const [tipsCollapsed, setTipsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // 初始化數據
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await fetchSurgeryData(setRows, setLoading, setError);
        setIsInitialized(true);
      } catch (error) {
        console.error("初始化數據失敗:", error);
        setError("初始化數據失敗");
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    console.log("手術室資料:", rows);
    console.log("篩選後的手術室資料:", filteredRows);
  }, [rows, filteredRows]);

  // 當rows更新時，更新filteredRows
  useEffect(() => {
    if (rows && rows.length > 0) {
      setFilteredRows(rows);
      setIsInitialized(true);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [rows]);


  //  處理滾動事件，確保時間刻度和內容區域同步
  const handleDragStart = () => {
    document.body.style.overflowY = "hidden";
  };

  const handleDragEndWrapper = async (result) => {
    document.body.style.overflowY = "auto"; // 拖曳結束後恢復滾動

    if (!result.destination) return;

    console.log("排班管理甘特圖拖曳結束，更新界面", result);

    if (!result.draggableId) {
      console.error("拖曳操作缺少draggableId，無法處理");
      return;
    }

    const isGroupDrag = await handleGroupDragEnd(result, filteredRows, setFilteredRows);

    if (!isGroupDrag) {
      await handleDragEnd(result, filteredRows, setFilteredRows);
    }

    setRows([...filteredRows]);

    window.dispatchEvent(new CustomEvent('ganttDragEnd'));
    setTimeout(() => {
      setFilteredRows([...filteredRows]);
    }, 100);
  };


  // 處理滾輪事件，確保垂直滾動時時間刻度保持在頂部，同時保持水平滾動同步
  useEffect(() => {
    const handleGanttTimeScaleScroll = (e) => {
      const { scrollLeft } = e.detail;
      // 同步內容區域的水平滾動
      const chartScrollArea = document.querySelector('.gantt-chart-scroll-area');
      if (chartScrollArea) {
        chartScrollArea.scrollLeft = scrollLeft;
      }
    };

    const handleGanttContentScroll = (e) => {
      const { scrollLeft } = e.detail;
      // 同步時間刻度的水平滾動
      const timeScaleContainer = timeScaleRef.current?.querySelector('.scrollable-container');
      if (timeScaleContainer) {
        timeScaleContainer.scrollLeft = scrollLeft;
      }
    };

    // 監聽滾動事件，確保水平滾動同步
    const handleContentScroll = (e) => {
      if (e.target.classList.contains('gantt-chart-scroll-area') ||
        e.target.classList.contains('scrollable-container')) {
        const scrollLeft = e.target.scrollLeft;

        // 通知時間刻度和內容區域
        window.dispatchEvent(new CustomEvent('ganttMainScroll', {
          detail: { scrollLeft }
        }));
      }
    };

    // window.addEventListener('ganttTimeScaleScroll', handleGanttTimeScaleScroll);
    // window.addEventListener('ganttContentScroll', handleGanttContentScroll);

    // // 使用捕獲階段監聽所有相關容器的滾動事件
    // document.addEventListener('scroll', handleContentScroll, true);

    // return () => {
    //   window.removeEventListener('ganttTimeScaleScroll', handleGanttTimeScaleScroll);
    //   window.removeEventListener('ganttContentScroll', handleGanttContentScroll);
    //   document.removeEventListener('scroll', handleContentScroll, true);
    // };
  }, []);





  const handleResize = () => {
    if (timeScaleRef.current) {
      setTimeScaleWidth(`${timeScaleRef.current.scrollWidth}px`);
    }
    if (scrollContainerRef.current) {
      setContainerWidth(scrollContainerRef.current.clientWidth);
    }


  };

  // 處理手術房釘選狀態變更
  const handleRoomPinStatusChange = (roomIndex, isPinned) => {
    const updatedRows = [...filteredRows];
    updatedRows[roomIndex] = {
      ...updatedRows[roomIndex],
      isPinned: isPinned
    };
    setFilteredRows(updatedRows);

    // 同時更新原始數據
    const originalRoomIndex = rows.findIndex(r =>
      r.roomId === updatedRows[roomIndex].roomId ||
      r.room === updatedRows[roomIndex].room
    );

    if (originalRoomIndex !== -1) {
      const newRows = [...rows];
      newRows[originalRoomIndex] = {
        ...newRows[originalRoomIndex],
        isPinned: isPinned
      };
      setRows(newRows);
    }
  };

  // 處理群組操作
  const handleGroupOperation = (roomIndex, selectedSurgeries, operation) => {
    if (readOnly) return; // 唯讀模式下不允許群組操作

    const updatedRows = [...filteredRows];
    const roomData = [...updatedRows[roomIndex].data];
    const roomName = updatedRows[roomIndex].room || updatedRows[roomIndex].name || '手術室';

    if (operation === 'create') {
      // 使用新的創建群組函數
      const result = createGroup(selectedSurgeries, roomData, roomIndex, roomName);

      if (!result.success) {
        alert(result.message || '創建群組失敗');
        return;
      }

      // 更新手術室資料
      updatedRows[roomIndex] = {
        ...updatedRows[roomIndex],
        data: result.newRoomData
      };

      // 同時更新原始數據
      const originalRoomIndex = rows.findIndex(r =>
        r.roomId === updatedRows[roomIndex].roomId ||
        r.room === updatedRows[roomIndex].room
      );

      if (originalRoomIndex !== -1) {
        const newRows = [...rows];
        newRows[originalRoomIndex] = {
          ...newRows[originalRoomIndex],
          data: result.newRoomData
        };
        setRows(newRows);
      }

      // 強制更新 UI
      setFilteredRows([]);
      setTimeout(() => {
        setFilteredRows(updatedRows);
      }, 10);

    } else if (operation === 'ungroup') {
      // 使用新的解除群組函數
      const group = selectedSurgeries[0];
      if (!group.isGroup) {
        alert('選擇的項目不是群組');
        return;
      }

      const result = ungroup(group, roomData, roomName);

      if (!result.success) {
        alert(result.message || '解除群組失敗');
        return;
      }

      // 更新手術室資料
      updatedRows[roomIndex] = {
        ...updatedRows[roomIndex],
        data: result.newRoomData
      };

      // 同時更新原始數據
      const originalRoomIndex = rows.findIndex(r =>
        r.roomId === updatedRows[roomIndex].roomId ||
        r.room === updatedRows[roomIndex].room
      );

      if (originalRoomIndex !== -1) {
        const newRows = [...rows];
        newRows[originalRoomIndex] = {
          ...newRows[originalRoomIndex],
          data: result.newRoomData
        };
        setRows(newRows);
      }

      // 強制更新 UI
      setFilteredRows([]);
      setTimeout(() => {
        setFilteredRows(updatedRows);
      }, 10);
    }

    // 觸發 DOM 更新
    window.dispatchEvent(new CustomEvent('ganttDataUpdated'));
  };

  // 處理手術點擊事件，顯示詳細資訊
  const handleSurgeryClick = async (surgery) => {
    if (surgery.isCleaningTime) return;

    setModalError(null);

    console.log('點擊的手術:', surgery);
    console.log('釘選狀態:', surgery.isPinned);

    // 如果是群組手術，直接顯示
    if (surgery.isGroup && surgery.surgeries) {
      console.log('這是一個群組手術', surgery);
      setSelectedSurgery(surgery);
      return;
    }

    try {
      // 從後端獲取最新的手術詳細資料
      const response = await axios.get(`${BASE_URL}/api/surgeries/${surgery.applicationId}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data) {
        // 合併後端資料和甘特圖中的時間資訊
        const mergedData = {
          ...response.data,
          // 保留甘特圖中的開始和結束時間
          startTime: surgery.startTime,
          endTime: surgery.endTime,
          // 如果後端沒有這些欄位，則使用甘特圖中的資料
          doctor: response.data.chiefSurgeonName || surgery.doctor,
          surgery: response.data.surgeryName ? `${response.data.surgeryName} (${response.data.patientName || '未知病患'})` : surgery.surgery,
          color: surgery.color,
          // 使用從父組件傳入的手術室名稱
          operatingRoomName: surgery.operatingRoomName,
          // 保留群組資訊
          isGroup: surgery.isGroup,
          surgeries: surgery.surgeries,
          // 保留釘選狀態
          isPinned: surgery.isPinned
        };
        console.log('設置手術詳情，包含釘選狀態:', mergedData.isPinned);
        setSelectedSurgery(mergedData);
      } else {
        setSelectedSurgery(surgery);
      }
    } catch (error) {
      console.error('獲取手術詳細資料時發生錯誤:', error);
      setModalError(`獲取手術詳細資料失敗: ${error.message}`);
      setSelectedSurgery(surgery);
    }
  };

  // 處理篩選結果
  const handleFilterChange = (filteredData) => {
    setFilteredRows(filteredData);
  };

  // 處理拖拽結束事件，確保UI更新
  const onDragEndHandler = async (result) => {
    if (!result.destination) return;

    console.log("排班管理甘特圖拖曳結束，更新界面", result);

    // 檢查是否有ID相關問題
    if (!result.draggableId) {
      console.error("拖曳操作缺少draggableId，無法處理");
      return;
    }

    // 首先嘗試處理群組拖曳
    const isGroupDrag = await handleGroupDragEnd(result, filteredRows, setFilteredRows);

    // 如果不是群組拖曳，則按一般手術拖曳處理
    if (!isGroupDrag) {
      await handleDragEnd(result, filteredRows, setFilteredRows);
    }

    // 觸發原始狀態更新
    setRows([...filteredRows]);

    // 確保UI更新
    window.dispatchEvent(new CustomEvent('ganttDragEnd'));

    // 延遲後再次更新以確保UI一致性
    setTimeout(() => {
      setFilteredRows([...filteredRows]);
    }, 100);
  };

  // 處理頁籤切換
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // 如果切換到甘特圖頁籤，觸發重新加載
    if (tab === 'gantt') {
      // 讓甘特圖組件重新加載數據
      console.log('切換到甘特圖頁籤，重新加載數據');
      window.dispatchEvent(new CustomEvent('ganttTabActive'));
    }
  };

  // 關閉模態視窗
  const handleCloseModal = () => {
    setSelectedSurgery(null);
  };

  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // 加一天變成明天的日期

    const formattedDate = today.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    setCurrentDate(formattedDate);
  }, []);

  // 初始化甘特圖
  useEffect(() => {
    const initializeGantt = async () => {
      if (!rows || rows.length === 0) {
        await fetchSurgeryData(setRows, setLoading, setError);
      }
      setIsInitialized(true);
    };

    initializeGantt();
  }, [rows]);

  // 監聽ganttTabActive事件
  useEffect(() => {
    const handleGanttTabActive = async () => {
      console.log('接收到ganttTabActive事件，重新加載甘特圖數據');
      setLoading(true);
      try {
        await fetchSurgeryData(setRows, setLoading, setError);
      } catch (error) {
        console.error('重新加載甘特圖數據失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener('ganttTabActive', handleGanttTabActive);
    return () => {
      window.removeEventListener('ganttTabActive', handleGanttTabActive);
    };
  }, []);

  // 初始化時讀取提示收合狀態
  useEffect(() => {
    const savedTipsState = localStorage.getItem('ganttTipsCollapsed');
    if (savedTipsState) {
      setTipsCollapsed(savedTipsState === 'true');
    }
  }, []);

  // 處理提示收合狀態變更
  const toggleTips = () => {
    const newState = !tipsCollapsed;
    setTipsCollapsed(newState);
    localStorage.setItem('ganttTipsCollapsed', newState.toString());
  };

  // 如果數據尚未初始化，顯示載入中
  if (!isInitialized && loading) {
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
      <GanttHeader
        currentDate={currentDate}
        filteredRows={filteredRows}
        setRows={setRows}
      />
      {/* ✅ 頁籤切換區 */}
      <div className="gantt-tabs">
        <ul className="gantt-tab-list">
          <li
            className={`gantt-tab ${activeTab === 'gantt' ? 'gantt-tab-active' : ''}`}
            onClick={() => handleTabChange('gantt')}
          >
            手術排程甘特圖
          </li>
          <li
            className={`gantt-tab ${activeTab === 'timeSettings' ? 'gantt-tab-active' : ''}`}
            onClick={() => handleTabChange('timeSettings')}
          >
            參數設定
          </li>
        </ul>
      </div>

      {/* ✅ 甘特圖頁籤內容 */}
      <div className={`gantt-tab-panel ${activeTab !== 'gantt' ? 'gantt-tab-panel-hidden' : ''}`}>
        {/* ✅ 提示區塊 */}
        <div className={`gantt-tips ${tipsCollapsed ? 'tips-collapsed' : ''}`}>
          <svg className="gantt-tips-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#3B82F6" />
            <circle cx="12" cy="7" r="1.5" fill="white" />
            <rect x="11" y="9.5" width="2" height="6" rx="1" fill="white" />
          </svg>
          <div className="gantt-tips-content">
            <div className="tips-header">
              <p className="gantt-tips-title">使用提示</p>
              <button className="tips-toggle-button" onClick={toggleTips}>
                {tipsCollapsed ? "展開" : "收合"}
              </button>
            </div>
            {!tipsCollapsed && (
              <ul className="gantt-tips-list">
                <li>可橫向滾動查看時間</li>
                <li>可拖曳修改手術時間與群組</li>
                <li>點擊手術查看詳細資訊</li>
              </ul>
            )}
          </div>
        </div>

        {/* ✅ 主內容：左右佈局 */}
        <div className="gantt-main-layout flex w-full h-full">
          {/* ✅ 左側固定篩選器 */}
          {/* 篩選器區域 - 可收合的側邊欄 */}
          <div className={` ${isFilterOpen ? 'open' : 'closed'}`}>
            <GanttFilter
              originalRows={rows}
              onFilteredDataChange={handleFilterChange}
            />
            {/* 切換按鈕 */}
            <button
              className="filter-toggle-button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              aria-label={isFilterOpen ? "收合篩選器" : "展開篩選器"}
            >
              {/* {isFilterOpen ? "←" : "→"} */}
            </button>
          </div>
          {/* ✅ 右側甘特圖區域 */}
          <div className="gantt-chart-wrapper flex-1 relative transition-all duration-500 ease-in-out">
            {/* 篩選器開關按鈕（固定）
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="filter-toggle-btn"
              style={{
                top: '8rem',
                left: isFilterOpen ? '18rem' : '0.25rem',
                position: 'absolute',
                zIndex: 50,
              }}
            >
              {isFilterOpen ? '←' : '→'}
            </button> */}

            {/* ✅ 甘特圖內容 */}
            {!loading && !error && filteredRows.length > 0 && (
              <div className="gantt-content">
                {/* // <div class="w-full max-w-[95vw] mx-auto border border-gray-200 rounded-lg relative flex flex-col overflow-visible"> */}

                <DragDropContext
                  onDragStart={handleDragStart}
                  onDragEnd={onDragEndHandler} >
                  {/* 時間刻度區塊 */}
                  {/* <div ref={timeScaleRef} className="gantt-timescale-container sticky-header">
                    <div className="containerWidth" style={{ overflowX: 'auto' }}>
                      <TimeWrapper containerWidth={containerWidth} timeScaleOnly={true}> */}
                  {/* 時間刻度 */}
                  {/* </TimeWrapper>
                    </div>
                  </div> */}
                  <div className="gantt-timescale-container sticky-header">
                    <div className="scrollable-container" ref={timeScaleRef}>
                      <div style={{ width: containerWidth }}>
                        <TimeWrapper containerWidth={containerWidth} timeScaleOnly={true} />
                      </div>
                    </div>
                  </div>

                  {/* 可滾動內容區域 */}
                  <div className="gantt-chart-scroll-area" ref={scrollContainerRef}>
                    <div style={{ width: containerWidth }}>
                      <TimeWrapper containerWidth={containerWidth} contentOnly={true}>
                        <div ref={ganttChartRef} className="gantt-chart-container">
                          <div className="gantt-chart">
                            {filteredRows.map((room, roomIndex) => {
                              const originalData = room.data || [];

                              // 1️⃣ 取出所有有 orderInRoom 的手術（不包含清潔）
                              const surgeriesOnly = originalData.filter(item => !item.isCleaningTime && item.orderInRoom != null);

                              // 2️⃣ 排序手術
                              const sortedSurgeries = [...surgeriesOnly].sort((a, b) => a.orderInRoom - b.orderInRoom);

                              // 3️⃣ 根據排序結果重建 room.data，插入對應的清潔項目
                              const sortedData = sortedSurgeries.flatMap(surgery => {
                                const cleaningItem = originalData.find(item => item.id === `cleaning-${surgery.applicationId}`);
                                return cleaningItem ? [surgery, cleaningItem] : [surgery];
                              });

                              // // 🪵 Debug log
                              // console.log(`📋 Room ${room.room || roomIndex} 排序後手術清單：`);
                              // sortedData.forEach((item, i) => {
                              //   if (!item.isCleaningTime) {
                              //     console.log(`  ${i + 1}. ${item.applicationId} (orderInRoom: ${item.orderInRoom})`);
                              //   }
                              // });

                              return (
                                <div
                                  key={room.room || roomIndex}
                                  className={`row ${roomIndex % 2 === 0 ? 'row-even' : 'row-odd'} ${room.isPinned ? 'row-pinned' : ''}`}
                                >
                                  <RoomSection
                                    room={{ ...room, data: sortedData }}
                                    roomIndex={roomIndex}
                                    readOnly={readOnly}
                                    onSurgeryClick={handleSurgeryClick}
                                    onGroupOperation={handleGroupOperation}
                                    onPinStatusChange={handleRoomPinStatusChange}
                                  />
                                </div>
                              );
                            })}

                          </div>
                        </div>
                      </TimeWrapper>
                    </div>
                  </div>
                </DragDropContext>
              </div>
            )}

            {/* 無資料提示 */}
            {!loading && !error && filteredRows.length === 0 && (
              <div className="no-data">
                <p className="no-data-title">尚無符合條件的排程資料</p>
                <p className="no-data-subtitle">請更改篩選條件或稍後再試</p>
              </div>
            )}
          </div>
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

      {/* 參數設定頁籤內容 */}
      <div className={`gantt-tab-panel ${activeTab !== 'timeSettings' ? 'gantt-tab-panel-hidden' : ''}`}>
        <ParametricSettings
          onTimeSettingsChange={(newSettings, isPreview) => {
            const updatedRows = formatRoomData([...rows].map(r => ({
              ...r,
              data: r.data ? [...r.data] : []
            })), isPreview);

            setRows([]);
            setTimeout(() => {
              setRows(updatedRows);
              setFilteredRows(updatedRows);
            }, 0);
            setActiveTab('gantt');
          }}
          initialTimeSettings={initialTimeSettings}
          setInitialTimeSettings={setInitialTimeSettings}
        />
      </div>
    </div >
  );

}
export default Gantt;
