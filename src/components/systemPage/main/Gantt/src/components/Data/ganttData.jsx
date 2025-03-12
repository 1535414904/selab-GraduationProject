import axios from 'axios';
import { addMinutesToTime } from '../Time/timeUtils';
import { getColorByEndTime, getCleaningColor } from '../ROOM/colorUtils';
import { BASE_URL } from "/src/config";

export const fetchSurgeryData = async (setRows, setLoading, setError) => {
  setLoading(true);
  setError(null);
  try {
    console.log('開始獲取手術房數據...');
    
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
    
    // 2. 準備存儲所有手術房及其手術的數據
    const allRoomsWithSurgeries = [];
    
    // 3. 對每個手術房獲取相關手術
    for (const room of operatingRoomsResponse.data) {
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
          surgeriesResponse.data.forEach(surgery => {
            // 手術項目
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
              user: surgery.user
            };

            // 清潔時間項目
            const cleaningItem = {
              id: `cleaning-${surgery.applicationId}`,
              doctor: '清潔時間',
              surgery: '整理中',
              duration: 45,
              isCleaningTime: true
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
  } catch (error) {
    console.error('獲取數據時發生錯誤:', error);
    setError(`獲取數據失敗: ${error.message}`);
    setLoading(false);
  }
};

// 格式化手術房數據，計算時間和顏色
export const formatRoomData = (roomsWithSurgeries) => {
  try {
    // 計算時間和顏色
    roomsWithSurgeries.forEach(room => {
      if (room.data && room.data.length > 0) {
        let currentTime = "08:30";
        
        room.data.forEach((item) => {
          item.startTime = currentTime;
          item.endTime = addMinutesToTime(currentTime, item.duration);
          
          item.color = item.isCleaningTime ? 
            getCleaningColor() : 
            getColorByEndTime(item.endTime, false);
          
          currentTime = item.endTime;
        });
      }
    });

    return roomsWithSurgeries;
  } catch (error) {
    console.error('數據格式化錯誤:', error);
    return [];
  }
}; 