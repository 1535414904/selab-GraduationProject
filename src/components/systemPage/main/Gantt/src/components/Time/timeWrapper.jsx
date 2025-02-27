import React, { useRef } from 'react';

const TimeWrapper = ({ children }) => {
  const startTime = 8 * 60 + 30; // 8:30 轉換為分鐘數
  const endTime = 24 * 60; // 24:00 轉換為分鐘數
  const wrapperRef = useRef(null);
  const timeScaleRef = useRef(null);

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
      return '24:00';
    }
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    return `${formattedHour}:${formattedMinute}`;
  };

  const timeIntervals = [];
  const totalIntervals = ((endTime - startTime) / 15); // 每15分鐘一格

  for (let i = 0; i <= totalIntervals; i++) {
    const totalMinutes = startTime + (i * 15);
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const isHourMark = minute === 0;
    const isHalfHourMark = minute === 30;
    const isStartTime = i === 0; // 8:30
    
    timeIntervals.push({
      time: formatTime(hour, minute),
      type: isHourMark ? 'hour' : isHalfHourMark ? 'half' : 'quarter',
      isStartTime
    });
  }

  return (
    <div className="time-wrapper" ref={wrapperRef} onWheel={handleScroll}>
      <div className="time-scale-container" onWheel={handleHorizontalScroll}>
        <div className="time-scale" ref={timeScaleRef} style={{ overflow: 'visible' }}>
          {timeIntervals.map((interval, index) => (
            <div 
              key={index} 
              className={`time-scale-mark ${interval.type}`}
            >
              {(interval.type === 'hour' || interval.isStartTime) && (
                <div className={`time-scale-hour-start ${interval.isStartTime ? 'start-time' : ''}`}>
                  {interval.time}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="gantt-chart">
        {children}
      </div>
    </div>
  );
};

export default TimeWrapper;