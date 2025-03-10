package com.backend.project.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.project.Dao.DepartmentRepository;
import com.backend.project.Dao.OperatingRoomRepository;
import com.backend.project.model.Department;
import com.backend.project.model.OperatingRoom;

@Service
public class OperatingRoomService {
    @Autowired
    private OperatingRoomRepository operatingRoomRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    public List<OperatingRoom> getAllOperatingRooms() {
        return operatingRoomRepository.findAll();
    }

    public OperatingRoom updateOperatingRoom(String id, OperatingRoom updateOperatingRoom) {
        Department department = departmentRepository.findById(updateOperatingRoom.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        return operatingRoomRepository.findById(id).map(operatingRoom -> {
            operatingRoom.setId(updateOperatingRoom.getId());
            operatingRoom.setName(updateOperatingRoom.getName());
            operatingRoom.setRoomType(updateOperatingRoom.getRoomType());
            operatingRoom.setStatus(operatingRoom.getStatus());
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
}
