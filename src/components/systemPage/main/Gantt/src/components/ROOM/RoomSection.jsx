import React from "react";
import DroppableContainer from "../DragDrop/DroppableContainer"; // Import DroppableContainer component

function RoomSection({ room, roomIndex }) {
  return (
    <div className="relative">
      <h3 className="text-sm font-medium my-0.5 pl-3">{room.room}</h3>
      <div className="relative overflow-visible" style={{ zIndex: 1 }}>
        <DroppableContainer room={room} roomIndex={roomIndex} />
      </div>
    </div>
  );
}

export default RoomSection;
