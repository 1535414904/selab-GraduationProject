package com.backend.project.model;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "operating_room")
public class OperatingRoom {

    @Id
    @Column(name = "operating_room_id")
    private String operatingRoomId;

    public String getId() {
        return operatingRoomId;
    }

    public void setId(String operatingRoomId) {
        this.operatingRoomId = operatingRoomId;
    }

    @Column(name = "operating_room_name")
    private String operatingRoomName;

    public String getName() {
        return operatingRoomName;
    }

    public void setName(String operatingRoomName) {
        this.operatingRoomName = operatingRoomName;
    }

    @Column(name = "operating_room_status")
    private String operatingRoomStatus;

    public String getStatus() {
        return operatingRoomStatus;
    }

    public void setStatus(String operatingRoomStatus) {
        this.operatingRoomStatus = operatingRoomStatus;
    }

    @Column(name = "operating_room_type")
    private String operatingRoomType;

    public String getRoomType() {
        return operatingRoomType;
    }

    public void setRoomType(String operatingRoomType) {
        this.operatingRoomType = operatingRoomType;
    }

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    @OneToMany(mappedBy = "operatingRoom")
    private List<Surgery> surgeries;
}
