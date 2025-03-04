import React, { useRef } from "react";

const TimeWrapper = ({ children }) => {
  const startTime = 8 * 60 + 30; // 8:30 converted to minutes
  const endTime = 24 * 60; // 24:00 converted to minutes
  const wrapperRef = useRef(null);
  const timeScaleRef = useRef(null);

  // 每15分鐘對應25px
  const pixelsPerMinute = 25 / 15; // 1.67 px per minute
  const pixelsPer15Minutes = 25; // 每15分鐘25px

  const handleScroll = (event) => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTop += event.deltaY;
    }
  };

  const handleHorizontalScroll = (event) => {
    if (timeScaleRef.current) {
      timeScaleRef.current.scrollLeft += event.deltaY;
      wrapperRef.current.scrollLeft += event.deltaY;
    }
  };

  const formatTime = (hour, minute) => {
    if (hour === 24) {
      return "24:00";
    }
    const formattedHour = hour.toString().padStart(2, "0");
    const formattedMinute = minute.toString().padStart(2, "0");
    return `${formattedHour}:${formattedMinute}`;
  };

  const timeIntervals = [];
  const totalIntervals = (endTime - startTime) / 15; // 15-minute intervals
  for (let i = 0; i <= totalIntervals; i++) {
    const totalMinutes = startTime + i * 15;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const isHourMark = minute === 0;
    const isHalfHourMark = minute === 30;
    const isStartTime = i === 0; // 8:30

    timeIntervals.push({
      time: formatTime(hour, minute),
      type: isHourMark ? "hour" : isHalfHourMark ? "half" : "quarter",
      isStartTime,
      position: i * pixelsPer15Minutes, // 計算每個時間刻度的位置
    });
  }

  // 計算時間軸的總寬度
  const totalWidth = totalIntervals * pixelsPer15Minutes;

  return (
    <div
      className="relative w-full h-screen overflow-y-auto overflow-x-auto mt-14"
      ref={wrapperRef}
      onWheel={handleScroll}
    >
      <div
        className="sticky top-0 w-full bg-gray-100 z-10 pl-3"
        onWheel={handleHorizontalScroll}
      >
        <div
          className="flex h-12 relative bg-gray-100 border-b-2 border-gray-800"
          ref={timeScaleRef}
          style={{ width: `${totalWidth}px`, minWidth: "100%" }}
        >
          {timeIntervals.map((interval, index) => (
            <div
              key={index}
              className={`absolute h-full flex justify-center items-end ${
                interval.type === "hour"
                  ? "time-mark-hour"
                  : interval.type === "half"
                  ? "time-mark-half"
                  : "time-mark-quarter"
              }`}
              style={{ 
                left: `${interval.position}px`,
                width: "1px" // 時間刻度線的寬度
              }}
            >
              {(interval.type === "hour" || interval.isStartTime) && (
                <div
                  className={`text-xs absolute bottom-8 ${
                    interval.isStartTime
                      ? "transform-none"
                      : "transform -translate-x-1/2"
                  } whitespace-nowrap`}
                >
                  {interval.time}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 h-[calc(100vh-30px)] whitespace-nowrap">
        {children}
      </div>

      <style jsx>{`
        .time-mark-hour::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 2px;
          height: 30px;
          background-color: #333;
          transform-origin: bottom left;
        }

        .time-mark-half::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 1px;
          height: 20px;
          background-color: #666;
          transform-origin: bottom left;
        }

        .time-mark-quarter::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 1px;
          height: 15px;
          background-color: #999;
          transform-origin: bottom left;
        }
      `}</style>
    </div>
  );
};

export default TimeWrapper;
