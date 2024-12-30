package com.example.model.entities.dental;

import com.example.model.common.Result;
import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name = "Patient_billing")
public class PatientBilling {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bill_id", nullable = false)
    private Long billId;

    @OneToOne
    @JoinColumn(name = "patient_id", nullable = false, referencedColumnName = "patient_id")
    private Patient patientId;

    @Column(name = "patient_amount", nullable = false)
    private Double patientAmount;

    @Column(name = "insurance_amount", nullable = false)
    private Double insuranceAmount;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "payment_type", nullable = false)
    private String paymentType;

    public PatientBilling() {}

    protected PatientBilling(Patient patientId, Double patientAmount, Double insuranceAmount, Double totalAmount, String paymentType) {
        this.patientId = patientId;
        this.patientAmount = patientAmount;
        this.insuranceAmount = insuranceAmount;
        this.totalAmount = totalAmount;
        this.paymentType = paymentType;
    }

    public Result<PatientBilling> createPatientBilling(Patient patientId, Double patientAmount, Double insuranceAmount, Double totalAmount, String paymentType) {
        return Result.Success(new PatientBilling(patientId, patientAmount, insuranceAmount, totalAmount, paymentType));
    }
    public Long getId(){
        return billId;
    }
    public Patient getPatientId() {
        return patientId;
    }
    public Double getPatientAmount() {
        return patientAmount;
    }
    public Double getInsuranceAmount() {
        return insuranceAmount;
    }
    public Double getTotalAmount() {
        return totalAmount;
    }
    public String getPaymentType() {
        return paymentType;
    }
}
