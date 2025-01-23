package com.example.model.usecase.Patient;

import com.example.infrastructure.persistence.patient.PatientRepositoryV2;
import com.example.model.common.Result;
import com.example.model.entities.dental.Patient;

import java.util.Optional;

public class GetPatientByIdUseCase {
    private final PatientRepositoryV2 patientRepositoryV2;

    public GetPatientByIdUseCase(PatientRepositoryV2 patientRepositoryV2) {
        this.patientRepositoryV2 = patientRepositoryV2;
    }

    public Result<Patient> execute(Long id) {
        Optional<Patient> patient = patientRepositoryV2.findById(id);
        if(patient.isPresent()) {
            return Result.Success(patient.get());
        } else {
            return Result.Failure(null, "Patient not found");
        }
    }
}
