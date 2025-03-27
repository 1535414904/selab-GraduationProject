package com.backend.project.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.project.Dto.TimeSettingsDTO;
import com.backend.project.Service.AlgorithmService;

@RestController
@RequestMapping("/api")
public class AlgorithmController {
    private final AlgorithmService algorithmService;

    public AlgorithmController(AlgorithmService algorithmService) {
        this.algorithmService = algorithmService;
    }

    @GetMapping("/system/algorithm/run")
    public String runAlgorithm() {
        try {
            algorithmService.runBatchFile(); // 呼叫後端服務執行 .bat 檔案
            return "執行完成！"; // 回傳執行成功的訊息
        } catch (Exception e) {
            return "錯誤: " + e.getMessage(); // 回傳錯誤訊息
        }
    }

   @PostMapping("/system/algorithm/time-settings/export")
    public ResponseEntity<String> exportTimeSettingsToCsv(@RequestBody TimeSettingsDTO timeSettingsDTO) {
        try {
            algorithmService.exportArgumentsToCsv(
                String.valueOf(timeSettingsDTO.getSurgeryStartTime()),
                String.valueOf(timeSettingsDTO.getRegularEndTime()),
                String.valueOf(timeSettingsDTO.getOvertimeEndTime()),
                String.valueOf(timeSettingsDTO.getCleaningTime())
            );
            return ResponseEntity.ok("CSV 檔案已成功生成");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("生成 CSV 失敗：" + e.getMessage());
        }
    }
}
