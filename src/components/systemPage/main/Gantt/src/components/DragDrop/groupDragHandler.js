import { getColorByEndTime } from '../ROOM/colorUtils';
import { 
  timeToMinutes, 
  minutesToTime, 
  getCleaningDuration,
  updateGroupTimes,
  ensureTimeConsistency
} from '../ROOM/GroupOperations';

// 處理群組拖曳結束
export const handleGroupDragEnd = (result, rows, setRows) => {
  const { source, destination, draggableId } = result;
  
  if (!destination) return false;
  
  // 獲取源房間和目標房間
  const sourceRoomIndex = parseInt(source.droppableId.split('-')[1]);
  const destRoomIndex = parseInt(destination.droppableId.split('-')[1]);
  
  // 複製行數據以避免直接修改狀態
  const newRows = [...rows];
  
  // 找到被拖曳的群組
  const sourceRoom = newRows[sourceRoomIndex];
  const draggedItem = sourceRoom.data.find(item => item.id === draggableId);
  
  // 如果不是群組，則不處理
  if (!draggedItem || !draggedItem.isGroup) return false;
  
  // 如果是在同一房間內移動
  if (sourceRoomIndex === destRoomIndex) {
    return handleSameRoomGroupDrag(
      draggedItem,
      newRows,
      sourceRoomIndex,
      source.index,
      destination.index,
      setRows
    );
  } else {
    // 跨房間拖曳群組
    return handleCrossRoomGroupDrag(
      draggedItem,
      newRows,
      sourceRoomIndex,
      destRoomIndex,
      source.index,
      destination.index,
      setRows
    );
  }
};

// 處理同一房間內的群組拖曳
const handleSameRoomGroupDrag = (
  draggedGroup,
  rows,
  roomIndex,
  sourceIndex,
  destIndex,
  setRows
) => {
  // 如果位置沒有變化，不需要處理
  if (sourceIndex === destIndex) return false;
  
  const roomData = [...rows[roomIndex].data];
  const roomName = rows[roomIndex].room || rows[roomIndex].name || '手術室';
  
  // 從原位置移除群組
  roomData.splice(sourceIndex, 1);
  
  // 獲取目標位置的前後項目，用於調整時間
  const prevItem = destIndex > 0 ? roomData[destIndex - 1] : null;
  const nextItem = destIndex < roomData.length ? roomData[destIndex] : null;
  
  // 調整群組時間以匹配目標位置
  const adjustedGroup = updateGroupTimes(draggedGroup, prevItem, nextItem, roomName);
  
  // 在目標位置插入群組
  roomData.splice(destIndex, 0, adjustedGroup);
  
  // 確保時間連續性
  ensureTimeConsistency(roomData, Math.min(sourceIndex, destIndex), roomName);
  
  // 更新顏色
  updateGroupColors(roomData);
  
  // 更新行數據
  const newRows = [...rows];
  newRows[roomIndex] = {
    ...newRows[roomIndex],
    data: roomData
  };
  
  setRows(newRows);
  return true;
};

// 處理跨房間的群組拖曳
const handleCrossRoomGroupDrag = (
  draggedGroup,
  rows,
  sourceRoomIndex,
  destRoomIndex,
  sourceIndex,
  destIndex,
  setRows
) => {
  // 源房間和目標房間的數據
  const sourceRoomData = [...rows[sourceRoomIndex].data];
  const destRoomData = [...rows[destRoomIndex].data];
  
  const sourceRoomName = rows[sourceRoomIndex].room || rows[sourceRoomIndex].name || '手術室';
  const destRoomName = rows[destRoomIndex].room || rows[destRoomIndex].name || '手術室';
  
  // 從源房間移除群組
  sourceRoomData.splice(sourceIndex, 1);
  
  // 獲取目標位置的前後項目，用於調整時間
  const prevItem = destIndex > 0 ? destRoomData[destIndex - 1] : null;
  const nextItem = destIndex < destRoomData.length ? destRoomData[destIndex] : null;
  
  // 調整群組時間以匹配目標位置
  const adjustedGroup = {
    ...updateGroupTimes(draggedGroup, prevItem, nextItem, destRoomName),
    operatingRoomName: destRoomName, // 更新手術室名稱
    roomIndex: destRoomIndex, // 更新房間索引
    roomId: rows[destRoomIndex].roomId || rows[destRoomIndex].id // 更新房間ID
  };
  
  // 更新群組內部手術的手術室名稱
  if (adjustedGroup.surgeries && adjustedGroup.surgeries.length > 0) {
    adjustedGroup.surgeries = adjustedGroup.surgeries.map(surgery => ({
      ...surgery,
      operatingRoomName: destRoomName
    }));
  }
  
  // 在目標房間插入群組
  destRoomData.splice(destIndex, 0, adjustedGroup);
  
  // 確保源房間和目標房間的時間連續性
  ensureTimeConsistency(sourceRoomData, sourceIndex, sourceRoomName);
  ensureTimeConsistency(destRoomData, destIndex, destRoomName);
  
  // 更新顏色
  updateGroupColors(sourceRoomData);
  updateGroupColors(destRoomData);
  
  // 更新行數據
  const newRows = [...rows];
  newRows[sourceRoomIndex] = {
    ...newRows[sourceRoomIndex],
    data: sourceRoomData
  };
  newRows[destRoomIndex] = {
    ...newRows[destRoomIndex],
    data: destRoomData
  };
  
  setRows(newRows);
  return true;
};

// 更新群組和其中項目的顏色
export const updateGroupColors = (roomData) => {
  if (!roomData || roomData.length === 0) return;
  
  roomData.forEach(item => {
    if (item.isGroup && item.surgeries && item.surgeries.length > 0) {
      // 找出非清潔時間的手術
      const surgeries = item.surgeries.filter(s => !s.isCleaningTime);
      
      if (surgeries.length > 0) {
        // 獲取最後一個非清潔時間手術
        const lastSurgery = surgeries[surgeries.length - 1];
        
        // 根據結束時間確定顏色
        const color = getColorByEndTime(lastSurgery.endTime, false, true);
        item.color = color;
        
        // 更新群組內每個手術的顏色
        surgeries.forEach(surgery => {
          surgery.color = getColorByEndTime(surgery.endTime, false, true);
        });
      }
    }
  });
}; 