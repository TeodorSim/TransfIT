package com.example.infrastructure.api;

import com.example.infrastructure.persistence.patient.PatientRequestDto;
import com.example.model.common.Result;
import com.example.model.entities.dental.Patient;
import com.example.service.dentalv2.PatientServiceV2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient/v2")
public class PatientControllerV2 {

    //@Autowired
    private final PatientServiceV2 patientService;

    public PatientControllerV2(PatientServiceV2 patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    public ResponseEntity<?> createPatient(@RequestBody PatientRequestDto patientRequestDto) {
        Result<Patient> result = patientService.CreatePatient(
                patientRequestDto.getPatientInfo()
        );
        if(!result.isSuccess){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result.error);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(result.value);
    }

    @GetMapping
    public ResponseEntity<?> getPatients() {
        return ResponseEntity.ok(patientService.GetAllPatients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPatientById(@PathVariable Long id) {
        Result<Patient> result = patientService.GetPatientById(id);
        if(!result.isSuccess){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result.error);
        }
        return ResponseEntity.ok(result.value);
    }
}
