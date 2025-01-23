package com.example.config;

import com.example.infrastructure.persistence.useraccount.UserAccountRepositoryV2;
import com.example.model.usecase.UserAccount.CreateUserAccountUseCase;
import com.example.model.usecase.UserAccount.DeleteUserAccountUseCase;
import com.example.model.usecase.UserAccount.GetUserAccountByUsernameAndPasswordUseCase;
import com.example.service.useraccount.UserAccountServiceV2;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UserAccountConfig {
    @Bean
    public CreateUserAccountUseCase createUserAccountUseCase(UserAccountRepositoryV2 userAccountRepositoryV2){
        return new CreateUserAccountUseCase(userAccountRepositoryV2);
    }

    @Bean
    public GetUserAccountByUsernameAndPasswordUseCase getUserAccountByIdUseCase(UserAccountRepositoryV2 userAccountRepositoryV2) {
        return new GetUserAccountByUsernameAndPasswordUseCase(userAccountRepositoryV2);
    }

    @Bean
    public DeleteUserAccountUseCase deleteUserAccountUseCase(UserAccountRepositoryV2 userAccountRepositoryV2) {
        return new DeleteUserAccountUseCase(userAccountRepositoryV2);
    }

    @Bean
    public UserAccountServiceV2 userAccountServiceV2(CreateUserAccountUseCase createUserAccountUseCase,
                                                     DeleteUserAccountUseCase deleteUserAccountUseCase,
                                                     GetUserAccountByUsernameAndPasswordUseCase getUserAccountByUsernameAndPasswordUseCase) {
        return new UserAccountServiceV2(createUserAccountUseCase, deleteUserAccountUseCase, getUserAccountByUsernameAndPasswordUseCase);
    }
}
