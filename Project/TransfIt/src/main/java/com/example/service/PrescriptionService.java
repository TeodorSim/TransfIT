package com.example.service;

import com.example.model.entities.Prescription;
import com.example.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;

@Service
public class PrescriptionService {
    @Autowired
    private PrescriptionRepository prescriptionRepository;
    public List<Prescription> findAllPrescriptionForUser(Long userId) {
        List<Prescription> allPresctiptions = prescriptionRepository.findAll();
        List<Prescription> userPrescriptions = new LinkedList<>();
        for (Prescription prescription : allPresctiptions) {
            if(prescription.getUserId().equals(userId)) {
                userPrescriptions.add(prescription);
            }
        }
        return userPrescriptions;
    }
    public Prescription findPrescriptionById(Long id) {
        return prescriptionRepository.findById(id).orElse(null);
    }
}
