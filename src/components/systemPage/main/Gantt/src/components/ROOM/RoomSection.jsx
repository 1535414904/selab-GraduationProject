import React, { useState } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import RoomItem from "./RoomItem";
import DroppableContainer from "../DragDrop/DroppableContainer";

function RoomSection({ room, roomIndex, onPinStatusChange }) {
  const [isPinned, setIsPinned] = useState(room.isPinned || false);

  // 處理釘選按鈕點擊
  const handlePinClick = (e) => {
    e.stopPropagation();
    const newPinnedStatus = !isPinned;
    setIsPinned(newPinnedStatus);
    
    // 通知父組件釘選狀態已更改
    if (onPinStatusChange) {
      onPinStatusChange(roomIndex, newPinnedStatus);
    }
  };

  return (
    <div className="room-section">
      <h3 className="room-title">
        <span>{room.room}</span>
        {/* 釘選按鈕 */}
        <span 
          className="room-pin-button"
          onClick={handlePinClick}
          title={isPinned ? "取消釘選" : "釘選此手術房"}
        >
          {isPinned ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="pin-icon pin-icon-active">
                <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" />
              </svg>
              <span className="pin-text pin-text-active">已釘選</span>
            </>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="pin-icon">
              <path d="M14 4v5c0 1.12.37 2.16 1 3H9c.65-.86 1-1.9 1-3V4h4m3-2H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3V4h1c.55 0 1-.45 1-1s-.45-1-1-1z" />
            </svg>
          )}
        </span>
      </h3>
      <div className="room-content">
        <DroppableContainer 
          room={room} 
          roomIndex={roomIndex} 
          isPinned={isPinned}
          roomName={room.room} // 傳遞手術室名稱
        />
      </div>
    </div>
  );
}

export default RoomSection;
