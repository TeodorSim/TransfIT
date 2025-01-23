package com.example.infrastructure.persistence.patient;

import com.example.model.entities.dental.PatientInfo;

public class PatientRequestDto {
    public PatientInfo patientInfo;
    public PatientInfo getPatientInfo(){
        return patientInfo;
    }
}
