// 定義顏色常數
export const COLORS = {
    GREEN: "#19ec9f",   // 對應 CSS 中的 .item.green
    YELLOW: "#ebeb0a",  // 對應 CSS 中的 .item.yellow
    RED: "#e63030",     // 對應 CSS 中的 .item.red
    BLUE: "#362de9",    // 對應 CSS 中的 .item.blue
    GROUP: "#ffa500" // 群組顏色
  };
  
  // 從時間設定獲取設定，如果不存在則使用預設值
  import { getTimeSettings } from '../Time/timeUtils';
  
  // 根據手術結束時間判斷顏色
  export const getColorByEndTime = (endTime, isCleaningTime, useTempSettings = false) => {
    if (isCleaningTime) {
      return "blue";
    }
    
    // 獲取當前的時間設定，指定是否使用臨時設定
    const timeSettings = getTimeSettings(useTempSettings);
    
    const [hours, minutes] = endTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    if (totalMinutes <= timeSettings.regularEndTime) {        // 常規時間內
      return "green";
    } else if (totalMinutes <= timeSettings.overtimeEndTime) { // 常規時間-加班時間內
      return "yellow";
    } else {                                                  // 加班時間之後
      return "red";
    }
  };
  
  // 獲取清潔時間的顏色
  export const getCleaningColor = () => "blue";
  
  // 獲取群組顏色
  export const getGroupColor = (isCleaningTime, endTime, useTempSettings = false) => {
    // 如果是清潔時間，返回藍色
    if (isCleaningTime) return "blue";
    
    // 否則根據結束時間返回相應顏色
    return getColorByEndTime(endTime, false, useTempSettings);
  };
  
  // 根據顏色名稱獲取實際的色碼值
  export const getColorCode = (colorName) => {
    switch (colorName) {
      case "green":
        return COLORS.GREEN;
      case "yellow":
        return COLORS.YELLOW;
      case "red":
        return COLORS.RED;
      case "blue":
        return COLORS.BLUE;
      case "group":
        return COLORS.GROUP;
      default:
        return "#999999"; // 預設灰色
    }
  };