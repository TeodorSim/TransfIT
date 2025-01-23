package com.example.model.usecase.UserAccount;

import com.example.infrastructure.persistence.useraccount.UserAccountRepositoryV2;

public class DeleteUserAccountUseCase {
    private final UserAccountRepositoryV2 userAccountRepository;
    public DeleteUserAccountUseCase(UserAccountRepositoryV2 userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public boolean execute(Long userAccountId) {
        if(userAccountRepository.existsById(userAccountId)){
            userAccountRepository.deleteById(userAccountId);
            return true;
        }
        return false;
    }
}
