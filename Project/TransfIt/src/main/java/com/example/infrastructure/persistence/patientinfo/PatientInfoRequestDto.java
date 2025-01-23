package com.example.infrastructure.persistence.patientinfo;

import com.example.model.entities.dental.Representative;

import java.time.LocalDate;

public class PatientInfoRequestDto {
    public String address;
    public String name;
    public String gender;
    public String email;
    public String phone;
    public LocalDate dateOfBirth;
    public String insurance;
    public Representative representative;
    public String GetAddress(){
        return address;
    }
    public String GetName(){
        return name;
    }
    public String GetGender(){
        return gender;
    }
    public String GetEmail(){
        return email;
    }
    public String GetPhone(){
        return phone;
    }
    public LocalDate GetDateOfBirth(){
        return dateOfBirth;
    }
    public String GetInsurance(){
        return insurance;
    }
    public Representative GetRepresentative(){
        return representative;
    }
}
