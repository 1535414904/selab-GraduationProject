package com.backend.project.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}