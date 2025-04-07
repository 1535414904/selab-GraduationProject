package com.backend.project.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.project.Dto.TimeSettingsDTO;
import com.backend.project.Service.AlgorithmService;

@CrossOrigin(origins = { "*" })
@RestController
@RequestMapping("/api")
public class AlgorithmController {
    private final AlgorithmService algorithmService;

    public AlgorithmController(AlgorithmService algorithmService) {
        this.algorithmService = algorithmService;
    }

    @GetMapping("/system/algorithm/run")
    public ResponseEntity<String> runAlgorithm() {
        try {
            algorithmService.runBatchFile();
            return ResponseEntity.ok().body("執行完成！");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("錯誤: " + e.getMessage());
        }
    }

    @PostMapping("/system/algorithm/time-settings/export")
    public ResponseEntity<String> exportTimeSettingsToCsv(@RequestBody TimeSettingsDTO timeSettingsDTO) {
        try {
            algorithmService.exportArgumentsToCsv(
                    String.valueOf(timeSettingsDTO.getSurgeryStartTime()),
                    String.valueOf(timeSettingsDTO.getRegularEndTime()),
                    String.valueOf(timeSettingsDTO.getOvertimeEndTime()),
                    String.valueOf(timeSettingsDTO.getCleaningTime()));
            return ResponseEntity.ok("CSV 檔案已成功生成");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("生成 CSV 失敗：" + e.getMessage());
        }
    }

    @GetMapping("/system/algorithm/time-settings")
    public ResponseEntity<TimeSettingsDTO> getTimeSettings() {
        try {
            TimeSettingsDTO timeSettings = algorithmService.getTimeSettingsFromCsv();
            return ResponseEntity.ok(timeSettings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/system/algorithm/pin")
    public ResponseEntity<String> pinRoom(@RequestBody Map<String, Object> payload) {
        String roomId = (String) payload.get("roomId");
        boolean pinned = (Boolean) payload.get("pinned");
        algorithmService.setPinned(roomId, pinned);
        return ResponseEntity.ok("已更新釘選狀態"); 
    }
}
