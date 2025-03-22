import { getTimeSettings } from '../Time/timeUtils';

export const calculateWidth = (startTime, endTime) => {
  // 從時間設定中獲取起始時間
  const timeSettings = getTimeSettings();
  const baseTime = timeSettings.surgeryStartTime; // 使用設定中的起始時間
  
  // Helper function to convert time to minutes
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Handle special case for end time "24:00"
  const startMinutes = timeToMinutes(startTime);
  const endMinutes =
    endTime === "24:00"
      ? 24 * 60 // Special case for midnight
      : timeToMinutes(endTime);

  // Calculate relative position to base time
  const relativeStart = startMinutes - baseTime;
  const duration = endMinutes - startMinutes;

  // Calculate width - 25px per 15 minutes (5/3 px per minute)
  const pixelsPerMinute = 25 / 15; // 1.67 px per minute
  
  // 確保寬度計算與時間刻度一致
  const width = Math.max(duration * pixelsPerMinute, 25); // Ensure minimum width of 25px

  // 計算左側位置，確保手術塊與時間刻度對齊
  const left = relativeStart * pixelsPerMinute;

  return {
    width: `${width}px`,
    left: `${left}px`,
  };
}; 