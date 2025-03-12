import axios from 'axios';
import { calculateDuration, addMinutesToTime } from '../Time/timeUtils';
import { getColorByEndTime, getCleaningColor } from '../ROOM/colorUtils';
import { BASE_URL } from "/src/config";

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

  setRows(newRows);
  
  // 將更新發送到後端並返回更新後的手術資料
  try {
    const updatedSurgeries = await updateSurgeryInDatabase(newRows, sourceRoomIndex, destinationRoomIndex, sourceIndex, destinationIndex);
    return updatedSurgeries;
  } catch (error) {
    console.error('更新手術資料失敗:', error);
    return null;
  }
};

// 新增函數：將更新發送到後端
const updateSurgeryInDatabase = async (rows, sourceRoomIndex, destinationRoomIndex, sourceIndex, destinationIndex) => {
  try {
    // 確定要更新的手術資訊
    const targetRoomIndex = sourceRoomIndex !== destinationRoomIndex ? destinationRoomIndex : sourceRoomIndex;
    const targetRoom = rows[targetRoomIndex];
    
    // 遍歷目標房間的所有手術，更新它們的優先順序和時間
    const surgeriesToUpdate = targetRoom.data.filter(item => !item.isCleaningTime);
    const updatedSurgeries = [];
    
    for (let i = 0; i < surgeriesToUpdate.length; i++) {
      const surgery = surgeriesToUpdate[i];
      
      // 準備更新資料
      const updateData = {
        operatingRoomId: targetRoom.roomId || targetRoom.room, // 使用roomId屬性
        prioritySequence: i + 1, // 更新優先順序
        estimatedSurgeryTime: surgery.duration, // 更新預估手術時間
        operatingRoomName: targetRoom.room // 添加手術室名稱
      };
      
      console.log(`更新手術 ${surgery.applicationId} 的資料:`, updateData);
      
      // 發送更新請求
      const response = await axios.put(`${BASE_URL}/api/surgeries/${surgery.applicationId}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log(`已更新手術 ${surgery.applicationId} 的資訊`);
      
      // 保存更新後的手術資料
      if (response.data) {
        // 確保更新後的資料包含手術室名稱
        const updatedSurgery = {
          ...response.data,
          operatingRoomName: targetRoom.room // 確保手術室名稱正確
        };
        
        updatedSurgeries.push({
          applicationId: surgery.applicationId,
          updatedData: updatedSurgery
        });
        
        // 同時更新本地資料
        surgery.operatingRoomName = targetRoom.room;
      }
    }
    
    // 如果是跨房間拖曳，還需要更新源房間的手術順序
    if (sourceRoomIndex !== destinationRoomIndex) {
      const sourceRoom = rows[sourceRoomIndex];
      const sourceSurgeries = sourceRoom.data.filter(item => !item.isCleaningTime);
      
      for (let i = 0; i < sourceSurgeries.length; i++) {
        const surgery = sourceSurgeries[i];
        
        // 準備更新資料
        const updateData = {
          prioritySequence: i + 1, // 只更新優先順序
          operatingRoomName: sourceRoom.room // 確保手術室名稱正確
        };
        
        // 發送更新請求
        const response = await axios.put(`${BASE_URL}/api/surgeries/${surgery.applicationId}`, updateData, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log(`已更新手術 ${surgery.applicationId} 的優先順序`);
        
        // 保存更新後的手術資料
        if (response.data) {
          // 確保更新後的資料包含手術室名稱
          const updatedSurgery = {
            ...response.data,
            operatingRoomName: sourceRoom.room // 確保手術室名稱正確
          };
          
          updatedSurgeries.push({
            applicationId: surgery.applicationId,
            updatedData: updatedSurgery
          });
          
          // 同時更新本地資料
          surgery.operatingRoomName = sourceRoom.room;
        }
      }
    }
    
    console.log('所有手術資訊已成功更新到資料庫');
    return updatedSurgeries; // 返回更新後的手術資料
  } catch (error) {
    console.error('更新手術資訊到資料庫時發生錯誤:', error);
    throw error; // 拋出錯誤以便調用者處理
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

  // 更新手術室名稱
  movedItems[0].operatingRoomName = newRows[destRoomIndex].room;
  movedItems[1].operatingRoomName = newRows[destRoomIndex].room;

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
  movedItems[1].startTime = movedItems[0].endTime;
  movedItems[1].endTime = addMinutesToTime(movedItems[0].endTime, 45);
  movedItems[1].color = getColorByEndTime(movedItems[1].endTime, true);

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