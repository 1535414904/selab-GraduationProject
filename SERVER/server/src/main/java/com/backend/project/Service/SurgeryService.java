/*package com.backend.project.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.project.Dao.SurgeryRepository;

@Service
public class SurgeryService {
    @Autowired
    private SurgeryRepository surgeryRepository;
}
*/
package com.backend.project.Service;

import java.util.List;

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
}
