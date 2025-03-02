import React, { useState } from "react";
import { calculateWidth } from "./calculateWidth";
import SurgeryModal from "../Modal/SurgeryModal";

function RoomItem({ item, fixedHeight, isDragging }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isOver24Hours = item.endTime > "24:00";

  const handleClick = () => {
    if (!item.isCleaningTime) {
      // Only surgery items can be clicked to view details
      setIsModalOpen(true);
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
        } transform transition-transform duration-100 active:scale-110`}
        style={{
          width: width,
          height: fixedHeight,
          opacity: isDragging || isOver24Hours ? 0.5 : 1,
          cursor: item.isCleaningTime ? "move" : "pointer",
          // These are the important fixes:
          position: "relative",
          alignSelf: "flex-start",
          inset: "auto",
          zIndex: 10,
        }}
        onClick={handleClick}
      >
        <div>{item.doctor}</div>
        <div>{item.surgery}</div>
        <div>
          {item.startTime} - {item.endTime}
        </div>
      </div>

      {isModalOpen && (
        <SurgeryModal surgery={item} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

export default RoomItem;
