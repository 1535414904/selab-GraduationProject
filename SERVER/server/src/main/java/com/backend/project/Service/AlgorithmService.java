package com.backend.project.Service;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.backend.project.Dao.SurgeryRepository;
import com.backend.project.model.Surgery;
import com.opencsv.CSVWriter;

@Service
public class AlgorithmService {

    private static final String BATCH_FILE_PATH = "ORSM 2025/AllInOne.bat"; // 根據實際檔名修改

    @Value("${time-table.export.path}")
    private String TIME_TABLE_FILE_PATH;

    private final SurgeryRepository surgeryRepository;

    public AlgorithmService(SurgeryRepository surgeryRepository) {
        this.surgeryRepository = surgeryRepository;
    }

    public void runBatchFile() {
        System.out.println("路徑為：" + TIME_TABLE_FILE_PATH);
        exportSurgeriesToCsv();

        try {
            ProcessBuilder processBuilder = new ProcessBuilder("cmd.exe", "/c", BATCH_FILE_PATH);
            processBuilder.directory(new File(System.getProperty("user.dir"))); // 設定工作目錄為 server 目錄
            processBuilder.inheritIO(); // 讓 Java 直接顯示執行結果到主控台
            Process process = processBuilder.start();
            process.waitFor(); // 等待執行完成
        } catch (IOException | InterruptedException e) {
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
}