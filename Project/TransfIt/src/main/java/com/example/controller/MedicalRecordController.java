package com.example.controller;

import com.example.model.common.Result;
import com.example.model.entities.MedicalRecord;
import com.example.service.MedicalRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/records")
public class MedicalRecordController {
    @Autowired
    private MedicalRecordService medicalRecordService;

    @GetMapping
    public List<MedicalRecord> getAllMedicalRecords() {
        var received = medicalRecordService.getAllRecords();
        return received;
    }


    @GetMapping("getById")
    public MedicalRecord getMedicalRecordById(@RequestParam Long id) {
        return medicalRecordService.getRecordById(id);
    }

    @PostMapping
    public ResponseEntity<?> createMedicalRecord(@RequestBody MedicalRecord medicalRecord) {
        // Usage of the factory method
        Result<MedicalRecord> result = MedicalRecord.createMedicalRecord(
                medicalRecord.getDiagnosis(),
                medicalRecord.getTreatment(),
                medicalRecord.getPatient()
        );

        if(!result.isSuccess){
            // If creation fails, returns a bad request with the error message
            return ResponseEntity.badRequest().body(result.error);
        }

        medicalRecordService.saveMedicalRecord(result.value);
        return ResponseEntity.ok().build();
    }
}
