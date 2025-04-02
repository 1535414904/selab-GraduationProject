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
          room: room.name,
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
              operatingRoomName: room.name,
              estimatedSurgeryTime: surgery.estimatedSurgeryTime,
              anesthesiaMethod: surgery.anesthesiaMethod,
              surgeryReason: surgery.surgeryReason,
              specialOrRequirements: surgery.specialOrRequirements,
              user: surgery.user,
              departmentName: surgery.departmentName || "未指定科別", // 修改科別屬性名
              prioritySequence: surgery.prioritySequence || 999 // 保存優先順序
            };
            console.log('手術項目:', surgeryItem);
            // 銜接時間項目
            const cleaningItem = {
              id: `cleaning-${surgery.applicationId}`,
              doctor: '銜接時間',
              surgery: '整理中',
              duration: 45,
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
    const formattedData = formatRoomData(allRoomsWithSurgeries);
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
export const formatRoomData = (roomsWithSurgeries, useTempSettings = false) => {
  try {
    // 從時間設定中獲取起始時間和銜接時間，指定是否使用臨時設定
    const timeSettings = getTimeSettings(useTempSettings);
    const startHour = Math.floor(timeSettings.surgeryStartTime / 60);
    const startMinute = timeSettings.surgeryStartTime % 60;
    const initialTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;

    // 計算時間和顏色
    roomsWithSurgeries.forEach(room => {
      if (room.data && room.data.length > 0) {
        let currentTime = initialTime;

        room.data.forEach((item) => {
          item.startTime = currentTime;
          item.endTime = addMinutesToTime(currentTime, item.duration);

          item.color = item.isCleaningTime
            ? getCleaningColor()
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
