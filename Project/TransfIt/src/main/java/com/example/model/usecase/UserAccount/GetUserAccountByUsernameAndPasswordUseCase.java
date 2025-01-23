package com.example.model.usecase.UserAccount;

import com.example.infrastructure.persistence.useraccount.UserAccountRepositoryV2;

import com.example.infrastructure.persistence.useraccount.UserAccountRequestDto;
import com.example.model.common.Result;
import com.example.model.entities.useraccount.UserAccount;

import java.util.Optional;

public class GetUserAccountByUsernameAndPasswordUseCase {
    private final UserAccountRepositoryV2 userAccountRepository;
    public GetUserAccountByUsernameAndPasswordUseCase(UserAccountRepositoryV2 userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }
    public Result<UserAccount> execute(String username, String password) {
        if(username == null || password == null) {
            return Result.Failure(null, "Username or password is null");
        }
        Optional<UserAccount> userAccount = userAccountRepository.findByUsername(username);
        if (userAccount.isPresent() && userAccount.get().getPassword().equals(password)) {
            return Result.Success(userAccount.get());
        }
        return Result.Failure(null, "User Account not found");
    }
}
