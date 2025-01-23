package com.example.infrastructure.persistence.patient;

import com.example.model.entities.dental.Patient;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Repository;

import java.util.List;

/*
@Repository
public class JpaPatientRepository implements PatientRepository{
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Patient save(Patient patient) {
        entityManager.persist(patient);
        return patient;
    }

    @Override
    public Patient findById(Long id) {
        return entityManager.find(Patient.class, id);
    }
}*/
