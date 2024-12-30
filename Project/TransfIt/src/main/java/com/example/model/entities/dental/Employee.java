package com.example.model.entities.dental;

import com.example.model.common.Result;
import jakarta.persistence.*;

@Entity
@Table(name = "Employee")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_id", nullable = false)
    private Integer employeeId;

    @OneToOne
    @JoinColumn(name = "employee_sin", nullable = false, referencedColumnName = "employee_sin")
    private EmployeeInfo employee_sin;

    @OneToOne
    @JoinColumn(name = "branch_id", nullable = false, referencedColumnName = "branch_id")
    private Branch branch_id;

    public Employee() {}

    protected Employee(EmployeeInfo employee_sin, Branch branch_id) {
        this.employee_sin = employee_sin;
        this.branch_id = branch_id;
    }

    public Result<Employee> createEmployee(EmployeeInfo employee_sin, Branch branch_id) {
        return Result.Success(new Employee(employee_sin, branch_id));
    }
    public Integer getId(){
        return employeeId;
    }
    public EmployeeInfo getEmployee_sin() {
        return employee_sin;
    }
    public Branch getBranch_id() {
        return branch_id;
    }
}
