package com.example.infrastructure.persistence.useraccount;

import com.example.model.entities.dental.Employee;
import com.example.model.entities.dental.Patient;

public class UserAccountRequestDto {
    public String username;
    public String password;
    public Integer type_id;
    public Patient patientId;
    public Employee employeeId;
    public UserAccountRequestDto(){}

    public String getUsername(){
        return username;
    }
    public String getPassword(){
        return password;
    }
    public Integer getTypeId(){
        return type_id;
    }
    public Patient getPatientId(){
        return patientId;
    }
    public Employee getEmployeeId(){
        return employeeId;
    }
}
