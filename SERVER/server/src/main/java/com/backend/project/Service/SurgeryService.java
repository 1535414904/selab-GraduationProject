package com.backend.project.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.project.Dao.SurgeryRepository;
import com.backend.project.model.Surgery;

@Service
public class SurgeryService {
    
    @Autowired
    private SurgeryRepository surgeryRepository;
    
    public List<Surgery> getAllSurgeries() {
        return surgeryRepository.findAll();
    }
    
    public Surgery getSurgeryById(String applicationId) {
        Optional<Surgery> surgery = surgeryRepository.findById(applicationId);
        return surgery.orElse(null);
    }
    
    public Surgery updateSurgery(Surgery surgery) {
        return surgeryRepository.save(surgery);
    }
}