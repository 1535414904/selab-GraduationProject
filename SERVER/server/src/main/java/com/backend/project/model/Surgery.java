package com.backend.project.model;

import java.sql.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "surgery")
public class Surgery {

    @Id
    @Column(name = "application_id")
    private String applicationId;

    public String getId() {
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
    private int estimatedSurgeryTime;

    public int getEstimatedSurgeryTime() {
        return estimatedSurgeryTime;
    }

    public void setEstimatedSurgeryTime(int estimatedSurgeryTime) {
        this.estimatedSurgeryTime = estimatedSurgeryTime;
    }

    @ManyToOne
    @JoinColumn(name = "chief_surgeon_employee_id")
    private ChiefSurgeon chiefSurgeon;

    @ManyToOne
    @JoinColumn(name = "username")
    private User user;

    @ManyToOne
    @JoinColumn(name = "operating_room_id")
    private OperatingRoom operatingRoom;
}
