package com.example.config;

import com.example.infrastructure.persistence.patientinfo.PatientInfoRepositoryV2;
import com.example.model.usecase.PatientInfo.CreatePatientInfoUseCase;
import com.example.model.usecase.PatientInfo.DeletePatientInfoUseCase;
import com.example.model.usecase.PatientInfo.GetPatientInfoByIdUseCase;
import com.example.service.dentalv2.PatientInfoServiceV2;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PatientInfoConfig {
    @Bean
    public CreatePatientInfoUseCase createPatientInfoUseCase(PatientInfoRepositoryV2 patientInfoRepositoryV2) {
        return new CreatePatientInfoUseCase(patientInfoRepositoryV2);
    }

    @Bean
    public DeletePatientInfoUseCase deletePatientInfoUseCase(PatientInfoRepositoryV2 patientInfoRepositoryV2) {
        return new DeletePatientInfoUseCase(patientInfoRepositoryV2);
    }

    @Bean
    public GetPatientInfoByIdUseCase getPatientInfoByIdUseCase(PatientInfoRepositoryV2 patientInfoRepositoryV2) {
        return new GetPatientInfoByIdUseCase(patientInfoRepositoryV2);
    }

    @Bean
    public PatientInfoServiceV2 patientInfoServiceV2(CreatePatientInfoUseCase createPatientInfoUseCase, DeletePatientInfoUseCase deletePatientInfoUseCase, GetPatientInfoByIdUseCase getPatientInfoByIdUseCase) {
        return new PatientInfoServiceV2(createPatientInfoUseCase, deletePatientInfoUseCase, getPatientInfoByIdUseCase);
    }
}
