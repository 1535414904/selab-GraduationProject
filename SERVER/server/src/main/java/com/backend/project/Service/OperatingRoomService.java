package com.backend.project.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.project.Dao.OperatingRoomRepository;
import com.backend.project.model.OperatingRoom;

@Service
public class OperatingRoomService {
    @Autowired
    private OperatingRoomRepository operatingRoomRepository;

    public List<OperatingRoom> getAllOperatingRooms() {
        return operatingRoomRepository.findAll();
    }

    public OperatingRoom updateOperatingRoom(String id, OperatingRoom updateOperatingRoom) {
        return operatingRoomRepository.findById(id).map(operatingRoom -> {
            operatingRoom.setId(updateOperatingRoom.getId());
            operatingRoom.setName(updateOperatingRoom.getName());
            operatingRoom.setRoomType(updateOperatingRoom.getRoomType());
            operatingRoom.setStatus(operatingRoom.getStatus());
            return operatingRoomRepository.save(operatingRoom);
        }).orElseThrow(() -> new RuntimeException("OperatingRoom not found"));
    }

    public void addOperatingRooms(List<OperatingRoom> operatingRooms) {
        operatingRoomRepository.saveAll(operatingRooms);
    }

    public void deleteOperatingRooms(List<String> ids) {
        operatingRoomRepository.deleteAllById(ids);
    }
}
