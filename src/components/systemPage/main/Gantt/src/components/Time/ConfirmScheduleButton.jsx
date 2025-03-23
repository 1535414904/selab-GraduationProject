import React from "react";
import axios from "axios";
import { BASE_URL } from "/src/config";
import { updateSurgeryInDatabase } from "../DragDrop/dragEndHandler";
import { getTimeSettings, clearTempTimeSettings } from "./timeUtils";

const ConfirmScheduleButton = ({ rows }) => {
  const confirmChanges = async () => {
    try {
      // 開始確認修改
      console.log('開始確認修改排班...');
      
      const updatePromises = [];
      
      // 遍歷每個手術房
      for (const roomIndex in rows) {
        const room = rows[roomIndex];
        if (room.data && room.data.length > 0) {
          // 使用 updateSurgeryInDatabase 函數更新每個手術房的數據
          // 參數傳遞: rows, sourceRoomIndex, destinationRoomIndex, sourceIndex, destinationIndex
          // 因為是確認操作，這裡源和目標都是同一個房間
          const updatePromise = updateSurgeryInDatabase(
            rows, 
            parseInt(roomIndex), 
            parseInt(roomIndex), 
            0, 
            0
          );
          
          updatePromises.push(updatePromise);
        }
      }
      
      // 等待所有更新完成
      await Promise.all(updatePromises);
      
      // 如果有臨時時間設定，則將其保存到 localStorage
      const tempSettings = getTimeSettings(true);
      if (tempSettings) {
        // 保存到 localStorage
        localStorage.setItem("ganttTimeSettings", JSON.stringify(tempSettings));
        // 清除臨時設定
        clearTempTimeSettings();
      }
      
      // 通知用戶更新成功
      alert('排班已成功更新！');
      
      // 重新載入頁面，確保所有組件都使用新的設定
      window.location.reload();
    } catch (error) {
      console.error('確認修改排班時發生錯誤:', error);
      alert(`確認修改失敗: ${error.message}`);
    }
  };

  return (
    <button
      onClick={confirmChanges}
      className="confirm-schedule-button"
    >
      確認修改
    </button>
  );
};

export default ConfirmScheduleButton; 