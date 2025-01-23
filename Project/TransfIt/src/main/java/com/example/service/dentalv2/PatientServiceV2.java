package com.example.service.dentalv2;

import com.example.model.common.Result;
import com.example.model.entities.dental.Patient;
import com.example.model.entities.dental.PatientInfo;
import com.example.model.usecase.Patient.CreatePatientUseCase;
import com.example.model.usecase.Patient.GetAllPatientUseCase;
import com.example.model.usecase.Patient.GetPatientByIdUseCase;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientServiceV2 {
    private final CreatePatientUseCase createPatientUseCase;
    private final GetAllPatientUseCase getAllPatientUseCase;
    private final GetPatientByIdUseCase getPatientByIdUseCase;

    public PatientServiceV2(CreatePatientUseCase createPatientUseCase, GetAllPatientUseCase getAllPatientUseCase,
                            GetPatientByIdUseCase getPatientByIdUseCase){
        this.createPatientUseCase = createPatientUseCase;
        this.getAllPatientUseCase = getAllPatientUseCase;
        this.getPatientByIdUseCase = getPatientByIdUseCase;
    }

    public Result<Patient> CreatePatient(PatientInfo patientInfo) {
        return createPatientUseCase.execute(patientInfo);
    }

    public Result<List<Patient>> GetAllPatients() {
        return getAllPatientUseCase.execute();
    }

    public Result<Patient> GetPatientById(Long id) {
        return getPatientByIdUseCase.execute(id);
    }
}
