import { getTimeSettings } from '../Time/timeUtils';

// 輔助函數：將時間轉換為分鐘數
export const timeToMinutes = (timeString) => {
  if (!timeString) return 0;
  
  // 處理 24:00 和超過24小時的特殊情況
  if (timeString === "24:00") return 24 * 60;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};
  
// 輔助函數：將分鐘數轉換為時間字符串
export const minutesToTime = (minutes) => {
  if (minutes === 24 * 60) return "24:00";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// 輔助函數：計算清潔時間長度（分鐘）
export const getCleaningDuration = (useTempSettings = false) => {
  const timeSettings = getTimeSettings(useTempSettings);
  return timeSettings.cleaningTime || 45; // 預設45分鐘清潔時間
};

// 建立唯一ID
export const generateUniqueId = (prefix) => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// 創建清潔時間項目
export const createCleaningTimeItem = (startTime, endTime, roomName, id) => {
  return {
    id: id || generateUniqueId('cleaning'),
    doctor: '清潔時間',
    surgery: '整理中',
    startTime,
    endTime,
    isCleaningTime: true,
    operatingRoomName: roomName,
    color: 'gray'
  };
};

// 檢查項目是否連續（包含清潔時間）
export const checkConsecutiveItems = (items, roomData) => {
  if (!items || items.length < 2) return false;
  
  // 獲取所選項目的索引
  const selectedIndices = items.map(item => 
    roomData.findIndex(data => data.id === item.id)
  ).filter(index => index !== -1).sort();
  
  // 檢查索引是否連續
  for (let i = 1; i < selectedIndices.length; i++) {
    const diff = selectedIndices[i] - selectedIndices[i-1];
    
    // 不連續且不是中間隔了清潔時間的情況
    if (diff !== 1 && diff !== 2) {
      return false;
    }
    
    // 如果索引差距為2，檢查中間是否為清潔時間
    if (diff === 2 && !roomData[selectedIndices[i-1] + 1].isCleaningTime) {
      return false;
    }
  }
  
  return true;
};

// 獲取選擇範圍內的所有項目
export const getRangeItems = (selectedItems, roomData) => {
  // 排序選中的手術，按開始時間排序
  const sortedItems = [...selectedItems].sort((a, b) => {
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });
  
  // 找出第一個和最後一個項目的索引
  const firstIndex = roomData.findIndex(item => item.id === sortedItems[0].id);
  const lastIndex = roomData.findIndex(item => item.id === sortedItems[sortedItems.length - 1].id);
  
  if (firstIndex === -1 || lastIndex === -1) {
    console.error('找不到選中項目在房間資料中的位置');
    return [];
  }
  
  // 獲取範圍內的所有項目（包括中間的清潔時間）
  return roomData.slice(firstIndex, lastIndex + 1);
};

// 創建群組
export const createGroup = (selectedItems, roomData, roomIndex, roomName) => {
  if (!selectedItems || selectedItems.length < 2) {
    console.error('選擇的項目數量不足以創建群組');
    return { success: false, message: '請至少選擇兩個手術項目' };
  }
  
  // 過濾出非清潔時間的項目
  const nonCleaningItems = selectedItems.filter(item => !item.isCleaningTime);
  
  if (nonCleaningItems.length < 2) {
    return { success: false, message: '請至少選擇兩個非清潔時間的手術項目' };
  }
  
  // 檢查是否連續
  if (!checkConsecutiveItems(selectedItems, roomData)) {
    return { success: false, message: '只能將連續的手術進行群組（可以包含中間的清潔時間）' };
  }
  
  // 獲取範圍內的所有項目
  const rangeItems = getRangeItems(selectedItems, roomData);
  
  // 檢查範圍內是否包含未選中的非清潔時間項目
  const nonCleaningInRange = rangeItems.filter(item => !item.isCleaningTime);
  const allNonCleaningSelected = nonCleaningInRange.every(item => 
    nonCleaningItems.some(selected => selected.id === item.id)
  );
  
  if (!allNonCleaningSelected) {
    return { success: false, message: '群組中包含了未選中的手術，請確保選擇了範圍內的所有手術' };
  }
  
  // 排序選中的手術，按開始時間排序
  const sortedItems = [...nonCleaningItems].sort((a, b) => {
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });
  
  // 創建群組項目
  const groupId = generateUniqueId('group');
  
  // 確保時間連續性：使用第一個項目的開始時間和最後一個項目的結束時間
  const firstItem = sortedItems[0];
  const lastItem = sortedItems[sortedItems.length - 1];
  
  const groupItem = {
    id: groupId,
    doctor: `${sortedItems.length} 個手術`,
    surgery: '群組手術',
    startTime: firstItem.startTime,
    endTime: lastItem.endTime,
    color: 'blue',
    isGroup: true,
    surgeries: rangeItems, // 包含範圍內的所有項目，包括清潔時間
    isCleaningTime: false,
    operatingRoomName: roomName,
    // 添加必要的引用信息，用於拖曳時保持關係
    roomId: roomData[0]?.roomId,
    roomIndex,
    applicationId: sortedItems[0].applicationId,
    // 保存群組內部時間信息，用於解除群組時恢復
    originalTimeInfo: {
      startTime: firstItem.startTime,
      endTime: lastItem.endTime,
      items: rangeItems.map(item => ({
        id: item.id,
        startTime: item.startTime,
        endTime: item.endTime,
        isCleaningTime: item.isCleaningTime
      }))
    }
  };
  
  // 找出第一個和最後一個項目的索引
  const firstIndex = roomData.findIndex(item => item.id === firstItem.id);
  const lastIndex = roomData.findIndex(item => item.id === lastItem.id);
  
  // 標記要移除的項目
  const itemsToRemove = new Set();
  for (let i = firstIndex; i <= lastIndex; i++) {
    itemsToRemove.add(i);
  }
  
  // 建立新的房間資料，移除被群組的項目
  const newRoomData = roomData.filter((_, index) => !itemsToRemove.has(index));
  
  // 檢查群組前是否有手術，若有則確保銜接時間正確
  if (firstIndex > 0 && !roomData[firstIndex - 1].isCleaningTime) {
    // 前一個項目是手術，需要在群組前添加清潔時間
    const prevSurgery = roomData[firstIndex - 1];
    const cleaningStartTime = prevSurgery.endTime;
    
    // 創建清潔時間項目並插入
    const cleaningItem = createCleaningTimeItem(
      cleaningStartTime,
      firstItem.startTime,
      roomName
    );
    
    newRoomData.splice(firstIndex - 1, 0, cleaningItem);
  } else if (firstIndex > 0) {
    // 前一個項目是清潔時間，需要調整其結束時間
    const prevCleaning = {...roomData[firstIndex - 1]};
    prevCleaning.endTime = firstItem.startTime;
    
    // 更新清潔時間
    const prevIndex = newRoomData.findIndex(item => item.id === prevCleaning.id);
    if (prevIndex !== -1) {
      newRoomData[prevIndex] = prevCleaning;
    }
  }
  
  // 在原位置插入群組
  newRoomData.splice(firstIndex, 0, groupItem);
  
  return {
    success: true,
    newRoomData,
    groupItem
  };
};

// 解除群組
export const ungroup = (groupItem, roomData, roomName) => {
  if (!groupItem || !groupItem.isGroup) {
    return { success: false, message: '選擇的項目不是群組' };
  }
  
  // 找到群組在房間資料中的位置
  const groupIndex = roomData.findIndex(item => item.id === groupItem.id);
  
  if (groupIndex === -1) {
    return { success: false, message: '找不到要解除的群組' };
  }
  
  // 創建新的房間資料，移除群組
  const newRoomData = [...roomData];
  newRoomData.splice(groupIndex, 1);
  
  // 獲取群組內的項目
  const groupItems = groupItem.surgeries || [];
  
  // 檢查是否有原始時間信息，用於恢復時間
  const hasOriginalTimeInfo = groupItem.originalTimeInfo && 
                            groupItem.originalTimeInfo.items && 
                            groupItem.originalTimeInfo.items.length > 0;
  
  // 按時間排序群組內的項目
  const sortedItems = [...groupItems].sort((a, b) => {
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });
  
  // 插入所有原始項目
  let insertIndex = groupIndex;
  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    
    // 如果有原始時間信息，使用它恢復時間
    let restoredItem = {...item};
    if (hasOriginalTimeInfo) {
      const originalItem = groupItem.originalTimeInfo.items.find(orig => orig.id === item.id);
      if (originalItem) {
        restoredItem.startTime = originalItem.startTime;
        restoredItem.endTime = originalItem.endTime;
      }
    }
    
    // 確保項目ID是唯一的
    if (!restoredItem.id) {
      restoredItem.id = generateUniqueId('restored');
    }
    
    // 插入項目
    newRoomData.splice(insertIndex, 0, restoredItem);
    insertIndex++;
  }
  
  // 檢查群組前後項目的時間銜接
  ensureTimeConsistency(newRoomData, groupIndex, roomName);
  
  return {
    success: true,
    newRoomData
  };
};

// 確保解除群組後，前後項目的時間銜接正確
export const ensureTimeConsistency = (roomData, startIndex, roomName) => {
  // 檢查項目是否為空
  if (!roomData || roomData.length === 0) return roomData;
  
  // 遍歷所有項目，確保時間連續性
  for (let i = startIndex; i < roomData.length - 1; i++) {
    const currentItem = roomData[i];
    const nextItem = roomData[i + 1];
    
    // 如果當前項目不是清潔時間且下一個項目不是清潔時間，則需要添加清潔時間
    if (!currentItem.isCleaningTime && !nextItem.isCleaningTime) {
      // 計算清潔時間長度（分鐘）
      const cleaningDuration = getCleaningDuration(true);
      
      // 創建清潔時間項目
      const cleaningItem = createCleaningTimeItem(
        currentItem.endTime,
        nextItem.startTime,
        roomName
      );
      
      // 插入清潔時間
      roomData.splice(i + 1, 0, cleaningItem);
      i++; // 跳過新插入的清潔時間
    }
    // 如果當前項目是清潔時間且下一個項目也是清潔時間，合併它們
    else if (currentItem.isCleaningTime && nextItem.isCleaningTime) {
      currentItem.endTime = nextItem.endTime;
      roomData.splice(i + 1, 1); // 移除下一個項目
      i--; // 重新檢查當前項目
    }
    // 如果時間不連續，調整清潔時間的結束時間
    else if (currentItem.isCleaningTime && currentItem.endTime !== nextItem.startTime) {
      currentItem.endTime = nextItem.startTime;
    }
  }
  
  return roomData;
};

// 當群組被拖曳到新位置時，更新時間
export const updateGroupTimes = (groupItem, prevItem, nextItem, roomName) => {
  if (!groupItem || !groupItem.isGroup) return groupItem;
  
  // 如果沒有前後項目，則不需要更新時間
  if (!prevItem && !nextItem) return groupItem;
  
  const updatedGroup = {...groupItem};
  let startTimeChanged = false;
  let endTimeChanged = false;
  
  // 更新群組開始時間（如果有前一個項目）
  if (prevItem) {
    const newStartTime = prevItem.isCleaningTime 
      ? prevItem.startTime  // 如果前一個是清潔時間，使用其開始時間
      : minutesToTime(timeToMinutes(prevItem.endTime) + getCleaningDuration(true)); // 否則加上清潔時間
      
    if (newStartTime !== updatedGroup.startTime) {
      updatedGroup.startTime = newStartTime;
      startTimeChanged = true;
    }
  }
  
  // 更新群組結束時間（如果有後一個項目）
  if (nextItem) {
    const newEndTime = nextItem.isCleaningTime
      ? nextItem.endTime  // 如果後一個是清潔時間，使用其結束時間
      : minutesToTime(timeToMinutes(nextItem.startTime) - getCleaningDuration(true)); // 否則減去清潔時間
      
    if (newEndTime !== updatedGroup.endTime) {
      updatedGroup.endTime = newEndTime;
      endTimeChanged = true;
    }
  }
  
  // 如果時間有變化，更新群組內部時間
  if (startTimeChanged || endTimeChanged) {
    // 計算群組持續時間（分鐘）
    const groupDuration = timeToMinutes(updatedGroup.endTime) - timeToMinutes(updatedGroup.startTime);
    
    // 如果群組持續時間小於或等於0，則無法更新
    if (groupDuration <= 0) {
      console.error('群組時間調整後持續時間不正確', groupDuration);
      return groupItem; // 返回原始群組
    }
    
    // 更新群組內部時間
    if (updatedGroup.surgeries && updatedGroup.surgeries.length > 0) {
      // 獲取非清潔時間的項目
      const nonCleaningItems = updatedGroup.surgeries.filter(item => !item.isCleaningTime);
      
      if (nonCleaningItems.length > 0) {
        // 計算原始總持續時間
        let originalTotalDuration = 0;
        for (const item of nonCleaningItems) {
          originalTotalDuration += timeToMinutes(item.endTime) - timeToMinutes(item.startTime);
        }
        
        // 計算縮放比例
        const scaleFactor = groupDuration / originalTotalDuration;
        
        // 重新計算每個項目的時間
        let currentTime = timeToMinutes(updatedGroup.startTime);
        
        for (let i = 0; i < updatedGroup.surgeries.length; i++) {
          const item = updatedGroup.surgeries[i];
          
          // 設置項目的開始時間
          item.startTime = minutesToTime(currentTime);
          
          // 計算項目的持續時間
          let itemDuration = 0;
          if (!item.isCleaningTime) {
            // 非清潔時間項目，按比例縮放
            const originalDuration = timeToMinutes(item.endTime) - timeToMinutes(item.startTime);
            itemDuration = Math.round(originalDuration * scaleFactor);
          } else {
            // 清潔時間固定
            itemDuration = getCleaningDuration(true);
          }
          
          // 設置項目的結束時間
          currentTime += itemDuration;
          item.endTime = minutesToTime(currentTime);
        }
        
        // 確保最後一個項目的結束時間與群組結束時間一致
        if (updatedGroup.surgeries.length > 0) {
          updatedGroup.surgeries[updatedGroup.surgeries.length - 1].endTime = updatedGroup.endTime;
        }
      }
    }
  }
  
  return updatedGroup;
};

// 處理多選拖曳
export const createDragContainer = (selectedItems, roomData, roomIndex, roomName) => {
  if (!selectedItems || selectedItems.length < 2) {
    return { success: false, message: '請至少選擇兩個手術項目' };
  }
  
  // 過濾出非清潔時間的項目
  const nonCleaningItems = selectedItems.filter(item => !item.isCleaningTime);
  
  // 檢查是否連續
  if (!checkConsecutiveItems(selectedItems, roomData)) {
    return { success: false, message: '只能選擇連續的手術進行拖曳（可以包含中間的清潔時間）' };
  }
  
  // 獲取範圍內的所有項目
  const rangeItems = getRangeItems(selectedItems, roomData);
  
  // 檢查範圍內是否包含未選中的非清潔時間項目
  const nonCleaningInRange = rangeItems.filter(item => !item.isCleaningTime);
  const allNonCleaningSelected = nonCleaningInRange.every(item => 
    nonCleaningItems.some(selected => selected.id === item.id)
  );
  
  if (!allNonCleaningSelected) {
    return { success: false, message: '選擇範圍中包含了未選中的手術，請確保選擇了範圍內的所有手術' };
  }
  
  // 排序選中的手術，按開始時間排序
  const sortedItems = [...nonCleaningItems].sort((a, b) => {
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });
  
  // 創建拖曳容器
  const containerId = generateUniqueId('drag-container');
  
  const containerItem = {
    id: containerId,
    doctor: `${sortedItems.length} 個手術`,
    surgery: '多選拖曳',
    startTime: sortedItems[0].startTime,
    endTime: sortedItems[sortedItems.length - 1].endTime,
    color: 'emerald',
    isVirtualContainer: true,
    items: rangeItems,
    originalRoomIndex: roomIndex,
    roomName: roomName,
    roomId: roomData[0]?.roomId,
    applicationId: sortedItems[0].applicationId,
    // 保存容器內部時間信息
    originalTimeInfo: {
      startTime: sortedItems[0].startTime,
      endTime: sortedItems[sortedItems.length - 1].endTime,
      items: rangeItems.map(item => ({
        id: item.id,
        startTime: item.startTime,
        endTime: item.endTime,
        isCleaningTime: item.isCleaningTime
      }))
    }
  };
  
  // 找出第一個和最後一個項目的索引
  const firstIndex = roomData.findIndex(item => item.id === sortedItems[0].id);
  const lastIndex = roomData.findIndex(item => item.id === sortedItems[sortedItems.length - 1].id);
  
  // 標記要移除的項目
  const itemsToRemove = new Set();
  for (let i = firstIndex; i <= lastIndex; i++) {
    itemsToRemove.add(i);
  }
  
  // 建立新的房間資料，移除被選中的項目
  const newRoomData = roomData.filter((_, index) => !itemsToRemove.has(index));
  
  // 在原位置插入容器
  newRoomData.splice(firstIndex, 0, containerItem);
  
  return {
    success: true,
    newRoomData,
    containerItem
  };
};

// 處理拖曳容器放置
export const handleContainerDrop = (container, roomData, roomIndex, targetIndex, roomName) => {
  if (!container || !container.isVirtualContainer || !container.items) {
    return { success: false, message: '無效的拖曳容器' };
  }
  
  // 獲取容器中的項目
  const containerItems = container.items || [];
  
  // 按時間排序項目
  const sortedItems = [...containerItems].sort((a, b) => {
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });
  
  // 創建新的房間資料，移除容器
  const newRoomData = [...roomData];
  const containerIndex = newRoomData.findIndex(item => item.id === container.id);
  
  if (containerIndex !== -1) {
    newRoomData.splice(containerIndex, 1);
  }
  
  // 如果目標索引大於容器索引，需要調整目標索引
  let adjustedTargetIndex = targetIndex;
  if (containerIndex !== -1 && targetIndex > containerIndex) {
    adjustedTargetIndex--;
  }
  
  // 確保目標索引有效
  adjustedTargetIndex = Math.max(0, Math.min(adjustedTargetIndex, newRoomData.length));
  
  // 檢查目標位置的前後項目，用於調整時間
  const prevItem = adjustedTargetIndex > 0 ? newRoomData[adjustedTargetIndex - 1] : null;
  const nextItem = adjustedTargetIndex < newRoomData.length ? newRoomData[adjustedTargetIndex] : null;
  
  // 調整項目的時間以匹配目標位置
  const adjustedItems = adjustItemTimes(sortedItems, prevItem, nextItem, roomName);
  
  // 插入所有項目到目標位置
  for (let i = adjustedItems.length - 1; i >= 0; i--) {
    const item = adjustedItems[i];
    newRoomData.splice(adjustedTargetIndex, 0, item);
  }
  
  // 確保時間連續性
  ensureTimeConsistency(newRoomData, adjustedTargetIndex, roomName);
  
  return {
    success: true,
    newRoomData
  };
};

// 調整多個項目的時間以匹配目標位置
export const adjustItemTimes = (items, prevItem, nextItem, roomName) => {
  if (!items || items.length === 0) return [];
  
  const adjustedItems = [...items];
  const firstNonCleaningIndex = adjustedItems.findIndex(item => !item.isCleaningTime);
  const lastNonCleaningIndex = adjustedItems.length - 1 - [...adjustedItems].reverse().findIndex(item => !item.isCleaningTime);
  
  // 如果沒有非清潔時間項目，則不需要調整
  if (firstNonCleaningIndex === -1 || lastNonCleaningIndex === -1) return adjustedItems;
  
  const firstItem = adjustedItems[firstNonCleaningIndex];
  const lastItem = adjustedItems[lastNonCleaningIndex];
  
  let startTimeShift = 0;
  
  // 根據前一個項目調整開始時間
  if (prevItem) {
    const newStartTime = prevItem.isCleaningTime 
      ? timeToMinutes(prevItem.endTime)  // 如果前一個是清潔時間，使用其結束時間
      : timeToMinutes(prevItem.endTime) + getCleaningDuration(true); // 否則加上清潔時間
      
    startTimeShift = newStartTime - timeToMinutes(firstItem.startTime);
  }
  
  // 如果有時間偏移，調整所有項目的時間
  if (startTimeShift !== 0) {
    for (const item of adjustedItems) {
      const newStartMinutes = timeToMinutes(item.startTime) + startTimeShift;
      const newEndMinutes = timeToMinutes(item.endTime) + startTimeShift;
      
      item.startTime = minutesToTime(newStartMinutes);
      item.endTime = minutesToTime(newEndMinutes);
    }
  }
  
  // 如果有後一個項目，可能需要縮放或延長項目時間
  if (nextItem) {
    const currentEndTime = timeToMinutes(lastItem.endTime);
    let targetEndTime = nextItem.isCleaningTime 
      ? timeToMinutes(nextItem.startTime)  // 如果後一個是清潔時間，使用其開始時間
      : timeToMinutes(nextItem.startTime) - getCleaningDuration(true); // 否則減去清潔時間
    
    // 計算縮放比例
    const timeDifference = targetEndTime - currentEndTime;
    
    if (timeDifference !== 0) {
      // 計算非清潔時間項目的總持續時間
      let totalNonCleaningDuration = 0;
      for (const item of adjustedItems) {
        if (!item.isCleaningTime) {
          totalNonCleaningDuration += timeToMinutes(item.endTime) - timeToMinutes(item.startTime);
        }
      }
      
      // 計算縮放比例
      const scaleFactor = (totalNonCleaningDuration + timeDifference) / totalNonCleaningDuration;
      
      // 如果縮放比例合理（不會導致項目過短），則調整項目時間
      if (scaleFactor > 0.5) {
        let currentTime = timeToMinutes(adjustedItems[0].startTime);
        
        for (let i = 0; i < adjustedItems.length; i++) {
          const item = adjustedItems[i];
          
          // 設置項目的開始時間
          item.startTime = minutesToTime(currentTime);
          
          // 計算項目的持續時間
          let itemDuration = 0;
          if (!item.isCleaningTime) {
            // 非清潔時間項目，按比例縮放
            const originalDuration = timeToMinutes(item.endTime) - timeToMinutes(item.startTime);
            itemDuration = Math.round(originalDuration * scaleFactor);
            // 確保最小持續時間
            itemDuration = Math.max(itemDuration, 15);
          } else {
            // 清潔時間固定
            itemDuration = getCleaningDuration(true);
          }
          
          // 設置項目的結束時間
          currentTime += itemDuration;
          item.endTime = minutesToTime(currentTime);
        }
      }
    }
  }
  
  // 確保清潔時間的持續時間正確
  for (const item of adjustedItems) {
    if (item.isCleaningTime) {
      const startMinutes = timeToMinutes(item.startTime);
      item.endTime = minutesToTime(startMinutes + getCleaningDuration(true));
    }
  }
  
  return adjustedItems;
}; 