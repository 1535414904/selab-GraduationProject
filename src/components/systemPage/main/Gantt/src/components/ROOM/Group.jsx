import React, { useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import RoomItem from './RoomItem';
import { use } from 'react';

// 群組手術組件
function Group({ group, roomIndex, fixedHeight, isDragging, isPinned, roomName, readOnly = false, onSurgeryClick, isUngroupMode = false }) {
  // 安全檢查，確保 surgeries 存在且為數組
  if (!group.surgeries || !Array.isArray(group.surgeries) || group.surgeries.length === 0) {
    console.error('群組缺少有效的 surgeries 陣列');
    return null;
  }
  
  // 群組的寬度應該等於所有手術的寬度總和
  // 左邊位置應該等於第一個手術的開始位置
  const firstSurgery = group.surgeries[0];
  const lastSurgery = group.surgeries[group.surgeries.length - 1];
  
  // 計算群組的開始和結束時間
  const startTime = firstSurgery.startTime;
  const endTime = lastSurgery.endTime;
  
  // 計算群組包含的手術（不含銜接時間）
  const actualSurgeries = group.surgeries.filter(s => !s.isCleaningTime);
  console.log('actualSurgeries', actualSurgeries);
  
  // 創建群組的展示資料
  const groupItem = {
    id: group.id,
    doctor: `${actualSurgeries.length} 個手術`,
    surgery: '群組手術',
    startTime: startTime,
    endTime: endTime,
    color: group.color || 'orange', // 使用傳入的顏色，或默認橘色
    isGroup: true,
    surgeries: group.surgeries,
    isCleaningTime: false,
    // 確保拖曳時保留這些資訊
    applicationId: group.applicationId || actualSurgeries[0]?.applicationId,
    roomId: group.roomId || actualSurgeries[0]?.roomId || roomIndex,
    operatingRoomName: roomName || group.operatingRoomName,
    roomIndex: roomIndex || group.roomIndex
  };
  
  return (
    <div className="group-container" style={{ position: 'relative' }}>
      {/* 顯示群組的主要資訊 */}
      <RoomItem
        item={groupItem}
        itemIndex={group.index}
        roomIndex={roomIndex}
        fixedHeight={fixedHeight}
        isDragging={isDragging}
        isPinned={isPinned}
        roomName={roomName}
        readOnly={readOnly}
        onSurgeryClick={onSurgeryClick}
        isUngroupMode={isUngroupMode}
      />
      
      {/* 群組標記 - 在群組框的左上角顯示群組圖標 */}
      <div className="absolute top-1 left-1 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      </div>
      
      {/* 添加包含手術數量的標記 */}
      <div className="absolute bottom-1 left-1 text-white text-xs">
        <span className="bg-blue-600 text-white px-1 py-0.5 rounded">
          {actualSurgeries.length} 個手術
        </span>
      </div>
      
      {/* 如果是解除模式，添加提示 */}
      {isUngroupMode && (
        <div className="absolute top-1 right-1 text-red-500 flex items-center">
          <span className="mr-1 text-xs font-bold">點擊解除</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
    </div>
  );
}

// 輔助函數：將時間轉換為分鐘數
const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// 輔助函數：將分鐘數轉換為時間字符串
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

export default Group; 