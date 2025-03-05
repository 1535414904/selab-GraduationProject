import React, { useRef, useEffect, useState } from "react";
import RoomSection from "./components/ROOM/RoomSection";
import TimeWrapper from "./components/Time/timeWrapper";
import GeneratePDFButton from "./components/Time/GeneratePDFButton";
import { fetchSurgeryData } from "./components/Data/ganttData";
import "./styles.css";
import GanttFilter from "./components/GanttFilter"; // ✅ 加入篩選器

function Gantt({ rows, setRows }) {
  const ganttChartRef = useRef(null);
  const timeScaleRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [filteredRows, setFilteredRows] = useState([]); // 儲存篩選後的結果

  useEffect(() => {
    fetchSurgeryData(setRows, setLoading, setError);
  }, []);

  // 當原始數據變更時，更新篩選後的結果
  useEffect(() => {
    setFilteredRows(rows);
  }, [rows]);

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

  // 處理手術房釘選狀態變更
  const handleRoomPinStatusChange = (roomIndex, isPinned) => {
    setRows(prevRows => {
      const newRows = [...prevRows];
      if (newRows[roomIndex]) {
        // 更新手術房的釘選狀態
        newRows[roomIndex] = {
          ...newRows[roomIndex],
          isPinned: isPinned
        };
      }
      return newRows;
    });
  };

  // 處理篩選結果
  const handleFilterChange = (filteredData) => {
    setFilteredRows(filteredData);
  };

  return (
    <div className="gantt-main-container">
      {/* ✅ 上方資訊區塊 */}
      <div className="gantt-header">
        <div className="gantt-title">
          <h2 className="gantt-title-text">手術排程甘特圖</h2>
          <p className="gantt-subtitle">顯示所有手術室的排程安排</p>
        </div>

        {/* ✅ 手術室數量 & PDF 按鈕 */}
        <div className="gantt-actions">
          <div className="gantt-room-count">
            <svg className="gantt-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="gantt-room-count-text">共 {filteredRows.length} 間手術室</span>
          </div>
          
          <GeneratePDFButton timeScaleRef={timeScaleRef} ganttChartRef={ganttChartRef} />
        </div>
      </div>

      {/* ✅ 使用提示 */}
      <div className="gantt-tips">
        <svg className="gantt-tips-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div className="gantt-tips-content">
          <p className="gantt-tips-title">使用提示</p>
          <ul className="gantt-tips-list">
            <li>可以橫向滾動查看不同時間段的排程</li>
            <li>點擊「生成 PDF」按鈕可將當前甘特生成圖為 PDF 檔案</li>
            <li>點擊手術房名稱右側的圖釘可釘選手術房，釘選後該手術房的手術將無法移動</li>
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
              <TimeWrapper containerWidth={containerWidth}>
                <div ref={ganttChartRef} className="gantt-chart-container">
                  {filteredRows.map((room, roomIndex) => (
                    <div 
                      key={room.room || roomIndex} 
                      className={`row ${roomIndex % 2 === 0 ? "row-even" : "row-odd"} ${room.isPinned ? 'row-pinned' : ''}`}
                    >
                      <RoomSection 
                        room={room} 
                        roomIndex={roomIndex} 
                        onPinStatusChange={handleRoomPinStatusChange}
                      />
                    </div>
                  ))}
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
  );
}

export default Gantt;
