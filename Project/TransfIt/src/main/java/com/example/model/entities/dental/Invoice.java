package com.example.model.entities.dental;

import com.example.model.common.Result;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

// Entity for Invoice
@Entity
@Table(name = "Invoice")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Long invoiceId;

    @Column(name = "date_of_issue", nullable = false)
    private LocalDate dateOfIssue;

    @Column(name = "contact_info", nullable = false)
    private String contactInfo;

    @Column(name = "patient_charge", nullable = false)
    private BigDecimal patientCharge;

    @Column(name = "insurance_charge", nullable = false)
    private BigDecimal insuranceCharge;

    @Column(name = "discount", nullable = false)
    private BigDecimal discount;

    @Column(name = "penalty", nullable = false)
    private BigDecimal penalty;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    public Invoice() {}

    protected Invoice(LocalDate dateOfIssue, String contactInfo, BigDecimal patientCharge, BigDecimal insuranceCharge, BigDecimal discount, BigDecimal penalty, Patient patient) {
        this.dateOfIssue = dateOfIssue;
        this.contactInfo = contactInfo;
        this.patientCharge = patientCharge;
        this.insuranceCharge = insuranceCharge;
        this.discount = discount;
        this.penalty = penalty;
        this.patient = patient;
    }

    public static Result<Invoice> createInvoice(LocalDate dateOfIssue, String contactInfo, BigDecimal patientCharge, BigDecimal insuranceCharge, BigDecimal discount, BigDecimal penalty, Patient patient) {
        return Result.Success(new Invoice(dateOfIssue, contactInfo, patientCharge, insuranceCharge, discount, penalty, patient));
    }

    public Long getId() {
        return invoiceId;
    }
    public LocalDate getDateOfIssue() {
        return dateOfIssue;
    }
    public String getContactInfo() {
        return contactInfo;
    }
    public BigDecimal getPatientCharge() {
        return patientCharge;
    }
    public BigDecimal getInsuranceCharge() {
        return insuranceCharge;
    }
    public BigDecimal getDiscount() {
        return discount;
    }
    public BigDecimal getPenalty() {
        return penalty;
    }
    public Patient getPatient() {
        return patient;
    }

}
