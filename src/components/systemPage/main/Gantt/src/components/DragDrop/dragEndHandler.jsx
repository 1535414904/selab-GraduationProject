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

// 修改為更新手術室中的所有手術項目
export const updateSurgeryInDatabase = async (rows, roomIndex) => {
  try {
    if (!rows || !rows[roomIndex] || !rows[roomIndex].data) {
      console.log('無效的手術室數據');
      return null;
    }
    
    const roomData = rows[roomIndex].data;
    const roomName = rows[roomIndex].room;
    const roomId = rows[roomIndex].roomId || roomName;
    const updatePromises = [];
    
    // 遍歷手術室中的所有項目
    for (let i = 0; i < roomData.length; i += 2) {
      const surgery = roomData[i];
      
      // 跳過清潔時間或無效手術項目
      if (!surgery || !surgery.applicationId || surgery.isCleaningTime) {
        continue;
      }
      
      // 計算手術持續時間（分鐘）
      const durationMinutes = surgery.duration || calculateDuration(surgery.startTime, surgery.endTime);
      
      // 設置優先順序（根據在房間中的位置）
      const prioritySequence = (i / 2) + 1;
      
      // 準備更新資料 - 確保格式與後端 API 期望的一致
      const updateData = {
        operatingRoomId: roomId,
        operatingRoomName: roomName,
        prioritySequence: prioritySequence,
        estimatedSurgeryTime: parseInt(durationMinutes, 10), // 確保是整數
        startTime: surgery.startTime,
        endTime: surgery.endTime
      };
      
      console.log(`準備更新手術 ${surgery.applicationId} 的資料:`, updateData);
      console.log(`API 端點: ${BASE_URL}/api/surgeries/${surgery.applicationId}`);
      
      // 發送更新請求
      const updatePromise = axios.put(`${BASE_URL}/api/surgeries/${surgery.applicationId}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
        }
      }).then(response => {
        console.log(`已更新手術 ${surgery.applicationId} 的資訊，狀態碼:`, response.status);
        return response.data;
      });
      
      updatePromises.push(updatePromise);
    }
    
    // 等待所有更新完成
    const results = await Promise.all(updatePromises);
    console.log('所有手術更新完成:', results);
    return results;
    
  } catch (error) {
    console.error(`更新手術資訊到資料庫時發生錯誤:`, error);
    console.error(`錯誤詳情:`, error.response ? error.response.data : '無響應數據');
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
  if (!newRows[sourceRoomIndex].data) {
    newRows[sourceRoomIndex].data = [];
  }
  if (!newRows[destRoomIndex].data) {
    newRows[destRoomIndex].data = [];
  }

  const sourceRoomData = newRows[sourceRoomIndex].data;
  const destRoomData = newRows[destRoomIndex].data;
  
  const movedItems = sourceRoomData.splice(sourceIndex, 2);
  const surgeryDuration = calculateDuration(movedItems[0].startTime, movedItems[0].endTime);

  // 更新手術室名稱和ID - 確保使用正確的 roomId
  const destRoomId = newRows[destRoomIndex].roomId || newRows[destRoomIndex].room;
  const destRoomName = newRows[destRoomIndex].room;
  
  // 更新手術項目的手術室信息
  movedItems[0].operatingRoomName = destRoomName;
  movedItems[0].operatingRoomId = destRoomId;
  
  // 更新清潔時間項目的手術室信息
  if (movedItems.length > 1) {
    movedItems[1].operatingRoomName = destRoomName;
    movedItems[1].operatingRoomId = destRoomId;
  }

  if (sourceRoomData.length > 0) {
    updateRoomTimes(sourceRoomData);
  }

  let targetIndex = destinationIndex;
  const prevEndTime = targetIndex === 0 ? "08:30" : 
    (destRoomData.length === 0 ? "08:30" : 
    (targetIndex >= destRoomData.length ? destRoomData[destRoomData.length - 1].endTime : 
    destRoomData[targetIndex - 1].endTime));

  movedItems[0].startTime = prevEndTime;
  movedItems[0].endTime = addMinutesToTime(prevEndTime, surgeryDuration);
  movedItems[0].color = getColorByEndTime(movedItems[0].endTime, false);
  
  if (movedItems.length > 1) {
    movedItems[1].startTime = movedItems[0].endTime;
    movedItems[1].endTime = addMinutesToTime(movedItems[0].endTime, 45);
    movedItems[1].color = getColorByEndTime(movedItems[1].endTime, true);
  }

  if (targetIndex >= destRoomData.length) {
    destRoomData.push(...movedItems);
  } else {
    destRoomData.splice(targetIndex, 0, ...movedItems);
  }

  updateRoomTimes(destRoomData);
};

const updateRoomTimes = (roomData) => {
  let currentTime = "08:30";
  
  for (let i = 0; i < roomData.length; i += 2) {
    const surgery = roomData[i];
    const surgeryDuration = calculateDuration(surgery.startTime, surgery.endTime);
    
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