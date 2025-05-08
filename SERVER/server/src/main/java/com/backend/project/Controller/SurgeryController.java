package com.backend.project.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.backend.project.Dao.OperatingRoomRepository;
import com.backend.project.Service.SurgeryService;
import com.backend.project.model.Department;
import com.backend.project.model.OperatingRoom;
import com.backend.project.model.Surgery;
import org.springframework.web.bind.annotation.PostMapping;

/**
 * SurgeryController
 */
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

        // 科別資訊 - 從手術房獲取關聯的科別
        if (surgery.getOperatingRoom() != null) {
            OperatingRoom operatingRoom = surgery.getOperatingRoom();
            Department department = operatingRoom.getDepartment();
            if (department != null) {
                response.put("departmentName", department.getName());
            } else {
                response.put("departmentName", "未指定科別");
                System.out
                        .println("Warning: Operating Room " + operatingRoom.getId() + " has no associated department");
            }
        } else {
            response.put("departmentName", "未指定科別");
            System.out.println("Warning: Surgery " + surgery.getApplicationId() + " has no associated operating room");
        }

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
    public ResponseEntity<?> updateSurgery(@PathVariable String applicationId,
            @RequestBody Map<String, Object> updateData) {
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
            Surgery updatedSurgery = surgeryService.updateSurgeryForHome(surgery);

            // 創建響應
            Map<String, Object> response = new HashMap<>();
            response.put("applicationId", updatedSurgery.getApplicationId());
            response.put("operatingRoomId",
                    updatedSurgery.getOperatingRoom() != null ? updatedSurgery.getOperatingRoom().getId() : null);
            response.put("operatingRoomName", updatedSurgery.getOperatingRoomName());
            response.put("prioritySequence", updatedSurgery.getPrioritySequence());
            response.put("estimatedSurgeryTime", updatedSurgery.getEstimatedSurgeryTime());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("更新手術資料失敗: " + e.getMessage());
        }
    }

    @PutMapping("system/surgery/{id}")
    public ResponseEntity<?> updateSurgery(@PathVariable String id,
            @RequestBody Surgery updatSurgery) {
        System.out.println("收到的 Surgery：" + updatSurgery);

        surgeryService.updateSurgery(id, updatSurgery);
        Surgery surgery = surgeryService.getSurgeryById(id);
        surgeryService.updateSurgeryPrioritySequenceByRoom(surgery.getOperatingRoom().getId());
        return ResponseEntity.ok("Surgery update successfully");
    }

    @PutMapping("system/surgery/{id}/{operatingRoomId}")
    public ResponseEntity<?> updateSurgery4DrogEnd(@PathVariable String id, @PathVariable String operatingRoomId) {
        System.out.println("收到的手術 ID：" + id);
        System.out.println("收到的手術室 ID：" + operatingRoomId);

        surgeryService.updateSurgery4DrogEnd(id, operatingRoomId);
        Surgery surgery = surgeryService.getSurgeryById(id);
        surgeryService.updateSurgeryPrioritySequenceByRoom(surgery.getOperatingRoom().getId());
        return ResponseEntity.ok("Surgery update successfully");
    }

    @PutMapping("system/surgery/{id}/order-in-room")
    public ResponseEntity<?> updateSurgery4OrderInRoom(@PathVariable String id,
            @RequestBody Map<String, Object> body) {

        int orderInRoom = ((Number) body.get("orderInRoom")).intValue();
        String operatingRoomId = (String) body.get("operatingRoomId");

        surgeryService.updateSurgeryOrderAndRoom(id, orderInRoom, operatingRoomId);
        return ResponseEntity.ok("Surgery updated with new order and room");
    }

    @PostMapping("/system/surgery/add")
    public ResponseEntity<?> addSurgery(@RequestBody Surgery surgery) {
        System.out.println("🔹 接收到的 Surgery 物件：" + surgery);
        surgeryService.addSurgery(surgery);
        surgeryService.updateSurgeryPrioritySequenceByRoom(surgery.getOperatingRoom().getId());
        return ResponseEntity.ok("Surgery add successfully");
    }

    @DeleteMapping("/system/surgery/delete/{id}")
    public ResponseEntity<?> deleteSurgery(@PathVariable String id) {
        surgeryService.deleteSurgery(id);
        Surgery surgery = surgeryService.getSurgeryById(id);
        surgeryService.updateSurgeryPrioritySequenceByRoom(surgery.getOperatingRoom().getId());
        return ResponseEntity.ok("Surgery delete successfully");
    }

    // 更新手術群組的 API
    @PostMapping("/system/surgeries/group")
    public void updateSurgeryGroup(@RequestBody List<String> applicationIds) {
        System.out.println("收到的手術 ID 列表: " + applicationIds);
        surgeryService.updateSurgeryGroups(applicationIds);
        surgeryService.updateSurgeryGroupEstimatedTime(applicationIds);
    }

    @PostMapping("/system/surgeries/group/clear")
    public void clearSurgeryGroup(@RequestBody String id) {
        if (id.endsWith("=")) {
            id = id.substring(0, id.length() - 1); // 去掉結尾的等號
        }
        System.out.println("收到的手術 ID: " + id);
        System.out.println("清空手術群組的 estimatedSurgeryTime");
        surgeryService.restoreSurgeryGroupEstimatedTime(id);
        surgeryService.clearSurgeryGroups(id);
    }

    @GetMapping("/system/surgeries/group/clear/{id}")
    public void testClearSurgeryGroup(@PathVariable String id) {
        if (id.endsWith("=")) {
            id = id.substring(0, id.length() - 1); // 去掉結尾的等號
        }
        System.out.println("收到的手術 ID: " + id);
        System.out.println("清空手術群組的 estimatedSurgeryTime");
        surgeryService.restoreSurgeryGroupEstimatedTime(id);
        surgeryService.clearSurgeryGroups(id);
    }

    @PostMapping("/system/surgeries/upload-time-table")
    public ResponseEntity<?> uploadTimeTable(@RequestParam("file") MultipartFile file,
            @RequestParam("username") String username) {
        if (file.isEmpty() || !file.getOriginalFilename().toLowerCase().endsWith(".csv")) {
            return ResponseEntity.badRequest().body("請上傳CSV檔案！");
        }
        try {
            List<String> failedList = surgeryService.uploadTimeTable(file, username);
            if (failedList.isEmpty()) {
                return ResponseEntity.ok("✅ 全部手術新增成功！");
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "⚠️ 有部分手術無法新增");
                response.put("failedApplications", failedList);
                return ResponseEntity.badRequest().body(response);
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("檢查失敗：" + e.getMessage());
        }
    }

}