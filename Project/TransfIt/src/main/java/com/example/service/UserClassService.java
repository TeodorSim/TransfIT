package com.example.service;

import com.example.model.entities.UserClass;
import com.example.repository.UserClassRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserClassService {
    private UserClassRepository UserClassRepository;

    @Autowired
    public UserClassService(UserClassRepository UserClassRepository) {
        this.UserClassRepository = UserClassRepository;
    }

    /**
     * Fetch the UserClass with the specified ID.
     * Return the UserClass or error
     * @param UserClassId : Long
     * @return <UserClass> or <Error>
     */
    public UserClass getUserClassById(Long UserClassId) {
        Optional<UserClass> getUserClassById = UserClassRepository.findById(UserClassId);

        if (getUserClassById.isEmpty()){
            throw new EntityNotFoundException("No UserClass with id" + UserClassId + " found by UserClassService.");
        }
        return getUserClassById.orElse(null);
    }

    /**
     * Fetch all UserClasss.
     * Throw error if there are none.
     * @return <List>UserClass</List> or <Error>No UserClasss found.</Error>
     */
    public List<UserClass> getAllUserClasss() {
        var allUserClasss = UserClassRepository.findAll();
        if (allUserClasss.isEmpty()){
            throw new EntityNotFoundException("No UserClasss found.");
        }
        return allUserClasss;
    }


    /**
     * Save the {@code UserClass} received.
     * Throw error if UserClass can't be saved.
     * @param UserClass : UserClass
     * @return new {@code UserClass} or {@code Error} Failed to save the UserClass.
    */
    public UserClass saveUserClass(UserClass UserClass) {
        try {
            return UserClassRepository.save(UserClass);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save the UserClass : " + e.getMessage());
        }
    }
}
