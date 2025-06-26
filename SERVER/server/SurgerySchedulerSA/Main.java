import java.util.*;

public class Main {
    public static void main(String[] args) {

        // 讀取時間參數
        System.out.println("讀取時間參數...");
        int startTime = DataLoader.loadTime("data\\in\\Arguments4Exec.csv", 0);
        int regular = DataLoader.loadTime("data\\in\\Arguments4Exec.csv", 1);
        int overtime = DataLoader.loadTime("data\\in\\Arguments4Exec.csv", 2);
        int cleaning = DataLoader.loadTime("data\\in\\Arguments4Exec.csv", 3);
        System.out.println("常規時間: " + regular + " 分鐘, 加班限制: " + overtime + " 分鐘, 銜接時間: " + cleaning + " 分鐘\n");

        // 讀取手術資料
        System.out.println("\n讀取手術資料...");
        List<Surgery> allSurgeries = DataLoader.loadSurgeries("data\\in\\TimeTable.csv");
        System.out.println("讀取手術資料完成，共 " + allSurgeries.size() + " 筆手術資料\n");
        if (allSurgeries.isEmpty()) {
            System.out.println("沒有手術資料，請檢查 TimeTable.csv 檔案");
            return;
        }

        // 讀取手術室資料
        System.out.println("\n讀取手術室資料...");
        List<OperatingRoom> allRooms = DataLoader.loadRooms("data\\in\\room.csv", regular, overtime, cleaning);
        System.out.println("讀取手術室資料完成，共 " + allRooms.size() + " 間手術室");
        if (allRooms.stream().anyMatch(room -> room.isOrthRoom)) {
            for (OperatingRoom room : allRooms) {
                if (room.isOrthRoom) {
                    System.out.println("特殊手術房: " + room.roomId + "\n");
                }
            }
        } else {
            System.out.println("沒有特殊手術房\n");
        }

        DataLoader.assignInitialSchedule(allRooms, allSurgeries, "FCFS"); // 可選 FCFS、LPT或SPT

        for (OperatingRoom room : allRooms) {
            System.out.println("----房間 " + room.roomId + " 有 " + room.surgeries.size() + " 台手術");
            for (Surgery s : room.surgeries) {
                System.out.println("--> " + s.surgeryId + " (" + s.duration + " mins)");
            }
            System.out.println("\n");
        }

        // 輸出所有手術房的isOrthRoom
        System.out.println("所有手術房的特殊手術房狀態:");
        for (OperatingRoom room : allRooms) {
            System.out.println("手術室 " + room.roomId + " 是否為特殊手術房: " + room.isOrthRoom);
        }

        System.out.println("開始模擬退火演算法進行手術室排程優化...");
        SchedulerSA sa = new SchedulerSA(allRooms, 500000);
        sa.run();
        Integer surgeryCount = sa.bestSolution.stream()
                .mapToInt(room -> room.surgeries.size())
                .sum();
        System.out.println("最佳解找到，共有 " + surgeryCount + " 台手術被排入手術室。");

        // 輸出結果
        OutputWriter.writeNewTimeTable("data\\out\\newTimeTable.csv", sa.bestSolution);
        OutputWriter.writeGuidelinesCsv("data\\out\\Guidelines.csv", sa.bestSolution, startTime);

        System.out.println("排程成本分析:");
        // 計算總成本差異
        int initialCost = new SchedulerSA(allRooms, 1).cost(allRooms);
        int finalCost = sa.cost(sa.bestSolution);
        int costDifference = initialCost - finalCost;
        System.out.println("初始成本: " + initialCost);
        System.out.println("最佳解成本: " + finalCost);
        System.out.println("成本差異: " + costDifference);
        System.out.println("\n模擬退火演算法完成，最佳解已找到！");

        System.out.println("新班表已寫入 newTimeTable.csv 與 Guidelines.csv");
    }
}
