package com.backend.project.Controller;

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
