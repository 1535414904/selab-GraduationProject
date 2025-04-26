import axios from 'axios';
import { addMinutesToTime, getTimeSettings } from '../Time/timeUtils';
import { getColorByEndTime, getCleaningColor } from '../ROOM/colorUtils';
import { BASE_URL } from "/src/config";

export const fetchSurgeryData = async (setRows, setLoading, setError, isMainPage = false) => {
  setLoading(true);
  setError(null);
  try {
    console.log('開始獲取手術房數據...', isMainPage ? '(主頁模式)' : '(排班管理模式)');

    // 1. 先獲取所有手術房
    const operatingRoomsResponse = await axios.get(`${BASE_URL}/api/system/operating-rooms`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!operatingRoomsResponse.data || operatingRoomsResponse.data.length === 0) {
      throw new Error('未收到手術房數據');
    }

    console.log('收到的手術房數據:', operatingRoomsResponse.data);

    // 過濾掉status為0(關閉)的手術房
    const closedRooms = operatingRoomsResponse.data.filter(room => room.status === 0);
    if (closedRooms.length > 0) {
      console.log('以下手術房因狀態為關閉而被過濾:');
      closedRooms.forEach(room => {
        console.log(`- ID: ${room.id}, 名稱: ${room.name}, 科別: ${room.department.name}`);
      });
    } else {
      console.log('沒有處於關閉狀態的手術房');
    }

    // 從localStorage獲取用戶選中的關閉手術房 - 只在排班管理頁面使用，主頁不使用
    let reservedClosedRooms = [];
    if (!isMainPage) {
      try {
        const reservedRoomsStr = localStorage.getItem('reservedClosedRooms');
        if (reservedRoomsStr) {
          reservedClosedRooms = JSON.parse(reservedRoomsStr);
          console.log('從localStorage獲取的保留關閉手術房:', reservedClosedRooms);
        }
      } catch (error) {
        console.error('解析保留手術房數據時出錯:', error);
      }
    } else {
      console.log('主頁模式下不使用保留手術房');
    }

    // 過濾出開啟的手術房
    const openRooms = operatingRoomsResponse.data.filter(room => room.status !== 0);

    // 合併開啟的手術房和選定的關閉手術房（如果不是主頁模式）
    const filteredOperatingRooms = isMainPage ? openRooms : [...openRooms, ...reservedClosedRooms];

    console.log('過濾後的手術房數據' + (isMainPage ? ' (僅開啟狀態)' : ' (包含保留的關閉手術房)') + ':', filteredOperatingRooms);

    // 2. 準備存儲所有手術房及其手術的數據
    const allRoomsWithSurgeries = [];

    // 用於存儲群組手術識別資訊
    const groupMap = new Map();

    // 3. 對每個手術房獲取相關手術
    for (const room of filteredOperatingRooms) {
      try {
        console.log(`獲取手術房 ${room.id} 的手術數據...`);

        const surgeriesResponse = await axios.get(`${BASE_URL}/api/system/operating-rooms/${room.id}/surgery`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        // 創建手術房對象，包含其手術
        const roomWithSurgeries = {
          roomId: room.id,
          room: room.operatingRoomName,
          data: []
        };

        // 處理該手術房的手術
        if (surgeriesResponse.data && surgeriesResponse.data.length > 0) {
          // 根據 prioritySequence 對手術排序
          const sortedSurgeries = [...surgeriesResponse.data].sort((a, b) => {
            // 如果優先順序存在，按優先順序排序
            if (a.prioritySequence && b.prioritySequence) {
              return a.prioritySequence - b.prioritySequence;
            }
            // 如果 a 有優先順序而 b 沒有，a 排在前面
            if (a.prioritySequence) return -1;
            // 如果 b 有優先順序而 a 沒有，b 排在前面
            if (b.prioritySequence) return 1;
            // 如果都沒有優先順序，維持原來的順序
            return 0;
          });

          console.log('排序後的手術數據:', sortedSurgeries);

          // 首先檢查哪些手術是群組的一部分
          sortedSurgeries.forEach(surgery => {
            if (surgery.groupApplicationIds && surgery.groupApplicationIds.length > 0 && !isMainPage) {
              // 根據群組ID添加到群組映射中
              const groupId = surgery.groupApplicationIds.join('-');
              if (!groupMap.has(groupId)) {
                groupMap.set(groupId, {
                  surgeries: [],
                  roomId: room.id,
                  roomName: room.name
                });
              }

              // 將此手術添加到對應的群組中
              groupMap.get(groupId).surgeries.push(surgery);
            }
          });

          sortedSurgeries.forEach(surgery => {
            // 手術項目，加入科別 specialty
            const surgeryItem = {
              id: surgery.applicationId,
              doctor: surgery.chiefSurgeonName || '未指定醫師',
              surgery: `${surgery.surgeryName || '未命名手術'} (${surgery.patientName || '未知病患'})`,
              startTime: "08:30",
              duration: surgery.estimatedSurgeryTime || 60,
              isCleaningTime: false,
              // 保存原始手術資料的所有欄位，用於詳細資訊顯示
              applicationId: surgery.applicationId,
              medicalRecordNumber: surgery.medicalRecordNumber,
              patientName: surgery.patientName,
              date: surgery.date,
              surgeryName: surgery.surgeryName,
              chiefSurgeonName: surgery.chiefSurgeonName,
              operatingRoomName: room.operatingRoomName || room.name,
              estimatedSurgeryTime: surgery.estimatedSurgeryTime,
              anesthesiaMethod: surgery.anesthesiaMethod,
              surgeryReason: surgery.surgeryReason,
              specialOrRequirements: surgery.specialOrRequirements,
              user: surgery.user,
              departmentName: surgery.departmentName || (room.department ? room.department.name : "未指定科別"), // 加強科別獲取邏輯
              prioritySequence: surgery.prioritySequence || 99999, // 保存優先順序
              orderInRoom: surgery.orderInRoom ?? null, // 保證排序用得到
              // 保存群組資訊
              groupApplicationIds: surgery.groupApplicationIds || [],
              // 若有群組ID且不是主頁模式，則標記為群組的一部分
              isInGroup: !isMainPage && (surgery.groupApplicationIds && surgery.groupApplicationIds.length > 0)
            };
            
            // 調試日誌：檢查科別資料
            console.log(`手術 ${surgery.applicationId} 的科別資料:`, {
              從surgery直接獲取: surgery.departmentName,
              從手術房獲取: room.department ? room.department.name : "無科別資料",
              最終使用: surgeryItem.departmentName
            });

            // 銜接時間項目
            const cleaningItem = {
              id: `cleaning-${surgery.applicationId}`,
              doctor: '銜接時間',
              surgery: '整理中',
              duration: getTimeSettings(true).cleaningTime,
              isCleaningTime: true,
              operatingRoomName: room.name
            };

            roomWithSurgeries.data.push(surgeryItem, cleaningItem);
          });
        }

        // 即使沒有手術，也添加手術房（顯示空手術房）
        allRoomsWithSurgeries.push(roomWithSurgeries);

      } catch (roomError) {
        console.error(`獲取手術房 ${room.id} 的手術數據時發生錯誤:`, roomError);
        // 繼續處理下一個手術房，不中斷整個流程
        allRoomsWithSurgeries.push({
          roomId: room.id,
          room: room.name,
          data: []
        });
      }
    }

    // 4. 計算每個手術房中手術的時間和顏色
    // 使用臨時設定處理時間
    const formattedData = formatRoomData(allRoomsWithSurgeries, true, isMainPage, groupMap);
    console.log('格式化後的數據:', formattedData);

    setRows(formattedData);
    setLoading(false);
    return formattedData; // 返回格式化後的數據，以便在Promise中使用
  } catch (error) {
    console.error('獲取數據時發生錯誤:', error);
    setError(`獲取數據失敗: ${error.message}`);
    setLoading(false);
    throw error; // 拋出錯誤以便調用者處理
  }
};

// 格式化手術房數據，計算時間和顏色
export const formatRoomData = (roomsWithSurgeries, useTempSettings = false, isMainPage = false, groupMap = null) => {
  try {
    // 從時間設定中獲取起始時間和銜接時間，指定是否使用臨時設定
    const timeSettings = getTimeSettings(useTempSettings);
    const startHour = Math.floor(timeSettings.surgeryStartTime / 60);
    const startMinute = timeSettings.surgeryStartTime % 60;
    const initialTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;

    // 處理群組手術
    if (!isMainPage && groupMap) {
      // 遍歷每個手術房
      roomsWithSurgeries.forEach(room => {
        if (!room.data || room.data.length === 0) return;

        // 尋找需要組成群組的手術
        const groupedSurgeries = room.data.filter(item =>
          !item.isCleaningTime && item.isInGroup &&
          item.groupApplicationIds && item.groupApplicationIds.length > 0
        );

        // 按群組ID進行分組
        const groupsInRoom = {};
        groupedSurgeries.forEach(surgery => {
          const groupId = surgery.groupApplicationIds.join('-');
          if (!groupsInRoom[groupId]) {
            groupsInRoom[groupId] = [];
          }
          groupsInRoom[groupId].push(surgery);
        });

        // 處理每個群組
        Object.keys(groupsInRoom).forEach(groupId => {
          const surgeries = groupsInRoom[groupId];
          // 如果群組中只有一個手術，則不進行群組處理
          if (surgeries.length < 2) return;

          // 收集群組中所有手術的ID及相關銜接時間ID
          const allRelatedIds = new Set();
          const groupSurgeryIds = surgeries.map(s => s.id);

          groupSurgeryIds.forEach(id => {
            allRelatedIds.add(id);
            // 添加每個手術後的銜接時間ID
            allRelatedIds.add(`cleaning-${id.replace('cleaning-', '')}`);
          });

          // 從room.data中過濾出所有相關項目
          const allRelatedItems = room.data.filter(item => allRelatedIds.has(item.id));

          // 按開始時間排序
          allRelatedItems.sort((a, b) => {
            if (!a.startTime || !b.startTime) return 0;
            return new Date('1970/01/01 ' + a.startTime) - new Date('1970/01/01 ' + b.startTime);
          });

          // 如果沒有相關項目，則跳過
          if (allRelatedItems.length === 0) return;

          // 創建群組項目
          const firstItem = allRelatedItems[0];
          const lastItem = allRelatedItems[allRelatedItems.length - 1];
          
          // 獲取時間設定（使用臨時設定）
          const timeSettings = getTimeSettings(true);
          
          // 查找 orderInRoom = 1 的手術
          const order1Surgery = surgeries.find(surgery => surgery.orderInRoom === 1);
          
          // 如果找到 orderInRoom = 1 的手術，使用其時間 + 一個銜接時間
          // 否則使用所有項目的時間（維持原邏輯）
          let groupDuration = 0;
          let groupEndTime = lastItem.endTime;
          
          let groupOrderInRoom = null;
          let groupSurgeries = [...allRelatedItems]; // 預設保留所有手術
          
          if (order1Surgery) {
            // 使用 orderInRoom=1 的手術時間 + 一個銜接時間
            groupDuration = order1Surgery.duration + timeSettings.cleaningTime;
            // 重新計算結束時間（保留實際結束時間在 surgeries 中）
            groupEndTime = addMinutesToTime(firstItem.startTime, groupDuration);
            console.log(`群組使用 orderInRoom=1 的手術時間 (${order1Surgery.duration}) + 銜接時間 (${timeSettings.cleaningTime})`);
            // 確保群組的 orderInRoom 是 1，與計算時間的手術一致
            groupOrderInRoom = 1;
            
            // 只保留 orderInRoom=1 的手術和它的銜接時間
            // 在 allRelatedItems 中查找銜接時間項目
            const order1CleaningItem = allRelatedItems.find(s => s.id === `cleaning-${order1Surgery.applicationId}`);
            // 只保留需要顯示的手術和銜接時間
            groupSurgeries = order1CleaningItem ? [order1Surgery, order1CleaningItem] : [order1Surgery];
          } else {
            // 如果沒有找到 orderInRoom=1 的手術，維持原來的總時間計算
            groupDuration = allRelatedItems.reduce((total, surgeryItem) => total + (surgeryItem.duration || 0), 0);
            console.log(`找不到 orderInRoom=1 的手術，使用所有手術的總時間: ${groupDuration}`);
            // 所有手術都要保留 - 不需要額外操作
          }

          const groupItem = {
            id: `group-${groupId}`,
            doctor: `${surgeries.length} 個手術`,
            surgery: '群組手術',
            startTime: firstItem.startTime,
            endTime: groupEndTime,
            duration: groupDuration,
            color: "group",
            isGroup: true,
            surgeries: groupSurgeries, // 使用根據 orderInRoom 過濾後的手術列表
            allSurgeries: allRelatedItems, // 完整保存所有手術的原始資訊
            originalEndTime: lastItem.endTime, // 保存原始結束時間
            isCleaningTime: false,
            operatingRoomName: room.room,
            applicationId: surgeries[0].applicationId,
            groupApplicationIds: surgeries[0].groupApplicationIds,
            orderInRoom: groupOrderInRoom
          };

          // 從room.data中移除所有相關項目
          room.data = room.data.filter(item => !allRelatedIds.has(item.id));

          // 在第一個項目的位置插入群組項目
          const insertIndex = room.data.findIndex(item =>
            item.startTime && new Date('1970/01/01 ' + item.startTime) > new Date('1970/01/01 ' + firstItem.startTime)
          );

          if (insertIndex === -1) {
            // 如果沒有找到合適的位置，則添加到末尾
            room.data.push(groupItem);
          } else {
            // 在找到的位置插入
            room.data.splice(insertIndex, 0, groupItem);
          }
        });
      });
    }

    // 計算時間和顏色
    roomsWithSurgeries.forEach(room => {
      if (room.data && room.data.length > 0) {
        // 🔧 在計算時間前先根據 orderInRoom 排序（只排序手術，不動清潔時間）
        const surgeriesOnly = room.data.filter(item => !item.isCleaningTime && item.orderInRoom != null);
        const sortedSurgeries = [...surgeriesOnly].sort((a, b) => a.orderInRoom - b.orderInRoom);

        // 🔁 重新組合 room.data
        room.data = sortedSurgeries.flatMap(surgery => {
          const cleaningItem = room.data.find(item => item.id === `cleaning-${surgery.applicationId}`);
          return cleaningItem ? [surgery, cleaningItem] : [surgery];
        });

        let currentTime = initialTime;

        room.data.forEach((item) => {
          item.startTime = currentTime;

          // 如果是群組，使用已計算的持續時間
          if (item.isGroup && item.duration) {
            item.endTime = addMinutesToTime(currentTime, item.duration);

            // 如果有 orderInRoom=1 的手術，只計算這個手術和一個銜接時間
            let innerCurrentTime = currentTime;
            
            // 尋找 orderInRoom=1 的手術
            const surgeryItems = item.surgeries.filter(s => !s.isCleaningTime);
            const order1SurgeryItem = surgeryItems.find(s => s.orderInRoom === 1);
            const order1CleaningItem = order1SurgeryItem ? 
              item.surgeries.find(s => s.id === `cleaning-${order1SurgeryItem.applicationId}`) : null;
              
            if (order1SurgeryItem) {
              // 只更新 orderInRoom=1 的手術和它的銜接時間
              console.log(`群組內部只計算 orderInRoom=1 的手術和銜接時間`);
              
              // 設置 orderInRoom=1 的手術時間
              order1SurgeryItem.startTime = innerCurrentTime;
              order1SurgeryItem.endTime = addMinutesToTime(innerCurrentTime, order1SurgeryItem.duration);
              innerCurrentTime = order1SurgeryItem.endTime;
              
              // 設置它的銜接時間
              if (order1CleaningItem) {
                order1CleaningItem.startTime = innerCurrentTime;
                order1CleaningItem.duration = timeSettings.cleaningTime;
                order1CleaningItem.endTime = addMinutesToTime(innerCurrentTime, timeSettings.cleaningTime);
              }
              
              // 為其他手術設置時間，但不輔助渲染
              item.surgeries.forEach(surgery => {
                if (surgery !== order1SurgeryItem && surgery !== order1CleaningItem) {
                  // 設置有效的時間使用 displayRender=false 代替 hidden
                  if (!surgery.startTime) surgery.startTime = order1SurgeryItem.startTime;
                  if (!surgery.endTime) surgery.endTime = order1SurgeryItem.endTime;
                  surgery.displayRender = false; // 使用自定義屬性代替 hidden
                }
              });
            } else {
              // 如果沒有 orderInRoom=1 的手術，使用原來的都包含邏輯
              console.log(`群組內沒有 orderInRoom=1 的手術，顯示所有手術`);
              item.surgeries.forEach(surgery => {
                surgery.startTime = innerCurrentTime;
                surgery.endTime = addMinutesToTime(innerCurrentTime, surgery.duration);
                innerCurrentTime = surgery.endTime;
                surgery.hidden = false;
              });
            }
          } else {
            item.endTime = addMinutesToTime(currentTime, item.duration);
          }

          item.color = item.isCleaningTime
            ? getCleaningColor()
            : item.isGroup
              ? "group"
              : getColorByEndTime(item.endTime, false, useTempSettings);

          // 使用設定中的銜接時間
          if (item.isCleaningTime) {
            item.duration = timeSettings.cleaningTime;
            item.endTime = addMinutesToTime(item.startTime, timeSettings.cleaningTime);
          }

          currentTime = item.endTime;
        });
      }
    });

    // 觸發自定義事件，通知TimeWrapper組件重新渲染
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('cleaningTimeChange'));
    }, 0);

    return roomsWithSurgeries;
  } catch (error) {
    console.error('數據格式化錯誤:', error);
    return [];
  }
};
