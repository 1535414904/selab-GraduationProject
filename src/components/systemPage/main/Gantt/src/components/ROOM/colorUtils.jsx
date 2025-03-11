// 定義顏色常數
export const COLORS = {
    GREEN: "#19ec9f",   // 對應 CSS 中的 .item.green
    YELLOW: "#ebeb0a",  // 對應 CSS 中的 .item.yellow
    RED: "#e63030",     // 對應 CSS 中的 .item.red
    BLUE: "#362de9"     // 對應 CSS 中的 .item.blue
  };
  
  // 根據手術結束時間判斷顏色
  export const getColorByEndTime = (endTime, isCleaningTime) => {
    if (isCleaningTime) {
      return "blue";
    }
    
    const [hours, minutes] = endTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    if (totalMinutes <= 1050) {        // 17:30 之前
      return "green";
    } else if (totalMinutes <= 1200) { // 17:30-20:00
      return "yellow";
    } else {                           // 20:00 之後
      return "red";
    }
  };
  
  // 獲取清潔時間的顏色
  export const getCleaningColor = () => "blue";
  
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
      default:
        return COLORS.GREEN;
    }
  };