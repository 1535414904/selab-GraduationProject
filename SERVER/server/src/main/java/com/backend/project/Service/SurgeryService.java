package com.backend.project.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.project.Dao.ChiefSurgeonRepository;
import com.backend.project.Dao.OperatingRoomRepository;
import com.backend.project.Dao.SurgeryRepository;
import com.backend.project.model.ChiefSurgeon;
import com.backend.project.model.OperatingRoom;
import com.backend.project.model.Surgery;

@Service
public class SurgeryService {

    @Autowired
    private SurgeryRepository surgeryRepository;

    @Autowired
    private OperatingRoomRepository operatingRoomRepository;

    @Autowired
    private ChiefSurgeonRepository chiefSurgeonRepository;

    public List<Surgery> getAllSurgeries() {
        return surgeryRepository.findAll();
    }

    public Surgery getSurgeryById(String applicationId) {
        Optional<Surgery> surgery = surgeryRepository.findById(applicationId);
        return surgery.orElse(null);
    }

    public Surgery updateSurgeryForHome(Surgery surgery) {
        return surgeryRepository.save(surgery);
    }

    public Surgery updateSurgery(String id,
            Surgery updateSurgery) {
        OperatingRoom operatingRoom = operatingRoomRepository.findById(updateSurgery.getOperatingRoomId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
        ChiefSurgeon chiefSurgeon = chiefSurgeonRepository.findById(updateSurgery.getChiefSurgeonId())
                .orElseThrow(() -> new RuntimeException("chiefSurgeon not found"));

        return surgeryRepository.findById(id).map(surgery -> {
            surgery.setId(updateSurgery.getApplicationId());
            surgery.setDate(updateSurgery.getDate());
            surgery.setMedicalRecordNumber(updateSurgery.getMedicalRecordNumber());
            surgery.setPatientName(updateSurgery.getPatientName());
            surgery.setSurgeryName(updateSurgery.getSurgeryName());
            surgery.setAnesthesiaMethod(updateSurgery.getAnesthesiaMethod());
            surgery.setSurgeryReason(updateSurgery.getSurgeryReason());
            surgery.setSpecialOrRequirements(updateSurgery.getSpecialOrRequirements());
            surgery.setEstimatedSurgeryTime(updateSurgery.getEstimatedSurgeryTime());
            surgery.setChiefSurgeon(chiefSurgeon);
            surgery.setOperatingRoom(operatingRoom);
            return surgeryRepository.save(surgery);
        }).orElseThrow(() -> new RuntimeException("Surgery not found"));
    }

}