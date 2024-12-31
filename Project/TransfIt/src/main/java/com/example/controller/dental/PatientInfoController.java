package com.example.controller.dental;

import com.example.model.common.Result;
import com.example.model.entities.dental.Patient;
import com.example.model.entities.dental.PatientInfo;
import com.example.service.dental.PatientInfoService;
import com.example.service.dental.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patientinfo")
public class PatientInfoController {

    @Autowired
    private PatientInfoService patientInfoService;

    @GetMapping()
    public List<PatientInfo> getPatients(){
        return patientInfoService.getAllPatients();
    }

    @GetMapping("/getById")
    public PatientInfo getPatientById(@RequestParam Long id){
        return patientInfoService.getPatientById(id);
    }

    @PostMapping
    public ResponseEntity<?> createPatient(@RequestBody PatientInfo patientInfo){
        Result<PatientInfo> result = PatientInfo.createPatientInfo(
                patientInfo.getAddress(), patientInfo.getName(), patientInfo.getGender(),
                patientInfo.getEmail(), patientInfo.getPhone(), patientInfo.getDateOfBirth(),
                patientInfo.getInsurance(), patientInfo.getRepresentative()
        );
        if (!result.isSuccess){
            // If creation fails, return a vad request with the error message

            return ResponseEntity.badRequest().body(result.error);
        }

        patientInfoService.savePatient(patientInfo);
        return ResponseEntity.ok().build();
    }
}
