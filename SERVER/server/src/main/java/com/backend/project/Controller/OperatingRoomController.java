package com.backend.project.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.project.Service.OperatingRoomService;
import com.backend.project.model.OperatingRoom;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@CrossOrigin(origins = { "*" })
@RestController
@RequestMapping("/api")
public class OperatingRoomController {
    @Autowired
    private OperatingRoomService operatingRoomService;

    @GetMapping("/system/operating-rooms")
    public List<OperatingRoom> getOperatingRooms() {
        return operatingRoomService.getAllOperatingRooms();
    }

    @PutMapping("/system/operating-room/{id}")
    public ResponseEntity<?> updateOperatingRoom(@PathVariable String id,
            @RequestBody OperatingRoom updatOperatingRoom) {
        operatingRoomService.updateOperatingRoom(id, updatOperatingRoom);
        return ResponseEntity.ok("OperatingRoom update successfully");
    }

    @PostMapping("system/operating-room/add")
    public ResponseEntity<?> addOperatingRoom(
            @RequestBody OperatingRoom operatingRoom) {
        operatingRoomService.addOperatingRoom(operatingRoom);
        return ResponseEntity.ok("OperatingRoom add successfully");
    }

    @PostMapping("/system/operating-rooms/add")
    public ResponseEntity<?> addOperatingRooms(
            @RequestBody List<OperatingRoom> operatingRooms) {
        operatingRoomService.addOperatingRooms(operatingRooms);
        return ResponseEntity.ok("OperatingRooms add successfully");
    }

    @DeleteMapping("/system/operating-room/delete/{id}")
    public ResponseEntity<?> deleteOperatingRoom(@PathVariable String id) {
        operatingRoomService.deleteOperatingRoom(id);
        return ResponseEntity.ok("OperatingRoom delete successfully");
    }

    @DeleteMapping("/system/operating-rooms/delete")
    public ResponseEntity<?> deleteOperatingRooms(@RequestBody List<String> ids) {
        operatingRoomService.deleteOperatingRooms(ids);
        return ResponseEntity.ok("OperatingRooms delete successfully");
    }
}
