
// File: OutputWriter.java
// 使用 BufferedWriter 寫出新的手術室排程表
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

public class OutputWriter {
    public static void writeNewTimeTable(String path, List<OperatingRoom> rooms) {
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(path))) {
            // 輸出標題列
            bw.write(
                    "surgeryDateTime,surgeryId,patientId,specialty,surgeon,roomId,anesthesia,duration,req,order");
            bw.newLine();

            for (OperatingRoom room : rooms) {
                for (Surgery s : room.surgeries) {
                    bw.write(String.format(
                            "%s,%s,%s,%s,%s,%s,%s,%d,%s,%d",
                            "no day data", // 固定排程時間（可改動）
                            s.surgeryId,
                            s.patientId,
                            s.specialty,
                            s.surgeon,
                            s.roomId,
                            s.anesthesia,
                            s.duration,
                            s.req,
                            s.order));
                    bw.newLine();
                }
            }

            System.out.println("newTimeTable.csv 輸出完成！");
        } catch (IOException e) {
            System.err.println("寫檔錯誤！");
            e.printStackTrace();
        }
    }
}
