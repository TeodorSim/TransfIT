package com.example.infrastructure.api;

import com.example.infrastructure.persistence.patientinfo.PatientInfoRequestDto;
import com.example.model.common.Result;
import com.example.model.entities.dental.PatientInfo;
import com.example.service.dentalv2.PatientInfoServiceV2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patientinfo/v2")
public class PatientInfoControllerV2 {
    private final PatientInfoServiceV2 patientInfoService;

    public PatientInfoControllerV2(PatientInfoServiceV2 patientInfoService) {
        this.patientInfoService = patientInfoService;
    }

    @PostMapping
    public ResponseEntity<?> createPatientInfo(@RequestBody PatientInfoRequestDto patientInfoRequestDto) {
        Result<PatientInfo> result = patientInfoService.CreatePatientInfo(patientInfoRequestDto);
        if(!result.isSuccess){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result.error);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(result.value);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPatientInfoById(@PathVariable Long id) {
        Result<PatientInfo> result = patientInfoService.GetPatientInfoById(id);
        if(!result.isSuccess){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result.error);
        }
        return ResponseEntity.ok(result.value);
    }

    @DeleteMapping()
    public ResponseEntity<?> deletePatientInfo(@RequestParam Long patientInfoId) {
        boolean result = patientInfoService.DeletePatientInfo(patientInfoId);
        if(!result){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("PatientInfo not found");
        }
        return ResponseEntity.ok("PatientInfo deleted");
    }

}
