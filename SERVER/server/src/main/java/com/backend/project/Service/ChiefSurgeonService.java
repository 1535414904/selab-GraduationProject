package com.backend.project.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.project.Dao.ChiefSurgeonRepository;
import com.backend.project.Dao.DepartmentRepository;
import com.backend.project.Dto.ChiefSurgeonDTO;
import com.backend.project.model.ChiefSurgeon;
import com.backend.project.model.Department;

@Service
public class ChiefSurgeonService {
    @Autowired
    private ChiefSurgeonRepository chiefSurgeonRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    public ChiefSurgeon updatChiefSurgeon(String id, ChiefSurgeon updatChiefSurgeon) {
        return chiefSurgeonRepository.findById(id).map(chiefSurgeon -> {
            chiefSurgeon.setId(updatChiefSurgeon.getId());
            chiefSurgeon.setName(updatChiefSurgeon.getName());
            return chiefSurgeonRepository.save(chiefSurgeon);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<ChiefSurgeon> addChiefSurgeon(String departmentId, List<ChiefSurgeonDTO> chiefSurgeonDTOs) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        List<ChiefSurgeon> chiefSurgeons = chiefSurgeonDTOs.stream().map(dto -> {
            ChiefSurgeon surgeon = new ChiefSurgeon();
            surgeon.setId(dto.getId()); 
            surgeon.setName(dto.getName());
            surgeon.setDepartment(department);
            return surgeon;
        }).collect(Collectors.toList());

        return chiefSurgeonRepository.saveAll(chiefSurgeons);
    }
    
    public void deleteChiefSurgeon(List<String> ids) {
        chiefSurgeonRepository.deleteAllById(ids);
    }
}
