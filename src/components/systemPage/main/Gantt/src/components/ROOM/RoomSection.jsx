import React from "react";
import DroppableContainer from "../DragDrop/DroppableContainer";
import "../../styles.css"; // ✅ 引入外部 CSS

function RoomSection({ room, roomIndex }) {
  return (
    <div className="room-section">
      <h3 className="room-title">{room.room}</h3>
      <div className="room-container">
        <DroppableContainer room={room} roomIndex={roomIndex} />
      </div>
    </div>
  );
}

export default RoomSection;

