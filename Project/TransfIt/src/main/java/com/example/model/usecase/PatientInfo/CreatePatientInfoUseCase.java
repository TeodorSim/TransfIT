package com.example.model.usecase.PatientInfo;

import com.example.infrastructure.persistence.patientinfo.PatientInfoRepositoryV2;
import com.example.infrastructure.persistence.patientinfo.PatientInfoRequestDto;
import com.example.model.common.Result;
import com.example.model.entities.dental.PatientInfo;
import com.example.model.entities.dental.Representative;

import java.time.LocalDate;

public class CreatePatientInfoUseCase {

    private final PatientInfoRepositoryV2 patientInfoRepository;

    public CreatePatientInfoUseCase(PatientInfoRepositoryV2 patientInfoRepository) {
        this.patientInfoRepository = patientInfoRepository;
    }

    public Result<PatientInfo> execute(PatientInfoRequestDto patientInfo) {
        Result<PatientInfo> creationResult = PatientInfo.createPatientInfo(
                patientInfo.GetAddress(),
                patientInfo.GetName(),
                patientInfo.GetGender(),
                patientInfo.GetEmail(),
                patientInfo.GetPhone(),
                patientInfo.GetDateOfBirth(),
                patientInfo.GetInsurance(),
                patientInfo.GetRepresentative()
        );
        if(!creationResult.isSuccess) {
            // Return failure directly if validation fails
            return creationResult;
        }

        PatientInfo savedPatient = patientInfoRepository.save(creationResult.value);
        return Result.Success(savedPatient);
    }
}
