package com.backend.project.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.project.Dao.OperatingRoomRepository;
import com.backend.project.Service.SurgeryService;
import com.backend.project.model.OperatingRoom;
import com.backend.project.model.Surgery;

@CrossOrigin(origins = { "*" })
@RestController
@RequestMapping("/api")
public class SurgeryController {    
    @Autowired
    private SurgeryService surgeryService;
    
    @Autowired
    private OperatingRoomRepository operatingRoomRepository;
    
    // 新增獲取手術排程的 endpoint
    @GetMapping("/surgeries")
    public ResponseEntity<?> getAllSurgeries() {
        List<Surgery> surgeries = surgeryService.getAllSurgeries();
        return ResponseEntity.ok(surgeries);
    }
    
    // 新增獲取單個手術詳細資料的 endpoint
    @GetMapping("/surgeries/{applicationId}")
    public ResponseEntity<?> getSurgeryById(@PathVariable String applicationId) {
        Surgery surgery = surgeryService.getSurgeryById(applicationId);
        if (surgery == null) {
            return ResponseEntity.notFound().build();
        }
        
        // 創建一個包含所有必要欄位的響應
        Map<String, Object> response = new HashMap<>();
        
        // 基本資訊
        response.put("applicationId", surgery.getApplicationId());
        response.put("medicalRecordNumber", surgery.getMedicalRecordNumber());
        response.put("patientName", surgery.getPatientName());
        response.put("date", surgery.getDate());
        
        // 手術資訊
        response.put("surgeryName", surgery.getSurgeryName());
        response.put("chiefSurgeonName", surgery.getChiefSurgeonName());
        response.put("operatingRoomName", surgery.getOperatingRoomName());
        response.put("estimatedSurgeryTime", surgery.getEstimatedSurgeryTime());
        response.put("anesthesiaMethod", surgery.getAnesthesiaMethod());
        response.put("surgeryReason", surgery.getSurgeryReason());
        
        // 其他資訊
        response.put("specialOrRequirements", surgery.getSpecialOrRequirements());
        
        // 用戶資訊
        if (surgery.getUser() != null) {
            Map<String, Object> user = new HashMap<>();
            user.put("name", surgery.getUser().getName());
            response.put("user", user);
        }
        
        return ResponseEntity.ok(response);
    }
    
    // 新增更新手術資料的 endpoint
    @PutMapping("/surgeries/{applicationId}")
    public ResponseEntity<?> updateSurgery(@PathVariable String applicationId, @RequestBody Map<String, Object> updateData) {
        try {
            // 獲取要更新的手術
            Surgery surgery = surgeryService.getSurgeryById(applicationId);
            if (surgery == null) {
                return ResponseEntity.notFound().build();
            }
            
            // 更新手術室ID
            if (updateData.containsKey("operatingRoomId")) {
                String operatingRoomId = (String) updateData.get("operatingRoomId");
                OperatingRoom operatingRoom = operatingRoomRepository.findById(operatingRoomId).orElse(null);
                if (operatingRoom != null) {
                    surgery.setOperatingRoom(operatingRoom);
                }
            }
            
            // 更新優先順序
            if (updateData.containsKey("prioritySequence")) {
                int prioritySequence = ((Number) updateData.get("prioritySequence")).intValue();
                surgery.setPrioritySequence(prioritySequence);
            }
            
            // 更新預估手術時間
            if (updateData.containsKey("estimatedSurgeryTime")) {
                int estimatedSurgeryTime = ((Number) updateData.get("estimatedSurgeryTime")).intValue();
                surgery.setEstimatedSurgeryTime(estimatedSurgeryTime);
            }
            
            // 保存更新後的手術資料
            Surgery updatedSurgery = surgeryService.updateSurgery(surgery);
            
            // 創建響應
            Map<String, Object> response = new HashMap<>();
            response.put("applicationId", updatedSurgery.getApplicationId());
            response.put("operatingRoomId", updatedSurgery.getOperatingRoom() != null ? updatedSurgery.getOperatingRoom().getId() : null);
            response.put("operatingRoomName", updatedSurgery.getOperatingRoomName());
            response.put("prioritySequence", updatedSurgery.getPrioritySequence());
            response.put("estimatedSurgeryTime", updatedSurgery.getEstimatedSurgeryTime());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("更新手術資料失敗: " + e.getMessage());
        }
    }
}