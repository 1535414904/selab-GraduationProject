import React, { useRef, useEffect, useState } from "react";
import RoomSection from "./components/ROOM/RoomSection";
import TimeWrapper from "./components/Time/timeWrapper";
import GeneratePDFButton from "./components/Time/GeneratePDFButton";
import { fetchSurgeryData } from "./components/Data/ganttData";
import "./styles.css";

function Gantt({ rows, setRows }) {
  const ganttChartRef = useRef(null);
  const timeScaleRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    fetchSurgeryData(setRows, setLoading, setError);
  }, [setRows]);

  // Add window resize listener
  useEffect(() => {
    const handleResize = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };

    // Initial setup
    handleResize();

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="container w-full bg-white rounded-lg shadow-md p-4 md:p-6">
      {loading && (
        <div className="loading flex justify-center items-center h-40">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            加載中...
          </div>
        </div>
      )}

      {error && (
        <div className="error-message bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && rows && rows.length > 0 && (
        <>
          <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800">
                手術排程甘特圖
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                顯示所有手術室的排程安排
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-md">
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs font-medium">
                  共 {rows.length} 間手術室
                </span>
              </div>

              <div className="hidden md:block h-8 w-px bg-gray-300"></div>

              <GeneratePDFButton
                timeScaleRef={timeScaleRef}
                ganttChartRef={ganttChartRef}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
              >
                <svg
                  className="h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                匯出 PDF
              </GeneratePDFButton>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 flex items-start">
            <svg
              className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium">使用提示</p>
              <ul className="mt-1 list-disc list-inside text-blue-700 space-y-1">
                <li>可以橫向滾動查看不同時間段的排程</li>
                <li>點擊「匯出 PDF」按鈕可將當前甘特圖導出為 PDF 檔案</li>
                <li>奇數行與偶數行背景顏色不同，方便區分不同手術室</li>
              </ul>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="scroll-container overflow-x-auto"
              style={{
                width: "100%",
                WebkitOverflowScrolling: "touch", // Enhance iOS scroll performance
              }}
            >
              <div ref={timeScaleRef} className="min-w-full">
                {/* Pass containerWidth to TimeWrapper */}
                <TimeWrapper containerWidth={containerWidth}>
                  <div
                    ref={ganttChartRef}
                    style={{
                      transform: "translateZ(0)", // Enable hardware acceleration
                      willChange: "transform", // Hint to browser that this element will change
                      position: "relative", // Ensure child elements are positioned correctly
                      minHeight: "fit-content", // Ensure container expands to fit content
                    }}
                  >
                    {rows.map((room, roomIndex) => (
                      <div
                        key={room.room || roomIndex}
                        className={`row border-b border-gray-200 ${
                          roomIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } z-10 relative`}
                      >
                        <RoomSection room={room} roomIndex={roomIndex} />
                      </div>
                    ))}
                  </div>
                </TimeWrapper>
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !error && (!rows || rows.length === 0) && (
        <div className="no-data flex flex-col items-center justify-center h-60 text-gray-500">
          <svg
            className="h-16 w-16 mb-2 text-gray-300"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg font-medium">尚無排程資料</p>
          <p className="text-sm mt-1">請稍後再檢查或新增排程</p>
        </div>
      )}
    </div>
  );
}

export default Gantt;
