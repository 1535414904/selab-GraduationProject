import axios from 'axios';
import { calculateDuration, addMinutesToTime } from '../Time/timeUtils';
import { getColorByEndTime, getCleaningColor } from '../ROOM/colorUtils';
import { BASE_URL } from "/src/config";
import { getTimeSettings } from '../Time/timeUtils';

// 修改：移除立即更新後端的邏輯，只更新前端界面
export const handleDragEnd = async (result, rows, setRows) => {
  console.log("開始處理拖曳結束事件");
  const { source, destination } = result;
  if (!destination) return null;

  const sourceRoomIndex = parseInt(source.droppableId.split("-")[1], 10);
  const destinationRoomIndex = parseInt(destination.droppableId.split("-")[1], 10);
  
  console.log(`從手術室 ${sourceRoomIndex} 拖曳到手術室 ${destinationRoomIndex}`);
  
  const sourceIndex = source.index * 2;
  const destinationIndex = destination.index * 2;
  
  const newRows = [...rows];

  if (sourceRoomIndex === destinationRoomIndex) {
    console.log("同一手術室內的拖曳操作");
    handleSameRoomDrag(newRows, sourceRoomIndex, sourceIndex, destinationIndex);
  } else {
    console.log("跨手術室的拖曳操作");
    handleCrossRoomDrag(newRows, sourceRoomIndex, destinationRoomIndex, sourceIndex, destinationIndex);
  }

  // 只更新前端界面，不發送後端請求
  setRows(newRows);
  console.log("前端界面更新完成，標記有未保存的變更");
  
  // 返回更新後的行數據和變更狀態
  return {
    updatedRows: newRows,
    hasChanges: true  // 確保每次拖曳操作都會設置 hasChanges
  };
};

// 這個函數現在僅供 ConfirmScheduleButton 組件使用
// 修改函數只接受 rows 參數，並遍歷所有房間更新資料庫
export const updateSurgeryInDatabase = async (rows) => {
  console.log("開始更新資料庫...");
  try {
    // 儲存所有更新的房間，用於最後回傳結果
    const updatedRooms = [];
    let errorCount = 0;
    
    // 遍歷所有房間，更新每個房間的手術時間
    for (let roomIndex = 0; roomIndex < rows.length; roomIndex++) {
      const room = rows[roomIndex];
      
      if (!room.data || room.data.length === 0) {
        console.log(`跳過空房間: ${room.room || roomIndex}`);
        continue;
      }
      
      console.log(`處理手術室 ${room.room || roomIndex} 的資料`);
      
      // 過濾出實際手術（非清潔時間）
      const surgeries = room.data.filter(item => !item.isCleaningTime);
      console.log(`該手術室有 ${surgeries.length} 個手術需要更新`);
      
      // 手術室ID
      const operatingRoomId = room.roomId || room.room;
      
      // 初始化開始時間為08:30
      let currentTime = "08:30";
      
      // 遍歷該房間的所有手術，按顯示順序更新
      for (let i = 0; i < surgeries.length; i++) {
        const surgery = surgeries[i];
        
        // 計算實際時間
        const surgeryStartTime = currentTime;
        const surgeryEndTime = addMinutesToTime(currentTime, surgery.duration);
        
        // 準備更新資料 - 加入優先順序資訊但不強制排序
        const updateData = {
          operatingRoomId: operatingRoomId,
          estimatedSurgeryTime: surgery.duration,
          operatingRoomName: room.room,
          prioritySequence: i + 1
        };
        
        console.log(`準備更新手術 ${surgery.applicationId}，房間: ${room.room}，順序: ${i+1}`);
        console.log("更新數據:", JSON.stringify(updateData));
        
        // 發送更新請求
        try {
          // 確認 API 路徑是否正確
          const apiUrl = `${BASE_URL}/api/surgeries/${surgery.applicationId}`;
          console.log("API 請求地址:", apiUrl);
          
          const response = await axios.put(apiUrl, updateData);
          
          if (response.data) {
            console.log(`手術 ${surgery.applicationId} 更新成功，服務器響應:`, response.data);
            // 確保本地資料與後端同步
            surgery.operatingRoomName = room.room;
            surgery.prioritySequence = i + 1;
            updatedRooms.push({
              applicationId: surgery.applicationId,
              roomId: operatingRoomId,
              prioritySequence: i + 1
            });
          } else {
            console.error(`手術 ${surgery.applicationId} 返回空響應`);
            errorCount++;
          }
        } catch (error) {
          console.error(`更新手術 ${surgery.applicationId} 時出錯:`, error);
          console.error('錯誤詳情:', error.response?.data || error.message);
          errorCount++;
        }
        
        currentTime = addMinutesToTime(surgeryEndTime, 45);
      }
    }
    
    console.log(`資料庫更新完成，成功: ${updatedRooms.length} 個，失敗: ${errorCount} 個`);
    return updatedRooms;
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
  // 從時間設定中獲取起始時間和清潔時間
  const timeSettings = getTimeSettings();
  const startHour = Math.floor(timeSettings.surgeryStartTime / 60);
  const startMinute = timeSettings.surgeryStartTime % 60;
  const initialTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
  
  let currentTime = initialTime;
  
  for (let i = 0; i < roomData.length; i += 2) {
    const surgery = roomData[i];
    const surgeryDuration = surgery.duration; // 使用預估手術時間
    
    surgery.startTime = currentTime;
    surgery.endTime = addMinutesToTime(currentTime, surgeryDuration);
    surgery.color = getColorByEndTime(surgery.endTime, false);
    
    if (i + 1 < roomData.length) {
      const cleaning = roomData[i + 1];
      cleaning.startTime = surgery.endTime;
      cleaning.endTime = addMinutesToTime(surgery.endTime, timeSettings.cleaningTime);
      cleaning.color = getCleaningColor();
      currentTime = cleaning.endTime;
    }
  }
};