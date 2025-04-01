package com.backend.project.Service;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Writer;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.backend.project.Dao.SurgeryRepository;
import com.backend.project.model.Surgery;
import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.opencsv.exceptions.CsvValidationException;

@Service
public class AlgorithmService {

    private static final String BATCH_FILE_PATH = "ORSM 2025/AllInOne.bat"; // 根據實際檔名修改

    @Value("${time-table.export.path}")
    private String TIME_TABLE_FILE_PATH;

    private String ORSM_FILE_PATH = "ORSM 2025";

    private String ORSM_GUIDELINES_FILE_PATH = "ORSM 2025/Guidelines";

    private final SurgeryRepository surgeryRepository;

    public AlgorithmService(SurgeryRepository surgeryRepository) {
        this.surgeryRepository = surgeryRepository;
    }

    public void runBatchFile() {
        System.out.println("路徑為：" + TIME_TABLE_FILE_PATH);
        exportSurgeriesToCsv();
        // exportArgumentsToCsv(startTime, normalTime, maxTime, bridgeTime);

        try {
            ProcessBuilder processBuilder = new ProcessBuilder("cmd.exe", "/c", BATCH_FILE_PATH);
            processBuilder.directory(new File(System.getProperty("user.dir"))); // 設定工作目錄為 server 目錄
            processBuilder.inheritIO(); // 讓 Java 直接顯示執行結果到主控台
            Process process = processBuilder.start();
            process.waitFor(); // 等待執行完成
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }

        try {
            copyGuidelines();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void exportSurgeriesToCsv() {
        List<Surgery> surgeries = surgeryRepository.findAll();
        String filePath = TIME_TABLE_FILE_PATH + "/TimeTable.csv";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String tomorrowDate = LocalDate.now().plusDays(1).format(formatter);

        Map<String, Boolean> firstSurgeryMap = new HashMap<>(); // 記錄手術房是否已有第一筆手術

        try (OutputStreamWriter osw = new OutputStreamWriter(new FileOutputStream(filePath), StandardCharsets.UTF_8);
                BufferedWriter writer = new BufferedWriter(osw);
                CSVWriter csvWriter = new CSVWriter(writer,
                        CSVWriter.DEFAULT_SEPARATOR, // 分隔符號
                        CSVWriter.NO_QUOTE_CHARACTER, // 不使用雙引號
                        CSVWriter.DEFAULT_ESCAPE_CHARACTER,
                        CSVWriter.DEFAULT_LINE_END)) {

            // 寫入 UTF-8 BOM
            osw.write("\uFEFF");

            for (Surgery surgery : surgeries) {
                String EST = surgery.getEstimatedSurgeryTime().toString();
                String departmentName = surgery.getOperatingRoom().getDepartment().getName().replace("\n", " ");
                String chiefSurgeonName = surgery.getChiefSurgeon().getName().replace("\n", " ");
                String operatingRoomName = surgery.getOperatingRoom().getName();

                // 檢查是否為該手術房的第一筆手術
                String dateSuffix = firstSurgeryMap.getOrDefault(operatingRoomName, false) ? "TF" : "0830";
                firstSurgeryMap.put(operatingRoomName, true);

                String[] data = {
                        tomorrowDate + " " + dateSuffix,
                        surgery.getApplicationId(),
                        surgery.getMedicalRecordNumber(),
                        departmentName,
                        chiefSurgeonName,
                        operatingRoomName,
                        surgery.getAnesthesiaMethod(),
                        EST,
                        (surgery.getSpecialOrRequirements().isEmpty() ? "N" : "Y"),
                        "99999"
                };
                csvWriter.writeNext(data);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void copyGuidelines() throws IOException {
        // 取得時間戳，例如：20250401_153045
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));

        // 取得來源 CSV 檔案路徑
        Path inputPath = Paths.get(ORSM_GUIDELINES_FILE_PATH, "Guidelines.csv");

        // 產生新的檔名，例如：20250401_153045_Guidelines.csv
        String outputFileName = timestamp + "_" + inputPath.getFileName().toString();

        // 目標 CSV 檔案路徑（存放在相同資料夾內）
        Path outputPath = inputPath.getParent().resolve(outputFileName);
        

        // 使用 OpenCSV 來讀取與寫入 CSV
        try (
            Reader reader = Files.newBufferedReader(inputPath, Charset.forName("Big5"));
                CSVReader csvReader = new CSVReader(reader);

                Writer writer = Files.newBufferedWriter(outputPath, Charset.forName("Big5"));
                CSVWriter csvWriter = new CSVWriter(writer)) {
            String[] nextLine;
            while (true) {
                try {
                    if ((nextLine = csvReader.readNext()) == null)
                        break;
                    csvWriter.writeNext(nextLine);
                } catch (CsvValidationException e) {
                    System.err.println("CSV 讀取錯誤: " + e.getMessage());
                }
            }
        }

        System.out.println("Guidelines.csv 已成功複製為：" + outputPath);
    }

    public void exportArgumentsToCsv(
            String startTime,
            String normalTime,
            String maxTime,
            String bridgeTime) {
        String filePath = ORSM_FILE_PATH + "/Arguments4Exec.csv";

        try (OutputStreamWriter osw = new OutputStreamWriter(new FileOutputStream(filePath), StandardCharsets.UTF_8);
                BufferedWriter writer = new BufferedWriter(osw);
                CSVWriter csvWriter = new CSVWriter(writer,
                        CSVWriter.DEFAULT_SEPARATOR, // 分隔符號
                        CSVWriter.NO_QUOTE_CHARACTER, // 不使用雙引號
                        CSVWriter.DEFAULT_ESCAPE_CHARACTER,
                        "\n")) {

            String[] data = {
                    "#每日開始排程時間 (分)。例如：510 表示 08:30、540 表示 09:00",
                    (startTime.isEmpty() ? "510" : startTime),
                    "#每日允許可用的最大常規期間 (分)。預設：540",
                    (normalTime.isEmpty() ? "540" : normalTime),
                    "#每日允許可用的最大超時期間 (分)。預設：120",
                    (maxTime.isEmpty() ? "120" : maxTime),
                    "#兩檯手術之間的銜接期間 (分)。預設：60",
                    (bridgeTime.isEmpty() ? "60" : bridgeTime)
            };
            for (String line : data) {
                csvWriter.writeNext(new String[] { line }); // 每次寫入一個值，換行處理
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}