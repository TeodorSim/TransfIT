package com.example.model.entities;

import com.example.model.common.Result;
import jakarta.persistence.*;


@Entity
@Table(name = "medications")
public class Medications {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long MedicationID;

    private Long PatientID;
    private String Condition;
    private String DiagnosisDate;
    private String Notes;

    // Additional fields, getters, and setters
    public Medications() {}
    protected Medications(Long PatientID, String Condition, String DiagnosisDate, String Notes) {
        this.PatientID = PatientID;
        this.Condition = Condition;
        this.DiagnosisDate = DiagnosisDate;
        this.Notes = Notes;
    }
    public static Result<Medications> CreateMedication(Long PatientID, String Condition, String DiagnosisDate, String Notes) {
        return Result.Success(new Medications(PatientID, Condition, DiagnosisDate, Notes));
    }

    public Long getMedicationID() {
        return MedicationID;
    }
    public Long getPatientID() {
        return PatientID;
    }
    public String getCondition() {
        return Condition;
    }
    public String getDiagnosisDate() {
        return DiagnosisDate;
    }
    public String getNotes() {
        return Notes;
    }
}