package com.example.model.entities.dental;

import com.example.model.common.Result;
import jakarta.persistence.*;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;

// Entity for Appointment
@Entity
@Table(name = "Appointment")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Long appointmentId;

    @OneToOne
    @JoinColumn(name = "patient_id", nullable = false, referencedColumnName = "patient_id")
    private Patient patientId;

    @Column(name = "dentist_id", nullable = false)
    private Long dentistId;

    @Column(name = "date_of_appointment", nullable = false)
    private Date appointmentDate;

    @Column(name = "start_time", nullable = false)
    private Time startTime;

    @Column(name = "end_time", nullable = false)
    private Time endTime;

    @Column(name = "appointment_type", nullable = false)
    private String appointmentType;

    @Column(name = "appointment_status", nullable = false)
    private String appointmentStatus;

    @Column(name = "room", nullable = false)
    private Integer room;


    public Appointment() {}

    protected Appointment(Patient patientId, Long dentistId, Date appointmentDate, Time startTime, Time endTime, String appointmentType, String appointmentStatus, Integer room) {
        this.patientId = patientId;
        this.dentistId = dentistId;
        this.appointmentDate = appointmentDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.appointmentType = appointmentType;
        this.appointmentStatus = appointmentStatus;
        this.room = room;
    }

    public static Result<Appointment> createAppointment(Patient patientId, Long dentistId, Date appointmentDate, Time startTime, Time endTime, String appointmentType, String appointmentStatus, Integer room) {
        return Result.Success(new Appointment(patientId, dentistId, appointmentDate, startTime, endTime, appointmentType, appointmentStatus, room));
    }

    public Long getId() {
        return appointmentId;
    }
    public Patient getPatient() {
        return patientId;
    }
    public Long getDentist() {
        return dentistId;
    }
    public Date getAppointmentDate() {
        return appointmentDate;
    }
    public Time getStartTime() {
        return startTime;
    }
    public Time getEndTime() {
        return endTime;
    }
    public String getAppointmentType() {
        return appointmentType;
    }
    public String getAppointmentStatus() {
        return appointmentStatus;
    }
    public Integer getRoom() {
        return room;
    }

}
