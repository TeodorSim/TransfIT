package com.example.service.dental;

import com.example.model.entities.dental.Review;
import com.example.repository.dental.ReviewRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    private ReviewRepository reviewRepository;

    @Autowired
    public ReviewService(ReviewRepository revRepository) {
        this.reviewRepository = revRepository;
    }

    /**
     * Fetch the person with the mentioned {@code id},
     * or return an error .
     * @param id the review id
     * @return {@code Review} entinty data OR {@ccode Error} "Review not found with id: {id}".
     */
    public Review getReviewById(Long id) {
        Optional<Review> review = reviewRepository.findById(id);
        return review.orElseThrow(() -> new EntityNotFoundException("Review not found with id: " + id));
    }

    /**
     * Fetch all reviews, or return error
     * @return {@code List of  reviews} or {@code Error} "No Reviews found.".
     */
    public List<Review> getAllReviews(){
        var allReviews = reviewRepository.findAll();
        if(allReviews.isEmpty()){
            throw new EntityNotFoundException("No Reviews found.");
        }
        return allReviews;
    }

    /**
     * Save the new {@code Review} received.
     * Throw error if the new Review can't be saved.
     * @param review new Review to save
     * @return new {@code Review} or {@code Error} Failed to store the new Review.
     */
    public Review saveReview(Review review) {
        try{
            return reviewRepository.save(review);
        } catch (Exception e){
            throw new RuntimeException("Failed to store the new review");
        }
    }

}
