package com.backend.project.Dto;

public class ChiefSurgeonDTO {
    private String chiefSurgeonEmployeeId;
    private String physicianName;

    public String getId() {
        return chiefSurgeonEmployeeId;
    }

    public void setId(String chiefSurgeonEmployeeId) {
        this.chiefSurgeonEmployeeId = chiefSurgeonEmployeeId;
    }

    public String getName() {
        return physicianName;
    }

    public void setName(String physicianName) {
        this.physicianName = physicianName;
    }
    
}
