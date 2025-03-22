import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "/src/config";

const TimeSettings = ({ onTimeSettingsChange }) => {
  // 定義時間設定的狀態
  const [timeSettings, setTimeSettings] = useState({
    surgeryStartTime: 510, // 預設值 510 分鐘 = 8:30 AM (從00:00開始計算)
    regularEndTime: 1050,  // 預設值 1050 分鐘 = 17:30 PM (從00:00開始計算)
    overtimeEndTime: 1200, // 預設值 1200 分鐘 = 20:00 PM (從00:00開始計算)
    cleaningTime: 45,      // 預設值 45 分鐘
  });

  // 當組件載入時嘗試從 localStorage 獲取設定
  useEffect(() => {
    const savedSettings = localStorage.getItem("ganttTimeSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setTimeSettings(parsedSettings);
      } catch (error) {
        console.error("解析時間設定時出錯：", error);
      }
    }
  }, []);

  // 轉換分鐘為時間格式 (HH:MM)
  const minutesToTimeString = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // 時間字串轉換為分鐘數
  const timeStringToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 處理輸入變更
  const handleTimeChange = (field, timeString) => {
    try {
      const minutes = timeStringToMinutes(timeString);
      
      // 更新狀態
      const updatedSettings = {
        ...timeSettings,
        [field]: minutes,
      };
      
      setTimeSettings(updatedSettings);
    } catch (error) {
      console.error("轉換時間時出錯：", error);
    }
  };

  // 處理清潔時間變更
  const handleCleaningTimeChange = (minutes) => {
    const updatedSettings = {
      ...timeSettings,
      cleaningTime: minutes,
    };
    
    setTimeSettings(updatedSettings);
  };
  
  // 試排確認
  const applySettings = () => {
    // 儲存設定到 localStorage
    localStorage.setItem("ganttTimeSettings", JSON.stringify(timeSettings));
    
    // 如果有傳入回調函數，則調用它
    if (onTimeSettingsChange) {
      onTimeSettingsChange(timeSettings);
    }
    
    // 顯示確認訊息
    alert('時間設定已更新，您可以在甘特圖中預覽變更。若要保存變更，請點擊「確認修改」按鈕。');
  };

  return (
    <div className="time-settings-container">
      <h3 className="time-settings-title">時間設定</h3>
      
      <div className="time-settings-form">
        <div className="time-settings-item">
          <label>手術起始時間：</label>
          <input
            type="time"
            value={minutesToTimeString(timeSettings.surgeryStartTime)}
            onChange={(e) => handleTimeChange('surgeryStartTime', e.target.value)}
            className="time-input"
          />
          <span className="time-label">{minutesToTimeString(timeSettings.surgeryStartTime)}</span>
        </div>
        
        <div className="time-settings-item">
          <label>常規結束時間：</label>
          <input
            type="time"
            value={minutesToTimeString(timeSettings.regularEndTime)}
            onChange={(e) => handleTimeChange('regularEndTime', e.target.value)}
            className="time-input"
          />
          <span className="time-label">{minutesToTimeString(timeSettings.regularEndTime)}</span>
        </div>
        
        <div className="time-settings-item">
          <label>加班結束時間：</label>
          <input
            type="time"
            value={minutesToTimeString(timeSettings.overtimeEndTime)}
            onChange={(e) => handleTimeChange('overtimeEndTime', e.target.value)}
            className="time-input"
          />
          <span className="time-label">{minutesToTimeString(timeSettings.overtimeEndTime)}</span>
        </div>
        
        <div className="time-settings-item">
          <label>清潔時間 (分鐘)：</label>
          <input
            type="number"
            min="5"
            max="120"
            value={timeSettings.cleaningTime}
            onChange={(e) => handleCleaningTimeChange(parseInt(e.target.value))}
            className="number-input"
          />
          <span className="time-label">{timeSettings.cleaningTime} 分鐘</span>
        </div>
        
        <div className="apply-settings-button-container">
          <button 
            onClick={applySettings}
            className="apply-settings-button"
          >
            試排確認
          </button>
        </div>
      </div>

      <div className="time-settings-explanation">
        <p>注意：這些設定會影響甘特圖的時間計算和顯示。</p>
        <ul>
          <li>手術起始時間：每天手術室開始進行手術的時間 (預設 08:30)</li>
          <li>常規結束時間：正常工作時間結束的時間點 (預設 17:30)</li>
          <li>加班結束時間：加班時間結束的時間點 (預設 20:00)</li>
          <li>清潔時間：每次手術後的清潔時間 (預設 45 分鐘)</li>
        </ul>
        <p style={{ marginTop: '10px', color: '#e74c3c', fontWeight: '500' }}>
          變更設定後，請點擊「試排確認」按鈕預覽變更。確認無誤後，點擊「確認修改」按鈕保存變更。
        </p>
      </div>
    </div>
  );
};

export default TimeSettings; 