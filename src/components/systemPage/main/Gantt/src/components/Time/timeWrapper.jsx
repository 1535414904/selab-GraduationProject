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
      className="time-wrapper-container"
      ref={wrapperRef}
      onWheel={handleScroll}
    >
      <div
        className="time-scale-header"
        onWheel={handleHorizontalScroll}
      >
        <div
          className="time-scale-ruler"
          ref={timeScaleRef}
          style={{ width: `${totalWidth}px` }}
        >
          {timeIntervals.map((interval, index) => (
            <div
              key={index}
              className={`time-mark ${
                interval.type === "hour"
                  ? "time-mark-hour"
                  : interval.type === "half"
                  ? "time-mark-half"
                  : "time-mark-quarter"
              }`}
              style={{ left: `${interval.position}px` }}
            >
              {(interval.type === "hour" || interval.isStartTime) && (
                <div
                  className={`time-mark-label ${
                    interval.isStartTime
                      ? "time-mark-start"
                      : ""
                  }`}
                >
                  {interval.time}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="time-wrapper-content">
        {children}
      </div>
    </div>
  );
};

export default TimeWrapper;
