package com.backend.project.Dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.project.model.Surgery;

public interface SurgeryRepository extends JpaRepository<Surgery, String> {
    
}
