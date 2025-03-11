package com.backend.project.Controller;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.project.Service.SurgeryService;
import com.backend.project.model.Surgery;

@CrossOrigin(origins = { "*" })
@RestController
@RequestMapping("/api")
public class SurgeryController {    
    @Autowired
    private SurgeryService surgeryService;
    
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
}