package com.example.model.entities;

import com.example.model.common.Result;
import jakarta.persistence.*;

@Entity
@Table(name = "patients")
public class Patients {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long patientId;
    private Long userId;

    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String gender;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String phoneNumber;
    private String email;

    public Patients() {}


    protected Patients(String firstName, String lastName, String dateOfBirth, String gender, String address, String city, String state, String zipCode, String phoneNumber, String email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.address = address;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.phoneNumber = phoneNumber;
        this.email = email;
    }

    public static Result<Patients> CreatePatient(String firstName, String lastName, String dateOfBirth, String gender, String address, String city, String state, String zipCode, String phoneNumber, String email) {
        return Result.Success(new Patients(firstName,lastName, dateOfBirth, gender, address, city, state, zipCode, phoneNumber, email));
    }

    public Long getPatientId() {
        return patientId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getZipCode() {
        return zipCode;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getEmail() {
        return email;
    }
}
