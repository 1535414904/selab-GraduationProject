export const calculateWidth = (startTime, endTime) => {
  // 將時間轉換為分鐘數的輔助函數
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  // 調整基準時間（8:30）
  const baseTime = 8 * 60 + 30; // 8:30
  
  // 計算相對於基準時間的位置
  const relativeStart = startMinutes - baseTime;
  const duration = endMinutes - startMinutes;
  
  // 修改像素計算方式
  const pixelsPerMinute = 25 / 15; // 每15分鐘25px
  const width = duration * pixelsPerMinute;
  
  return {
    width: `${width}px`,
  };
};