package com.example.model.entities.dental;

import com.example.model.common.Result;
import jakarta.persistence.*;

// Entity for Patient_info
@Entity
@Table(name = "Patient_records")
public class PatientRecords {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Long recordId;

    @Column(name = "patient_detalis")
    private String patientDetalis;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false, referencedColumnName = "patient_id")
    private Patient patientId;

    public PatientRecords() {}

    protected PatientRecords(Long recordId, String patientDetalis, Patient patientId) {
        this.recordId = recordId;
        this.patientDetalis = patientDetalis;
        this.patientId = patientId;
    }

    public Result<PatientRecords> createPatientRecord(Long recordId, String patientDetalis, Patient patientId) {
        return Result.Success(new PatientRecords(recordId, patientDetalis, patientId));
    }

    public Long getId() {
        return recordId;
    }
    public String getPatientDetalis() {
        return patientDetalis;
    }
    public Patient getPatientId() {
        return patientId;
    }
}
