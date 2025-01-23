package com.example.infrastructure.persistence.patientinfo;

import com.example.model.entities.dental.PatientInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientInfoRepositoryV2 extends JpaRepository<PatientInfo, Long> {
}
