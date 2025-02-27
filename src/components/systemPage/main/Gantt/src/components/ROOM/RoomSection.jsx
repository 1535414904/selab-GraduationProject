import React from 'react';
import DroppableContainer from '../DragDrop/DroppableContainer'; // 引入 DroppableContainer 组件

function RoomSection({ room, roomIndex }) {
  return (
    <div className="room-section">
      <h3 style={{ fontSize: '14px', margin: '2px 0' }}>{room.room}</h3> {/* 縮小標頭大小 */}
      <DroppableContainer room={room} roomIndex={roomIndex} />
    </div>
  );
}

export default RoomSection;
