package com.backend.project.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.project.Dto.ChiefSurgeonDTO;
import com.backend.project.Service.ChiefSurgeonService;
import com.backend.project.model.ChiefSurgeon;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@CrossOrigin(origins = { "*" })
@RestController
@RequestMapping("/api")
public class ChiefSurgeonController {
    @Autowired
    private ChiefSurgeonService chiefSurgeonService;

    @PutMapping("system/chief-surgeon/{id}")
    public ResponseEntity<?> pudateChiefSurgeon(@PathVariable String id, @RequestBody ChiefSurgeon updateChiefSurgeon) {
        chiefSurgeonService.updatChiefSurgeon(id, updateChiefSurgeon);
        return ResponseEntity.ok("ChiefSurgeon update successfully");
    }

    @PostMapping("/system/{departmentId}/chief-surgeons/add")
    public ResponseEntity<List<ChiefSurgeon>> addChiefSurgeons(
            @PathVariable String departmentId,
            @RequestBody List<ChiefSurgeonDTO> chiefSurgeonDTOs) {
        List<ChiefSurgeon> addChiefSurgeons = chiefSurgeonService.addChiefSurgeon(departmentId, chiefSurgeonDTOs);
        return ResponseEntity.ok(addChiefSurgeons);
    }

    @DeleteMapping("/system/chief-surgeons/delete")
    public ResponseEntity<?> deleteChiefSurgeons(@RequestBody List<String> ids) {
        chiefSurgeonService.deleteChiefSurgeon(ids);
        return ResponseEntity.ok("ChiefSurgeon delete successfully");
    }

}
