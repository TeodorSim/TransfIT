package com.example.model.entities.dental;

import com.example.model.common.Result;
import jakarta.persistence.*;

import java.time.LocalDate;

// Entity for Patient_info
@Entity
@Table(name = "Patient_info")
public class PatientInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patient_sin")
    private Long patientSin;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "gender", nullable = false, length = 1)
    private String gender;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "insurance")
    private String insurance;

    // Additional fields, getters, setters, and constructors

    public PatientInfo() {}

    protected PatientInfo(Long patientSin, String address, String name, String gender, String email, String phone, LocalDate dateOfBirth, String insurance) {
        this.patientSin = patientSin;
        this.address = address;
        this.name = name;
        this.gender = gender;
        this.email = email;
        this.phone = phone;
        this.dateOfBirth = dateOfBirth;
        this.insurance = insurance;
    }

    public static Result<PatientInfo> createPatientInfo(Long patientSin, String address, String name, String gender, String email, String phone, LocalDate dateOfBirth, String insurance) {
        return Result.Success(new PatientInfo(patientSin, address, name, gender, email, phone, dateOfBirth, insurance));
    }

    public Long getId() {
        return patientSin;
    }

    public String getAddress() {
        return address;
    }
    public String getName() {
        return name;
    }
    public String getGender() {
        return gender;
    }
    public String getEmail() {
        return email;
    }
    public String getPhone() {
        return phone;
    }
    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }
    public String getInsurance() {
        return insurance;
    }

}