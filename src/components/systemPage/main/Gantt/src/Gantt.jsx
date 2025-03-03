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
  const [filters, setFilters] = useState({}); // ✅ 儲存篩選條件

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

  // ✅ 依據篩選條件過濾手術室
  const filteredRows = rows.filter((room) => {
    if (filters.selectedDepartments?.length > 0 && !filters.selectedDepartments.includes(room.department)) return false;
    if (filters.selectedRoomTypes?.length > 0 && !filters.selectedRoomTypes.includes(room.roomType)) return false;
    if (filters.selectedRoomNames?.length > 0 && !filters.selectedRoomNames.includes(room.room)) return false;
    if (filters.showOvertime && !room.hasOvertime) return false;
    return true;
  });

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4 md:p-6">
      {/* ✅ 上方資訊區塊 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">手術排程甘特圖</h2>
          <p className="text-sm text-gray-500 mt-1">顯示所有手術室的排程安排</p>
        </div>

        {/* ✅ 手術室數量 & PDF 按鈕 */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-md">
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">共 {filteredRows.length} 間手術室</span>
          </div>
          
          <GeneratePDFButton timeScaleRef={timeScaleRef} ganttChartRef={ganttChartRef} />
        </div>
      </div>

      {/* ✅ 使用提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 flex items-start">
        <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div className="text-sm text-blue-800">
          <p className="font-medium">使用提示</p>
          <ul className="mt-1 list-disc list-inside text-blue-700 space-y-1">
            <li>可以橫向滾動查看不同時間段的排程</li>
            <li>點擊「生成 PDF」按鈕可將當前甘特生成圖為 PDF 檔案</li>
          </ul>
        </div>
      </div>

      {/* ✅ 篩選器放在提示下方 */}
      <GanttFilter onFilterChange={setFilters} />

      {/* ✅ 手術排程內容 */}
      {!loading && !error && filteredRows.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
          <div ref={scrollContainerRef} className="scroll-container overflow-x-auto" style={{ width: "100%", WebkitOverflowScrolling: "touch" }}>
            <div ref={timeScaleRef} className="min-w-full">
              <TimeWrapper containerWidth={containerWidth}>
                <div ref={ganttChartRef} style={{ position: "relative", minHeight: "fit-content" }}>
                  {filteredRows.map((room, roomIndex) => (
                    <div key={room.room || roomIndex} className={`row border-b border-gray-200 ${roomIndex % 2 === 0 ? "bg-gray-50" : "bg-white"} z-10 relative`}>
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
        <div className="no-data flex flex-col items-center justify-center h-60 text-gray-500">
          <p className="text-lg font-medium">尚無符合條件的排程資料</p>
          <p className="text-sm mt-1">請更改篩選條件或稍後再試</p>
        </div>
      )}
    </div>
  );
}

export default Gantt;
