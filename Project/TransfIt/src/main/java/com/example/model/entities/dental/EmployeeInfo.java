package com.example.model.entities.dental;

import com.example.model.common.Result;
import jakarta.persistence.*;

@Entity
@Table(name = "Employee_info")
public class EmployeeInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_sin", nullable = false)
    private Integer employeeSin;

    @Column(name = "employee_type", nullable = false)
    private Character employeeType;
    /*
    'r'eceptionist, 'd'entist, 'h'ygienist, 'b'ranch manager
     */

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "annual_salary", nullable = false)
    private Double annualSalary;

    public EmployeeInfo() {}

    protected EmployeeInfo(Character employeeType, String name, String address, Double annualSalary) {
        this.employeeType = employeeType;
        this.name = name;
        this.address = address;
        this.annualSalary = annualSalary;
    }

    public Result<EmployeeInfo> createEmployeeInfo(Character employeeType, String name, String address, Double annualSalary) {
        return Result.Success(new EmployeeInfo(employeeType, name, address, annualSalary));
    }
    public Integer getId(){
        return employeeSin;
    }
    public Character getEmployeeType() {
        return employeeType;
    }
    public String getName() {
        return name;
    }
    public String getAddress() {
        return address;
    }
    public Double getAnnualSalary() {
        return annualSalary;
    }
}