
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

    // 輸出 Guidelines.csv（對應人員、時間、狀態）
    public static void writeGuidelinesCsv(String path, List<OperatingRoom> rooms, int startTime) {
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(path))) {
            bw.write(",醫師姓名,手術名稱,現在時間,結束時間,狀態");
            bw.newLine();

            for (OperatingRoom room : rooms) {
                bw.write(room.roomId); // 每間房開頭
                bw.newLine();

                int currentTime = startTime;

                for (Surgery s : room.surgeries) {
                    int start = currentTime;
                    int end = start + s.duration;
                    String status = getStatus(start, end, startTime, room.regularTime, room.overtimeLimit);

                    bw.write(String.format("第1天,%s,%s(%s),%s,%s,%s",
                            s.surgeon != null ? s.surgeon : "null",
                            s.surgeryId,
                            s.anesthesia,
                            formatTime(start),
                            formatTime(end),
                            status));
                    bw.newLine();

                    // 整理時間
                    currentTime = end;
                    int cleanEnd = currentTime + room.transitionTime;
                    bw.write(String.format("第1天,null,整理時間,%s,%s,4",
                            formatTime(currentTime),
                            formatTime(cleanEnd)));
                    bw.newLine();

                    currentTime = cleanEnd;
                }
            }

            System.out.println("Guidelines.csv 輸出完成！");
        } catch (IOException e) {
            System.err.println("寫 Guidelines.csv 時發生錯誤！");
            e.printStackTrace();
        }
    }

    // 將分鐘轉換成 HH:mm 格式
    private static String formatTime(int minutes) {
        int hr = minutes / 60;
        int min = minutes % 60;
        return String.format("%d:%02d", hr, min);
    }

    // 根據結束時間判斷狀態：1=正常、2=加班、3=超時
    private static String getStatus(int start, int end, int baseStart, int maxRegular, int maxOvertime) {
        int regularEnd = baseStart + maxRegular;
        int overtimeEnd = regularEnd + maxOvertime;

        if (end <= regularEnd)
            return "1";
        else if (end <= overtimeEnd)
            return "2";
        else
            return "3";
    }

}
