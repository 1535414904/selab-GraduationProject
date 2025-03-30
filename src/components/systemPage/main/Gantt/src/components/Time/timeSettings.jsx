/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { setTempTimeSettings, clearTempTimeSettings } from "./timeUtils";
import axios from "axios";
import { BASE_URL } from "../../../../../../../config";

const TimeSettings = ({ onTimeSettingsChange, initialTimeSettings, setInitialTimeSettings }) => {
  // 使用 initialTimeSettings 作為初始值
  const [timeSettings, setTimeSettings] = useState(initialTimeSettings);
  // 關閉的手術房列表
  const [closedRooms, setClosedRooms] = useState([]);
  // 選中的關閉手術房 ID 列表
  const [selectedClosedRooms, setSelectedClosedRooms] = useState([]);
  // 加載狀態
  const [loading, setLoading] = useState(false);
  // 使用提示的折疊狀態
  const [tipsCollapsed, setTipsCollapsed] = useState(false);

  useEffect(() => {
    // 獲取所有關閉的手術房
    fetchClosedRooms();
    
    // 從localStorage讀取提示收合狀態
    const savedTipsState = localStorage.getItem('parameterTipsCollapsed');
    if (savedTipsState) {
      setTipsCollapsed(savedTipsState === 'true');
    }
  }, []);

  useEffect(() => {
    console.log("initialTimeSettings", initialTimeSettings);
    console.log("timeSettings", timeSettings);
  }, [initialTimeSettings, timeSettings]);

  // 當 initialTimeSettings 變更時，同步更新 timeSettings（確保 UI 顯示正確）
  useEffect(() => {
    setTimeSettings(initialTimeSettings);
  }, [initialTimeSettings]);

  // 獲取所有關閉的手術房
  const fetchClosedRooms = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/system/operating-rooms`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data && response.data.length > 0) {
        // 過濾出狀態為關閉的手術房
        const closed = response.data.filter(room => room.status === 0);
        setClosedRooms(closed);
        console.log('關閉的手術房:', closed);
      }
    } catch (error) {
      console.error('獲取關閉手術房失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 處理手術房勾選
  const handleRoomSelect = (roomId) => {
    setSelectedClosedRooms(prev => {
      if (prev.includes(roomId)) {
        return prev.filter(id => id !== roomId);
      } else {
        return [...prev, roomId];
      }
    });
  };

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

  // 確認添加選中的關閉手術房
  const confirmSelectedRooms = async () => {
    if (selectedClosedRooms.length === 0) {
      alert("請至少選擇一個關閉的手術房");
      return;
    }

    // 從closedRooms中找出被選中的手術房完整信息
    const selectedRooms = closedRooms.filter(room => selectedClosedRooms.includes(room.id));
    
    // 將選中的關閉手術房信息存儲到localStorage，供ganttData.jsx使用
    localStorage.setItem("reservedClosedRooms", JSON.stringify(selectedRooms));
    
    alert(`已選擇 ${selectedRooms.length} 個關閉手術房加入本次排班`);
    
    // 通知父組件更新
    if (onTimeSettingsChange) {
      onTimeSettingsChange(timeSettings, true);
    }
  };

  // 試排確認
  const applySettings = async (event)=> {
    if (event) event.preventDefault();
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
    alert("參數設定已更新，您可以在甘特圖中預覽變更。");
  };

  // 處理提示收合狀態變更
  const toggleTips = () => {
    const newState = !tipsCollapsed;
    setTipsCollapsed(newState);
    localStorage.setItem('parameterTipsCollapsed', newState.toString());
  };

  return (
    <div className="time-settings-container">
      <h3 className="time-settings-title">參數設定</h3>
      
      {/* 使用提示區域 - 添加收合功能 */}
      <div className={`parameter-tips ${tipsCollapsed ? 'tips-collapsed' : ''}`}>
        <svg 
          className="parameter-tips-icon" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width="20" 
          height="20" 
          fill="currentColor"
        >
          <circle cx="12" cy="12" r="10" fill="#3B82F6" />
          <circle cx="12" cy="7" r="1.5" fill="white" />
          <rect x="11" y="9.5" width="2" height="6" rx="1" fill="white" />
        </svg>
        
        <div className="parameter-tips-content">
          <div className="tips-header">
            <p className="parameter-tips-title">參數設定使用說明</p>
            <button 
              className="tips-toggle-button" 
              onClick={toggleTips}
              aria-label={tipsCollapsed ? "展開說明" : "收合說明"}
            >
              {tipsCollapsed ? "展開" : "收合"}
            </button>
          </div>
          
          {!tipsCollapsed && (
            <ul className="parameter-tips-list">
              <li><strong>時間設定區域</strong>：調整手術起始時間、常規與加班結束時間，以及手術間清潔所需時間</li>
              <li><strong>保留手術房區域</strong>：您可以選擇將目前關閉的手術房暫時加入排班，但不會更改手術房管理中的狀態</li>
              <li><strong>確認加入選中的手術房</strong>：將勾選的關閉狀態手術房加入甘特圖排班</li>
              <li><strong>確認所有設定</strong>：將所有參數設定（時間和保留的手術房）一併應用到甘特圖中</li>
            </ul>
          )}
        </div>
      </div>
      
      {/* 左右兩欄佈局容器 */}
      <div className="parameters-layout">
        {/* 左側：時間設定部分 */}
        <div className="parameters-column">
          <div className="settings-section">
            <h4 className="settings-section-title">時間設定</h4>
            <div className="time-settings-form">
              <div className="time-settings-item">
                <label>手術開始時間：</label>
                <div className="input-container">
                  <input
                    type="time"
                    value={minutesToTimeString(timeSettings.surgeryStartTime)}
                    onChange={(e) => handleTimeChange("surgeryStartTime", e.target.value)}
                    className="time-input"
                  />
                </div>
              </div>
              <div className="time-settings-item">
                <label>常規結束時間：</label>
                <div className="input-container">
                  <input
                    type="time"
                    value={minutesToTimeString(timeSettings.regularEndTime)}
                    onChange={(e) => handleTimeChange("regularEndTime", e.target.value)}
                    className="time-input"
                  />
                </div>
              </div>
              <div className="time-settings-item">
                <label>加班結束時間：</label>
                <div className="input-container">
                  <input
                    type="time"
                    value={minutesToTimeString(timeSettings.overtimeEndTime)}
                    onChange={(e) => handleTimeChange("overtimeEndTime", e.target.value)}
                    className="time-input"
                  />
                </div>
              </div>
              <div className="time-settings-item">
                <label>清潔時間 (分鐘)：</label>
                <div className="input-container">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={timeSettings.cleaningTime}
                    onChange={(e) => handleCleaningTimeChange(parseInt(e.target.value))}
                    className="number-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 右側：保留手術房部分 */}
        <div className="parameters-column">
          <div className="settings-section">
            <h4 className="settings-section-title">保留手術房</h4>
            <p className="settings-description">可選擇將目前關閉的手術房加入本次排班（不會改變手術房管理中的狀態）</p>
            
            {loading ? (
              <div className="loading-rooms">正在載入關閉的手術房...</div>
            ) : closedRooms.length === 0 ? (
              <div className="no-closed-rooms">目前沒有處於關閉狀態的手術房</div>
            ) : (
              <div className="closed-rooms-list">
                {closedRooms.map(room => (
                  <div key={room.id} className="closed-room-item">
                    <input
                      type="checkbox"
                      id={`room-${room.id}`}
                      checked={selectedClosedRooms.includes(room.id)}
                      onChange={() => handleRoomSelect(room.id)}
                    />
                    <label htmlFor={`room-${room.id}`}>
                      {room.name} (ID: {room.id}) - {room.department?.name || '未指定科別'} - {room.roomType}
                    </label>
                  </div>
                ))}
                
                <div className="confirm-rooms-button-container">
                  <button 
                    onClick={confirmSelectedRooms} 
                    className="confirm-rooms-button"
                    disabled={selectedClosedRooms.length === 0}
                  >
                    確認加入選中的手術房
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 確認按鈕 */}
      <div className="apply-settings-button-container">
        <button onClick={applySettings} className="apply-settings-button">
          確認所有設定
        </button>
      </div>
    </div>
  );
};

export default TimeSettings;
