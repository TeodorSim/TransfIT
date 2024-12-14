package com.example.model.entities;

import com.example.model.common.Result;
import jakarta.persistence.*;

@Entity
@Table(name = "users") // Custom table name
public class User{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String password;
    private String email;

    public User() {}
    protected User(String username, String password, String email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }
    public static Result<User> CreateUser(String username, String password, String email){
        return Result.Success(new User(username, password, email));
    }

    public Long getId() {
        return id;
    }
    public String getUsername() { return username;}
    public String getPassword() { return password;}
    public String getEmail() { return email;}
}
