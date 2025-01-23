package com.example.model.usecase.PatientInfo;

import com.example.infrastructure.persistence.patientinfo.PatientInfoRepositoryV2;
import com.example.model.common.Result;
import com.example.model.entities.dental.PatientInfo;

import java.util.Optional;

public class GetPatientInfoByIdUseCase {
    final private PatientInfoRepositoryV2 patientInfoRepository;
    public GetPatientInfoByIdUseCase(PatientInfoRepositoryV2 patientInfoRepository) {
        this.patientInfoRepository = patientInfoRepository;
    }

    public Result<PatientInfo> execute(Long patientInfoId) {
        Optional<PatientInfo> patientInfo = patientInfoRepository.findById(patientInfoId);
        if(patientInfo.isPresent()) {
            return Result.Success(patientInfo.get());
        } else {
            return Result.Failure(null, "Patient Info not found");
        }
    }
}
