package com.backend.project.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.backend.project.Dao.ChiefSurgeonRepository;
import com.backend.project.Dao.OperatingRoomRepository;
import com.backend.project.Dao.SurgeryRepository;
import com.backend.project.Dao.UserRepository;
import com.backend.project.Dto.TimeSettingsDTO;
import com.backend.project.model.ChiefSurgeon;
import com.backend.project.model.OperatingRoom;
import com.backend.project.model.Surgery;
import com.backend.project.model.User;

@Service
public class SurgeryService {

    @Autowired
    private SurgeryRepository surgeryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OperatingRoomRepository operatingRoomRepository;

    @Autowired
    private ChiefSurgeonRepository chiefSurgeonRepository;

    @Autowired
    private AlgorithmService algorithmService;

    public List<Surgery> getAllSurgeries() {
        return surgeryRepository.findAll();
    }

    public Surgery getSurgeryById(String applicationId) {
        Optional<Surgery> surgery = surgeryRepository.findById(applicationId);
        return surgery.orElse(null);
    }

    public Surgery updateSurgeryForHome(Surgery surgery) {
        return surgeryRepository.save(surgery);
    }

    public Surgery updateSurgery(String id,
            Surgery updateSurgery) {
        OperatingRoom operatingRoom = operatingRoomRepository.findById(updateSurgery.getOperatingRoomId())
                .orElseThrow(() -> new RuntimeException("OperatingRoom not found"));
        ChiefSurgeon chiefSurgeon = chiefSurgeonRepository.findById(updateSurgery.getChiefSurgeonId())
                .orElseThrow(() -> new RuntimeException("chiefSurgeon not found"));

        return surgeryRepository.findById(id).map(surgery -> {
            surgery.setApplicationId(updateSurgery.getApplicationId());
            surgery.setDate(updateSurgery.getDate());
            surgery.setMedicalRecordNumber(updateSurgery.getMedicalRecordNumber());
            surgery.setPatientName(updateSurgery.getPatientName());
            surgery.setSurgeryName(updateSurgery.getSurgeryName());
            surgery.setAnesthesiaMethod(updateSurgery.getAnesthesiaMethod());
            surgery.setSurgeryReason(updateSurgery.getSurgeryReason());
            surgery.setSpecialOrRequirements(updateSurgery.getSpecialOrRequirements());
            surgery.setEstimatedSurgeryTime(updateSurgery.getEstimatedSurgeryTime());
            surgery.setChiefSurgeon(chiefSurgeon);
            surgery.setOperatingRoom(operatingRoom);
            return surgeryRepository.save(surgery);
        }).orElseThrow(() -> new RuntimeException("Surgery not found"));
    }

    public Surgery updateSurgery4OrderInRoom(String id, int orderInRoom) {
        return surgeryRepository.findById(id).map(surgery -> {
            surgery.setOrderInRoom(orderInRoom);
            return surgeryRepository.save(surgery);
        }).orElseThrow(() -> new RuntimeException("Surgery not found"));
    }

    public void updateSurgeryOrderAndRoom(String id, int orderInRoom, String operatingRoomId) {
        Surgery surgery = surgeryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Surgery not found with id " + id));

        surgery.setOrderInRoom(orderInRoom);

        if (operatingRoomId != null && !operatingRoomId.equals(surgery.getOperatingRoom().getId())) {
            OperatingRoom newRoom = operatingRoomRepository.findById(operatingRoomId)
                    .orElseThrow(() -> new RuntimeException("OperatingRoom not found with id " + operatingRoomId));
            surgery.setOperatingRoom(newRoom);
        }

        surgeryRepository.save(surgery);
    }

    public Surgery addSurgery(Surgery surgery) {
        // 若是以帳號為主關聯
        User user = userRepository.findByUsername(surgery.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        OperatingRoom operatingRoom = operatingRoomRepository.findById(surgery.getOperatingRoomId())
                .orElseThrow(() -> new RuntimeException("OperatingRoom not found"));

        ChiefSurgeon chiefSurgeon = chiefSurgeonRepository.findById(surgery.getChiefSurgeonId())
                .orElseThrow(() -> new RuntimeException("ChiefSurgeon not found"));

        surgery.setUser(user);
        surgery.setOperatingRoom(operatingRoom);
        surgery.setChiefSurgeon(chiefSurgeon);
        surgery.setOrderInRoom(operatingRoom.getSurgeries().size() + 1); // 設定手術在手術房中的順序

        return surgeryRepository.save(surgery);
    }

    public void deleteSurgery(String id) {
        surgeryRepository.deleteById(id);
    }

    // 更新每個手術的 groupApplicationIds
    public void updateSurgeryGroups(List<String> applicationIds) {
        if (applicationIds == null || applicationIds.isEmpty()) {
            throw new IllegalArgumentException("applicationIds 不可為空");
        }

        // 找第一台手術，推得 OperatingRoom
        Surgery firstSurgery = surgeryRepository.findById(applicationIds.get(0))
                .orElseThrow(() -> new RuntimeException("找不到手術 ID: " + applicationIds.get(0)));
        OperatingRoom room = firstSurgery.getOperatingRoom();

        // 找出該手術房的所有手術（用你提供的方法），並根據 orderInRoom 排序
        List<Surgery> allSurgeriesInRoom = surgeryRepository.findByOperatingRoom(room).stream()
                .sorted(Comparator.comparing(Surgery::getOrderInRoom, Comparator.nullsLast(Integer::compareTo)))
                .collect(Collectors.toList());

        // 標記群組 ID
        Set<String> groupSet = new HashSet<>(applicationIds);

        List<String> sortedGroupIds = allSurgeriesInRoom.stream()
                .filter(s -> groupSet.contains(s.getApplicationId()))
                .map(Surgery::getApplicationId)
                .collect(Collectors.toList());

        for (Surgery surgery : allSurgeriesInRoom) {
            if (groupSet.contains(surgery.getApplicationId())) {
                surgery.setGroupApplicationIds(sortedGroupIds);
            } else {
                surgery.setGroupApplicationIds(null);
            }
        }

        // 設定新的 orderInRoom：群組只佔一個位置，其餘依序編號
        int currentOrder = 1;
        Set<String> alreadyGrouped = new HashSet<>();

        for (Surgery surgery : allSurgeriesInRoom) {
            if (groupSet.contains(surgery.getApplicationId())) {
                if (alreadyGrouped.isEmpty()) {
                    surgery.setOrderInRoom(currentOrder++);
                } else {
                    surgery.setOrderInRoom(null); // 群組中後續項設為 null
                }
                alreadyGrouped.add(surgery.getApplicationId());
            } else {
                surgery.setOrderInRoom(currentOrder++);
            }

            // 儲存更新
            surgeryRepository.save(surgery);
        }
    }

    // 清空手術的 groupApplicationIds
    public void clearSurgeryGroups(String id) {
        System.out.println("收到的手術 ID: " + id);
        Surgery initSurgery = surgeryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Surgery not found with id " + id));

        List<String> applicationIds = initSurgery.getGroupApplicationIds();
        if (applicationIds == null || applicationIds.isEmpty()) {
            System.out.println("此手術不屬於任何群組");
            return;
        }

        // 取得 OperatingRoom
        OperatingRoom room = initSurgery.getOperatingRoom();

        // 房內手術依照順序排列
        List<Surgery> surgeriesInRoom = surgeryRepository.findByOperatingRoom(room).stream()
                .sorted(Comparator.comparing(Surgery::getOrderInRoom, Comparator.nullsLast(Integer::compareTo)))
                .collect(Collectors.toList());

        // 找到 main 手術在房間中的位置
        int mainIndex = -1;
        for (int i = 0; i < surgeriesInRoom.size(); i++) {
            if (surgeriesInRoom.get(i).getApplicationId().equals(id)) {
                mainIndex = i;
                break;
            }
        }

        if (mainIndex == -1) {
            throw new RuntimeException("主手術未在該房間內");
        }

        // 取得群組所有手術（依 groupIds 順序）
        List<Surgery> groupSurgeries = surgeryRepository.findAllById(applicationIds).stream()
                .sorted(Comparator.comparingInt(s -> applicationIds.indexOf(s.getApplicationId())))
                .collect(Collectors.toList());

        // 清除每一筆群組成員的 groupApplicationIds
        groupSurgeries.forEach(s -> s.setGroupApplicationIds(null));

        // 移除所有群組手術（主+副）出手術房中現有清單
        Set<String> groupIdSet = new HashSet<>(applicationIds);
        surgeriesInRoom.removeIf(s -> groupIdSet.contains(s.getApplicationId()));

        // 插回主手術位置（保留順序）
        surgeriesInRoom.addAll(mainIndex, groupSurgeries);

        // 重新編號 orderInRoom
        for (int i = 0; i < surgeriesInRoom.size(); i++) {
            surgeriesInRoom.get(i).setOrderInRoom(i + 1);
        }

        // 儲存所有手術更新
        surgeryRepository.saveAll(surgeriesInRoom);
        System.out.println("✅ 已解除群組並依據主手術位置展開成員");
    }

    // 根據 groupApplicationIds 更新手術群組的 estimatedSurgeryTime
    public void updateSurgeryGroupEstimatedTime(List<String> groupApplicationIds) {
        if (groupApplicationIds == null || groupApplicationIds.isEmpty()) {
            return;
        }

        // 查詢群組中所有手術
        List<Surgery> surgeries = surgeryRepository.findAllById(groupApplicationIds);
        if (surgeries.isEmpty()) {
            return;
        }

        // 取得 cleaningTime
        TimeSettingsDTO timeSettings = algorithmService.getTimeSettingsFromCsv();
        if (timeSettings == null) {
            return; // 若取得 cleaningTime 失敗，則退出
        }

        int cleaningTime = timeSettings.getCleaningTime();

        // 計算所有手術的 estimatedSurgeryTime 總和
        int totalEstimatedTime = surgeries.stream()
                .mapToInt(surgery -> surgery.getEstimatedSurgeryTime() != null ? surgery.getEstimatedSurgeryTime() : 0)
                .sum();

        // 加上 (n - 1) * cleaningTime
        int totalCleaningTime = (surgeries.size() - 1) * cleaningTime;
        totalEstimatedTime += totalCleaningTime;

        // 明確找出第一個指定的 ID
        String firstId = groupApplicationIds.get(0);
        Optional<Surgery> optionalFirstSurgery = surgeries.stream()
                .filter(s -> s.getApplicationId().equals(firstId))
                .findFirst();

        // 保存更新後的手術資料
        if (optionalFirstSurgery.isPresent()) {
            Surgery firstSurgery = optionalFirstSurgery.get();
            firstSurgery.setEstimatedSurgeryTime(totalEstimatedTime);
            surgeryRepository.save(firstSurgery);
        }
    }

    // 根據群組的 applicationIds 還原手術的 estimatedSurgeryTime
    public void restoreSurgeryGroupEstimatedTime(String id) {
        Surgery initSurgery = surgeryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Surgery not found with id " + id));

        List<String> groupIds = initSurgery.getGroupApplicationIds();
        List<Surgery> surgeries = surgeryRepository.findAllById(groupIds);

        if (surgeries.isEmpty()) {
            return;
        }

        TimeSettingsDTO timeSettings = algorithmService.getTimeSettingsFromCsv();
        if (timeSettings == null) {
            return;
        }

        int cleaningTime = timeSettings.getCleaningTime();

        // 明確取得第一台手術（根據群組傳入順序）
        String firstId = groupIds.get(0);
        Optional<Surgery> optionalFirstSurgery = surgeries.stream()
                .filter(s -> s.getApplicationId().equals(firstId))
                .findFirst();

        if (!optionalFirstSurgery.isPresent()) {
            return;
        }

        Surgery firstSurgery = optionalFirstSurgery.get();

        // 計算其他手術的總 estimatedSurgeryTime
        int totalEstimatedTime = surgeries.stream()
                .filter(s -> !s.getApplicationId().equals(firstId))
                .mapToInt(s -> s.getEstimatedSurgeryTime() != null ? s.getEstimatedSurgeryTime() : 0)
                .sum();

        totalEstimatedTime += (surgeries.size() - 1) * cleaningTime;

        // 還原第一台手術的 estimatedTime
        Integer currentGroupEstimated = firstSurgery.getEstimatedSurgeryTime();
        if (currentGroupEstimated != null && currentGroupEstimated > totalEstimatedTime) {
            int originalEstimatedTime = currentGroupEstimated - totalEstimatedTime;
            firstSurgery.setEstimatedSurgeryTime(originalEstimatedTime);
            surgeryRepository.save(firstSurgery);
        }
    }

    public void updateSurgery4DrogEnd(String id, String operatingRoomId) {
        Surgery surgery = surgeryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Surgery not found with id " + id));
        OperatingRoom operatingRoom = operatingRoomRepository.findById(operatingRoomId)
                .orElseThrow(() -> new RuntimeException("OperatingRoom not found with id " + operatingRoomId));

        // 更新手術的 operatingRoom
        surgery.setOperatingRoom(operatingRoom);
        surgery.setOrderInRoom(operatingRoom.getSurgeries().size() + 1); // 設定手術在手術房中的順序

        // 保存更新後的手術資料
        surgeryRepository.save(surgery);
    }

    public void updateSurgeryPrioritySequenceByRoom(String roomId) {
        System.out.println("開始以『estimatedSurgeryTime』來全院排序 prioritySequence（房間ID: " + roomId + "）");

        // 撈出整院所有手術
        List<Surgery> allSurgeries = surgeryRepository.findAll();
        if (allSurgeries == null || allSurgeries.isEmpty()) {
            System.out.println("❌ 全院沒有任何手術資料，結束");
            return;
        }

        System.out.println("共撈出 " + allSurgeries.size() + " 台手術，開始依 estimatedSurgeryTime 排序...");

        // 按 estimatedSurgeryTime 排序（大的排前面）
        allSurgeries.sort((s1, s2) -> {
            int est1 = s1.getEstimatedSurgeryTime() != null ? s1.getEstimatedSurgeryTime() : 0;
            int est2 = s2.getEstimatedSurgeryTime() != null ? s2.getEstimatedSurgeryTime() : 0;
            return Integer.compare(est2, est1); // 大到小
        });

        System.out.println("✅ 排序完成");

        // 從 1 開始重新設定 prioritySequence
        int sequence = 1;
        for (Surgery surgery : allSurgeries) {
            surgery.setPrioritySequence(sequence++);
            System.out.println(
                    "手術 " + surgery.getApplicationId() + " 設定 prioritySequence = " + surgery.getPrioritySequence());
        }

        // 一次存回
        surgeryRepository.saveAll(allSurgeries);

        System.out.println("✅ 已全部更新 prioritySequence 完成");
    }

    public List<String> uploadTimeTable(MultipartFile file, String username) {
        List<String> failedApplications = new ArrayList<>();
        List<Surgery> surgeriesToSave = new ArrayList<>(); // 批次存比較快
        Map<String, Integer> roomIdToNextOrderMap = new HashMap<>(); // 手動記錄每間房的 orderInRoom

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), Charset.forName("Big5")))) {
            String line;
            int lineNumber = 0;

            while ((line = reader.readLine()) != null) {
                lineNumber++;

                String[] columns = line.split(",", -1);
                if (columns.length < 10) {
                    failedApplications.add("第 " + lineNumber + " 行欄位數不足");
                    continue;
                }

                String applicationId = columns[1].trim();
                String medicalRecordNumber = columns[2].trim();
                String departmentName = columns[3].trim();
                String chiefSurgeonName = columns[4].trim();
                String operatingRoomName = columns[5].trim();
                String anesthesiaMethod = columns[6].trim();
                String estimatedTimeStr = columns[7].trim();
                String specialRequirements = columns[8].trim();

                // 檢查申請編號是否已存在
                if (surgeryRepository.existsById(applicationId)) {
                    failedApplications.add(applicationId + " 已存在，無法新增");
                    continue;
                }

                // 查找手術房
                Optional<OperatingRoom> optionalRoom = operatingRoomRepository
                        .findByOperatingRoomName(operatingRoomName);
                if (optionalRoom.isEmpty()) {
                    failedApplications.add(applicationId + " 找不到手術房：" + operatingRoomName);
                    continue;
                }
                OperatingRoom room = optionalRoom.get();

                System.out.println("CSV 科別：" + departmentName + "；房間科別：" +
                        (room.getDepartment() != null ? room.getDepartment().getName() : "null"));

                // 驗證科別是否符合
                if (room.getDepartment() == null || !room.getDepartment().getName().equals(departmentName)) {
                    failedApplications.add(applicationId + " 手術房與科別不一致（房間科別: " +
                            (room.getDepartment() != null ? room.getDepartment().getName() : "無科別") + "）");
                    continue;
                }

                // 查找主刀醫師
                Optional<ChiefSurgeon> optionalSurgeon = chiefSurgeonRepository.findByPhysicianName(chiefSurgeonName);
                if (optionalSurgeon.isEmpty()) {
                    failedApplications.add(applicationId + " 找不到主刀醫師：" + chiefSurgeonName);
                    continue;
                }
                ChiefSurgeon chiefSurgeon = optionalSurgeon.get();

                // 決定 orderInRoom
                String roomId = room.getId();
                int nextOrder = roomIdToNextOrderMap.getOrDefault(roomId, room.getSurgeries().size() + 1);
                roomIdToNextOrderMap.put(roomId, nextOrder + 1);

                // 設定使用者
                User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                // 建立 Surgery
                Surgery surgery = new Surgery();
                surgery.setApplicationId(applicationId);
                surgery.setMedicalRecordNumber(medicalRecordNumber);
                surgery.setOperatingRoom(room);
                surgery.setChiefSurgeon(chiefSurgeon);
                surgery.setAnesthesiaMethod(anesthesiaMethod);
                surgery.setDate(Date.valueOf(LocalDate.now().plusDays(1)));
                surgery.setOrderInRoom(nextOrder);
                surgery.setUser(user);

                try {
                    surgery.setEstimatedSurgeryTime(Integer.parseInt(estimatedTimeStr));
                } catch (NumberFormatException e) {
                    failedApplications.add(applicationId + " 手術預估時間格式錯誤");
                    continue;
                }

                surgery.setSpecialOrRequirements(specialRequirements.equalsIgnoreCase("Y") ? "Y" : "N");

                surgeriesToSave.add(surgery);
            }
        } catch (IOException e) {
            throw new RuntimeException("讀取上傳檔案失敗: " + e.getMessage());
        }

        // 批次存入資料庫
        surgeryRepository.saveAll(surgeriesToSave);

        List<OperatingRoom> operatingRooms = operatingRoomRepository.findAll();
        for (OperatingRoom room : operatingRooms) {
            updateSurgeryPrioritySequenceByRoom(room.getId());
        }

        return failedApplications;
    }

}