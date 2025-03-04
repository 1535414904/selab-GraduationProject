import React, { useState } from "react";
import { createPortal } from "react-dom";
import { calculateWidth } from "./calculateWidth";
import SurgeryModal from "../Modal/SurgeryModal";
import axios from 'axios';
import { BASE_URL } from "/src/config";

function RoomItem({ item, fixedHeight, isDragging }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [surgeryDetails, setSurgeryDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isOver24Hours = item.endTime > "24:00";

  const handleClick = async () => {
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
            color: item.color
          };
          setSurgeryDetails(mergedData);
        } else {
          // 如果沒有獲取到資料，使用現有的項目資料
          setSurgeryDetails(item);
        }
        
        setIsModalOpen(true);
      } catch (error) {
        console.error('獲取手術詳細資料時發生錯誤:', error);
        setError(`獲取手術詳細資料失敗: ${error.message}`);
        // 發生錯誤時，使用現有的項目資料
        setSurgeryDetails(item);
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

  return (
    <>
      <div
        className={`flex flex-col justify-center items-center text-xs p-1 border-2 border-gray-300 rounded-2xl ${colorClass()} ${
          isDragging ? "bg-orange-400 opacity-50" : ""
        } transform transition-transform duration-100 active:scale-110 ${loading ? 'cursor-wait' : item.isCleaningTime ? 'cursor-move' : 'cursor-pointer'}`}
        style={{
          width: width,
          height: fixedHeight,
          opacity: isDragging || isOver24Hours ? 0.5 : 1,
          cursor: loading ? 'wait' : (item.isCleaningTime ? "move" : "pointer"),
          position: "relative",
          alignSelf: "flex-start",
          inset: "auto",
          zIndex: isDragging ? 9999 : 10,
        }}
        onClick={handleClick}
      >
        <div>{item.doctor}</div>
        <div>{item.surgery}</div>
        <div>
          {item.startTime} - {item.endTime}
        </div>
      </div>

      {isModalOpen && 
        createPortal(
          <SurgeryModal surgery={surgeryDetails || item} onClose={() => setIsModalOpen(false)} error={error} />,
          document.body
        )
      }
    </>
  );
}

export default RoomItem;
