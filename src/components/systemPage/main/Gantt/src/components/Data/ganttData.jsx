import axios from 'axios';
import { addMinutesToTime } from '../Time/timeUtils';
import { getColorByEndTime, getCleaningColor } from '../ROOM/colorUtils';
import { BASE_URL } from "/src/config";

export const fetchSurgeryData = async (setRows, setLoading, setError) => {
  setLoading(true);
  setError(null);
  try {
    console.log('開始獲取數據...');
    const response = await axios.get(`${BASE_URL}/api/surgeries`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('收到的原始數據:', response.data);

    if (!response.data) {
      throw new Error('未收到數據');
    }

    const dataToUse = response.data.length > 0 ? response.data : mockData;
    console.log('使用的數據:', dataToUse);

    const formattedData = formatSurgeryData(dataToUse);
    console.log('格式化後的數據:', formattedData);

    setRows(formattedData);
    setLoading(false);
  } catch (error) {
    console.error('獲取數據時發生錯誤:', error);
    setError(`獲取數據失敗: ${error.message}`);
    setLoading(false);
  }
};

export const formatSurgeryData = (surgeries) => {
  try {
    const roomGroups = {};
    
    surgeries.forEach(surgery => {
      const roomId = surgery.operatingRoom?.id;
      const roomName = surgery.operatingRoom?.name;
      
      if (!roomId || !roomName) return;

      if (!roomGroups[roomId]) {
        roomGroups[roomId] = {
          room: roomName,
          data: []
        };
      }

      // 手術項目
      const surgeryItem = {
        id: surgery.applicationId,
        doctor: surgery.chiefSurgeonName || '未指定醫師',
        surgery: `${surgery.surgeryName || '未命名手術'} (${surgery.patientName || '未知病患'})`,
        startTime: "08:30",
        duration: surgery.estimatedSurgeryTime || 60,
        isCleaningTime: false
      };

      // 清潔時間項目
      const cleaningItem = {
        id: `cleaning-${surgery.applicationId}`,
        doctor: '清潔時間',
        surgery: '整理中',
        duration: 45,
        isCleaningTime: true
      };

      roomGroups[roomId].data.push(surgeryItem, cleaningItem);
    });

    // 計算時間和顏色
    Object.values(roomGroups).forEach(room => {
      let currentTime = "08:30";
      
      room.data.forEach((item, index) => {
        item.startTime = currentTime;
        item.endTime = addMinutesToTime(currentTime, item.duration);
        
        item.color = item.isCleaningTime ? 
          getCleaningColor() : 
          getColorByEndTime(item.endTime, false);
        
        currentTime = item.endTime;
      });
    });

    return Object.values(roomGroups);
  } catch (error) {
    console.error('數據格式化錯誤:', error);
    return [];
  }
}; 