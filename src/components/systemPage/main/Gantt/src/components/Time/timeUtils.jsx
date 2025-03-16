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
  
  // 更新後續所有手術和整理時間
  export const updateFollowingTimes = (data, startIndex) => {
    for (let i = startIndex; i < data.length; i += 2) {
      const prevEndTime = i > 0 ? data[i - 1].endTime : "08:30";
      const surgeryDuration = calculateDuration(data[i].startTime, data[i].endTime);
      
      // 更新手術時間
      data[i].startTime = prevEndTime;
      data[i].endTime = addMinutesToTime(prevEndTime, surgeryDuration);
      
      // 更新整理時間（改為45分鐘）
      if (i + 1 < data.length) {
        data[i + 1].startTime = data[i].endTime;
        data[i + 1].endTime = addMinutesToTime(data[i].endTime, 45);
      }
    }
    return data;
  };