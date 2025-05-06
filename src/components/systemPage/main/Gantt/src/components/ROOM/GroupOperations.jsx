import axios from 'axios';
import { getTimeSettings } from '../Time/timeUtils';
import { getColorByEndTime, COLORS, getCleaningColor } from './colorUtils';
import { BASE_URL } from '../../../../../../../config';

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

// 輔助函數：計算銜接時間長度（分鐘）
export const getCleaningDuration = (useTempSettings = false) => {
  const timeSettings = getTimeSettings(useTempSettings);
  return timeSettings.cleaningTime || 45; // 預設45分鐘銜接時間
};

// 建立唯一ID
export const generateUniqueId = (prefix) => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// 創建銜接時間項目
export const createCleaningTimeItem = (startTime, endTime, roomName, id) => {
  return {
    id: id || generateUniqueId('cleaning'),
    doctor: '銜接時間',
    surgery: '整理中',
    startTime,
    endTime,
    isCleaningTime: true,
    operatingRoomName: roomName,
    color: 'blue'
  };
};

// 檢查項目之間的時間一致性
export const checkTimeContinuity = (items) => {
  if (!items || items.length < 2) return true;

  // 按開始時間排序項目
  const sortedItems = [...items].sort((a, b) => {
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });

  // 檢查每對相鄰項目的時間是否連續
  for (let i = 0; i < sortedItems.length - 1; i++) {
    if (sortedItems[i].endTime !== sortedItems[i + 1].startTime) {
      return false;
    }
  }

  return true;
};

// 檢查項目是否連續（包含銜接時間）
export const checkConsecutiveItems = (items, roomData) => {
  if (!items || items.length < 2) return false;

  // 獲取所選項目的索引
  const selectedIndices = items.map(item =>
    roomData.findIndex(data => data.id === item.id)
  ).filter(index => index !== -1).sort();

  // 檢查索引是否連續
  for (let i = 1; i < selectedIndices.length; i++) {
    const diff = selectedIndices[i] - selectedIndices[i - 1];

    // 不連續且不是中間隔了銜接時間的情況
    if (diff !== 1 && diff !== 2) {
      return false;
    }

    // 如果索引差距為2，檢查中間是否為銜接時間
    if (diff === 2 && !roomData[selectedIndices[i - 1] + 1].isCleaningTime) {
      return false;
    }
  }

  return true;
};

// 獲取選擇範圍內的所有項目（包括中間可能未選中的項目）
export const getRangeItems = (selectedItems, roomData) => {
  if (!selectedItems || selectedItems.length === 0 || !roomData || roomData.length === 0) {
    return [];
  }

  // 排序選中的項目，按開始時間排序
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

  // 獲取範圍內的所有項目（包括中間的銜接時間）
  // 確保最後一個手術後的銜接時間也被包含
  let endIndex = lastIndex;
  if (lastIndex < roomData.length - 1 && roomData[lastIndex + 1].isCleaningTime) {
    endIndex = lastIndex + 1;
  }

  return roomData.slice(firstIndex, endIndex + 1);
};

// 創建群組
export const createGroup = (selectedItems, roomData, roomIndex, roomName) => {
  // 提取所選手術的 ID
  const ids = selectedItems.map(s => s.id);
  console.log('正在創建手術群組，包含手術 ID:', ids);

  if (!selectedItems || selectedItems.length < 2) {
    console.error('選擇的項目數量不足以創建群組');
    return { success: false, message: '請至少選擇兩個手術項目' };
  }

  // 過濾出非銜接時間的項目
  const nonCleaningItems = selectedItems.filter(item => !item.isCleaningTime);

  if (nonCleaningItems.length < 2) {
    return { success: false, message: '請至少選擇兩個非銜接時間的手術項目' };
  }

  // 檢查是否連續
  if (!checkConsecutiveItems(selectedItems, roomData)) {
    return { success: false, message: '只能將連續的手術進行群組（可以包含中間的銜接時間）' };
  }

  // 獲取範圍內的所有項目
  const rangeItems = getRangeItems(selectedItems, roomData);

  // 檢查範圍內是否包含未選中的非銜接時間項目
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

  // 找出第一個和最後一個項目在 roomData 中的索引
  const firstIndex = roomData.findIndex(item => item.id === firstItem.id);
  const lastIndex = roomData.findIndex(item => item.id === lastItem.id);

  if (firstIndex === -1 || lastIndex === -1) {
    return { success: false, message: '找不到選中項目在房間資料中的位置' };
  }

  // 檢查最後一個項目後是否有銜接時間，如果有則併入群組
  let lastEndTime = lastItem.endTime;
  if (lastIndex < roomData.length - 1 && roomData[lastIndex + 1].isCleaningTime) {
    lastEndTime = roomData[lastIndex + 1].endTime;

    // 確保該銜接時間也被加入到 rangeItems 中
    if (!rangeItems.some(item => item.id === roomData[lastIndex + 1].id)) {
      rangeItems.push(roomData[lastIndex + 1]);
    }
  }

  // 按開始時間排序所有要包含的項目
  const allGroupItems = [...rangeItems].sort((a, b) => {
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });

  // 獲取最後一個非銜接時間項目的顏色
  const lastNonCleaningItem = [...nonCleaningItems].sort((a, b) => {
    return timeToMinutes(b.endTime) - timeToMinutes(a.endTime);
  })[0];

  const groupColor = getColorByEndTime(lastNonCleaningItem.endTime, false, true);

  const groupItem = {
    id: groupId,
    doctor: `${nonCleaningItems.length} 個手術`,
    surgery: '群組手術',
    startTime: firstItem.startTime,
    endTime: lastEndTime,
    color: "group",
    isGroup: true,
    surgeries: allGroupItems, // 包含範圍內的所有項目，包括銜接時間
    isCleaningTime: false,
    operatingRoomName: roomName,
    // 添加必要的引用信息，用於拖曳時保持關係
    roomId: roomData[0]?.roomId,
    orderInRoom: sortedItems[0]?.orderInRoom ?? null,
    roomIndex,
    applicationId: sortedItems[0].applicationId,
    // 保存群組內部時間信息，用於解除群組時恢復
    originalTimeInfo: {
      startTime: firstItem.startTime,
      endTime: lastEndTime,
      items: allGroupItems.map((item) => ({
        id: item.id,
        startTime: item.startTime,
        endTime: item.endTime,
        isCleaningTime: item.isCleaningTime,
        color: item.color,
      }))
      
    }
  };
// 🔧 在建立群組後，逐一更新每筆手術的 orderInRoom 至後端
nonCleaningItems.forEach((item, index) => {
  const newOrder = index + 1;
  axios.put(`${BASE_URL}/api/system/surgery/${item.applicationId}/order-in-room`, {
    orderInRoom: newOrder,
    operatingRoomId: roomData[0]?.roomId
  }).then(() => {
    console.log(`✅ 更新手術 ${item.applicationId} 的順序為 ${newOrder}`);
  }).catch(err => {
    console.error(`❌ 更新手術 ${item.applicationId} 的順序失敗`, err);
  });
});

  // ===== 全新的創建群組邏輯 =====
  // 我們不再移除和添加項目，而是創建一個全新的房間數據陣列
  const newRoomData = [];

  // 遍歷原始房間數據
  for (let i = 0; i < roomData.length; i++) {
    const item = roomData[i];

    // 檢查這個項目是否是被選中的項目或其相關的銜接時間
    const isSelectedItem = selectedItems.some(selected => selected.id === item.id);
    const isPreviousItemSelected = i > 0 && selectedItems.some(selected => selected.id === roomData[i - 1].id);
    const isCleaningAfterSelected = item.isCleaningTime && isPreviousItemSelected;

    // 如果是第一個被選中的項目，插入群組
    if (i === firstIndex) {
      newRoomData.push(groupItem);
    }

    // 如果不是被選中的項目或其相關的銜接時間，則保留原始項目
    if (!isSelectedItem && !isCleaningAfterSelected) {
      newRoomData.push(item);
    }
  }

  // 如果房間數據為空，或者第一個被選中的項目是第一個項目，直接在開頭插入群組
  if (roomData.length === 0 || firstIndex === -1) {
    newRoomData.unshift(groupItem);
  }

  // 確保時間連續性
  ensureTimeConsistency(newRoomData, 0, roomName);

  // 呼叫後端 API 創建手術群組
  axios.post(`${BASE_URL}/api/system/surgeries/group`, ids)
  .then(response => {
    // 處理成功的情況
    console.log('群組創建成功', response.data);
    // 在此處理成功後的邏輯，比如更新房間數據等
    return {
      success: true,
      newRoomData,
      groupItem
    };
  })
  .catch(error => {
    // 處理錯誤的情況
    console.error('創建群組時發生錯誤:', error);
    return { success: false, message: '創建群組時發生錯誤' };
  });

  return {
    success: true,
    newRoomData,
    groupItem
  };
};

// 解除群組
export const ungroup = (groupItem, roomData, roomName) => {
  console.log('正在解除群組，手術 ID:', groupItem.applicationId);
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

  // 獲取每個手術的原始持續時間
  const originalDurations = [];
  for (const item of sortedItems) {
    const itemDuration = timeToMinutes(item.endTime) - timeToMinutes(item.startTime);
    originalDurations.push({
      id: item.id,
      duration: itemDuration,
      isCleaningTime: item.isCleaningTime
    });
  }

  // 獲取清潔時間設置
  const cleaningTime = getCleaningDuration(true);

  // 插入所有原始項目
  let insertIndex = groupIndex;
  let currentStartTime = groupItem.startTime; // 從群組的開始時間開始

  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    
    // 獲取原始持續時間或使用默認值
    let originalDuration;
    if (item.isCleaningTime) {
      // 使用設定中的銜接時間
      originalDuration = cleaningTime;
    } else {
      originalDuration = originalDurations.find(d => d.id === item.id)?.duration || 0;
    }

    // 創建還原後的手術項目
    let restoredItem = { ...item };
    
    // 設置手術的開始時間和結束時間，保持原始持續時間
    restoredItem.startTime = currentStartTime;
    restoredItem.endTime = minutesToTime(timeToMinutes(currentStartTime) + originalDuration);
    currentStartTime = restoredItem.endTime; // 更新下一個手術的開始時間

    // 更新顏色
    if (restoredItem.isCleaningTime) {
      restoredItem.color = getCleaningColor();
      restoredItem.duration = cleaningTime; // 確保使用正確的銜接時間
    } else {
      restoredItem.color = getColorByEndTime(restoredItem.endTime, false, true);
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

  // 呼叫後端 API 創建手術群組
  axios.post(`${BASE_URL}/api/system/surgeries/group/clear`, groupItem.applicationId)
  .then(response => {
    // 處理成功的情況
    console.log('群組解除成功', response.data);
    // 在此處理成功後的邏輯，比如更新房間數據等
    return {
      success: true,
      newRoomData,
      groupItem
    };
  })
  .catch(error => {
    // 處理錯誤的情況
    console.error('創建解除時發生錯誤:', error);
    return { success: false, message: '創建解除時發生錯誤' };
  });

  return {
    success: true,
    newRoomData
  };
};

// 確保解除群組後，前後項目的時間銜接正確
export const ensureTimeConsistency = (roomData, startIndex, roomName) => {
  // 檢查項目是否為空
  if (!roomData || roomData.length === 0) return roomData;

  // 獲取清潔時間設置
  const cleaningDuration = getCleaningDuration(true);

  // 遍歷所有項目，確保時間連續性
  for (let i = startIndex; i < roomData.length - 1; i++) {
    const currentItem = roomData[i];
    const nextItem = roomData[i + 1];

    // 如果當前項目不是銜接時間且下一個項目不是銜接時間，則需要添加銜接時間
    if (!currentItem.isCleaningTime && !nextItem.isCleaningTime) {
      // 創建銜接時間項目
      const cleaningItem = {
        id: generateUniqueId('cleaning'),
        doctor: '銜接時間',
        surgery: '整理中',
        startTime: currentItem.endTime,
        endTime: minutesToTime(timeToMinutes(currentItem.endTime) + cleaningDuration),
        isCleaningTime: true,
        operatingRoomName: roomName,
        color: "blue",
        duration: cleaningDuration
      };

      // 插入銜接時間
      roomData.splice(i + 1, 0, cleaningItem);
      
      // 更新下一個手術的開始時間
      if (i + 2 < roomData.length) {
        roomData[i + 2].startTime = cleaningItem.endTime;
      }
      
      i++; // 跳過新插入的銜接時間
    }
    // 如果當前項目是銜接時間且下一個項目也是銜接時間，合併它們
    else if (currentItem.isCleaningTime && nextItem.isCleaningTime) {
      currentItem.endTime = nextItem.endTime;
      currentItem.duration = timeToMinutes(currentItem.endTime) - timeToMinutes(currentItem.startTime);
      currentItem.color = "blue";
      roomData.splice(i + 1, 1); // 移除下一個項目
      i--; // 重新檢查當前項目
    }
    // 如果時間不連續，調整銜接時間
    else if (currentItem.isCleaningTime) {
      // 確保銜接時間使用正確的顏色和持續時間
      currentItem.color = "blue";
      currentItem.duration = cleaningDuration;
      
      // 確保銜接時間與下一個項目相連
      if (currentItem.endTime !== nextItem.startTime) {
        currentItem.endTime = nextItem.startTime;
      }
    }
    // 如果普通項目時間不連續，插入銜接時間
    else if (currentItem.endTime !== nextItem.startTime) {
      // 創建銜接時間項目
      const cleaningItem = {
        id: generateUniqueId('cleaning'),
        doctor: '銜接時間',
        surgery: '整理中',
        startTime: currentItem.endTime,
        endTime: nextItem.startTime,
        isCleaningTime: true,
        operatingRoomName: roomName,
        color: "blue",
        duration: timeToMinutes(nextItem.startTime) - timeToMinutes(currentItem.endTime)
      };

      // 插入銜接時間
      roomData.splice(i + 1, 0, cleaningItem);
      i++; // 跳過新插入的銜接時間
    }
  }

  return roomData;
};

// 當群組被拖曳到新位置時，更新時間
export const updateGroupTimes = (groupItem, prevItem, nextItem, roomName) => {
  if (!groupItem || !groupItem.isGroup) return groupItem;

  // 如果沒有前後項目，則不需要更新時間
  if (!prevItem && !nextItem) return groupItem;

  const updatedGroup = { ...groupItem };
  let startTimeChanged = false;
  let endTimeChanged = false;

  // 獲取群組的原始時間量（分鐘）
  const originalGroupDuration = timeToMinutes(updatedGroup.endTime) - timeToMinutes(updatedGroup.startTime);
  
  // 更新群組開始時間（如果有前一個項目）
  if (prevItem) {
    const newStartTime = prevItem.isCleaningTime
      ? prevItem.endTime  // 如果前一個是銜接時間，使用其結束時間
      : minutesToTime(timeToMinutes(prevItem.endTime) + getCleaningDuration(true)); // 否則加上銜接時間

    if (newStartTime !== updatedGroup.startTime) {
      updatedGroup.startTime = newStartTime;
      startTimeChanged = true;
    }
  }

  // 如果開始時間變化了，根據原始持續時間來設置結束時間，保持時間量不變
  if (startTimeChanged) {
    const newEndTime = minutesToTime(timeToMinutes(updatedGroup.startTime) + originalGroupDuration);
    updatedGroup.endTime = newEndTime;
    endTimeChanged = true;
  } 
  // 如果開始時間沒變，但有後一個項目且需要調整結束時間
  else if (nextItem) {
    // 檢查是否需要調整結束時間
    const currentEndTime = updatedGroup.endTime;
    const maxEndTime = nextItem.isCleaningTime
      ? nextItem.startTime  // 如果後一個是銜接時間，最大到其開始時間
      : minutesToTime(timeToMinutes(nextItem.startTime) - getCleaningDuration(true)); // 否則減去銜接時間
      
    // 如果當前結束時間超過了允許的最大結束時間，則需要調整
    if (timeToMinutes(currentEndTime) > timeToMinutes(maxEndTime)) {
      updatedGroup.endTime = maxEndTime;
      endTimeChanged = true;
      
      // 由於結束時間變化了，我們也需要調整開始時間以保持原始持續時間
      updatedGroup.startTime = minutesToTime(timeToMinutes(maxEndTime) - originalGroupDuration);
      startTimeChanged = true;
    }
  }

  // 如果時間有變化，更新群組內部時間
  if (startTimeChanged || endTimeChanged) {
    // 獲取原始群組內每個項目的持續時間
    const originalItemDurations = [];
    
    if (updatedGroup.surgeries && updatedGroup.surgeries.length > 0) {
      // 獲取所有項目（包括清潔時間）的原始持續時間
      for (const item of updatedGroup.surgeries) {
        const itemDuration = timeToMinutes(item.endTime) - timeToMinutes(item.startTime);
        originalItemDurations.push({
          id: item.id,
          duration: itemDuration,
          isCleaningTime: item.isCleaningTime
        });
      }
      
      // 重新分配時間，保持每個項目的原始持續時間
      let currentTime = timeToMinutes(updatedGroup.startTime);
      
      for (let i = 0; i < updatedGroup.surgeries.length; i++) {
        const item = updatedGroup.surgeries[i];
        const originalDuration = originalItemDurations.find(d => d.id === item.id)?.duration || 0;
        
        // 設置項目的開始時間
        item.startTime = minutesToTime(currentTime);
        
        // 設置項目的結束時間，保持原始持續時間
        currentTime += originalDuration;
        item.endTime = minutesToTime(currentTime);
        
        // 更新顏色（僅對非銜接時間項目）
        if (!item.isCleaningTime) {
          item.color = getColorByEndTime(item.endTime, false, true);
        }
      }
      
      // 確保最後一個項目的結束時間與群組結束時間一致
      // 由於我們保持了原始持續時間，這應該已經是自動的
      // 但為了安全起見，我們仍進行一次檢查
      const lastItem = updatedGroup.surgeries[updatedGroup.surgeries.length - 1];
      if (lastItem.endTime !== updatedGroup.endTime) {
        // 如果不一致，輕微調整最後一個項目的持續時間
        lastItem.endTime = updatedGroup.endTime;
      }
      
      // 更新群組顏色基於最後一個非銜接時間項目
      const nonCleaningItems = updatedGroup.surgeries.filter(item => !item.isCleaningTime);
      if (nonCleaningItems.length > 0) {
        const lastNonCleaningItem = [...nonCleaningItems].sort((a, b) => {
          return timeToMinutes(b.endTime) - timeToMinutes(a.endTime);
        })[0];
        
        updatedGroup.color = getColorByEndTime(lastNonCleaningItem.endTime, false, true);
      }
    }
  }

  return updatedGroup;
}; 
