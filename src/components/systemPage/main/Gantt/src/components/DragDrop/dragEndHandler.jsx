import axios from 'axios';
import { calculateDuration, addMinutesToTime, getTimeSettings } from '../Time/timeUtils';
import { getColorByEndTime, getCleaningColor } from '../ROOM/colorUtils';
import { BASE_URL } from "/src/config";
import {
  timeToMinutes,
  minutesToTime,
  updateGroupTimes,
  createCleaningTimeItem
} from '../ROOM/GroupOperations';

// 修改：處理拖曳結束，增加對群組的處理
export const handleDragEnd = async (result, rows, setRows) => {
  console.log("開始處理拖曳結束事件");
  console.log("拖曳結果:", result);
  const { source, destination } = result;
  if (!destination) return null;

  const sourceRoomIndex = parseInt(source.droppableId.split("-")[1], 10);
  const destinationRoomIndex = parseInt(destination.droppableId.split("-")[1], 10);

  console.log(`從手術室 ${sourceRoomIndex} 拖曳到手術室 ${destinationRoomIndex}`);

  const sourceIndex = source.index * 2;
  const destinationIndex = destination.index * 2;

  const newRows = [...rows];

  // 檢查是否為群組拖曳
  const draggedId = result.draggableId;
  const isGroupDrag = draggedId.includes('draggable-group-');
  const isContainerDrag = draggedId.includes('draggable-container-');

  if (isGroupDrag) {
    console.log("群組拖曳操作");
    handleGroupDrag(newRows, sourceRoomIndex, destinationRoomIndex, sourceIndex, destinationIndex);
  } else if (isContainerDrag) {
    console.log("多選容器拖曳操作");
    // 多選拖曳在 Gantt.jsx 中的 handleMultiItemDragEnd 函數中處理
    // 這裡不需要額外處理
  } else if (sourceRoomIndex === destinationRoomIndex) {
    console.log("同一手術室內的拖曳操作");
    handleSameRoomDrag(newRows, sourceRoomIndex, sourceIndex, destinationIndex);
  } else {
    console.log("跨手術室的拖曳操作");
    handleCrossRoomDrag(result, newRows, sourceRoomIndex, destinationRoomIndex, sourceIndex, destinationIndex);
  }

  // 只更新前端界面，不發送後端請求
  setRows(newRows);
  console.log("前端界面更新完成，標記有未保存的變更");

  // 觸發自定義事件，通知TimeWrapper組件重新渲染
  window.dispatchEvent(new CustomEvent('ganttDragEnd'));

  // 返回更新後的行數據和變更狀態
  return {
    updatedRows: newRows,
    hasChanges: true  // 確保每次拖曳操作都會設置 hasChanges
  };
};

// 處理群組拖曳
const handleGroupDrag = (newRows, sourceRoomIndex, destinationRoomIndex, sourceIndex, destinationIndex) => {
  const sourceRoomData = newRows[sourceRoomIndex].data;
  const destRoomData = newRows[destinationRoomIndex].data;
  const roomName = newRows[destinationRoomIndex].room || '手術室';

  // 查找被拖曳的群組
  // 直接找出符合群組屬性的項目，而不使用 result 變數
  const groupItemIndex = sourceRoomData.findIndex(item =>
    item.isGroup && sourceIndex === sourceRoomData.indexOf(item) * 2
  );

  if (groupItemIndex === -1) {
    console.error('找不到被拖曳的群組項');
    return;
  }

  // 獲取群組項
  const groupItem = sourceRoomData[groupItemIndex];

  // 檢查群組後面是否有銜接時間，如果有也需要移除
  let itemsToRemove = 1;
  if (groupItemIndex < sourceRoomData.length - 1 && sourceRoomData[groupItemIndex + 1].isCleaningTime) {
    itemsToRemove = 2; // 同時移除群組和後續的銜接時間
  }

  // 從源房間移除群組項和相關銜接時間
  sourceRoomData.splice(groupItemIndex, itemsToRemove);

  // 更新源房間的時間，使用true參數避免自動添加尾部銜接時間
  if (sourceRoomData.length > 0) {
    updateRoomTimes(sourceRoomData, true);
  }

  // 插入到目標房間
  // 檢查插入位置是否有效
  let insertIndex = destinationIndex;
  if (insertIndex > destRoomData.length) {
    insertIndex = destRoomData.length;
  }

  // 獲取前後項目，用於調整群組時間
  const prevItem = insertIndex > 0 ? destRoomData[insertIndex - 1] : null;
  const nextItem = insertIndex < destRoomData.length ? destRoomData[insertIndex] : null;

  // 調整群組時間以匹配插入位置
  const updatedGroup = updateGroupTimes(groupItem, prevItem, nextItem, roomName);

  // 更新群組內容
  updatedGroup.operatingRoomName = roomName;

  // 插入更新後的群組
  destRoomData.splice(insertIndex, 0, updatedGroup);

  // 確保時間連續性
  if (sourceRoomIndex !== destinationRoomIndex) {
    // 如果是跨房間拖曳，需要插入銜接時間
    // 檢查前面是否需要插入銜接時間
    if (insertIndex > 0 && !destRoomData[insertIndex - 1].isCleaningTime && !updatedGroup.isCleaningTime) {
      const prevSurgery = destRoomData[insertIndex - 1];
      const cleaningItem = createCleaningTimeItem(
        prevSurgery.endTime,
        updatedGroup.startTime,
        roomName
      );
      destRoomData.splice(insertIndex, 0, cleaningItem);
      insertIndex++;
    }

    // 檢查後面是否需要插入銜接時間
    const afterIndex = insertIndex + 1;
    if (afterIndex < destRoomData.length && !destRoomData[afterIndex].isCleaningTime && !updatedGroup.isCleaningTime) {
      const cleaningItem = createCleaningTimeItem(
        updatedGroup.endTime,
        destRoomData[afterIndex].startTime,
        roomName
      );
      destRoomData.splice(afterIndex, 0, cleaningItem);
    }
  }

  // 重新計算目標房間的時間
  updateRoomTimes(destRoomData);
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

      // 過濾出實際手術（非銜接時間）
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

        console.log(`準備更新手術 ${surgery.applicationId}，房間: ${room.room}，順序: ${i + 1}`);
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

  // 檢查被拖曳的項目是否為銜接時間
  const isDraggingCleaningTime = roomData[sourceIndex]?.isCleaningTime;
  if (isDraggingCleaningTime) {
    console.log("禁止直接拖曳銜接時間");
    return;
  }

  // 如果目標位置是銜接時間，調整到相鄰的手術位置
  if (destinationIndex < roomData.length && roomData[destinationIndex]?.isCleaningTime) {
    destinationIndex = destinationIndex % 2 === 0 ? destinationIndex + 1 : destinationIndex - 1;
  }

  // 移除拖曳手術（含其銜接時間）
  const itemsToMove = roomData[sourceIndex + 1]?.isCleaningTime
    ? roomData.splice(sourceIndex, 2)
    : roomData.splice(sourceIndex, 1);

  let targetIndex = destinationIndex;
  if (targetIndex > roomData.length) {
    targetIndex = roomData.length;
  }

  // 插入拖曳項目
  roomData.splice(targetIndex, 0, ...itemsToMove);

  console.log(`拖曳至相同房間：從 ${sourceIndex} 到 ${destinationIndex}`);

  // 重新排序並更新 orderInRoom
  const surgeriesOnly = roomData.filter(item => !item.isCleaningTime);

  surgeriesOnly.forEach((surgery, index) => {
    const newOrder = index + 1;
    console.log(`手術：${surgery.applicationId}，新順序：${newOrder}`);
    if (surgery.orderInRoom !== newOrder) {
      surgery.orderInRoom = newOrder;

      // 發送更新到後端
      axios.put(`${BASE_URL}/api/system/surgery/${surgery.applicationId}/order-in-room`,
        { orderInRoom: newOrder }
      )
        .then(() => {
          console.log(`✅ 已更新 ${surgery.applicationId} 的 orderInRoom 為 ${newOrder}`);
        }).catch((err) => {
          console.error(`❌ 更新 ${surgery.applicationId} 的順序失敗`, err);
        });
    }
  });

  // 最後更新時間顯示
  updateRoomTimes(roomData);
};


const handleCrossRoomDrag = (result, newRows, sourceRoomIndex, destRoomIndex, sourceIndex, destinationIndex) => {
  const sourceRoomData = newRows[sourceRoomIndex].data;
  const destRoomData = newRows[destRoomIndex].data;
  const roomName = newRows[destRoomIndex].room || '手術室';

  console.log("🔁 跨手術房拖曳操作");

  const isDraggingCleaningTime = sourceRoomData[sourceIndex]?.isCleaningTime;
  if (isDraggingCleaningTime) {
    console.log("❌ 禁止拖曳銜接時間");
    return;
  }

  // ✅ Step 1: 先取出 surgery 與其後的清潔項（若有）
  const itemsToMove = [];
  const surgery = sourceRoomData[sourceIndex];
  itemsToMove.push(surgery);

  if (sourceRoomData[sourceIndex + 1]?.isCleaningTime) {
    itemsToMove.push(sourceRoomData[sourceIndex + 1]);
  }

  // ❗ 移除前，先刪除指定 range，不能只用 splice(1)
  sourceRoomData.splice(sourceIndex, itemsToMove.length);

  // ✅ Step 2: 插入至目標房
  let targetIndex = destinationIndex;
  if (targetIndex > destRoomData.length) targetIndex = destRoomData.length;

  // ⛔ 如果插入點是清潔時間，避免錯位
  if (destRoomData[targetIndex]?.isCleaningTime) {
    targetIndex = targetIndex % 2 === 0 ? targetIndex + 1 : targetIndex - 1;
  }

  surgery.operatingRoomName = roomName;
  destRoomData.splice(targetIndex, 0, ...itemsToMove);

  // ✅ Step 3: 插入前後銜接時間（若需要）
  if (targetIndex > 0 && !destRoomData[targetIndex - 1].isCleaningTime) {
    const prevSurgery = destRoomData[targetIndex - 1];
    const cleaningItem = createCleaningTimeItem(
      prevSurgery.endTime,
      surgery.startTime,
      roomName
    );
    destRoomData.splice(targetIndex, 0, cleaningItem);
    targetIndex++;
  }

  if (
    targetIndex + itemsToMove.length < destRoomData.length &&
    !destRoomData[targetIndex + itemsToMove.length]?.isCleaningTime
  ) {
    const cleaningItem = createCleaningTimeItem(
      surgery.endTime,
      destRoomData[targetIndex + itemsToMove.length].startTime,
      roomName
    );
    destRoomData.splice(targetIndex + itemsToMove.length, 0, cleaningItem);
  }

  // ✅ Step 4: 更新時間與順序
  updateRoomTimes(sourceRoomData, true);
  updateRoomTimes(destRoomData);

  updateOrderInRoomForRoomData(sourceRoomData, newRows[sourceRoomIndex].roomId);
  updateOrderInRoomForRoomData(destRoomData, newRows[destRoomIndex].roomId);

  axios.put(`${BASE_URL}/api/system/surgery/${result.draggableId}/${newRows[destRoomIndex].roomId}`)
    .then(response => {
      console.log("手術室更新成功:", response.data);
    })
    .catch(error => {
      console.error("手術室更新失敗:", error);
    }
    );

  axios.put(`${BASE_URL}/api/system/surgery/${result.draggableId}/${newRows[sourceRoomIndex].roomId}`)
    .then(response => {
      console.log("手術室更新成功:", response.data);
    })
    .catch(error => {
      console.error("手術室更新失敗:", error);
    }
    );
};

const updateRoomTimes = (roomData, skipAddLastCleaningTime = false) => {
  if (!roomData || roomData.length === 0) return;

  // 從時間設定中獲取起始時間和銜接時間
  const timeSettings = getTimeSettings(true);
  const startHour = Math.floor(timeSettings.surgeryStartTime / 60);
  const startMinute = timeSettings.surgeryStartTime % 60;
  const initialTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;

  let currentTime = initialTime;

  for (let i = 0; i < roomData.length; i++) {
    const item = roomData[i];

    // 跳過已經處理過的群組內部項目
    if (item._processedInGroup) continue;

    if (item.isGroup) {
      // 處理群組項目
      item.startTime = currentTime;
      const groupDuration = calculateGroupDuration(item);
      item.endTime = addMinutesToTime(currentTime, groupDuration);

      // 將時間傳遞到群組內部項目
      if (item.surgeries && item.surgeries.length > 0) {
        let groupItemTime = currentTime;
        for (let j = 0; j < item.surgeries.length; j++) {
          const surgery = item.surgeries[j];
          surgery.startTime = groupItemTime;

          if (surgery.isCleaningTime) {
            // 銜接時間固定
            surgery.endTime = addMinutesToTime(groupItemTime, timeSettings.cleaningTime);
            surgery.color = getCleaningColor();
          } else {
            // 手術時間按比例縮放
            const surgeryDuration = calculateDuration(surgery.startTime, surgery.endTime);
            surgery.endTime = addMinutesToTime(groupItemTime, surgeryDuration);
            surgery.color = getColorByEndTime(surgery.endTime, false);

            // 如果是最後一個手術且不是銜接時間，需要添加銜接時間
            if (j === item.surgeries.length - 1 && !surgery.isCleaningTime) {
              const cleaningTime = {
                isCleaningTime: true,
                startTime: surgery.endTime,
                endTime: addMinutesToTime(surgery.endTime, timeSettings.cleaningTime),
                color: getCleaningColor(),
                operatingRoomName: surgery.operatingRoomName,
                _processedInGroup: true
              };
              item.surgeries.push(cleaningTime);
            }
          }

          groupItemTime = surgery.endTime;
          surgery._processedInGroup = true;
        }

        // 確保最後一個項目的結束時間與群組結束時間一致
        if (item.surgeries.length > 0) {
          item.surgeries[item.surgeries.length - 1].endTime = item.endTime;
        }
      }

      // 群組結束後，更新當前時間
      currentTime = item.endTime;
    } else if (i + 1 < roomData.length && roomData[i + 1].isCleaningTime) {
      // 處理普通手術，且後面有銜接時間
      const surgery = item;
      const cleaning = roomData[i + 1];

      surgery.startTime = currentTime;
      const surgeryDuration = surgery.duration || calculateDuration(surgery.startTime, surgery.endTime);
      surgery.endTime = addMinutesToTime(currentTime, surgeryDuration);
      surgery.color = getColorByEndTime(surgery.endTime, false);

      cleaning.startTime = surgery.endTime;
      cleaning.endTime = addMinutesToTime(surgery.endTime, timeSettings.cleaningTime);
      cleaning.color = getCleaningColor();

      currentTime = cleaning.endTime;
      i++; // 跳過已處理的銜接時間
    } else if (item.isCleaningTime) {
      // 單獨的銜接時間
      item.startTime = currentTime;
      item.endTime = addMinutesToTime(currentTime, timeSettings.cleaningTime);
      item.color = getCleaningColor();

      currentTime = item.endTime;
    } else {
      // 普通手術，後面沒有銜接時間
      item.startTime = currentTime;
      const surgeryDuration = item.duration || calculateDuration(item.startTime, item.endTime);
      item.endTime = addMinutesToTime(currentTime, surgeryDuration);
      item.color = getColorByEndTime(item.endTime, false);

      // 如果是最後一個項目且不是銜接時間，添加銜接時間
      if (!skipAddLastCleaningTime && i === roomData.length - 1 && !item.isCleaningTime) {
        const cleaningTime = {
          isCleaningTime: true,
          startTime: item.endTime,
          endTime: addMinutesToTime(item.endTime, timeSettings.cleaningTime),
          color: getCleaningColor(),
          operatingRoomName: item.operatingRoomName
        };
        roomData.push(cleaningTime);
      }

      currentTime = item.endTime;
    }
  }

  // 清除處理標記
  for (let i = 0; i < roomData.length; i++) {
    if (roomData[i]._processedInGroup) {
      delete roomData[i]._processedInGroup;
    }

    if (roomData[i].surgeries) {
      for (let j = 0; j < roomData[i].surgeries.length; j++) {
        if (roomData[i].surgeries[j]._processedInGroup) {
          delete roomData[i].surgeries[j]._processedInGroup;
        }
      }
    }
  }
};

// 計算群組的總持續時間
const calculateGroupDuration = (group) => {
  if (!group.surgeries || group.surgeries.length === 0) {
    return 60; // 預設1小時
  }

  // 使用原始持續時間總和
  let totalMinutes = 0;
  for (let i = 0; i < group.surgeries.length; i++) {
    const item = group.surgeries[i];
    if (item.isCleaningTime) {
      // 銜接時間使用固定值
      totalMinutes += getTimeSettings(true).cleaningTime || 45;
    } else {
      // 手術時間使用原始設定或計算值
      const duration = item.duration || calculateDuration(item.startTime, item.endTime);
      totalMinutes += duration;
    }
  }

  return totalMinutes;
};

const updateOrderInRoomForRoomData = (roomData, roomId) => {
  console.log("更新手術順序和房間資料...");
  console.log("房間資料:", roomData);
  console.log("房間 ID:", roomId);
  const surgeries = roomData.filter(item => !item.isCleaningTime);
  surgeries.forEach((surgery, index) => {
    const newOrder = index + 1;
    surgery.orderInRoom = newOrder;

    axios.put(`${BASE_URL}/api/system/surgery/${surgery.applicationId}/order-in-room`, {
      orderInRoom: newOrder,
      operatingRoomId: roomId
    }).then(() => {
      console.log(`✅ 已更新 ${surgery.applicationId} 的 orderInRoom=${newOrder} 和房間=${roomId}`);
    }).catch(err => {
      console.error(`❌ 更新 ${surgery.applicationId} 的順序或房間失敗`, err);
    });
  });
};