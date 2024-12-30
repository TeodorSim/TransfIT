package com.example.model.entities.dental;

import com.example.model.common.Result;
import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name = "Appointment_procedure")
public class AppointmentProcedure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "procedure_id", nullable = false)
    private Long procedureId;

    @OneToOne
    @JoinColumn(name = "appointment_id", nullable = false, referencedColumnName = "appointment_id")
    private Appointment appointmentId;

    @OneToOne
    @JoinColumn(name = "patient_id", nullable = false, referencedColumnName = "patient_id")
    private Patient patientId;

    @Column(name = "date_of_procedure", nullable = false)
    private Date dateProcedure;

    @OneToOne
    @JoinColumn(name = "invoice_id", referencedColumnName = "invoice_id")
    private Invoice invoiceId;

    @OneToOne
    @JoinColumn(name = "procedure_code", nullable = false, referencedColumnName = "procedure_code")
    private ProcedureCodes procedureCode;

    @Column(name = "appointment_description", nullable = false)
    private String appointmentDescription;

    @Column(name = "tooth", nullable = false)
    private Integer tooth;

    @Column(name = "amount_of_procedure", nullable = false)
    private Integer amountProcedure;

    @Column(name = "patient_charge")
    private Double patientCharge;

    @Column(name = "insurance_charge")
    private Double insuranceCharge;

    @Column(name = "total_charge", nullable = false)
    private Double totalCharge;

    @ManyToOne
    @JoinColumn(name = "insurance_claim_id", referencedColumnName = "claim_id")
    private InsuranceClaim insuranceClaimId;

    public AppointmentProcedure() {}

    protected AppointmentProcedure(Appointment appointmentId, Patient patientId, Date dateProcedure, Invoice invoiceId, ProcedureCodes procedureCode,
                          String appointmentDescription, Integer tooth,  Integer amountProcedure, Double patientCharge, Double insuranceCharge,
                          Double totalCharge, InsuranceClaim insuranceClaimId){
        this.appointmentId = appointmentId;
        this.patientId = patientId;
        this.dateProcedure = dateProcedure;
        this.invoiceId = invoiceId;
        this.procedureCode = procedureCode;
        this.appointmentDescription = appointmentDescription;
        this.tooth = tooth;
        this.amountProcedure = amountProcedure;
        this.patientCharge = patientCharge;
        this.insuranceCharge = insuranceCharge;
        this.totalCharge = totalCharge;
        this.insuranceClaimId = insuranceClaimId;
    }

    public Result<AppointmentProcedure> createAppointmentProcedure(Appointment appointmentId, Patient patientId, Date dateProcedure, Invoice invoiceId, ProcedureCodes procedureCode,
                                                                   String appointmentDescription, Integer tooth,  Integer amountProcedure, Double patientCharge, Double insuranceCharge,
                                                                   Double totalCharge, InsuranceClaim insuranceClaimId){
        return Result.Success(new AppointmentProcedure(appointmentId, patientId, dateProcedure, invoiceId, procedureCode, appointmentDescription, tooth, amountProcedure, patientCharge, insuranceCharge, totalCharge, insuranceClaimId));
    }
    public Long getId(){
        return procedureId;
    }
    public Appointment getAppointmentId() {
        return appointmentId;
    }
    public Patient getPatientId() {
        return patientId;
    }
    public Date getDateProcedure() {
        return dateProcedure;
    }
    public Invoice getInvoiceId() {
        return invoiceId;
    }
    public ProcedureCodes getProcedureCode() {
        return procedureCode;
    }
    public String getAppointmentDescription() {
        return appointmentDescription;
    }
    public Integer getTooth() {
        return tooth;
    }
    public Integer getAmountProcedure() {
        return amountProcedure;
    }
    public Double getPatientCharge() {
        return patientCharge;
    }
    public Double getInsuranceCharge() {
        return insuranceCharge;
    }
    public Double getTotalCharge() {
        return totalCharge;
    }
    public InsuranceClaim getInsuranceClaimId() {
        return insuranceClaimId;
    }

}
