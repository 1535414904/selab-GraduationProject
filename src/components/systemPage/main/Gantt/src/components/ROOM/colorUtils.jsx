// 定義顏色常數
export const COLORS = {
    GREEN: "#19ec9f",   // 對應 CSS 中的 .item.green
    YELLOW: "#ebeb0a",  // 對應 CSS 中的 .item.yellow
    RED: "#e63030",     // 對應 CSS 中的 .item.red
    BLUE: "#362de9"     // 對應 CSS 中的 .item.blue
  };
  
  // 從 localStorage 獲取時間設定，如果不存在則使用預設值
  const getTimeSettings = () => {
    const defaultSettings = {
      surgeryStartTime: 510,  // 預設值 510 分鐘 = 8:30 AM (從00:00開始計算)
      regularEndTime: 1050,   // 預設值 1050 分鐘 = 17:30 PM (從00:00開始計算)
      overtimeEndTime: 1200,  // 預設值 1200 分鐘 = 20:00 PM (從00:00開始計算)
      cleaningTime: 45,       // 預設值 45 分鐘
    };
    
    try {
      const savedSettings = localStorage.getItem("ganttTimeSettings");
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
      console.error("獲取時間設定時發生錯誤：", error);
      return defaultSettings;
    }
  };
  
  // 根據手術結束時間判斷顏色
  export const getColorByEndTime = (endTime, isCleaningTime) => {
    if (isCleaningTime) {
      return "blue";
    }
    
    // 獲取當前的時間設定
    const timeSettings = getTimeSettings();
    
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