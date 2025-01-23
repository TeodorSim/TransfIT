package com.example.service.dentalv2;

import com.example.infrastructure.persistence.patientinfo.PatientInfoRequestDto;
import com.example.model.common.Result;
import com.example.model.entities.dental.PatientInfo;
import com.example.model.usecase.PatientInfo.CreatePatientInfoUseCase;
import com.example.model.usecase.PatientInfo.DeletePatientInfoUseCase;
import com.example.model.usecase.PatientInfo.GetPatientInfoByIdUseCase;

public class PatientInfoServiceV2 {
    private final CreatePatientInfoUseCase createPatientInfoUseCase;
    private final DeletePatientInfoUseCase deletePatientInfoUseCase;
    private final GetPatientInfoByIdUseCase getPatientInfoByIdUseCase;

    public PatientInfoServiceV2(CreatePatientInfoUseCase createPatientInfoUseCase, DeletePatientInfoUseCase deletePatientInfoUseCase, GetPatientInfoByIdUseCase getPatientInfoByIdUseCase) {
        this.createPatientInfoUseCase = createPatientInfoUseCase;
        this.deletePatientInfoUseCase = deletePatientInfoUseCase;
        this.getPatientInfoByIdUseCase = getPatientInfoByIdUseCase;
    }

    public Result<PatientInfo> CreatePatientInfo(PatientInfoRequestDto patientInfo) {
        return createPatientInfoUseCase.execute(patientInfo);
    }

    public boolean DeletePatientInfo(Long patientInfoId) {
        return deletePatientInfoUseCase.execute(patientInfoId);
    }

    public Result<PatientInfo> GetPatientInfoById(Long patientInfoId) {
        return getPatientInfoByIdUseCase.execute(patientInfoId);
    }
}
