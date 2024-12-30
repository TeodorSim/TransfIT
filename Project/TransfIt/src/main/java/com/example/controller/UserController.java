package com.example.controller;

import com.example.model.common.Result;
import com.example.model.entities.UserClass;
import com.example.service.UserClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/user/" + 1.1)
public class UserController {
    @Autowired
    private UserClassService UserClassService;

    //@GetMapping("/getAll")

    @GetMapping()
    public List<UserClass> getUsers() {
        return UserClassService.getAllUserClasss();
    }

    @GetMapping("/getById")
    //@GetMapping()
    public UserClass getUserById(@RequestParam Long id) {
        return UserClassService.getUserClassById(id);
    }

    //@PostMapping("/create")
    @PostMapping()
    public ResponseEntity<?>  createUser(@RequestBody UserClass user) {

        // Usage of the factory method
        Result<UserClass> result = UserClass.CreateUserClass(
                user.getUsername(),
                user.getPassword(),
                user.getEmail()
        );

        if(!result.isSuccess){
            // If creation fails, returns a bad request with the error message

            return ResponseEntity.badRequest().body(result.error);
        }

        UserClassService.saveUserClass(result.value);
        return ResponseEntity.ok().build();
    }
}
