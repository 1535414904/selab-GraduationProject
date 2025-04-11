package com.backend.project.Service;

import java.util.List;
import java.util.Optional;

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
        for (String applicationId : applicationIds) {
            // 查找該 Surgery
            Optional<Surgery> optionalSurgery = surgeryRepository.findById(applicationId);
            if (optionalSurgery.isPresent()) {
                Surgery surgery = optionalSurgery.get();

                // 設定每個手術的 groupApplicationIds，這裡我們將把所有傳入的 ID 設定給該 Surgery
                surgery.setGroupApplicationIds(applicationIds);

                // 保存更新後的 Surgery
                surgeryRepository.save(surgery);
            } else {
                throw new RuntimeException("Surgery not found with id " + applicationId);
            }
        }
    }

    // 清空手術的 groupApplicationIds
    public void clearSurgeryGroups(String id) {
        System.out.println("收到的手術 ID: " + id);
        Surgery initSurgery = surgeryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Surgery not found with id " + id));
        List<String> applicationIds = initSurgery.getGroupApplicationIds();

        for (String applicationId : applicationIds) {
            // 查找該 Surgery
            Optional<Surgery> optionalSurgery = surgeryRepository.findById(applicationId);
            if (optionalSurgery.isPresent()) {
                Surgery surgery = optionalSurgery.get();

                // 清空手術的 groupApplicationIds
                surgery.setGroupApplicationIds(null);

                // 保存更新後的 Surgery
                surgeryRepository.save(surgery);
            } else {
                throw new RuntimeException("Surgery not found with id " + applicationId);
            }
        }
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

        // 假設我們將總和賦值給群組中的第一台手術
        Surgery firstSurgery = surgeries.get(0);
        firstSurgery.setEstimatedSurgeryTime(totalEstimatedTime);

        // 保存更新後的手術資料
        surgeryRepository.save(firstSurgery);
    }

    // 根據群組的 applicationIds 還原手術的 estimatedSurgeryTime
    public void restoreSurgeryGroupEstimatedTime(String id) {

        Surgery initSurgery = surgeryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Surgery not found with id " + id));
        // 查詢群組中所有手術
        List<Surgery> surgeries = surgeryRepository.findAllById(initSurgery.getGroupApplicationIds());

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
                .skip(1) // 跳過第一台手術
                .mapToInt(surgery -> surgery.getEstimatedSurgeryTime() != null ? surgery.getEstimatedSurgeryTime() : 0)
                .sum();

        // 加上 (n - 1) * cleaningTime
        int totalCleaningTime = (surgeries.size() - 1) * cleaningTime;
        totalEstimatedTime += totalCleaningTime;

        // 假設我們將還原的總和設回群組中的第一台手術
        Surgery firstSurgery = surgeries.get(0);
        // 還原 estimatedSurgeryTime
        int originalEstimatedTime = firstSurgery.getEstimatedSurgeryTime() - totalEstimatedTime;
        firstSurgery.setEstimatedSurgeryTime(originalEstimatedTime);

        // 保存更新後的手術資料
        surgeryRepository.save(firstSurgery);
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
}