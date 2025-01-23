package com.example.model.usecase.UserAccount;

import com.example.infrastructure.persistence.useraccount.UserAccountRepositoryV2;
import com.example.infrastructure.persistence.useraccount.UserAccountRequestDto;
import com.example.model.common.Result;
import com.example.model.entities.useraccount.UserAccount;
import org.apache.catalina.User;

public class CreateUserAccountUseCase {
    private final UserAccountRepositoryV2 userAccountRepository;
    public CreateUserAccountUseCase(UserAccountRepositoryV2 userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public Result<UserAccount> execute(UserAccountRequestDto userAccount) {
        /*
            Patient attributes
         */
        if (userAccount.getTypeId() == 0 && userAccount.getEmployeeId() != null) {
            return Result.Failure(null, "Employee Id should be null when type_id is set on 0, meaning Patient");
        }
        /*
            Employee attributes
         */
        else if (userAccount.getTypeId() == 1 && userAccount.getPatientId() != null) {
            return Result.Failure(null, "Patient Id should be null when type_id is set on 1, meaning Employee");
        }
        /*
            Both employee and patient attributes
         */
        else if (userAccount.getTypeId() == 2 &&
                (userAccount.getPatientId() == null || userAccount.getEmployeeId() == null)) {
            return Result.Failure(null, "Both patient information and employee information should be set when type_id is set on 2.");
        }


        if(userAccountRepository.existsByUsername(userAccount.getUsername())){
            return Result.Failure(null, "The username is already in use.");
        }

        Result<UserAccount> creationResult = UserAccount.createUserAccount(
                userAccount.getUsername(),
                userAccount.getPassword(),
                userAccount.getTypeId(),
                userAccount.getPatientId(),
                userAccount.getEmployeeId()
        );
        if(!creationResult.isSuccess) {
            return creationResult;
        }
        UserAccount savedUser = userAccountRepository.save(creationResult.value);
        return Result.Success(savedUser);
    }


}
