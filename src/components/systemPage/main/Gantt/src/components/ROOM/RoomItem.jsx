import React, { useState } from "react";
import { calculateWidth } from "./calculateWidth";
import SurgeryModal from "../Modal/SurgeryModal";
import "../../styles.css"; // ✅ 引入外部 CSS

function RoomItem({ item, fixedHeight, isDragging }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isOver24Hours = item.endTime > "24:00";

  const handleClick = () => {
    if (!item.isCleaningTime) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        className={`room-item ${item.color} ${isDragging ? "dragging" : ""}`}
        style={{
          width: calculateWidth(item.startTime, item.endTime).width,
          height: fixedHeight,
          opacity: isDragging || isOver24Hours ? 0.5 : 1,
          cursor: item.isCleaningTime ? "move" : "pointer",
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
