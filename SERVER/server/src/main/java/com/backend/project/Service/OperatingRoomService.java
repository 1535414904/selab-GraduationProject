package com.backend.project.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.project.Dao.OperatingRoomRepository;

@Service
public class OperatingRoomService {
    @Autowired
    private OperatingRoomRepository operatingRoomRepository;
}
