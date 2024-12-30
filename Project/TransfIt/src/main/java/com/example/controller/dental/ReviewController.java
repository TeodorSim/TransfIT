package com.example.controller.dental;


import com.example.model.entities.dental.Patient;
import com.example.model.entities.dental.Review;
import com.example.service.dental.PatientService;
import com.example.service.dental.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/review")
public class ReviewController {
    @Autowired
    private ReviewService reviewService;

    @GetMapping()
    public List<Review> getReviews() {
        return reviewService.getAllReviews();
    }
}
