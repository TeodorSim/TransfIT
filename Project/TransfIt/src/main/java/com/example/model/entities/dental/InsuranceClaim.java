package com.example.model.entities.dental;

import com.example.model.common.Result;
import jakarta.persistence.*;


@Entity
@Table(name = "Insurance_claim")
public class InsuranceClaim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "claim_id")
    private Long claimId;

    @OneToOne
    @JoinColumn(name = "patient_sin", nullable = false, referencedColumnName = "patient_sin")
    private PatientInfo patientSin;

    @Column(name = "insurance_company", nullable = false)
    private String insuranceCompany;

    @Column(name = "plan_number", nullable = false)
    private Integer planNumber;

    @Column(name = "coverage", nullable = false)
    private Double coverage;

    @OneToOne
    @JoinColumn(name = "invoice_id", nullable = false, referencedColumnName = "invoice_id")
    private Invoice invoice_id;

    public InsuranceClaim() {}

    protected InsuranceClaim(PatientInfo patientSin, String insuranceCompany, Integer planNumber, Double coverage, Invoice invoice_id) {
        this.patientSin = patientSin;
        this.insuranceCompany = insuranceCompany;
        this.planNumber = planNumber;
        this.coverage = coverage;
        this.invoice_id = invoice_id;
    }

    public Result<InsuranceClaim> createInsuranceClaim(PatientInfo patientSin, String insuranceCompany, Integer planNumber, Double coverage) {
        return Result.Success(new InsuranceClaim(patientSin, insuranceCompany, planNumber, coverage, invoice_id));
    }

    public Long getId() {
        return claimId;
    }
    public PatientInfo getPatientSin() {
        return patientSin;
    }
    public String getInsuranceCompany() {
        return insuranceCompany;
    }
    public Integer getPlanNumber() {
        return planNumber;
    }
    public Double getCoverage() {
        return coverage;
    }
    public Invoice getInvoice_id() {
        return invoice_id;
    }
}
