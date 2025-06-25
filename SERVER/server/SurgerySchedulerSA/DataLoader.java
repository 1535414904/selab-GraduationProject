
// file: DataLoader.java
// 使用 BufferedReader 讀取時間參數、手術室和手術資料，並進行初始排程
import java.io.*;
import java.util.*;

public class DataLoader {

    public static int loadTime(String path, int index) {
        List<Integer> values = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new FileReader(path))) {
            String line;
            while ((line = br.readLine()) != null) {
                if (line.startsWith("#") || line.trim().isEmpty())
                    continue;
                values.add(Integer.parseInt(line.trim()));
            }
        } catch (IOException | NumberFormatException e) {
            e.printStackTrace();
        }

        if (index >= 0 && index < values.size()) {
            return values.get(index);
        } else {
            throw new IllegalArgumentException("索引超出範圍或 Arguments4Exec.csv 格式錯誤");
        }
    }

    public static List<OperatingRoom> loadRooms(String path, int regularTime, int overtimeLimit, int transitionTime) {
        List<OperatingRoom> rooms = new ArrayList<>();
        Set<String> specialRoomSet = new HashSet<>(); // 用來標記特殊房名稱

        try (BufferedReader br = new BufferedReader(new FileReader(path))) {
            String line;
            int validLineCount = 0;

            while ((line = br.readLine()) != null) {
                line = line.trim();
                if (line.startsWith("#") || line.isEmpty())
                    continue;

                line = line.replace("\"", "");
                String[] ids = line.split(",");

                if (validLineCount == 0) {
                    // roomNamesOfAll
                    for (String id : ids) {
                        id = id.trim();
                        if (!id.isEmpty()) {
                            rooms.add(new OperatingRoom(id, regularTime, overtimeLimit, transitionTime));
                        }
                    }
                } else if (validLineCount == 1) {
                    // roomNames4Orth
                    for (String id : ids) {
                        id = id.trim();
                        if (!id.isEmpty()) {
                            specialRoomSet.add(id);
                        }
                    }
                }

                validLineCount++;
            }

            // 標記哪些房是特殊房
            for (OperatingRoom room : rooms) {
                if (specialRoomSet.contains(room.roomId)) {
                    room.isOrthRoom = true;
                }
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

        return rooms;
    }

    public static List<Surgery> loadSurgeries(String path) {
        List<Surgery> surgeries = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new FileReader(path))) {
            String line;
            while ((line = br.readLine()) != null) {
                if (line.startsWith("#") || line.trim().isEmpty())
                    continue;
                String[] tokens = line.split(",");
                if (tokens.length < 10)
                    continue;
                String surgeryDateTime = tokens[0].trim();
                String surgeryId = tokens[1].trim();
                String patientId = tokens[2].trim();
                String specialty = tokens[3].trim();
                String surgeon = tokens[4].trim();
                String roomId = tokens[5].trim();
                String anesthesia = tokens[6].trim();
                int duration = Integer.parseInt(tokens[7].trim());
                String req = tokens[8].trim();
                int order = Integer.parseInt(tokens[9].trim());

                surgeries.add(new Surgery(surgeryDateTime, surgeryId, patientId, specialty,
                        surgeon, roomId, anesthesia, duration, req, order));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return surgeries;
    }

    public static void assignInitialSchedule(List<OperatingRoom> rooms, List<Surgery> surgeries, String rule) {
        Comparator<Surgery> comparator = switch (rule) {
            case "SPT" -> Comparator.comparingInt(s -> s.duration);
            case "LPT" -> Comparator.comparingInt(s -> -s.duration);
            case "FCFS" -> Comparator.comparing(s -> s.surgeryId);
            default -> null;
        };

        if (comparator != null)
            surgeries.sort(comparator);

        List<OperatingRoom> orthoRooms = new ArrayList<>();
        List<OperatingRoom> generalRooms = new ArrayList<>();

        for (OperatingRoom room : rooms) {
            if (room.isOrthRoom) {
                orthoRooms.add(room);
            } else {
                generalRooms.add(room);
            }
        }

        int orthoIndex = 0;
        int generalIndex = 0;

        for (Surgery s : surgeries) {
            if ("Y".equalsIgnoreCase(s.req.trim())) {
                // 有特殊需求，只能排進 isOrthRoom
                if (orthoRooms.isEmpty()) {
                    throw new IllegalStateException("找不到任何骨科房可放入 req=Y 的手術: " + s.surgeryId);
                }
                OperatingRoom room = orthoRooms.get(orthoIndex % orthoRooms.size());
                room.surgeries.add(s);
                s.roomId = room.roomId;
                orthoIndex++;
            } else {
                // 無特殊需求，可以排進任何房
                List<OperatingRoom> candidates = rooms;
                OperatingRoom room = generalRooms.get(generalIndex % generalRooms.size());
                room.surgeries.add(s);
                s.roomId = room.roomId;
                generalIndex++;
            }
        }
    }

}
