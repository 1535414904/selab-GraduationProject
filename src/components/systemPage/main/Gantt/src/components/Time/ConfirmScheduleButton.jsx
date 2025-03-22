import React from "react";
import axios from "axios";
import { BASE_URL } from "/src/config";
import { updateSurgeryInDatabase } from "../DragDrop/dragEndHandler";

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
      
      // 重新載入時間設定（如果有的話）
      const timeSettingsStr = localStorage.getItem("ganttTimeSettings");
      if (timeSettingsStr) {
        try {
          // 讀取並重新保存時間設定，觸發更新
          const settings = JSON.parse(timeSettingsStr);
          localStorage.setItem("ganttTimeSettings", JSON.stringify(settings));
          
          // 強制重新整理頁面，確保所有組件都重新載入時間設定
          window.location.reload();
        } catch (error) {
          console.error('重新載入時間設定時發生錯誤:', error);
        }
      }
      
      // 通知用戶更新成功
      alert('排班已成功更新！');
      
    } catch (error) {
      console.error('確認修改時發生錯誤:', error);
      alert('更新排班時發生錯誤，請稍後再試');
    }
  };

  return (
    <button
      className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-300"
      onClick={confirmChanges}
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
          d="M5 13l4 4L19 7"
        />
      </svg>
      確認修改
    </button>
  );
};

export default ConfirmScheduleButton; 