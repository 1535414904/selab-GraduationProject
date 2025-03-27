package com.backend.project.model;

import java.sql.Date;
import java.text.SimpleDateFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "surgery")
public class Surgery {

    @Id
    @Column(name = "application_id")
    private String applicationId;

    public String getApplicationId() {
        return applicationId;
    }

    public void setId(String applicationId) {
        this.applicationId = applicationId;
    }

    @Column(name = "date")
    private Date date;

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    @Column(name = "medical_record_number")
    private String medicalRecordNumber;

    public String getMedicalRecordNumber() {
        return medicalRecordNumber;
    }

    public void setMedicalRecordNumber(String medicalRecordNumber) {
        this.medicalRecordNumber = medicalRecordNumber;
    }

    @Column(name = "patient_name")
    private String patientName;

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    @Column(name = "surgery_name")
    private String surgeryName;

    public String getSurgeryName() {
        return surgeryName;
    }

    public void setSurgeryName(String surgeryName) {
        this.surgeryName = surgeryName;
    }

    @Column(name = "anesthesia_method")
    private String anesthesiaMethod;

    public String getAnesthesiaMethod() {
        return anesthesiaMethod;
    }

    public void setAnesthesiaMethod(String anesthesiaMethod) {
        this.anesthesiaMethod = anesthesiaMethod;
    }

    @Column(name = "surgery_reason")
    private String surgeryReason;

    public String getSurgeryReason() {
        return surgeryReason;
    }

    public void setSurgeryReason(String surgeryReason) {
        this.surgeryReason = surgeryReason;
    }

    @Column(name = "priority_sequence")
    private int prioritySequence;

    public int getPrioritySequence() {
        return prioritySequence;
    }

    public void setPrioritySequence(int prioritySequence) {
        this.prioritySequence = prioritySequence;
    }

    @Column(name = "special_or_requirements")
    private String specialOrRequirements;

    public String getSpecialOrRequirements() {
        return specialOrRequirements;
    }

    public void setSpecialOrRequirements(String specialOrRequirements) {
        this.specialOrRequirements = specialOrRequirements;
    }

    @Column(name = "estimated_surgery_time")
    private Integer estimatedSurgeryTime;

    public Integer getEstimatedSurgeryTime() {
        return estimatedSurgeryTime;
    }

    public void setEstimatedSurgeryTime(Integer estimatedSurgeryTime) {
        this.estimatedSurgeryTime = estimatedSurgeryTime;
    }

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "chief_surgeon_employee_id")
    private ChiefSurgeon chiefSurgeon;

    public ChiefSurgeon getChiefSurgeon() {
        return chiefSurgeon;
    }

    public void setChiefSurgeon(ChiefSurgeon chiefSurgeon) {
        this.chiefSurgeon = chiefSurgeon;
    }

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "username")
    private User user;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    @Transient
    private String username;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "operating_room_id")
    private OperatingRoom operatingRoom;

    public OperatingRoom getOperatingRoom() {
        return operatingRoom;
    }

    public void setOperatingRoom(OperatingRoom operatingRoom) {
        this.operatingRoom = operatingRoom;
    }

    @Transient
    private String operatingRoomId;

    public String getOperatingRoomId() {
        return operatingRoomId;
    }

    public void setOperatingRoomId(String operatingRoomId) {
        this.operatingRoomId = operatingRoomId;
    }

    @Transient
    private String chiefSurgeonId;

    public String getChiefSurgeonId() {
        return chiefSurgeonId;
    }

    public void setChiefSurgeonId(String chiefSurgeonId) {
        this.chiefSurgeonId = chiefSurgeonId;
    }

    @Column(name = "department_name")
    private String departmentName;

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getFormattedTime() {
        try {
            if (this.date == null) {
                return "00:00";
            }
            return new SimpleDateFormat("HH:mm").format(this.date);
        } catch (Exception e) {
            return "00:00";
        }
    }

    public String getChiefSurgeonName() {
        try {
            return this.chiefSurgeon != null ? this.chiefSurgeon.getName() : "未指定醫師";
        } catch (Exception e) {
            return "未指定醫師";
        }
    }

    public String getOperatingRoomName() {
        return this.operatingRoom != null ? this.operatingRoom.getName() : "未指定手術室";
    }
}
