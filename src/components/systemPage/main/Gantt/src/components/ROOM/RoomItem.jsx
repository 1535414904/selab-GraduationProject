import React, { useState } from 'react';
import { calculateWidth } from './calculateWidth';
import SurgeryModal from '../Modal/SurgeryModal';

function RoomItem({ item, fixedHeight, isDragging }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isOver24Hours = item.endTime > '24:00';

  const handleClick = () => {
    if (!item.isCleaningTime) {  // 只有手術項目可以點擊查看詳情
      setIsModalOpen(true);
    }
  };

  const style = {
    width: calculateWidth(item.startTime, item.endTime).width,
    height: fixedHeight,
    opacity: isDragging || isOver24Hours ? 0.5 : 1,
    fontSize: '12px',
    padding: '5px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: item.isCleaningTime ? 'move' : 'pointer',
  };

  return (
    <>
      <div 
        className={`item ${item.color} ${isDragging ? 'dragging' : ''}`} 
        style={style}
        onClick={handleClick}
      >
        <div>{item.doctor}</div>
        <div>{item.surgery}</div>
        <div>{item.startTime} - {item.endTime}</div>
      </div>

      {isModalOpen && (
        <SurgeryModal
          surgery={item}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export default RoomItem;