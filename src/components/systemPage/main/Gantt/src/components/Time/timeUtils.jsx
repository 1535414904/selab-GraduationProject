// 計算兩個時間點之間的分鐘差
export const calculateDuration = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };
  
  // 將指定時間加上分鐘數
  export const addMinutesToTime = (time, minutes) => {
    const [hours, mins] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  };
  
  // 從 localStorage 獲取時間設定，如果不存在則使用預設值
  export const getTimeSettings = () => {
    const defaultSettings = {
      surgeryStartTime: 510, // 預設值 510 分鐘 = 8:30 AM (從00:00開始計算)
      regularEndTime: 1050,  // 預設值 1050 分鐘 = 17:30 PM (從00:00開始計算)
      overtimeEndTime: 1200, // 預設值 1200 分鐘 = 20:00 PM (從00:00開始計算)
      cleaningTime: 45,      // 預設值 45 分鐘
    };
    
    try {
      const savedSettings = localStorage.getItem("ganttTimeSettings");
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
      console.error("獲取時間設定時發生錯誤：", error);
      return defaultSettings;
    }
  };
  
  // 更新後續所有手術和整理時間
  export const updateFollowingTimes = (data, startIndex) => {
    // 從 localStorage 獲取清潔時間
    const { cleaningTime } = getTimeSettings();
    
    for (let i = startIndex; i < data.length; i += 2) {
      const prevEndTime = i > 0 ? data[i - 1].endTime : "08:30";
      const surgeryDuration = calculateDuration(data[i].startTime, data[i].endTime);
      
      // 更新手術時間
      data[i].startTime = prevEndTime;
      data[i].endTime = addMinutesToTime(prevEndTime, surgeryDuration);
      
      // 使用從設定中獲取的清潔時間
      if (i + 1 < data.length) {
        data[i + 1].startTime = data[i].endTime;
        data[i + 1].endTime = addMinutesToTime(data[i].endTime, cleaningTime);
      }
    }
    return data;
  };