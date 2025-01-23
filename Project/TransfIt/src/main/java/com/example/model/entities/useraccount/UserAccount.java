package com.example.model.entities.useraccount;

import com.example.model.common.Result;
import com.example.model.entities.dental.Employee;
import com.example.model.entities.dental.Patient;
import jakarta.persistence.*;

@Entity
@Table(name = "user_account")
public class UserAccount {
    @Id
    //@GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "username", nullable = false)
    protected String username;

    @Column(name = "password", nullable = false)
    protected String password;

    @Column(name = "type_id", nullable = false)
    private Integer typeId;
    /*
       type_id 0 -> patient, 1 -> employee, 2 -> employee and patient
    */

    @OneToOne
    @JoinColumn(name = "patient_id", referencedColumnName = "patient_id")
    private Patient patientId;

    @OneToOne
    @JoinColumn(name = "employee_id", referencedColumnName = "employee_id")
    private Employee employeeId;

    public UserAccount() {}

    protected UserAccount(String username, String password, Integer typeId, Patient patientId, Employee employeeId) {
        this.username = username;
        this.password = password;
        this.typeId = typeId;
        this.patientId = patientId;
        this.employeeId = employeeId;
    }

    public static Result<UserAccount> createUserAccount(String username, String password, Integer typeId, Patient patientId, Employee employeeId) {
        return Result.Success(new UserAccount(username, password, typeId, patientId, employeeId));
    }

    public String getUsername() {
        return username;
    }
    public String getPassword() {
        return password;
    }
    public Integer getTypeId() {
        return typeId;
    }
    public Patient getPatientId() {
        return patientId;
    }
    public Employee getEmployeeId() {
        return employeeId;
    }
}
