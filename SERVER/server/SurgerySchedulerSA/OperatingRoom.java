
// File: OperatingRoom.java
// 表示手術室的類別
// 包含手術室ID、手術列表、常規時間和加班限制等屬性
import java.util.LinkedList;

public class OperatingRoom {
    public String roomId;
    public LinkedList<Surgery> surgeries;
    public int regularTime;
    public int overtimeLimit;
    public int transitionTime; // 銜接時間
    public boolean isOrthRoom = false; // 是否為特殊手術房

    public OperatingRoom(String roomId, int regularTime, int overtimeLimit, int transitionTime) {
        this.roomId = roomId; // 手術室ID
        this.regularTime = regularTime; // 常規時間（分鐘）
        this.overtimeLimit = overtimeLimit; // 加班限制（分鐘）
        this.surgeries = new LinkedList<>(); // 手術鏈結串列
        this.transitionTime = transitionTime; // 銜接時間（分鐘）
        this.isOrthRoom = false; // 預設不是特殊手術房
    }

    public int calculateTotalTime() { // 計算手術室內所有手術的總時間(含每檯手術後的銜接時間)
        int total = 0;
        for (Surgery s : surgeries) { // 遍歷手術列表
            total += s.duration; // 累加每個手術的持續時間
            total += transitionTime; // 累加銜接時間
        }
        return total;
    }

    public int calculateOvertime() { // 計算手術室的加班時間
        return Math.max(0, calculateTotalTime() - regularTime);
    }

    public int calculateOverlimit() { // 計算手術室的超過加班限制的時間
        return Math.max(0, calculateTotalTime() - (regularTime + overtimeLimit));
    }
}
