package com.backend.project.Service;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Writer;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import com.backend.project.Dao.OperatingRoomRepository;
import com.backend.project.Dao.SurgeryRepository;
import com.backend.project.Dto.TimeSettingsDTO;
import com.backend.project.model.OperatingRoom;
import com.backend.project.model.Surgery;
import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.opencsv.exceptions.CsvException;
import com.opencsv.exceptions.CsvValidationException;

@Service
public class AlgorithmService {

    private static final String BATCH_FILE_PATH = "ORSM 2025/AllInOne.bat"; // 根據實際檔名修改

    @Value("${time-table.export.path}")
    private String TIME_TABLE_FILE_PATH;

    private String ORSM_FILE_PATH = "ORSM 2025";

    private String ORSM_GUIDELINES_FILE_PATH = "ORSM 2025/Guidelines";

    @Autowired
    private SurgeryRepository surgeryRepository;

    @Autowired
    private OperatingRoomRepository operatingRoomRepository;

    @Autowired
    @Lazy
    private SurgeryService surgeryService;

    private final Map<String, Boolean> pinnedRooms = new ConcurrentHashMap<>(); // 儲存釘選的手術房

    public void runBatchFile(List<String> closedRoomIds) throws Exception {
        System.out.println("路徑為：" + TIME_TABLE_FILE_PATH);
        exportSurgeriesToCsv(closedRoomIds);
        exportOperatingRoomToCsv(closedRoomIds);
        // exportArgumentsToCsv(startTime, normalTime, maxTime, bridgeTime);

        try {
            File batchFile = new File(BATCH_FILE_PATH);
            System.out.println("批處理文件絕對路徑: " + batchFile.getAbsolutePath());
            System.out.println("批處理文件是否存在: " + batchFile.exists());
            System.out.println("工作目錄: " + System.getProperty("user.dir"));

            // 使用完整路徑執行批處理文件
            File fullPathBatch = new File(System.getProperty("user.dir"),
                    BATCH_FILE_PATH).getAbsoluteFile();
            System.out.println("使用完整路徑: " + fullPathBatch.getAbsolutePath());

            ProcessBuilder processBuilder = new ProcessBuilder("cmd.exe", "/c",
                    fullPathBatch.getAbsolutePath());

            // 設定工作目錄為批處理文件所在目錄
            processBuilder.directory(fullPathBatch.getParentFile());
            processBuilder.inheritIO(); // 讓 Java 直接顯示執行結果到主控台

            System.out.println("啟動批處理...");
            Process process = processBuilder.start();
            System.out.println("等待批處理完成...");
            int exitCode = process.waitFor(); // 等待執行完成
            System.out.println("批處理執行完成，退出代碼: " + exitCode);

            if (exitCode != 0) {
                throw new Exception("批處理執行失敗，錯誤代碼: " + exitCode);
            }
        } catch (IOException | InterruptedException e) {
            System.err.println("執行批處理文件時出錯: " + e.getMessage());
            e.printStackTrace();
            throw new Exception("演算法執行失敗: " + e.getMessage(), e);
        }

        try {
            cleanEmptySurgeonsAndShiftForward("ORSM 2025/Guidelines/Guidelines.csv");
            addPinnedOperatingRoomToCsv();
            // processGuidelinesCsv("ORSM 2025/Guidelines/Guidelines.csv");
            parseCsvAndUpdateOrder("ORSM 2025/Guidelines/Guidelines.csv");
            copyGuidelines();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void exportSurgeriesToCsv(List<String> closedRoomIds) {
        List<Surgery> surgeries = surgeryRepository.findAll();
        List<OperatingRoom> operatingRooms = operatingRoomRepository.findAllWithoutSurgeries();
        String filePath = TIME_TABLE_FILE_PATH + "/TimeTable.csv";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String tomorrowDate = LocalDate.now().plusDays(1).format(formatter);

        Map<String, Boolean> firstSurgeryMap = new HashMap<>();
        Set<String> processedGroupIds = new HashSet<>(); // 已處理過的群組 id

        try (OutputStreamWriter osw = new OutputStreamWriter(new FileOutputStream(filePath), Charset.forName("Big5"));
                BufferedWriter writer = new BufferedWriter(osw);
                CSVWriter csvWriter = new CSVWriter(writer,
                        CSVWriter.DEFAULT_SEPARATOR,
                        CSVWriter.NO_QUOTE_CHARACTER,
                        CSVWriter.DEFAULT_ESCAPE_CHARACTER,
                        CSVWriter.DEFAULT_LINE_END)) {

            osw.write("\uFEFF");

            for (Surgery surgery : surgeries) {
                List<String> groupIds = surgery.getGroupApplicationIds();
                String applicationId = surgery.getApplicationId();

                // 如果是群組手術
                if (groupIds != null && !groupIds.isEmpty()) {
                    String groupKey = String.join(",", groupIds); // 用來識別群組，可改為更穩定邏輯
                    if (processedGroupIds.contains(groupKey)) {
                        continue; // 已寫入群組第一筆手術，跳過
                    }
                    processedGroupIds.add(groupKey);
                }

                String operatingRoomId = surgery.getOperatingRoom().getId();
                if (Boolean.TRUE.equals(pinnedRooms.get(operatingRoomId))) {
                    continue;
                }

                String EST = surgery.getEstimatedSurgeryTime().toString();
                String departmentName = surgery.getOperatingRoom().getDepartment().getName().replace("\n", " ");
                String chiefSurgeonName = surgery.getChiefSurgeon().getName().replace("\n", " ");
                String operatingRoomName = surgery.getOperatingRoom().getOperatingRoomName();
                String dateSuffix = firstSurgeryMap.getOrDefault(operatingRoomName, false) ? "TF" : "0830";
                firstSurgeryMap.put(operatingRoomName, true);

                String[] data = {
                        tomorrowDate + " " + dateSuffix,
                        applicationId,
                        surgery.getMedicalRecordNumber(),
                        departmentName,
                        chiefSurgeonName,
                        operatingRoomName,
                        surgery.getAnesthesiaMethod(),
                        EST,
                        (surgery.getSpecialOrRequirements() == "N"
                                ? "Y"
                                : "N"),
                        String.valueOf(surgery.getPrioritySequence())
                };
                csvWriter.writeNext(data);
            }

            if (operatingRooms != null && !operatingRooms.isEmpty()) {
                for (OperatingRoom room : operatingRooms) {
                    if (room.getStatus() == 1) {
                        String[] data = {
                                tomorrowDate + " 0830",
                                "000000",
                                "000000",
                                room.getDepartment().getName(),
                                "空醫師",
                                room.getOperatingRoomName(),
                                "GA",
                                "0",
                                "N",
                                "99999", };
                        csvWriter.writeNext(data);
                    }
                }
            }

            if(closedRoomIds != null && !closedRoomIds.isEmpty()) {
                for (String roomId : closedRoomIds) {
                    OperatingRoom room = operatingRoomRepository.findById(roomId).orElseThrow();
                    String[] data = {
                            tomorrowDate + " 0830",
                            "000000",
                            "000000",
                            room.getDepartment().getName(),
                            "空醫師",
                            room.getOperatingRoomName(),
                            "GA",
                            "0",
                            "N",
                            "99999", };
                    csvWriter.writeNext(data);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void exportOperatingRoomToCsv(List<String> closedRoomIds) {
        List<OperatingRoom> operatingRooms = operatingRoomRepository.findAll();
        String filePath = ORSM_FILE_PATH + "/room.csv";
    
        List<String> roomNamesOfAll = new ArrayList<>();
        List<String> roomNames4Orth = new ArrayList<>();
    
        System.out.println("=== 加入手術房列表 ===");
    
        for (OperatingRoom room : operatingRooms) {
            if (room.getStatus() == 0 || Boolean.TRUE.equals(pinnedRooms.get(room.getId()))) {
                continue; // 跳過狀態為 0 的手術房
            }
    
            String name = room.getOperatingRoomName();
    
            if (!roomNamesOfAll.contains(name)) {
                roomNamesOfAll.add(name);
            }
            System.out.println("房號: " + room.getOperatingRoomName() + " 類型: [" + room.getRoomType() + "]");
    
            if ("鉛牆房".equals(room.getRoomType()) && !roomNames4Orth.contains(name)) {
                roomNames4Orth.add(name);
            }
        }

        for (String roomId : closedRoomIds) {
            OperatingRoom room = operatingRoomRepository.findById(roomId).orElseThrow();
            String name = room.getOperatingRoomName();
            if (!roomNamesOfAll.contains(name)) {
                roomNamesOfAll.add(name);
            }
            System.out.println("房號: " + room.getOperatingRoomName() + " 類型: [" + room.getRoomType() + "]");

            if ("鉛牆房".equals(room.getRoomType()) && !roomNames4Orth.contains(name)) {
                roomNames4Orth.add(name);
            }
        }
    
        System.out.println("roomNamesOfAll: " + roomNamesOfAll);
        System.out.println("roomNames4Orth: " + roomNames4Orth);
    
        System.out.println("=== 開始匯出 CSV 檔案 ===");
    
        try (OutputStreamWriter osw = new OutputStreamWriter(new FileOutputStream(filePath), Charset.forName("UTF-8"));
             BufferedWriter writer = new BufferedWriter(osw);
             CSVWriter csvWriter = new CSVWriter(writer,
                     CSVWriter.DEFAULT_SEPARATOR,
                     CSVWriter.DEFAULT_QUOTE_CHARACTER,
                     CSVWriter.DEFAULT_ESCAPE_CHARACTER,
                     CSVWriter.DEFAULT_LINE_END)) {
    
            // 註解行手動寫
            writer.write("# roomNamesOfAll");
            writer.newLine();
            csvWriter.writeNext(new String[]{String.join(",", roomNamesOfAll)});
    
            writer.write("# roomNames4Orth");
            writer.newLine();
            csvWriter.writeNext(new String[]{String.join(",", roomNames4Orth)});
    
            System.out.println("room.csv 已成功匯出至: " + filePath);
        } catch (IOException e) {
            System.err.println("匯出 room.csv 時發生錯誤: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public void addPinnedOperatingRoomToCsv() {
        String filePath = ORSM_GUIDELINES_FILE_PATH + "/Guidelines.csv";
        String argumentsFilePath = ORSM_FILE_PATH + "/Arguments4Exec.csv";

        // 读取Arguments4Exec.csv文件内容
        int startSchedulingTime = 0;
        int connectionTime = 0;

        try {
            List<String> lines = Files.readAllLines(Paths.get(argumentsFilePath), Charset.forName("Big5"));

            // 用來追蹤行號
            int lineNumber = 0;

            for (String line : lines) {
                lineNumber++;

                if (line.startsWith("#")) {
                    continue; // 跳過註解行
                }

                // 移除空白字符並解析數值
                line = line.trim();
                if (line.isEmpty()) {
                    continue; // 跳過空行
                }

                // 讀取第二行和第八行的值
                if (lineNumber == 2) {
                    startSchedulingTime = Integer.parseInt(line);
                } else if (lineNumber == 8) {
                    connectionTime = Integer.parseInt(line);
                }
            }

            System.out.println("每日開始排程時間: " + startSchedulingTime);
            System.out.println("兩檯手術之間的銜接期間: " + connectionTime);
        } catch (IOException e) {
            e.printStackTrace();
        }

        List<Surgery> surgeries = surgeryRepository.findAll();

        // 使用OutputStreamWriter寫入CSV（指定Big5編碼並設為追加模式）
        try (OutputStreamWriter osw = new OutputStreamWriter(new FileOutputStream(filePath, true), "Big5");
                BufferedWriter writer = new BufferedWriter(osw);
                CSVWriter csvWriter = new CSVWriter(writer,
                        CSVWriter.DEFAULT_SEPARATOR,
                        CSVWriter.NO_QUOTE_CHARACTER, // 不使用雙引號
                        CSVWriter.DEFAULT_ESCAPE_CHARACTER,
                        CSVWriter.DEFAULT_LINE_END)) {

            // 用來存儲已經處理過的手術房ID，避免重複寫入
            Set<String> processedRooms = new HashSet<>();

            // 使用DateTimeFormatter來格式化時間為HH:mm
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

            for (Surgery surgery : surgeries) {
                String operatingRoomId = surgery.getOperatingRoom().getId();

                // 如果該手術房是釘選的，且尚未處理過
                if (Boolean.TRUE.equals(pinnedRooms.get(operatingRoomId))
                        && !processedRooms.contains(operatingRoomId)) {
                    System.out.println("寫入手術房 " + operatingRoomId + " 的資料...");

                    // 寫入手術房名稱
                    String operatingRoomName = surgery.getOperatingRoom().getOperatingRoomName();
                    csvWriter.writeNext(new String[] { operatingRoomName });
                    System.out.println("寫入手術房名稱: " + operatingRoomName);

                    // 标记该手术房已经处理
                    processedRooms.add(operatingRoomId);

                    // 每个手术房处理的手术数据
                    List<Surgery> roomSurgeries = surgeries.stream()
                            .filter(s -> s.getOperatingRoom().getId().equals(operatingRoomId))
                            .collect(Collectors.toList());

                    // 記錄上一台手術的結束時間
                    int previousEndTime = startSchedulingTime;

                    for (int i = 0; i < roomSurgeries.size(); i++) {
                        Surgery currentSurgery = roomSurgeries.get(i);
                        String EST = currentSurgery.getEstimatedSurgeryTime().toString();
                        String chiefSurgeonName = currentSurgery.getChiefSurgeon().getName().replace("\n", " ");
                        String operatingRoomNameFromSurgery = currentSurgery.getOperatingRoom().getOperatingRoomName();

                        // 計算手術的開始和結束時間
                        int surgeryStartTime = previousEndTime; // 當前手術的開始時間是前一台手術的結束時間
                        int surgeryEndTime = surgeryStartTime + Integer.parseInt(EST); // 計算結束時間

                        surgeryStartTime = surgeryStartTime % 1440; // 限制開始時間不超過1440分鐘（24小時）
                        surgeryEndTime = surgeryEndTime % 1440; // 限制結束時間不超過1440分鐘（24小時）

                        // 銜接的現在時間=前一台手術的結束時間，結束時間=現在時間+connectionTime
                        previousEndTime = surgeryEndTime + connectionTime;

                        // 將開始和結束時間轉換為HH:mm格式
                        String startTimeFormatted = LocalTime.ofSecondOfDay(surgeryStartTime * 60)
                                .format(timeFormatter);
                        String endTimeFormatted = LocalTime.ofSecondOfDay(surgeryEndTime * 60)
                                .format(timeFormatter);

                        // 手術數據
                        String[] surgeryData = {
                                "第1天", // 日期（此處可以根據需要動態修改）
                                chiefSurgeonName, // 醫師姓名
                                currentSurgery.getApplicationId() + "(" + EST + ")", // 手術名稱（加上時間）
                                startTimeFormatted, // 開始時間（HH:mm格式）
                                endTimeFormatted, // 結束時間（HH:mm格式）
                                "1" // 狀態
                        };

                        // 寫入手術數據
                        csvWriter.writeNext(surgeryData);
                        System.out.println("寫入手術資料: " + String.join(", ", surgeryData));

                        // 整理時間數據（假設整理時間是固定的）
                        String[] cleaningData = {
                                "第1天", // 日期（此處可以根據需要動態修改）
                                "null", // 醫師姓名（整理時間沒有醫師）
                                "整理時間", // 手術名稱
                                endTimeFormatted, // 預計手術時間（假設固定）
                                LocalTime.ofSecondOfDay((surgeryEndTime + 80) * 60).format(timeFormatter), // 整理時間結束
                                "4" // 狀態（假設整理時間的狀態為4）
                        };

                        // 寫入整理時間數據
                        csvWriter.writeNext(cleaningData);
                        System.out.println("寫入整理時間資料: " + String.join(", ", cleaningData));
                    }
                }
            }

            System.out.println("已將釘選的手術房資料寫入CSV: " + filePath);

        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("寫入CSV過程中發生錯誤");
        }
    }

    public void copyGuidelines() throws IOException {
        // 取得日期與毫秒級 timestamp
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String timestamp = String.valueOf(System.currentTimeMillis());

        // 產生新檔名
        String outputFileNameOfGuidelines = date + "_Guidelines" + timestamp + ".csv";
        String outputFileNameOfTimeTable = date + "_TimeTable" + timestamp + ".csv";

        // 設定來源與目標路徑
        Path inputPathOfGuidelines = Paths.get(ORSM_FILE_PATH, "Guidelines/Guidelines.csv");
        Path inputPathOfTimeTable = Paths.get(ORSM_FILE_PATH, "TimeTable/TimeTable.csv");
        Path outputDir = Paths.get(ORSM_FILE_PATH, "Backup4Guidelines");

        // 確保備份資料夾存在
        if (!Files.exists(outputDir)) {
            Files.createDirectories(outputDir);
        }

        // 建立完整目標檔案路徑
        Path outputPathOfGuidelines = outputDir.resolve(outputFileNameOfGuidelines);
        Path outputPathOfTimeTable = outputDir.resolve(outputFileNameOfTimeTable);

        // 使用 OpenCSV 來讀取與寫入 CSV
        try (
                Reader readerOfGuidelines = Files.newBufferedReader(inputPathOfGuidelines, Charset.forName("Big5"));
                CSVReader csvReaderOfGuidelines = new CSVReader(readerOfGuidelines);

                Reader readerOfTimeTable = Files.newBufferedReader(inputPathOfTimeTable, Charset.forName("Big5"));
                CSVReader csvReaderOfTimeTable = new CSVReader(readerOfTimeTable);

                Writer writerGuidelines = Files.newBufferedWriter(outputPathOfGuidelines, Charset.forName("Big5"));
                CSVWriter csvWriterGuidelines = new CSVWriter(writerGuidelines);

                Writer writerTimeTable = Files.newBufferedWriter(outputPathOfTimeTable, Charset.forName("Big5"));
                CSVWriter csvWriterTimeTable = new CSVWriter(writerTimeTable)) {

            String[] nextLine;

            // 複製 Guidelines.csv
            while ((nextLine = csvReaderOfGuidelines.readNext()) != null) {
                csvWriterGuidelines.writeNext(nextLine);
            }

            // 複製 TimeTable.csv
            while ((nextLine = csvReaderOfTimeTable.readNext()) != null) {
                csvWriterTimeTable.writeNext(nextLine);
            }
        } catch (CsvValidationException e) {
            System.err.println("CSV 讀取錯誤: " + e.getMessage());
        }

        System.out.println("Guidelines.csv 與 TimeTable.csv 已成功備份至：" + outputDir);
    }

    public void exportArgumentsToCsv(
            String startTime,
            String normalTime,
            String maxTime,
            String bridgeTime) {
        String filePath = ORSM_FILE_PATH + "/Arguments4Exec.csv";

        try (OutputStreamWriter osw = new OutputStreamWriter(new FileOutputStream(filePath), Charset.forName("Big5"));
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

    public TimeSettingsDTO getTimeSettingsFromCsv() {
        TimeSettingsDTO dto = new TimeSettingsDTO();

        try (CSVReader csvReader = new CSVReader(
                new FileReader(ORSM_FILE_PATH + "/Arguments4Exec.csv", Charset.forName("Big5")))) {
            String[] nextLine;
            int lineNumber = 0;

            // 讀取 CSV 檔案每一行
            while ((nextLine = csvReader.readNext()) != null) {
                // 跳過註解行（以 # 開頭的行）
                if (nextLine[0].startsWith("#")) {
                    continue;
                }

                // 根據行號設定 DTO 的欄位
                if (lineNumber == 0) {
                    dto.setSurgeryStartTime(Integer.parseInt(nextLine[0].trim()));
                } else if (lineNumber == 1) {
                    dto.setRegularEndTime(Integer.parseInt(nextLine[0].trim()));
                } else if (lineNumber == 2) {
                    dto.setOvertimeEndTime(Integer.parseInt(nextLine[0].trim()));
                } else if (lineNumber == 3) {
                    dto.setCleaningTime(Integer.parseInt(nextLine[0].trim()));
                }

                lineNumber++;
            }
        } catch (IOException | CsvValidationException e) {
            e.printStackTrace();
            return null; // 如果發生錯誤，返回 null
        }

        return dto;
    }

    public void setPinned(String roomId, boolean isPinned) {
        pinnedRooms.put(roomId, isPinned);
        System.out.println("目前釘選的手術房列表: " + pinnedRooms);
    }

    public void processGuidelinesCsv(String csvPath) throws Exception {
        Path path = Paths.get(csvPath);
        Charset big5 = Charset.forName("Big5");
        List<String[]> updatedRows = new ArrayList<>();

        TimeSettingsDTO settings = getTimeSettingsFromCsv();
        if (settings == null) {
            System.out.println("未取得 TimeSettings，跳過處理。");
            return;
        }
        int cleaningTime = settings.getCleaningTime();
        System.out.println("整理時間: " + cleaningTime);

        List<String[]> originalRows;
        try (CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(path.toFile()), big5))) {
            originalRows = reader.readAll();
        }

        for (int i = 0; i < originalRows.size(); i++) {
            String[] row = originalRows.get(i);
            updatedRows.add(row);

            if (i == 0)
                continue; // 跳過第一行
            if (row.length < 6)
                continue; // 跳過逗號數小於5的行
            if ("整理時間".equals(row[2]))
                continue; // 跳過整理時間行

            String rawSurgeryName = row[2];
            System.out.println("原手術名稱: " + rawSurgeryName);
            String applicationId = extractApplicationId(rawSurgeryName);
            System.out.println("擷取的申請序號: " + applicationId);
            if (applicationId == null) {
                System.out.println("無法從手術名稱擷取申請序號，跳過：" + rawSurgeryName);
                continue;
            }

            System.out.println("處理手術申請序號: " + applicationId);
            Surgery surgery = surgeryRepository.findById(applicationId).orElseThrow();
            if (surgery == null) {
                System.out.println("找不到對應的手術資料: " + applicationId);
                continue;
            }
            if (surgery.getGroupApplicationIds() == null) {
                System.out.println("手術 " + applicationId + " 無群組資料，跳過。");
                continue;
            }

            List<String> groupIds = surgery.getGroupApplicationIds();
            List<String> otherIds = groupIds.stream()
                    .filter(id -> !id.equals(applicationId))
                    .collect(Collectors.toList());
            if (otherIds.isEmpty()) {
                System.out.println("手術 " + applicationId + " 所在群組無其他手術，跳過。");
                continue;
            }

            System.out.println("將為手術 " + applicationId + " 插入同群組手術: " + otherIds);

            String day = row[0];
            String startTimeStr = row[3];

            LocalTime cursorTime = parseCustomTime(startTimeStr);
            List<String[]> insertedRows = new ArrayList<>();

            // 更新原手術結束時間
            int duration = surgery.getEstimatedSurgeryTime();
            LocalTime endTime = cursorTime.plusMinutes(duration);
            row[4] = formatCustomTime(endTime);
            System.out.println("更新結束時間為: " + row[4]);

            // 插入整理時間
            cursorTime = endTime;
            endTime = cursorTime.plusMinutes(cleaningTime);
            insertedRows.add(
                    new String[] { day, "null", "整理時間", formatCustomTime(cursorTime), formatCustomTime(endTime), "4" });
            cursorTime = endTime;

            // 插入其他手術與整理時間
            for (String otherId : otherIds) {
                Surgery other = surgeryRepository.findById(otherId).orElseThrow();
                if (other == null) {
                    System.out.println("找不到群組內手術: " + otherId);
                    continue;
                }
                int est = other.getEstimatedSurgeryTime();
                LocalTime otherEnd = cursorTime.plusMinutes(est);
                insertedRows.add(new String[] {
                        day,
                        other.getChiefSurgeon().getName(),
                        formatSurgeryName(otherId),
                        formatCustomTime(cursorTime),
                        formatCustomTime(otherEnd),
                        "1"
                });
                System.out.println("插入手術: " + otherId + " 時間: " + formatCustomTime(cursorTime) + " ~ "
                        + formatCustomTime(otherEnd));
                cursorTime = otherEnd;

                LocalTime cleanEnd = cursorTime.plusMinutes(cleaningTime);
                insertedRows.add(new String[] { day, "null", "整理時間", formatCustomTime(cursorTime),
                        formatCustomTime(cleanEnd), "4" });
                cursorTime = cleanEnd;
            }

            updatedRows.addAll(insertedRows);
        }

        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(new FileOutputStream(path.toFile()), big5))) {
            writer.writeAll(updatedRows);
            System.out.println("Guidelines.csv 寫入完成。");
        }
    }

    private String extractApplicationId(String surgeryName) {
        if (surgeryName == null)
            return null;
        int idx = surgeryName.indexOf("(");
        return idx > 0 ? surgeryName.substring(0, idx) : surgeryName;
    }

    private String formatSurgeryName(String id) {
        // 預設為 TF
        return id + "(TF)";
    }

    private LocalTime parseCustomTime(String timeStr) {
        String[] parts = timeStr.split(":");
        int hour = Integer.parseInt(parts[0]);
        int minute = Integer.parseInt(parts[1]);
        return LocalTime.of(hour, minute);
    }

    private String formatCustomTime(LocalTime time) {
        return String.format("%d:%02d", time.getHour(), time.getMinute());
    }

    public void parseCsvAndUpdateOrder(String csvPath) throws Exception {
        Path path = Paths.get(csvPath);
        Charset big5 = Charset.forName("Big5");

        List<String[]> rows;
            try (CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(path.toFile()), Charset.forName("Big5")))) {
            rows = reader.readAll();
        }

        OperatingRoom currentRoom = null;
        int orderInRoom = 1;

        System.out.println("開始解析 CSV，共有列數：" + rows.size());

        int rowIndex = 0;
        for (String[] row : rows) {
            rowIndex++;
            System.out.println("➡️ 處理第 " + rowIndex + " 列: " + Arrays.toString(row));

            if (row.length == 0 || row[0].trim().isEmpty()) {
                System.out.println("空列或空白第一欄，跳過");
                continue;
            }

            String firstCol = row[0].trim();

            // 優先判斷是否為手術房代號（即使只有一欄也要判斷）
            if (firstCol.matches("^[A-Z]\\d+$")) {

                if (currentRoom != null) {
                    surgeryService.updateSurgeryPrioritySequenceByRoom(currentRoom.getId());
                }

                System.out.println("🏥 偵測到手術房代號：" + firstCol);
                currentRoom = operatingRoomRepository.findByOperatingRoomName(firstCol)
                        .orElseThrow(() -> new RuntimeException("找不到手術房：" + firstCol));
                System.out.println("✅ 切換到手術房：" + currentRoom.getOperatingRoomName());
                orderInRoom = 1;
                continue;
            }

            // 沒有 enough 欄位，不能抓手術欄位
            if (row.length < 3) {
                System.out.println("⚠️ 欄位數不足（非手術房也不是手術），跳過");
                continue;
            }

            String surgeryName = row[2].trim(); // 格式如 11106(0830) 或 "整理時間"

            // 排除整理時間/無效手術
            if (surgeryName == null || surgeryName.contains("整理時間") || !surgeryName.matches("^\\d+\\(.*\\)$")) {
                System.out.println("非手術資料，跳過");
                continue;
            }

            // 解析手術 ID
            String applicationId = surgeryName.split("\\(")[0].trim();
            System.out.println("🔎 嘗試載入手術 ID: " + applicationId);
            
            // ➡️ 加這段：遇到 000000 就跳過
            if ("000000".equals(applicationId)) {
                System.out.println("⚠️ 偵測到空房手術 000000，直接跳過");
                continue;
            }
            Surgery surgery = surgeryRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("找不到手術：" + applicationId));

            // 若為群組手術，則同步更新群組內所有手術的 operatingRoom
            if (surgery.getGroupApplicationIds() != null && !surgery.getGroupApplicationIds().isEmpty()) {
                List<String> groupIds = surgery.getGroupApplicationIds();
                List<Surgery> groupSurgeries = surgeryRepository.findAllById(groupIds);

                for (Surgery groupSurgery : groupSurgeries) {
                    groupSurgery.setOperatingRoom(currentRoom);
                }

                surgeryRepository.saveAll(groupSurgeries);
                System.out.println(
                        "🔁 群組手術同步更新了 " + groupSurgeries.size() + " 台手術的手術房為：" + currentRoom.getOperatingRoomName());
            }

            if (currentRoom == null) {
                throw new RuntimeException("無對應手術房，手術 ID: " + applicationId);
            }

            surgery.setOperatingRoom(currentRoom);
            surgery.setOrderInRoom(orderInRoom);
            surgeryRepository.save(surgery);

            System.out.println("📦 已更新手術：" + applicationId + " -> 房間：" +
                    currentRoom.getOperatingRoomName() + "，順序：" + orderInRoom);

            orderInRoom++;
        }

        if (currentRoom != null) {
            surgeryService.updateSurgeryPrioritySequenceByRoom(currentRoom.getId());
        }

        System.out.println("✅ CSV 解析與更新完成");
    }

    public void cleanEmptySurgeonsAndShiftForward(String csvPath) throws IOException {
        Path path = Paths.get(csvPath);
        Charset big5 = Charset.forName("Big5");

        List<String[]> originalRows;
        try (CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(path.toFile()), big5))) {
            originalRows = reader.readAll();
        } catch (IOException | CsvException e) {
            e.printStackTrace();
            return;
        }

        TimeSettingsDTO settings = getTimeSettingsFromCsv();
        if (settings == null) {
            System.out.println("❌ 無法取得 cleaningTime 設定，終止處理");
            return;
        }
        int cleaningTime = settings.getCleaningTime();
        System.out.println("🧼 將使用 cleaningTime: " + cleaningTime + " 分鐘");

        List<String[]> filteredRows = new ArrayList<>();
        int i = 0;
        while (i < originalRows.size()) {
            String[] row = originalRows.get(i);

            if (row.length == 1 && !row[0].trim().isEmpty()) {
                filteredRows.add(row); // 房間代碼
                i++;
                continue;
            }

            if (row.length < 6) {
                filteredRows.add(row); // 無效或無格式行照樣保留
                i++;
                continue;
            }

            String surgeon = row[1].trim();
            String status = row[5].trim();

            if ((surgeon.equals("空醫師") || surgeon.equals("null")) && status.equals("1")) {
                System.out.println("⚠️ 移除空醫師手術於第 " + (i + 1) + " 行: " + Arrays.toString(row));
                i += 2; // 跳過手術與整理時間
                continue;
            }

            filteredRows.add(row);
            i++;
        }

        // 重新調整時間：後續所有手術統一前移 cleaningTime 分鐘
        List<String[]> adjustedRows = new ArrayList<>();
        for (String[] row : filteredRows) {
            if (row.length == 1) {
                adjustedRows.add(row); // 房間行不調整
                continue;
            }

            if (row.length < 6) {
                adjustedRows.add(row);
                continue;
            }

            try {
                LocalTime start = parseCustomTime(row[3]);
                LocalTime end = parseCustomTime(row[4]);

                start = start.minusMinutes(cleaningTime);
                end = end.minusMinutes(cleaningTime);

                row[3] = formatCustomTime(start);
                row[4] = formatCustomTime(end);
            } catch (Exception e) {
                System.err.println("時間格式錯誤於列：" + Arrays.toString(row));
            }

            adjustedRows.add(row);
        }

        // 寫回原檔案
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(new FileOutputStream(path.toFile()), big5))) {
            writer.writeAll(adjustedRows);
        }

        System.out.println("✅ 檔案處理完成並覆蓋寫回: " + csvPath);
    }

}