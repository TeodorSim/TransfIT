package com.example.model.entities.dental;

import com.example.model.common.Result;
import com.example.model.deserializer.CharacterDeserializer;
import com.example.model.entities.typedef.RepresentativeConverter;
import com.example.model.entities.typedef.Representitve;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.persistence.*;

import java.time.LocalDate;

// Entity for Patient_info
@Entity
@Table(name = "Patient_info")
public class PatientInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patient_sin")
    private Integer patientSin;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "gender", nullable = false, length = 1)
    @JsonDeserialize(using = CharacterDeserializer.class)
    private String gender;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "insurance")
    private String insurance;

    @Convert(converter = RepresentativeConverter.class)
    @Column(name = "rep")
    private Representative representative;


    // Additional fields, getters, setters, and constructors

    public PatientInfo() {}


    protected PatientInfo( String address, String name, String gender, String email, String phone, LocalDate dateOfBirth, Representative representative) {
        this.address = address;
        this.name = name;
        this.gender = gender;
        this.email = email;
        this.phone = phone;
        this.dateOfBirth = dateOfBirth;
        this.representative = representative;
    }

    protected PatientInfo( String address, String name, String gender, String email, String phone, LocalDate dateOfBirth, String insurance, Representative representative) {
        this.address = address;
        this.name = name;
        this.gender = gender;
        this.email = email;
        this.phone = phone;
        this.dateOfBirth = dateOfBirth;
        this.insurance = insurance;
        this.representative = representative;
    }

    public static Result<PatientInfo> createPatientInfo(String address, String name, String gender, String email, String phone, LocalDate dateOfBirth, String insurance, Representative representative) {

        if (address == null || name == null || gender == null || email == null || phone == null || dateOfBirth == null) {
            return Result.Failure(null, "One or more required fields are missing.");
        }
        // Create and return PatientInfo instance
        return Result.Success(new PatientInfo(address, name, gender, email, phone, dateOfBirth, insurance, representative));
    }

    public Integer getId() {
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
    public Representative getRepresentative() {
        return representative;
    }
}