package com.example.model.entities;

import com.example.model.common.Result;
import com.sun.net.httpserver.Authenticator;
import jakarta.persistence.*;

@Entity
@Table(name = "medicalrecord")
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String diagnosis;
    private String treatment;
    private Long userId;
    // Additional fields, getters, and setters
    public MedicalRecord() {}
    protected MedicalRecord(String diagnosis, String treatment, Long userId) {
        this.diagnosis = diagnosis;
        this.treatment = treatment;
        this.userId = userId;
    }
    public static Result<MedicalRecord> CreateMedicalRecord(String diagnosis, String treatment, Long userId) {
        return Result.Success(new MedicalRecord(diagnosis, treatment, userId));
    }

    public Long getId() {
        return id;
    }
    public Long getUserId() {
        return userId;
    }
    public String getDiagnosis() {
        return diagnosis;
    }
    public String getTreatment() {
        return treatment;
    }
}