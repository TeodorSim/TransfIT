package com.example.model.entities.dental;

import com.example.model.common.Result;
import jakarta.persistence.*;

@Entity
@Table(name = "Treatment")
public class Treatment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "treatment_id", nullable = false)
    private Integer treatmentId;

    @Column(name = "treatment_type", nullable = false)
    private String treatmentType;

    @Column(name = "medication", nullable = false)
    private String medication;

    @Column(name = "symptoms", nullable = false)
    private String symptoms;

    @Column(name = "tooth", nullable = false)
    private Integer tooth;

    @Column(name = "comments", nullable = false)
    private String comments;

    @OneToOne
    @JoinColumn(name = "patient_id", nullable = false, referencedColumnName = "patient_id")
    private Patient patientId;

    @OneToOne
    @JoinColumn(name = "appointment_id", nullable = false, referencedColumnName = "appointment_id")
    private Appointment appointmentId;


    public Treatment() {}

    protected Treatment(String treatmentType, String medication, String symptoms, Integer tooth, String comments, Patient patientId, Appointment appointmentId) {
        this.treatmentType = treatmentType;
        this.medication = medication;
        this.symptoms = symptoms;
        this.tooth = tooth;
        this.comments = comments;
        this.patientId = patientId;
        this.appointmentId = appointmentId;
    }

    public Result<Treatment> createTreatment(String treatmentType, String medication, String symptoms, Integer tooth, String comments, Patient patientId, Appointment appointmentId) {
        return Result.Success(new Treatment(treatmentType, medication, symptoms, tooth, comments, patientId, appointmentId));
    }
    public Integer getId(){
        return treatmentId;
    }
    public String getTreatmentType() {
        return treatmentType;
    }
    public String getMedication() {
        return medication;
    }
    public String getSymptoms() {
        return symptoms;
    }
    public Integer getTooth() {
        return tooth;
    }
    public String getComments() {
        return comments;
    }
    public Patient getPatientId() {
        return patientId;
    }
    public Appointment getAppointmentId() {
        return appointmentId;
    }
}