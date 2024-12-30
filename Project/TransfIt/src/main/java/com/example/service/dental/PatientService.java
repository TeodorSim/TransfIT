package com.example.service.dental;

import com.example.model.entities.dental.Patient;
import com.example.repository.dental.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {
    private PatientRepository patientRepository;

    @Autowired
    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    /**
     * Fetch the person with the mentioned {@code id},
     * or return an error .
     * @param id the patient id
     * @return {@code Patient} entinty data OR {@ccode Error} "Patient not found with id: {id}".
     */
    public Patient getPatientById(Long id) {
        Optional<Patient> patient = patientRepository.findById(id);
        return patient.orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + id));
    }

    /**
     * Fetch all patients, or return error
     * @return {@code List of  patients} or {@code Error} "No Patients found.".
     */
    public List<Patient> getAllPatients(){
        var allPatients = patientRepository.findAll();
        if(allPatients.isEmpty()){
            throw new EntityNotFoundException("No Patients found.");
        }
        return allPatients;
    }

    /**
     * Save the new {@code patient} received.
     * Throw error if the new patient can't be saved.
     * @param patient new Patient to save
     * @return new {@code Patient} or {@code Error} Failed to store the new patient.
     */
    public Patient savePatient(Patient patient) {
        try{
            return patientRepository.save(patient);
        } catch (Exception e){
            throw new RuntimeException("Failed to store the new patient");
        }
    }


}
