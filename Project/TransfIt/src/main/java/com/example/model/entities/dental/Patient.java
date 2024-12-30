package com.example.model.entities.dental;

import com.example.model.common.Result;
import jakarta.persistence.*;

@Entity
@Table(name = "Patient")
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patient_id")
    private Long patientId;

    @ManyToOne
    @JoinColumn(name = "sin_info", nullable = false, referencedColumnName = "patient_sin")
    private PatientInfo sinInfo;

    // Additional fields, getters, setters, and constructors

    public Patient() {}

    protected Patient(PatientInfo patientInfo) {
        this.sinInfo = patientInfo;
    }

    public static Result<Patient> createPatient(PatientInfo sinInfo) {
        return Result.Success(new Patient(sinInfo));
    }

    public Long getId() {
        return patientId;
    }
    public PatientInfo getSinInfo() {
        return sinInfo;
    }
}