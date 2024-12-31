package com.example.repository.dental;

import com.example.model.entities.dental.PatientInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientInfoRepository extends JpaRepository<PatientInfo,Long> {
}
