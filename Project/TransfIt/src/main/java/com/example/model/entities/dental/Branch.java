package com.example.model.entities.dental;

import com.example.model.common.Result;
import jakarta.persistence.*;

@Entity
@Table(name = "Branch")
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "branch_id")
    private Integer branchId;

    @Column(name = "city", nullable = false)
    private String city;

    @OneToOne
    @JoinColumn(name = "manager_id", nullable = true, referencedColumnName = "employee_id")
    private Employee managerId;

    @OneToOne
    @JoinColumn(name = "receptionist1_id", nullable = true, referencedColumnName = "employee_id")
    private Employee receptionist1Id;

    @OneToOne
    @JoinColumn(name = "receptionist2_id", nullable = true, referencedColumnName = "employee_id")
    private Employee receptionist2Id;

    public Branch() {}

    protected Branch(String city, Employee managerId, Employee receptionist1Id, Employee receptionist2Id) {
        this.city = city;
        this.managerId = managerId;
        this.receptionist1Id = receptionist1Id;
        this.receptionist2Id = receptionist2Id;
    }

    public Result<Branch> createBranch(String city, Employee managerId, Employee receptionist1Id, Employee receptionist2Id) {
        return Result.Success(new Branch(city, managerId, receptionist1Id, receptionist2Id));
    }

    public Integer getId() {
        return branchId;
    }
    public String getCity() {
        return city;
    }
    public Employee getManagerId() {
        return managerId;
    }
    public Employee getReceptionist1Id() {
        return receptionist1Id;
    }
    public Employee getReceptionist2Id() {
        return receptionist2Id;
    }
}
