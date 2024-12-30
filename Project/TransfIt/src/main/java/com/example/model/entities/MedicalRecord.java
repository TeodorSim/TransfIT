package com.example.model.entities;

import com.example.model.common.Result;
import com.example.model.entities.dental.Patient;
import jakarta.persistence.*;

// Entity for MedicalRecord
@Entity
@Table(name = "MedicalRecord")
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Long recordId;

    @Column(name = "diagnosis", nullable = false)
    private String diagnosis;

    @Column(name = "treatment", nullable = false)
    private String treatment;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    public MedicalRecord() {}

    public MedicalRecord(String diagnosis, String treatment, Patient patient) {
        this.diagnosis = diagnosis;
        this.treatment = treatment;
        this.patient = patient;
    }

    public static Result<MedicalRecord> createMedicalRecord(String diagnosis, String treatment, Patient patient) {
        return Result.Success(new MedicalRecord(diagnosis, treatment, patient));
    }

    public Long getId() {
        return recordId;
    }
    public String getDiagnosis() {
        return diagnosis;
    }
    public String getTreatment() {
        return treatment;
    }
    public Patient getPatient() {
        return patient;
    }
}