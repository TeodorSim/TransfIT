package com.example.service.dental;

import com.example.model.entities.dental.Patient;
import com.example.model.entities.dental.PatientInfo;
import com.example.repository.dental.PatientInfoRepository;
import com.example.repository.dental.PatientInfoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientInfoService {
    private PatientInfoRepository patientInfoRepository;

    @Autowired
    public PatientInfoService(PatientInfoRepository patientInfoRepository) {
        this.patientInfoRepository = patientInfoRepository;
    }

    /**
     * Fetch the patientInfo with the mentioned {@code id},
     * or return an error .
     * @param id the patientInfo id
     * @return {@code PatientInfo} entinty data OR {@code Error} "PatientInfo not found with id: {id}".
     */
    public PatientInfo getPatientById(Long id) {
        Optional<PatientInfo> patientInfo = patientInfoRepository.findById(id);
        return patientInfo.orElseThrow(() -> new EntityNotFoundException("PatientInfo not found with id: " + id));
    }

    /**
     * Fetch all patientInfo, or return error
     * @return {@code List of  patientInfo} or {@code Error} "No PatientInfo found.".
     */
    public List<PatientInfo> getAllPatients(){
        var allPatientsInfo = patientInfoRepository.findAll();
        if(allPatientsInfo.isEmpty()){
            throw new EntityNotFoundException("No PatientInfo found.");
        }
        return allPatientsInfo;
    }

    /**
     * Save the new {@code patientInfo} received.
     * Throw error if the new patientInfo can't be saved.
     * @param patientInfo new PatientInfo to save
     * @return new {@code PatientInfo} or {@code Error} Failed to store the new patientInfo.
     */
    public PatientInfo savePatient(PatientInfo patientInfo) {
        try{
            return patientInfoRepository.save(patientInfo);
        } catch (Exception e){
            throw new RuntimeException("Failed to store the new patient");
        }
    }
}
