package com.backend.project.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.project.Dao.SurgeryRepository;

@Service
public class SurgeryService {
    @Autowired
    private SurgeryRepository surgeryRepository;
}
