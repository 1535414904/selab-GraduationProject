/*package com.backend.project.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.project.Service.SurgeryService;

@CrossOrigin(origins = { "*" })
@RestController
@RequestMapping("/api")
public class SurgeryController {
    @Autowired
    private SurgeryService surgeryService;
    
}
*/
package com.backend.project.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
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
}
