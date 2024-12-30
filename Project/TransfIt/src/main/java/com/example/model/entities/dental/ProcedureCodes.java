package com.example.model.entities.dental;

import com.example.model.common.Result;
import jakarta.persistence.*;

@Entity
@Table(name = "Procedure_codes")
public class ProcedureCodes {
    /*
    (1: Teeth Cleanings,
    2: Teeth Whitening,
    3: Extractions,
    4: Veneers,
    5: Fillings,
    6: Crowns,
    7: Root Canal,
    8: Braces/Invisalign,
    9: Bonding,
    10: Dentures)
     */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "procedure_code")
    private Integer procedureCode;

    @Column(name = "procedure_name")
    private String procedureName;

    public ProcedureCodes() {}

    protected ProcedureCodes(Integer procedureCode, String procedureName) {
        this.procedureCode = procedureCode;
        this.procedureName = procedureName;
    }

    public Result<ProcedureCodes> createNewProcedureCode(Integer procedureCode, String procedureName) {
        return Result.Success(new ProcedureCodes(procedureCode, procedureName));
    }

    public Integer getId() {
        return procedureCode;
    }

    public String getProcedureName() {
        return procedureName;
    }

}
