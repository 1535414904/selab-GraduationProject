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

    @Column(name = "date")
    private Date date;

    @Column(name = "medical_record_number")
    private String medicalRecordNumber;

    @Column(name = "patient_name")
    private String patientName;

    @Column(name = "surgery_name")
    private String surgeryName;

    @Column(name = "anesthesia_method")
    private String anesthesiaMethod;

    @Column(name = "surgery_reason")
    private String surgeryReason;

    @Column(name = "priority_sequence")
    private int prioritySequence;

    @Column(name = "special_or_requirements")
    private String specialOrRequirements;

    @Column(name = "estimated_surgery_time")
    private Integer estimatedSurgeryTime;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "chief_surgeon_employee_id")
    private ChiefSurgeon chiefSurgeon;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "username")
    private User user;

    @Transient
    private String username;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "operating_room_id")
    private OperatingRoom operatingRoom;

    @Transient
    private String operatingRoomId;

    @Transient
    private String chiefSurgeonId;

    @Column(name = "department_name")
    private String departmentName;

    // ===== Getters and Setters =====

    public String getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getMedicalRecordNumber() {
        return medicalRecordNumber;
    }

    public void setMedicalRecordNumber(String medicalRecordNumber) {
        this.medicalRecordNumber = medicalRecordNumber;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getSurgeryName() {
        return surgeryName;
    }

    public void setSurgeryName(String surgeryName) {
        this.surgeryName = surgeryName;
    }

    public String getAnesthesiaMethod() {
        return anesthesiaMethod;
    }

    public void setAnesthesiaMethod(String anesthesiaMethod) {
        this.anesthesiaMethod = anesthesiaMethod;
    }

    public String getSurgeryReason() {
        return surgeryReason;
    }

    public void setSurgeryReason(String surgeryReason) {
        this.surgeryReason = surgeryReason;
    }

    public int getPrioritySequence() {
        return prioritySequence;
    }

    public void setPrioritySequence(int prioritySequence) {
        this.prioritySequence = prioritySequence;
    }

    public String getSpecialOrRequirements() {
        return specialOrRequirements;
    }

    public void setSpecialOrRequirements(String specialOrRequirements) {
        this.specialOrRequirements = specialOrRequirements;
    }

    public Integer getEstimatedSurgeryTime() {
        return estimatedSurgeryTime;
    }

    public void setEstimatedSurgeryTime(Integer estimatedSurgeryTime) {
        this.estimatedSurgeryTime = estimatedSurgeryTime;
    }

    public ChiefSurgeon getChiefSurgeon() {
        return chiefSurgeon;
    }

    public void setChiefSurgeon(ChiefSurgeon chiefSurgeon) {
        this.chiefSurgeon = chiefSurgeon;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public OperatingRoom getOperatingRoom() {
        return operatingRoom;
    }

    public void setOperatingRoom(OperatingRoom operatingRoom) {
        this.operatingRoom = operatingRoom;
    }

    public String getOperatingRoomId() {
        return operatingRoomId;
    }

    public void setOperatingRoomId(String operatingRoomId) {
        this.operatingRoomId = operatingRoomId;
    }

    public String getChiefSurgeonId() {
        return chiefSurgeonId;
    }

    public void setChiefSurgeonId(String chiefSurgeonId) {
        this.chiefSurgeonId = chiefSurgeonId;
    }

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
