package com.backend.project.Dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.project.model.OperatingRoom;

public interface OperatingRoomRepository extends JpaRepository<OperatingRoom, String>  {
    Optional<OperatingRoom> findByOperatingRoomName(String operatingRoomName);
}
