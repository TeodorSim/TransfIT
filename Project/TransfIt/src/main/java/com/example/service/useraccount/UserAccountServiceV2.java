package com.example.service.useraccount;

import com.example.infrastructure.persistence.useraccount.UserAccountRequestDto;
import com.example.model.entities.useraccount.UserAccount;
import com.example.model.common.Result;
import com.example.model.usecase.UserAccount.CreateUserAccountUseCase;
import com.example.model.usecase.UserAccount.DeleteUserAccountUseCase;
import com.example.model.usecase.UserAccount.GetUserAccountByUsernameAndPasswordUseCase;

public class UserAccountServiceV2 {
    private final CreateUserAccountUseCase createUserAccountUseCase;
    private final DeleteUserAccountUseCase deleteUserAccountUseCase;
    private final GetUserAccountByUsernameAndPasswordUseCase getUserAccountByUsernameAndPasswordUseCase;
    public UserAccountServiceV2(CreateUserAccountUseCase createUserAccountUseCase, DeleteUserAccountUseCase deleteUserAccountUseCase, GetUserAccountByUsernameAndPasswordUseCase getUserAccountByUsernameAndPasswordUseCase){
        this.createUserAccountUseCase = createUserAccountUseCase;
        this.deleteUserAccountUseCase = deleteUserAccountUseCase;
        this.getUserAccountByUsernameAndPasswordUseCase = getUserAccountByUsernameAndPasswordUseCase;
    }

    public Result<UserAccount> CreateUserAccount(UserAccountRequestDto userAccount) {
        return createUserAccountUseCase.execute(userAccount);
    }


    public boolean DeleteUserAccount(Long userAccountId){
        return deleteUserAccountUseCase.execute(userAccountId);
    }

    public Result<UserAccount> GetUserAccountByUsernameAndPassword(String username, String password){
        return getUserAccountByUsernameAndPasswordUseCase.execute(username, password);
    }

}
