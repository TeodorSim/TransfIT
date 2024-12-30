package com.example.model.entities;

import com.example.model.common.Result;
import jakarta.persistence.*;

@Entity
@Table(name = "users") // Custom table name
public class UserClass{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String password;
    private String email;

    public UserClass() {}
    protected UserClass(String username, String password, String email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }
    public static Result<UserClass> CreateUserClass(String username, String password, String email){
        return Result.Success(new UserClass(username, password, email));
    }

    public Long getId() {
        return id;
    }
    public String getUsername() { return username;}
    public String getPassword() { return password;}
    public String getEmail() { return email;}
}
