package com.backend.project.model;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "department")
public class Department {

    @Id
    @Column(name = "department_id")
    private String departmentId;

    public String getId(){
        return departmentId;
    }

    public void setId(String departmentId){
        this.departmentId = departmentId;
    }
    
    @Column(name = "department_name")
    private String departmentName;

    public String getName(){
        return departmentName;
    }

    public void setName(String departmentName){
        this.departmentName = departmentName;
    }

    @OneToMany(mappedBy = "department")
    private List<ChiefSurgeon> chiefSurgeons;

    @OneToMany(mappedBy = "department")
    private List<OperatingRoom> operatingRooms;
    
}
