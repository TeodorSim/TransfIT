package com.example.service;

import com.example.model.entities.User;
import com.example.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Fetch the user with the specified ID.
     * Return the User or error
     * @param userId : Long
     * @return <User> or <Error>
     */
    public User getUserById(Long userId) {
        Optional<User> getUserById = userRepository.findById(userId);

        if (getUserById.isEmpty()){
            throw new EntityNotFoundException("No user with id" + userId + " found by UserService.");
        }
        return getUserById.orElse(null);
    }

    /**
     * Fetch all users.
     * Throw error if there are none.
     * @return <List>User</List> or <Error>No users found.</Error>
     */
    public List<User> getAllUsers() {
        var allUsers = userRepository.findAll();
        if (allUsers.isEmpty()){
            throw new EntityNotFoundException("No users found.");
        }
        return allUsers;
    }


    /**
     * Save the user received
     * Throw error if user can't be saved.
     * @param user : User
     * @return <User>new user</User> or <Error>Failed to save the user.</Error>
    */
    public User saveUser(User user) {
        try {
            return userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save the user : " + e.getMessage());
        }
    }
}
