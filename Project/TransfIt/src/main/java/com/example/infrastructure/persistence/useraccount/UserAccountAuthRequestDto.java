package com.example.infrastructure.persistence.useraccount;

public class UserAccountAuthRequestDto {
    public String username;
    public String password;
    public UserAccountAuthRequestDto(){}
    public String getPassword() {
        return password;
    }

    public String getUsername() {
        return username;
    }
}
