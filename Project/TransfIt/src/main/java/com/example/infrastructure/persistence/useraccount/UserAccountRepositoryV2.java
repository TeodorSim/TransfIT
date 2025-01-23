package com.example.infrastructure.persistence.useraccount;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.model.entities.useraccount.UserAccount;

import java.util.Optional;

public interface UserAccountRepositoryV2 extends JpaRepository<UserAccount, Long> {
    boolean existsByUsername(String username);
    Optional<UserAccount> findByUsername(String username);
}
