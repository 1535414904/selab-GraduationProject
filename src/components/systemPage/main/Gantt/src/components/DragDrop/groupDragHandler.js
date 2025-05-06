import { getColorByEndTime } from '../ROOM/colorUtils';
import axios from 'axios';
import { BASE_URL } from "/src/config";
import { 
  timeToMinutes, 
  minutesToTime, 
  getCleaningDuration,
  updateGroupTimes,
  ensureTimeConsistency
} from '../ROOM/GroupOperations';

// 處理群組拖曳結束
export const handleGroupDragEnd = (result, rows, setRows, setFilteredRows) => {
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
      setRows,
      setFilteredRows
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
      setRows,
      setFilteredRows
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
  setRows,
  setFilteredRows
) => {
  // 如果位置沒有變化，不需要處理
  if (sourceIndex === destIndex) return false;
  
  const roomData = [...rows[roomIndex].data];
  const roomName = rows[roomIndex].room || rows[roomIndex].name || '手術室';
  const roomId = rows[roomIndex].roomId;
  
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
  
  // 取得群組內非銜接時間的手術ID
  const groupSurgeries = adjustedGroup.surgeries
    .filter(surgery => !surgery.isCleaningTime)
    .map(surgery => surgery.applicationId);
  
  // 取得主手術和附屬手術
  const mainSurgeryId = groupSurgeries[0];
  const otherSurgeryIds = groupSurgeries.slice(1);
  
  // 重新排序並更新 orderInRoom
  const surgeriesOnly = roomData.filter(item => !item.isCleaningTime);
  
  // 計算群組在手術列表中的位置
  const groupIndex = surgeriesOnly.findIndex(item => item.isGroup);
  const groupOrder = groupIndex !== -1 ? groupIndex + 1 : 1;
  
  // 更新主手術的 orderInRoom
  // 使用拖曳專用API更新手術室ID
  const apiPromises = [
    axios.put(`${BASE_URL}/api/system/surgery/${mainSurgeryId}/${roomId}`),
    axios.put(`${BASE_URL}/api/system/surgery/${mainSurgeryId}/order-in-room`, {
      orderInRoom: groupOrder
    })
  ];
  
  // 更新附屬手術的 orderInRoom 為 null
  otherSurgeryIds.forEach(surgeryId => {
    // 確保房間ID是正確的
    apiPromises.push(axios.put(`${BASE_URL}/api/system/surgery/${surgeryId}/${roomId}`));
    apiPromises.push(axios.put(`${BASE_URL}/api/system/surgery/${surgeryId}/order-in-room`, {
      orderInRoom: null
    }));
  });
  
  // 更新非群組手術的 orderInRoom
  surgeriesOnly.forEach((surgery, index) => {
    // 跳過群組項目
    if (surgery.isGroup) return;
    
    // 如果是附屬手術（判斷邏輯需要視實際情況調整）
    const isInGroup = Array.isArray(surgery.groupApplicationIds) && 
                      surgery.groupApplicationIds.length > 0 && 
                      surgery.applicationId !== surgery.groupApplicationIds[0];
    
    if (!isInGroup) {
      const newOrder = index + 1;
      
      // 確保手術室ID是正確的
      apiPromises.push(axios.put(`${BASE_URL}/api/system/surgery/${surgery.applicationId}/${roomId}`));
      apiPromises.push(axios.put(`${BASE_URL}/api/system/surgery/${surgery.applicationId}/order-in-room`, {
        orderInRoom: newOrder
      }));
    }
  });
  
  Promise.all(apiPromises).then(() => {
    setRows([...newRows]);
    setFilteredRows([...newRows]);
    
    // 觸發UI更新事件
    window.dispatchEvent(new CustomEvent('ganttDragEnd'));
    
    // 延遲後刷新頁面，確保狀態已保存
    setTimeout(() => {
      console.log("✅ 同一房間群組拖曳完成後自動刷新頁面");
      window.location.reload();
    }, 300);
  }).catch(error => {
    console.error("❌ 同一房間群組拖曳API請求失敗:", error);
    
    // 即使API失敗，也嘗試更新前端UI
    setRows([...newRows]);
    setFilteredRows([...newRows]);
    window.dispatchEvent(new CustomEvent('ganttDragEnd'));
    
    // 延遲後刷新頁面，確保狀態已保存
    setTimeout(() => {
      console.log("✅ API請求失敗後自動刷新頁面");
      window.location.reload();
    }, 300);
  });
  
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
  setRows,
  setFilteredRows
) => {
  // 源房間和目標房間的數據
  const sourceRoomData = [...rows[sourceRoomIndex].data];
  const destRoomData = [...rows[destRoomIndex].data];
  
  const sourceRoomName = rows[sourceRoomIndex].room || rows[sourceRoomIndex].name || '手術室';
  const destRoomName = rows[destRoomIndex].room || rows[destRoomIndex].name || '手術室';
  
  const sourceRoomId = rows[sourceRoomIndex].roomId;
  const destRoomId = rows[destRoomIndex].roomId;
  
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
    roomId: destRoomId // 更新房間ID
  };
  
  // 取得群組內非銜接時間的手術ID
  const groupSurgeries = adjustedGroup.surgeries
    .filter(surgery => !surgery.isCleaningTime)
    .map(surgery => surgery.applicationId);
  
  // 取得主手術和附屬手術
  const mainSurgeryId = groupSurgeries[0];
  const otherSurgeryIds = groupSurgeries.slice(1);
  
  // 更新群組內部手術的手術室名稱
  if (adjustedGroup.surgeries && adjustedGroup.surgeries.length > 0) {
    adjustedGroup.surgeries = adjustedGroup.surgeries.map(surgery => ({
      ...surgery,
      operatingRoomName: destRoomName,
      roomId: destRoomId
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
  
  // 收集所有API請求
  const apiPromises = [];
  
  // 更新源房間的非群組手術的 orderInRoom
  const sourceSurgeriesOnly = sourceRoomData.filter(item => !item.isCleaningTime);
  sourceSurgeriesOnly.forEach((surgery, index) => {
    // 跳過群組項目
    if (surgery.isGroup) return;
    
    // 如果是附屬手術
    const isInGroup = Array.isArray(surgery.groupApplicationIds) && 
                      surgery.groupApplicationIds.length > 0 && 
                      surgery.applicationId !== surgery.groupApplicationIds[0];
    
    if (!isInGroup) {
      const newOrder = index + 1;
      
      // 確保手術室ID是正確的
      apiPromises.push(axios.put(`${BASE_URL}/api/system/surgery/${surgery.applicationId}/${sourceRoomId}`));
      apiPromises.push(axios.put(`${BASE_URL}/api/system/surgery/${surgery.applicationId}/order-in-room`, {
        orderInRoom: newOrder
      }));
    }
  });
  
  // 更新目標房間的非群組手術的 orderInRoom
  const destSurgeriesOnly = destRoomData.filter(item => !item.isCleaningTime);
  
  // 計算群組在手術列表中的位置
  const groupIndex = destSurgeriesOnly.findIndex(item => item.isGroup);
  const groupOrder = groupIndex !== -1 ? groupIndex + 1 : 1;
  
  // 更新主手術的房間和 orderInRoom
  apiPromises.push(axios.put(`${BASE_URL}/api/system/surgery/${mainSurgeryId}/${destRoomId}`));
  apiPromises.push(axios.put(`${BASE_URL}/api/system/surgery/${mainSurgeryId}/order-in-room`, {
    orderInRoom: groupOrder
  }));
  
  // 更新附屬手術的房間和將 orderInRoom 設為 null
  otherSurgeryIds.forEach(surgeryId => {
    // 確保房間ID是正確的
    apiPromises.push(axios.put(`${BASE_URL}/api/system/surgery/${surgeryId}/${destRoomId}`));
    apiPromises.push(axios.put(`${BASE_URL}/api/system/surgery/${surgeryId}/order-in-room`, {
      orderInRoom: null
    }));
  });
  
  // 更新目標房間的非群組手術的 orderInRoom
  destSurgeriesOnly.forEach((surgery, index) => {
    // 跳過群組項目
    if (surgery.isGroup) return;
    
    // 如果是附屬手術
    const isInGroup = Array.isArray(surgery.groupApplicationIds) && 
                      surgery.groupApplicationIds.length > 0 && 
                      surgery.applicationId !== surgery.groupApplicationIds[0];
    
    if (!isInGroup) {
      const newOrder = index + 1;
      
      // 確保手術室ID是正確的
      apiPromises.push(axios.put(`${BASE_URL}/api/system/surgery/${surgery.applicationId}/${destRoomId}`));
      apiPromises.push(axios.put(`${BASE_URL}/api/system/surgery/${surgery.applicationId}/order-in-room`, {
        orderInRoom: newOrder
      }));
    }
  });
  
  // 等待所有API請求完成後再更新UI
  Promise.all(apiPromises)
    .then(() => {
      console.log("✅ 跨房間群組拖曳所有API請求完成");
      
      // 一次性更新狀態
      setRows([...newRows]);
      setFilteredRows([...newRows]);
      
      // 觸發UI更新事件
      window.dispatchEvent(new CustomEvent('ganttDragEnd'));
      
      // 延遲後刷新頁面，確保狀態已保存
      setTimeout(() => {
        console.log("✅ 自動刷新頁面以顯示更新後的群組");
        window.location.reload();
      }, 300);
    })
    .catch(error => {
      console.error("❌ 跨房間群組拖曳API請求失敗:", error);
      
      // 即使API失敗，也嘗試更新前端UI
      setRows([...newRows]);
      setFilteredRows([...newRows]);
      window.dispatchEvent(new CustomEvent('ganttDragEnd'));
      
      // 延遲後刷新頁面，確保狀態已保存
      setTimeout(() => {
        console.log("✅ API請求失敗後自動刷新頁面");
        window.location.reload();
      }, 300);
    });
  
  return true;
};

// 更新群組和其中項目的顏色
export const updateGroupColors = (roomData) => {
  if (!roomData || roomData.length === 0) return;
  
  roomData.forEach(item => {
    if (item.isGroup && item.surgeries && item.surgeries.length > 0) {
      // 找出非銜接時間的手術
      const surgeries = item.surgeries.filter(s => !s.isCleaningTime);
      
      if (surgeries.length > 0) {
        // 獲取最後一個非銜接時間手術
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