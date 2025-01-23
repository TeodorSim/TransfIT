package com.example.model.usecase.Patient;

import com.example.infrastructure.persistence.patient.PatientRepositoryV2;
import com.example.model.common.Result;
import com.example.model.entities.dental.Patient;
import com.example.model.entities.dental.PatientInfo;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class CreatePatientUseCase {

    private final PatientRepositoryV2 patientRepositoryV2;

    public CreatePatientUseCase(PatientRepositoryV2 patientRepositoryV2) {
        this.patientRepositoryV2 = patientRepositoryV2;
    }

    public Result<Patient> execute(PatientInfo sinInfo) {
        // Business logic can be applied here
        Result<Patient> creationResult = Patient.createPatient(sinInfo);
        if(!creationResult.isSuccess) {
            // Return failure directly if validation fails
            return creationResult;
        }
        Patient savedPatient = patientRepositoryV2.save(creationResult.value);
        return Result.Success(savedPatient);
    }
}