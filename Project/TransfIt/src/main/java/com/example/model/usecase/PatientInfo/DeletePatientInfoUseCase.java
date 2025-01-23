package com.example.model.usecase.PatientInfo;

import com.example.infrastructure.persistence.patientinfo.PatientInfoRepositoryV2;
import com.example.model.entities.dental.PatientInfo;

public class DeletePatientInfoUseCase {
    private final PatientInfoRepositoryV2 patientInfoRepository;

    public DeletePatientInfoUseCase(PatientInfoRepositoryV2 patientInfoRepository) {
        this.patientInfoRepository = patientInfoRepository;
    }

    public boolean execute(Long patientInfo) {
        if(patientInfoRepository.existsById(patientInfo)){
            patientInfoRepository.deleteById(patientInfo);
            return true;
        }
        return false;
    }
}
