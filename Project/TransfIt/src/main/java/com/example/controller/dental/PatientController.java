package com.example.controller.dental;

import com.example.model.common.Result;
import com.example.model.entities.Patients;
import com.example.model.entities.dental.Patient;
import com.example.service.dental.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient")
public class PatientController {
    @Autowired
    private PatientService patientService;

    @GetMapping()
    public List<Patient> getPatients(){
        return patientService.getAllPatients();
    }

    @GetMapping("/getById")
    public Patient getPatientById(@RequestParam Long id){
        return patientService.getPatientById(id);
    }

    @PostMapping
    public ResponseEntity<?> createPatient(@RequestBody Patient patient){
        Result<Patient> result = Patient.createPatient(patient.getSinInfo());
        if (!result.isSuccess){
            // If creation fails, return a vad request with the error message

            return ResponseEntity.badRequest().body(result);
        }

        patientService.savePatient(patient);
        return ResponseEntity.ok().build();
    }
}
