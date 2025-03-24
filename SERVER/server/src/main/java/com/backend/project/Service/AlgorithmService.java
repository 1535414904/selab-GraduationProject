package com.backend.project.Service;

import java.io.File;
import java.io.IOException;

import org.springframework.stereotype.Service;

@Service
public class AlgorithmService {

    private static final String BATCH_FILE_PATH = "ORSM 2025/AllInOne.bat"; // 根據實際檔名修改

    public void runBatchFile() {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder("cmd.exe", "/c", BATCH_FILE_PATH);
            processBuilder.directory(new File(System.getProperty("user.dir"))); // 設定工作目錄為 server 目錄
            processBuilder.inheritIO(); // 讓 Java 直接顯示執行結果到主控台
            Process process = processBuilder.start();
            process.waitFor(); // 等待執行完成
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}