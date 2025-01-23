package com.example.config;

import com.example.infrastructure.persistence.patient.PatientRepositoryV2;
import com.example.model.usecase.Patient.CreatePatientUseCase;
import com.example.model.usecase.Patient.GetAllPatientUseCase;
import com.example.model.usecase.Patient.GetPatientByIdUseCase;
import com.example.service.dentalv2.PatientServiceV2;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PatientConfig {
    @Bean
    public CreatePatientUseCase createPatientUseCase(PatientRepositoryV2 patientRepositoryV2) {
        return new CreatePatientUseCase(patientRepositoryV2);
    }

    @Bean
    public GetAllPatientUseCase getAllPatientUseCase(PatientRepositoryV2 patientRepositoryV2) {
        return new GetAllPatientUseCase(patientRepositoryV2);
    }

    @Bean
    public GetPatientByIdUseCase getPatientByIdUseCase(PatientRepositoryV2 patientRepositoryV2) {
        return new GetPatientByIdUseCase(patientRepositoryV2);
    }

    @Bean
    public PatientServiceV2 patientServiceV2(CreatePatientUseCase createPatientUseCase, GetAllPatientUseCase getAllPatientUseCase
            , GetPatientByIdUseCase getPatientByIdUseCase) {
        return new PatientServiceV2(createPatientUseCase, getAllPatientUseCase, getPatientByIdUseCase);
    }
}
