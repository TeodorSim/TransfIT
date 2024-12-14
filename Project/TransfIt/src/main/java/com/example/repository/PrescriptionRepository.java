package com.example.repository;

import com.example.model.entities.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrescriptionRepository extends JpaRepository<Prescription
        , Long> {
}
