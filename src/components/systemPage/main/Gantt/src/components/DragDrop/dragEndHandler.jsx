import axios from 'axios';
import { calculateDuration, addMinutesToTime } from '../Time/timeUtils';
import { getColorByEndTime, getCleaningColor } from '../ROOM/colorUtils';
import { BASE_URL } from "/src/config";

// 修改：移除立即更新後端的邏輯，只更新前端界面
export const handleDragEnd = async (result, rows, setRows) => {
  const { source, destination } = result;
  if (!destination) return null;

  const sourceRoomIndex = parseInt(source.droppableId.split("-")[1], 10);
  const destinationRoomIndex = parseInt(destination.droppableId.split("-")[1], 10);
  
  const sourceIndex = source.index * 2;
  const destinationIndex = destination.index * 2;
  
  const newRows = [...rows];

  if (sourceRoomIndex === destinationRoomIndex) {
    handleSameRoomDrag(newRows, sourceRoomIndex, sourceIndex, destinationIndex);
  } else {
    handleCrossRoomDrag(newRows, sourceRoomIndex, destinationRoomIndex, sourceIndex, destinationIndex);
  }

  // 只更新前端界面，不發送後端請求
  setRows(newRows);
  
  // 返回更新後的行數據，但不發送到後端
  return { updatedRows: newRows };
};

// 這個函數現在僅供 ConfirmScheduleButton 組件使用
// 保留此函數供確認修改按鈕使用
const updateSurgeryInDatabase = async (rows, sourceRoomIndex, destinationRoomIndex, sourceIndex, destinationIndex) => {
  try {
    const targetRoomIndex = sourceRoomIndex !== destinationRoomIndex ? destinationRoomIndex : sourceRoomIndex;
    const targetRoom = rows[targetRoomIndex];
    
    // 只處理實際手術，不處理清潔時間
    const surgeriesToUpdate = targetRoom.data.filter(item => !item.isCleaningTime);
    
    // 計算每個手術的實際時間
    let currentTime = "08:30"; // 每天的起始時間
    
    for (let i = 0; i < surgeriesToUpdate.length; i++) {
      const surgery = surgeriesToUpdate[i];
      
      // 更新資料
      const updateData = {
        operatingRoomId: targetRoom.roomId || targetRoom.room,
        estimatedSurgeryTime: surgery.duration,
        operatingRoomName: targetRoom.room
      };
      
      // 發送更新請求
      const response = await axios.put(`${BASE_URL}/api/surgeries/${surgery.applicationId}`, updateData);
      
      if (response.data) {
        // 更新本地資料
        surgery.operatingRoomName = targetRoom.room;
      }
      
      // 計算下一個手術的開始時間
      currentTime = addMinutesToTime(currentTime, surgery.duration + 45); // 加上手術時間和清潔時間
    }
    
    return true;
  } catch (error) {
    console.error('更新手術資訊到資料庫時發生錯誤:', error);
    throw error;
  }
};

const handleSameRoomDrag = (newRows, roomIndex, sourceIndex, destinationIndex) => {
  const roomData = newRows[roomIndex].data;
  const movedItems = roomData.splice(sourceIndex, 2);
  
  let targetIndex = destinationIndex % 2 !== 0 ? destinationIndex - 1 : destinationIndex;
  
  if (targetIndex >= roomData.length) {
    roomData.push(...movedItems);
  } else {
    roomData.splice(targetIndex, 0, ...movedItems);
  }

  updateRoomTimes(roomData);
};

const handleCrossRoomDrag = (newRows, sourceRoomIndex, destRoomIndex, sourceIndex, destinationIndex) => {
  const sourceRoomData = newRows[sourceRoomIndex].data;
  const destRoomData = newRows[destRoomIndex].data;
  
  const movedItems = sourceRoomData.splice(sourceIndex, 2);
  const surgeryDuration = movedItems[0].duration; // 使用預估手術時間

  // 更新手術室名稱
  movedItems[0].operatingRoomName = newRows[destRoomIndex].room;
  movedItems[1].operatingRoomName = newRows[destRoomIndex].room;

  // 更新源房間的時間
  if (sourceRoomData.length > 0) {
    updateRoomTimes(sourceRoomData);
  }

  // 計算目標位置的時間
  let targetIndex = destinationIndex;
  const prevEndTime = targetIndex === 0 ? "08:30" : 
    (destRoomData.length === 0 ? "08:30" : 
    (targetIndex >= destRoomData.length ? destRoomData[destRoomData.length - 1].endTime : 
    destRoomData[targetIndex - 1].endTime));

  // 更新移動項目的時間
  movedItems[0].startTime = prevEndTime;
  movedItems[0].endTime = addMinutesToTime(prevEndTime, surgeryDuration);
  movedItems[0].color = getColorByEndTime(movedItems[0].endTime, false);
  
  // 更新清潔時間
  movedItems[1].startTime = movedItems[0].endTime;
  movedItems[1].endTime = addMinutesToTime(movedItems[0].endTime, 45);
  movedItems[1].color = getCleaningColor();

  // 插入移動的項目
  if (targetIndex >= destRoomData.length) {
    destRoomData.push(...movedItems);
  } else {
    destRoomData.splice(targetIndex, 0, ...movedItems);
  }

  // 更新目標房間的所有時間
  updateRoomTimes(destRoomData);
};

const updateRoomTimes = (roomData) => {
  let currentTime = "08:30";
  
  for (let i = 0; i < roomData.length; i += 2) {
    const surgery = roomData[i];
    const surgeryDuration = surgery.duration; // 使用預估手術時間
    
    surgery.startTime = currentTime;
    surgery.endTime = addMinutesToTime(currentTime, surgeryDuration);
    surgery.color = getColorByEndTime(surgery.endTime, false);
    
    if (i + 1 < roomData.length) {
      const cleaning = roomData[i + 1];
      cleaning.startTime = surgery.endTime;
      cleaning.endTime = addMinutesToTime(surgery.endTime, 45);
      cleaning.color = getCleaningColor();
      currentTime = cleaning.endTime;
    }
  }
};

// 導出 updateSurgeryInDatabase 函數供確認修改按鈕使用
export { updateSurgeryInDatabase };