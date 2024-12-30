package com.example.model.entities.dental;

import com.example.model.common.Result;
import jakarta.persistence.*;

@Entity
@Table(name = "Fee_charge")
public class FeeCharge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fee_id", nullable = false)
    private Integer feeId;

    @OneToOne
    @JoinColumn(name = "procedure_id", nullable = false, referencedColumnName = "procedure_id")
    private AppointmentProcedure procedureId;

    @Column(name = "fee_code", nullable = false)
    private Integer feeCode;

    @Column(name = "charge", nullable = false)
    private Double charge;

    public FeeCharge() {}

    protected FeeCharge(AppointmentProcedure procedureId, Integer feeCode, Double charge) {
        this.procedureId = procedureId;
        this.feeCode = feeCode;
        this.charge = charge;
    }

    public Result<FeeCharge> createFeeCharge(AppointmentProcedure procedureId, Integer feeCode, Double charge) {
        return Result.Success(new FeeCharge(procedureId, feeCode, charge));
    }

    public Integer getId() {
        return feeId;
    }
    public AppointmentProcedure getProcedureId() {
        return procedureId;
    }
    public Integer getFeeCode() {
        return feeCode;
    }
    public Double getCharge() {
        return charge;
    }
}
