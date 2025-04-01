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

// 用於暫存排班管理頁面的時間設定
let tempTimeSettings = null;

// 設置臨時時間設定（用於預覽）
export const setTempTimeSettings = (settings) => {
  tempTimeSettings = settings;

  // 觸發自定義事件，當銜接時間改變時通知TimeWrapper組件重新渲染
  window.dispatchEvent(new CustomEvent('cleaningTimeChange'));
};

// 清除臨時時間設定
export const clearTempTimeSettings = () => {
  tempTimeSettings = null;
};

// 從 localStorage 獲取時間設定，如果不存在則使用預設值
export const getTimeSettings = (useTempSettings = false) => {
  const defaultSettings = {
    surgeryStartTime: 510, // 預設值 510 分鐘 = 8:30 AM (從00:00開始計算)
    regularEndTime: 1050,  // 預設值 1050 分鐘 = 17:30 PM (從00:00開始計算)
    overtimeEndTime: 1200, // 預設值 1200 分鐘 = 20:00 PM (從00:00開始計算)
    cleaningTime: 45,      // 預設值 45 分鐘
  };

  // 如果是排班管理頁面且有臨時設定，則使用臨時設定
  if (useTempSettings && tempTimeSettings) {
    return tempTimeSettings;
  }

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
  // 從 localStorage 獲取銜接時間
  const { cleaningTime } = getTimeSettings();

  for (let i = startIndex; i < data.length; i += 2) {
    const prevEndTime = i > 0 ? data[i - 1].endTime : "08:30";
    const surgeryDuration = calculateDuration(data[i].startTime, data[i].endTime);

    // 更新手術時間
    data[i].startTime = prevEndTime;
    data[i].endTime = addMinutesToTime(prevEndTime, surgeryDuration);

    // 使用從設定中獲取的銜接時間
    if (i + 1 < data.length) {
      data[i + 1].startTime = data[i].endTime;
      data[i + 1].endTime = addMinutesToTime(data[i].endTime, cleaningTime);
    }
  }
  return data;
};