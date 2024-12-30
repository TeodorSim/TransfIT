package com.example.repository.dental;

import com.example.model.entities.dental.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
}
