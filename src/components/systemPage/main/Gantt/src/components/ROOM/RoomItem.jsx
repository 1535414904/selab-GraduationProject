import React, { useState } from "react";
import { createPortal } from "react-dom";
import { calculateWidth } from "./calculateWidth";
import SurgeryModal from "../Modal/SurgeryModal";
import axios from 'axios';
import { BASE_URL } from "/src/config";

function RoomItem({ item, fixedHeight, isDragging, isPinned }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [surgeryDetails, setSurgeryDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isOver24Hours = item.endTime > "24:00";

  const handleClick = async (e) => {
    // 如果正在拖曳中，不顯示詳細視窗
    if (isDragging) {
      e.preventDefault();
      return;
    }
    
    if (!item.isCleaningTime && item.applicationId) {
      setLoading(true);
      setError(null);
      
      try {
        // 從後端獲取最新的手術詳細資料
        const response = await axios.get(`${BASE_URL}/api/surgeries/${item.applicationId}`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.data) {
          // 合併後端資料和甘特圖中的時間資訊
          const mergedData = {
            ...response.data,
            // 保留甘特圖中的開始和結束時間
            startTime: item.startTime,
            endTime: item.endTime,
            // 如果後端沒有這些欄位，則使用甘特圖中的資料
            doctor: response.data.chiefSurgeonName || item.doctor,
            surgery: response.data.surgeryName ? `${response.data.surgeryName} (${response.data.patientName || '未知病患'})` : item.surgery,
            color: item.color,
            isPinned: isPinned // 傳遞釘選狀態
          };
          setSurgeryDetails(mergedData);
        } else {
          // 如果沒有獲取到資料，使用現有的項目資料
          setSurgeryDetails({...item, isPinned});
        }
        
        setIsModalOpen(true);
      } catch (error) {
        console.error('獲取手術詳細資料時發生錯誤:', error);
        setError(`獲取手術詳細資料失敗: ${error.message}`);
        // 發生錯誤時，使用現有的項目資料
        setSurgeryDetails({...item, isPinned});
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
  };

  // Determine which color class to use
  const colorClass = () => {
    switch (item.color) {
      case "green":
        return "bg-green-400 hover:bg-green-300";
      case "yellow":
        return "bg-yellow-300 hover:bg-yellow-200";
      case "red":
        return "bg-red-500 hover:bg-red-400 text-white";
      case "blue":
        return "bg-blue-600 hover:bg-blue-500 text-purple-200";
      default:
        return "bg-gray-200 hover:bg-gray-100";
    }
  };

  const width = calculateWidth(item.startTime, item.endTime).width;

  const formatDisplayTime = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    if (hours >= 24) {
      return `${String(hours - 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    return time;
  };

  return (
    <>
      <div
        className={`flex flex-col justify-center items-center text-xs p-1 border-2 ${isPinned ? 'border-red-300' : 'border-gray-300'} rounded-2xl ${colorClass()} ${
          isDragging ? "bg-orange-400 opacity-50" : ""
        } transform transition-transform duration-100 ${isPinned ? '' : 'active:scale-110'} ${loading ? 'cursor-wait' : isPinned ? 'cursor-not-allowed' : item.isCleaningTime ? 'cursor-move' : 'cursor-pointer'} relative`}
        style={{
          width: width,
          height: fixedHeight,
          opacity: isDragging || isOver24Hours ? 0.7 : 1,
          cursor: loading ? 'wait' : (isPinned ? "not-allowed" : (item.isCleaningTime ? "move" : "pointer")),
          position: "relative",
          alignSelf: "flex-start",
          inset: "auto",
          zIndex: isDragging ? 10000 : (item.isCleaningTime ? 1 : 2),
          pointerEvents: "auto",
          transform: isDragging ? "scale(1.02)" : "none",
          transformOrigin: "center",
          boxShadow: isDragging ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
        }}
        onClick={handleClick}
      >
        {isPinned && (
          <div className="absolute top-0 right-0 w-full h-full flex items-center justify-center pointer-events-none">
            <div className="absolute top-0 right-0 bottom-0 left-0 bg-red-100 opacity-10 rounded-xl"></div>
          </div>
        )}
        
        <div>{item.doctor}</div>
        <div>{item.surgery}</div>
        <div>
          {formatDisplayTime(item.startTime)} - {formatDisplayTime(item.endTime)}
        </div>
      </div>

      {isModalOpen && 
        createPortal(
          <SurgeryModal surgery={{...surgeryDetails || item, isPinned}} onClose={() => setIsModalOpen(false)} error={error} />,
          document.body
        )
      }
    </>
  );
}

export default RoomItem;
