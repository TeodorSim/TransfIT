package com.example.model.entities.user;

import org.springframework.security.core.GrantedAuthority;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class RoleMapper {
    public static Collection<? extends GrantedAuthority> mapTypeIdToAuthority(Integer typeId) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        if(typeId == 0){
            authorities.add(() -> "ROLE_PATIENT");
        } else if(typeId == 1){
            authorities.add(() -> "ROLE_EMPLOYEE");
        } else if(typeId == 2){
            authorities.add(() -> "ROLE_PATIENT");
            authorities.add(() -> "ROLE_EMPLOYEE");
        }
        return authorities;
    }
}
