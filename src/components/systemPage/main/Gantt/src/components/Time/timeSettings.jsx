/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { setTempTimeSettings, clearTempTimeSettings } from "./timeUtils";
import { use } from "react";
import axios from "axios";
import { BASE_URL } from "../../../../../../../config";

const TimeSettings = ({ onTimeSettingsChange, initialTimeSettings, setInitialTimeSettings }) => {
  // 使用 initialTimeSettings 作為初始值
  const [timeSettings, setTimeSettings] = useState(initialTimeSettings);

  useEffect(() => {
    console.log("initialTimeSettings", initialTimeSettings);
    console.log("timeSettings", timeSettings);
  }, [initialTimeSettings, timeSettings]);

  // 當 initialTimeSettings 變更時，同步更新 timeSettings（確保 UI 顯示正確）
  useEffect(() => {
    setTimeSettings(initialTimeSettings);
  }, [initialTimeSettings]);

  // 轉換分鐘為時間格式 (HH:MM)
  const minutesToTimeString = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  // 時間字串轉換為分鐘數
  const timeStringToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // 更新時間設定
  const handleTimeChange = (key, value) => {
    try {
      const minutes = timeStringToMinutes(value);
      const newSettings = { ...timeSettings, [key]: minutes };

      // 驗證時間邏輯
      if (
        newSettings.surgeryStartTime > newSettings.regularEndTime ||
        newSettings.surgeryStartTime > newSettings.overtimeEndTime ||
        newSettings.regularEndTime > newSettings.overtimeEndTime
      ) {
        alert("時間設定錯誤：請確認「手術起始時間」 ≤ 「常規結束時間」 ≤ 「加班結束時間」");
        return;
      }
      setTimeSettings(newSettings);
    } catch (error) {
      console.error("轉換時間時出錯：", error);
    }
  };

  // 處理清潔時間變更
  const handleCleaningTimeChange = (minutes) => {
    const updatedSettings = { ...timeSettings, cleaningTime: minutes };
    setTimeSettings(updatedSettings);
  };

  // 試排確認
  const applySettings = async ()=> {
    event.preventDefault();
    setTempTimeSettings(timeSettings);
    setInitialTimeSettings(timeSettings);
    localStorage.setItem("ganttTimeSettings", JSON.stringify(timeSettings)); // 確保設定儲存
    if (onTimeSettingsChange) {
      onTimeSettingsChange(timeSettings, true);
    }
    try {
      const payload = {
        surgeryStartTime: timeSettings.surgeryStartTime,
        regularEndTime: timeSettings.regularEndTime,
        overtimeEndTime: timeSettings.overtimeEndTime,
        cleaningTime: timeSettings.cleaningTime
      };
  
      const response = await axios.post(`${BASE_URL}/api/system/algorithm/time-settings/export`, payload);
      console.log("CSV 產生結果：", response.data);
      alert("CSV 檔案已成功生成！");
    } catch (error) {
      console.error("生成 CSV 失敗：", error);
      alert("生成 CSV 失敗，請稍後再試。");
    }
    alert("時間設定已更新，您可以在甘特圖中預覽變更。");
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
            onChange={(e) => handleTimeChange("surgeryStartTime", e.target.value)}
            className="time-input"
          />
        </div>
        <div className="time-settings-item">
          <label>常規結束時間：</label>
          <input
            type="time"
            value={minutesToTimeString(timeSettings.regularEndTime)}
            onChange={(e) => handleTimeChange("regularEndTime", e.target.value)}
            className="time-input"
          />
        </div>
        <div className="time-settings-item">
          <label>加班結束時間：</label>
          <input
            type="time"
            value={minutesToTimeString(timeSettings.overtimeEndTime)}
            onChange={(e) => handleTimeChange("overtimeEndTime", e.target.value)}
            className="time-input"
          />
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
        </div>
        <div className="apply-settings-button-container">
          <button onClick={applySettings} className="apply-settings-button">
            確認
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSettings;
