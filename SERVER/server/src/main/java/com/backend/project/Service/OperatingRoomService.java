package com.backend.project.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.project.Dao.DepartmentRepository;
import com.backend.project.Dao.OperatingRoomRepository;
import com.backend.project.Dao.SurgeryRepository;
import com.backend.project.model.Department;
import com.backend.project.model.OperatingRoom;
import com.backend.project.model.Surgery;

@Service
public class OperatingRoomService {
    @Autowired
    private OperatingRoomRepository operatingRoomRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private SurgeryRepository surgeryRepository;

    public List<OperatingRoom> getAllOperatingRooms() {
        return operatingRoomRepository.findAll();
    }

    public OperatingRoom updateOperatingRoom(String id, OperatingRoom updateOperatingRoom) {
        Department department = departmentRepository.findById(updateOperatingRoom.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        return operatingRoomRepository.findById(id).map(operatingRoom -> {
            operatingRoom.setId(updateOperatingRoom.getId());
            operatingRoom.setOperatingRoomName(updateOperatingRoom.getOperatingRoomName());
            operatingRoom.setRoomType(updateOperatingRoom.getRoomType());
            operatingRoom.setStatus(updateOperatingRoom.getStatus());
            operatingRoom.setDepartment(department);
            return operatingRoomRepository.save(operatingRoom);
        }).orElseThrow(() -> new RuntimeException("OperatingRoom not found"));
    }

    public void addOperatingRoom(OperatingRoom operatingRoom) {
        Department department = departmentRepository.findById(operatingRoom.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
        operatingRoom.setDepartment(department);

        operatingRoomRepository.save(operatingRoom);
    }

    public void addOperatingRooms(List<OperatingRoom> operatingRooms) {

        for (OperatingRoom operatingRoom : operatingRooms) {
            Department department = departmentRepository.findById(operatingRoom.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            operatingRoom.setDepartment(department);
        }

        operatingRoomRepository.saveAll(operatingRooms);
    }

    public void deleteOperatingRoom(String id) {
        operatingRoomRepository.deleteById(id);
    }

    public void deleteOperatingRooms(List<String> ids) {
        operatingRoomRepository.deleteAllById(ids);
    }

    // ----- About surgery -----//

    public List<Surgery> getSurgeryByOperatingRoomId(String operatingRoomId) {
        OperatingRoom operatingRoom = operatingRoomRepository.findById(operatingRoomId)
                .orElseThrow(() -> new RuntimeException("OperatingRoom not found"));
        
        // 獲取手術列表
        List<Surgery> surgeries = surgeryRepository.findByOperatingRoom(operatingRoom);
        
        // 為每個手術設置科別資訊
        for (Surgery surgery : surgeries) {
            // 確保手術房和科別資訊已加載
            if (surgery.getOperatingRoom() != null && surgery.getOperatingRoom().getDepartment() != null) {
                Department department = surgery.getOperatingRoom().getDepartment();
            }
        }
        
        return surgeries;
    }

    public String getLastSurgeryEndTime(String operatingRoomId) {
        List<Surgery> surgeries = getSurgeryByOperatingRoomId(operatingRoomId);

        LocalTime startTime = LocalTime.of(8, 30);

        int totalMinutes = surgeries.stream()
                .mapToInt(surgery -> surgery.getEstimatedSurgeryTime() + 45)
                .sum();

        LocalTime endTime = startTime.plusMinutes(totalMinutes);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        return endTime.format(formatter);
    }
}
