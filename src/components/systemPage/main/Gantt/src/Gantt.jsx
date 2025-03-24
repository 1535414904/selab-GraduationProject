import React, { useRef, useEffect, useState } from "react";
import RoomSection from "./components/ROOM/RoomSection";
import TimeWrapper from "./components/Time/timeWrapper";
import ConfirmScheduleButton from "./components/Time/ConfirmScheduleButton";
import TimeSettings from "./components/Time/timeSettings";
import { fetchSurgeryData, formatRoomData } from "./components/Data/ganttData";
import "./styles.css";
import GanttFilter from "./components/GanttFilter";
import { handleDragEnd } from "./components/DragDrop/dragEndHandler";
import SurgeryModal from "./components/Modal/SurgeryModal";
import axios from "axios";
import { BASE_URL } from "/src/config";
import { clearTempTimeSettings } from "./components/Time/timeUtils";
import ORSMButton from "./components/Time/ORSMButton";

// 排班管理專用的甘特圖組件
function Gantt({ rows, setRows }) {
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

  // 處理篩選結果
  const handleFilterChange = (filteredData) => {
    setFilteredRows(filteredData);
  };
  
  // 處理拖拽結束事件，確保UI更新
  const onDragEndHandler = async (result) => {
    if (!result.destination) return;
    
    console.log("排班管理甘特圖拖曳結束，更新界面");
    
    // 處理拖曳結束
    await handleDragEnd(result, filteredRows, setFilteredRows);
    
    // 確保UI更新
    window.dispatchEvent(new CustomEvent('ganttDragEnd'));
  };
  
  // 處理頁籤切換
  const handleTabChange = (tab) => {
    setActiveTab(tab);
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
      {/* ✅ 上方資訊區塊 */}
      <div className="gantt-header">
        <div className="gantt-title">
        <div className="gantt-date">
          <h2 className="gantt-title-text">{currentDate}手術排程甘特圖</h2>
          <p className="gantt-subtitle">顯示所有手術室的排程安排</p>
        </div>
      </div>

        {/* ✅ 手術室數量 & 確認修改按鈕 */}
        <div className="gantt-actions">
          <div className="gantt-room-count">
            <svg className="gantt-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="gantt-room-count-text">共 {filteredRows.length} 間手術室</span>
          </div>
          
          <ConfirmScheduleButton rows={filteredRows} setRows={setRows} />
          <ORSMButton />
        </div>
      </div>

      {/* ✅ 頁籤選單 */}
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
            時間設定
          </li>
        </ul>
      </div>

      {/* 甘特圖頁籤內容 */}
      <div className={`gantt-tab-panel ${activeTab !== 'gantt' ? 'gantt-tab-panel-hidden' : ''}`}>
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
              <li>點擊「更新主頁」按鈕可將當前排程更新到主頁中</li>
              <li>點擊手術房名稱右側的圖釘可釘選手術房，釘選後該手術房的手術將無法移動</li>
              <li>點擊「時間設定」頁籤可調整手術排程相關的時間參數</li>
            </ul>
          </div>
        </div>

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
                <TimeWrapper containerWidth={containerWidth} useTempSettings={true}>
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
      </div>

      {/* 時間設定頁籤內容 */}
      <div className={`gantt-tab-panel ${activeTab !== 'timeSettings' ? 'gantt-tab-panel-hidden' : ''}`}>
        <TimeSettings onTimeSettingsChange={(newSettings, isPreview) => {
          // 重新格式化所有手術房的數據
          const updatedRows = formatRoomData([...rows].map(room => ({
            ...room,
            data: room.data ? [...room.data] : []
          })), isPreview); // 傳遞 isPreview 參數
          
          // 強制觸發重新渲染
          setRows([]);
          setTimeout(() => {
            setRows(updatedRows);
            setFilteredRows(updatedRows);
          }, 0);
          
          // 切換到甘特圖頁籤
          setActiveTab('gantt');
        }} />
      </div>
    </div>
  );
}

export default Gantt;
