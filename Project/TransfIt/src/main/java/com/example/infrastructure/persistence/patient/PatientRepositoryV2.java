package com.example.infrastructure.persistence.patient;
import com.example.model.entities.dental.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


// Better to work with JpaRepository, as the requirements are not complex
@Repository
public interface PatientRepositoryV2 extends JpaRepository<Patient, Long> {
}
