package com.example.service;

import com.example.model.entities.MedicalRecord;
import com.example.repository.MedicalRecordRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;

    @Autowired
    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
    }

    /**
     *Fetch all medical records. Throw error if no records are found.
     *
     * @return List</MedicalRecord> or </Error>
     */
    public List<MedicalRecord> getAllRecords(){
        var allRecords = medicalRecordRepository.findAll();
        if (allRecords.isEmpty()){
            throw new EntityNotFoundException("No medical records found");
        }
        return allRecords;
    }


    /**
     *Fetch the medical record with the specified Id.
     *  Throw error if no record is found.
     * @param idReceived - Long
     * @return </MedicalRecord> or </Error>
     */
    public MedicalRecord getRecordById(Long idReceived){
        Optional<MedicalRecord> theRecords = medicalRecordRepository.findById(idReceived);
        if (theRecords.isEmpty()){
            throw new EntityNotFoundException("No medical record found");
        }
        return theRecords.orElseThrow(() -> new EntityNotFoundException("No medical record found with id = " + idReceived));
    }

    /**
     * Save the new medical record received via parameter.
     * Throw error if the data can't be saved as a medical record.
     * @param medicalRecord : {username, password, email}
     * @return </MedicalRecord> or </Error>
     */
    public MedicalRecord saveMedicalRecord(MedicalRecord medicalRecord){
        try {
            return medicalRecordRepository.save(medicalRecord);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save the medical record: " + e.getMessage());
        }
    }

}
