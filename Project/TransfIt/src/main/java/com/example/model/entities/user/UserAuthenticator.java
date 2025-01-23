package com.example.model.entities.user;


import com.example.model.entities.useraccount.UserAccount;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

/**
 * Represents a user in the system with security details.
 */
public class UserAuthenticator  extends UserAccount implements UserDetails {
    private final UserAccount userAccount;

    public UserAuthenticator(UserAccount userAccount){
        this.userAccount = userAccount;
    }

    /**
     * Returns the authorities granted to the user.
     * @return a collection of GrantedAuthority objects
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Split the authorities string and convert to a list of SimpleGrantedAuthority objects
        return RoleMapper.mapTypeIdToAuthority(userAccount.getTypeId());
    }

    /**
     * Returns the password used to authenticate the user.
     * @return the password
     */
    @Override
    public String getPassword() {
        return userAccount.getPassword();
    }

    /**
     * Returns the username used to authenticate the user.
     * @return the username
     */
    @Override
    public String getUsername() {
        return userAccount.getUsername();
    }

    /**
     * Indicates whether the user's account has expired.
     * @return true if the account is non-expired, false otherwise
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user is locked or unlocked.
     * @return true if the account is non-locked, false otherwise
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * Indicates whether the user's credentials have expired.
     * @return true if the credentials are non-expired, false otherwise
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user is enabled.
     * @return true if the user is enabled, false otherwise
     */
    @Override
    public boolean isEnabled() {
        return true;
    }
}