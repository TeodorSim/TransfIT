package com.example.model.usecase.Patient;

import com.example.infrastructure.persistence.patient.PatientRepositoryV2;
import com.example.model.common.Result;
import com.example.model.entities.dental.Patient;

import java.util.List;

public class GetAllPatientUseCase {
    private final PatientRepositoryV2 patientRepositoryV2;

    public GetAllPatientUseCase(PatientRepositoryV2 patientRepositoryV2) {
        this.patientRepositoryV2 = patientRepositoryV2;
    }

    public Result<List<Patient>> execute(){
        List<Patient> patients = patientRepositoryV2.findAll();
        if(patients.isEmpty()){
            return Result.Failure(null, "No patients found");
        } else {
            return Result.Success(patients);
        }
    }
}
