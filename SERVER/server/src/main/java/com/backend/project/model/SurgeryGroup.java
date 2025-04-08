package com.backend.project.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "surgery_group")
public class SurgeryGroup {
    @Id
    @Column(name = "surgery_group_id")
    private String surgeryGroupId;

    @OneToMany(mappedBy = "surgeryGroup")
    private Surgery surgery;
}
