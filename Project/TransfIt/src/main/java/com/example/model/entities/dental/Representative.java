package com.example.model.entities.dental;

import com.example.model.common.Result;
import jakarta.persistence.*;

// Entity for Representative
@Entity
@Table(name = "Representative")
public class Representative {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "representative_id")
    private Long representativeId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "address", nullable = false)
    private String address;

    public Representative() {}

    public Representative(String name, String email, String phone, String address) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
    }

    public static Result<Representative> createRepresentative(String name, String email, String phone, String address) {
        return Result.Success(new Representative(name, email, phone, address));
    }

    public Long geId() {
        return representativeId;
    }
    public String getName() {
        return name;
    }
    public String getEmail() {
        return email;
    }
    public String getPhone() {
        return phone;
    }
    public String getAddress() {
        return address;
    }

}