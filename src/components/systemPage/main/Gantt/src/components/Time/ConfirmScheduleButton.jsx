import React from "react";
import axios from "axios";
import { BASE_URL } from "/src/config";
import { updateSurgeryInDatabase } from "../DragDrop/dragEndHandler";

const ConfirmScheduleButton = ({ rows, setRows }) => {
  const confirmSaveChanges = async () => {
    try {
      // 開始確認修改
      console.log('開始確認修改排班...');
      
      const updatePromises = [];
      
      // 遍歷每個手術房
      for (const roomIndex in rows) {
        if (rows[roomIndex].data && rows[roomIndex].data.length > 0) {
          // 使用更新後的 updateSurgeryInDatabase 函數更新每個手術房的數據
          const updatePromise = updateSurgeryInDatabase(rows, parseInt(roomIndex));
          updatePromises.push(updatePromise);
        }
      }
      
      // 等待所有更新完成
      await Promise.all(updatePromises);
      
      // 重新載入最新數據以確保顯示正確的狀態
      try {
        const response = await axios.get(`${BASE_URL}/api/surgeries/scheduled`);
        if (response.data) {
          // 更新前端狀態以反映最新的數據
          console.log('重新載入最新數據');
          // 處理數據格式轉換並更新狀態
          if (setRows && typeof setRows === 'function') {
            setRows(response.data);
          }
        }
      } catch (loadError) {
        console.error('重新載入數據時發生錯誤:', loadError);
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
      onClick={confirmSaveChanges}
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