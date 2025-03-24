import React, { useRef, useCallback, useEffect, useState } from "react";
import { getTimeSettings } from './timeUtils';

const TimeWrapper = ({ children, containerWidth, useTempSettings = true }) => {
  // 新增時間設定狀態
  const [timeSettings, setTimeSettings] = useState({
    surgeryStartTime: 510, // 預設值 510 分鐘 = 8:30 AM (從00:00開始計算)
    regularEndTime: 1050,  // 預設值 1050 分鐘 = 17:30 PM (從00:00開始計算)
    overtimeEndTime: 1200, // 預設值 1200 分鐘 = 20:00 PM (從00:00開始計算)
    cleaningTime: 45,      // 預設值 45 分鐘
  });
  
  // 為了解決拖曳後甘特圖顯示偏差問題，新增一個key來強制重新渲染
  const [renderKey, setRenderKey] = useState(0);

  // 從時間設定中獲取設定
  const updateTimeSettings = useCallback(() => {
    // 使用臨時設定（排班管理頁面）或正式設定（主頁）
    const settings = getTimeSettings(useTempSettings);
    setTimeSettings(settings);
    // 強制重新渲染時間軸和內容
    setRenderKey(prevKey => prevKey + 1);
  }, [useTempSettings]);

  // 初始化時載入設定
  useEffect(() => {
    updateTimeSettings();
  }, [updateTimeSettings]);

  // 監聽 localStorage 變更
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "ganttTimeSettings") {
        updateTimeSettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 新增：額外監聽拖曳和清潔時間變更的自定義事件
    const handleDragOrCleaningChange = () => {
      updateTimeSettings();
    };
    
    window.addEventListener('ganttDragEnd', handleDragOrCleaningChange);
    window.addEventListener('cleaningTimeChange', handleDragOrCleaningChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ganttDragEnd', handleDragOrCleaningChange);
      window.removeEventListener('cleaningTimeChange', handleDragOrCleaningChange);
    };
  }, [updateTimeSettings]);
  
  // 將時間設定轉換為分鐘
  const startTime = timeSettings.surgeryStartTime; // 手術開始時間
  const endTime = 32 * 60; // 擴展到凌晨8:00 (24:00 + 8:00)，保留不變

  const wrapperRef = useRef(null);
  const timeScaleRef = useRef(null);
  const contentRef = useRef(null);

  // 每15分鐘對應25px
  const pixelsPer15Minutes = 25;

  // 同步滾動處理
  const syncScroll = useCallback((scrollLeft) => {
    if (timeScaleRef.current) {
      timeScaleRef.current.parentElement.scrollLeft = scrollLeft;
    }
    if (contentRef.current) {
      contentRef.current.scrollLeft = scrollLeft;
    }
  }, []);

  // 處理滾動事件
  const handleScroll = useCallback((event) => {
    const { scrollLeft } = event.target;
    syncScroll(scrollLeft);
  }, [syncScroll]);

  // 處理滾輪事件
  const handleWheel = useCallback((event) => {
    event.preventDefault();
    const scrollAmount = event.deltaY;
    
    if (timeScaleRef.current) {
      const currentScroll = timeScaleRef.current.parentElement.scrollLeft;
      const newScrollLeft = currentScroll + scrollAmount;
      syncScroll(newScrollLeft);
    }
  }, [syncScroll]);

  // 添加滾動事件監聽
  useEffect(() => {
    const timeScaleContainer = timeScaleRef.current?.parentElement;
    const content = contentRef.current;
    const wrapper = wrapperRef.current;

    if (timeScaleContainer && content && wrapper) {
      timeScaleContainer.addEventListener('scroll', handleScroll);
      content.addEventListener('scroll', handleScroll);
      wrapper.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        timeScaleContainer.removeEventListener('scroll', handleScroll);
        content.removeEventListener('scroll', handleScroll);
        wrapper.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleScroll, handleWheel]);

  // 時間格式化函數
  const formatTime = useCallback((hour, minute) => {
    if (hour === 24 && minute === 0) {
      return "24:00";
    }
    
    if (hour >= 24) {
      hour = hour - 24;
    }
    
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  }, []);

  // 生成時間間隔
  const timeIntervals = [];
  const totalIntervals = (endTime - startTime) / 15;
  
  for (let i = 0; i <= totalIntervals; i++) {
    const totalMinutes = startTime + i * 15;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    
    timeIntervals.push({
      time: formatTime(hour, minute),
      type: minute === 0 ? "hour" : minute === 30 ? "half" : "quarter",
      isStartTime: i === 0,
      is24Hour: hour === 24 && minute === 0,
      position: i * pixelsPer15Minutes,
    });
  }

  // 計算時間軸的總寬度
  const totalWidth = totalIntervals * pixelsPer15Minutes;

  return (
    <div className="time-wrapper-container" ref={wrapperRef} key={renderKey}>
      <div className="time-scale-header">
        <div className="scrollable-container">
          <div
            className="time-scale-ruler"
            ref={timeScaleRef}
            style={{ width: `${totalWidth}px` }}
          >
            {timeIntervals.map((interval, index) => (
              <div
                key={index}
                className={`time-mark ${interval.type}-mark ${interval.is24Hour ? "time-mark-24hour" : ""}`}
                style={{ left: `${interval.position}px` }}
              >
                {(interval.type === "hour" || interval.isStartTime || interval.is24Hour) && (
                  <div
                    className={`time-mark-label ${
                      interval.isStartTime
                        ? "time-mark-start"
                        : interval.is24Hour
                        ? "time-mark-24hour-label"
                        : ""
                    }`}
                    style={{ left: interval.isStartTime ? "0" : "50%" }}
                  >
                    {interval.time}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="time-wrapper-content">
        <div className="scrollable-container" ref={contentRef}>
          <div style={{ width: `${totalWidth}px`, minHeight: "100%" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeWrapper;
