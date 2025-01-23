package com.example.infrastructure.api;

import com.example.infrastructure.persistence.useraccount.UserAccountAuthRequestDto;
import com.example.infrastructure.persistence.useraccount.UserAccountRequestDto;
import com.example.model.entities.useraccount.UserAccount;
import com.example.service.useraccount.UserAccountServiceV2;
import org.apache.catalina.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.model.common.Result;

@RestController
@RequestMapping("/api/user/v2")
public class UserAccountControllerV2 {
    private final UserAccountServiceV2 userAccountService;

    public UserAccountControllerV2(UserAccountServiceV2 userAccountService){
        this.userAccountService = userAccountService;
    }

    @GetMapping("/login/")
    @ResponseBody
    public ResponseEntity<?> getUserAccountByUsernameAndPassword(
            @RequestParam("username") String username,
            @RequestParam("password") String password) {
        Result<UserAccount> result = userAccountService.GetUserAccountByUsernameAndPassword(username, password);
        if (!result.isSuccess) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result.error);
        }
        return ResponseEntity.ok(result.value);
    }

    @PostMapping()
    public ResponseEntity<?> createUserAccount(@RequestBody UserAccountRequestDto userAccountRequestDto){
        Result<UserAccount> result = userAccountService.CreateUserAccount(userAccountRequestDto);
        if(!result.isSuccess){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result.error);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(result.value);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUserAccount(@RequestBody Long id){
        boolean result = userAccountService.DeleteUserAccount(id);
        if(!result){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("UserAccount not found.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body("UserAccount deleted.");
    }
}
