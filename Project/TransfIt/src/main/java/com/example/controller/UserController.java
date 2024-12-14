package com.example.controller;

import com.example.model.common.Result;
import com.example.model.entities.MedicalRecord;
import com.example.model.entities.User;
import com.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/user/" + 1.1)
public class UserController {
    @Autowired
    private UserService userService;

    //@GetMapping("/getAll")

    @GetMapping()
    public List<User> getUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/getById")
    //@GetMapping()
    public User getUserById(Long id) {
        return userService.getUserById(id);
    }

    //@PostMapping("/create")
    @PostMapping()
    public ResponseEntity<?>  createUser(@RequestBody User user) {

        // Usage of the factory method
        Result<User> result = User.CreateUser(
                user.getUsername(),
                user.getPassword(),
                user.getEmail()
        );

        if(!result.isSuccess){
            // If creation fails, returns a bad request with the error message

            return ResponseEntity.badRequest().body(result.error);
        }

        userService.saveUser(result.value);
        return ResponseEntity.ok().build();
    }
}
