package com.backend.project.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
            algorithmService.runBatchFile();  // 呼叫後端服務執行 .bat 檔案
            return "執行完成！";  // 回傳執行成功的訊息
        } catch (Exception e) {
            return "錯誤: " + e.getMessage();  // 回傳錯誤訊息
        }
    }
}
