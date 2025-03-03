import React, { useRef, useEffect, useState } from "react";
import RoomSection from "./components/ROOM/RoomSection";
import TimeWrapper from "./components/Time/TimeWrapper";
import GeneratePDFButton from "./components/Time/GeneratePDFButton";
import { fetchSurgeryData } from "./components/Data/ganttData";
import GanttFilter from "./components/GanttFilter";
import "./styles.css";  // ✅ 引入外部 CSS

function Gantt({ rows, setRows }) {
  const ganttChartRef = useRef(null);
  const timeScaleRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchSurgeryData(setRows, setLoading, setError);
  }, []);

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

  const filteredRows = rows.filter((room) => {
    if (filters.selectedDepartments?.length > 0 && !filters.selectedDepartments.includes(room.department)) return false;
    if (filters.selectedRoomTypes?.length > 0 && !filters.selectedRoomTypes.includes(room.roomType)) return false;
    if (filters.selectedRoomNames?.length > 0 && !filters.selectedRoomNames.includes(room.room)) return false;
    if (filters.showOvertime && !room.hasOvertime) return false;
    return true;
  });

  return (
    <div className="gantt-container">
      {/* ✅ 上方資訊區塊 */}
      <div className="gantt-header">
        <div>
          <h2>手術排程甘特圖</h2>
          <p>顯示所有手術室的排程安排</p>
        </div>

        {/* ✅ 手術室數量 & PDF 按鈕 */}
        <div className="gantt-controls">
          <div className="room-count">
            <span>共 {filteredRows.length} 間手術室</span>
          </div>
          <GeneratePDFButton timeScaleRef={timeScaleRef} ganttChartRef={ganttChartRef} />
        </div>
      </div>

      {/* ✅ 使用提示 */}
      <div className="gantt-info">
        <p className="info-title">使用提示</p>
        <ul>
          <li>可以橫向滾動查看不同時間段的排程</li>
          <li>點擊「生成 PDF」按鈕可將當前甘特生成圖為 PDF 檔案</li>
        </ul>
      </div>

      {/* ✅ 篩選器 */}
      <GanttFilter onFilterChange={setFilters} />

      {/* ✅ 手術排程內容 */}
      {!loading && !error && filteredRows.length > 0 && (
        <div className="gantt-chart">
          <div ref={scrollContainerRef} className="scroll-container">
            <div ref={timeScaleRef}>
              <TimeWrapper containerWidth={containerWidth}>
                <div ref={ganttChartRef} className="gantt-rows">
                  {filteredRows.map((room, roomIndex) => (
                    <div key={room.room || roomIndex} className="row">
                      <RoomSection room={room} roomIndex={roomIndex} />
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
          <p className="text-lg">尚無符合條件的排程資料</p>
          <p className="text-sm">請更改篩選條件或稍後再試</p>
        </div>
      )}
    </div>
  );
}

export default Gantt;
