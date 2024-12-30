package com.example.model.entities.dental;

import com.example.model.common.Result;
import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name = "Review")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id", nullable = false)
    private Long reviewId;

    @Column(name = "dentist_name", nullable = false)
    private String dentistName;

    @Column(name = "review_description", nullable = false)
    private String reviewDescription;

    @Column(name = "professionalism", nullable = false)
    private Integer professionalism;

    @Column(name = "communication", nullable = false)
    private Integer communication;

    @Column(name = "cleanliness", nullable = false)
    private Integer cleanliness;

    @Column(name = "date_of_review", nullable = false)
    private Date dateReview;

    @OneToOne
    @JoinColumn(name = "procedure_id", nullable = false, referencedColumnName = "procedure_id")
    private AppointmentProcedure procedureId;

    public Review() {}

    protected Review(String dentistName, String reviewDescription, Integer professionalism, Integer communication, Integer cleanliness, Date dateReview, AppointmentProcedure procedureId) {
        this.dentistName = dentistName;
        this.reviewDescription = reviewDescription;
        this.professionalism = professionalism;
        this.communication = communication;
        this.cleanliness = cleanliness;
        this.dateReview = dateReview;
        this.procedureId = procedureId;
    }

    public Result<Review> createReview(String dentistName, String reviewDescription, Integer professionalism, Integer communication, Integer cleanliness, Date dateReview, AppointmentProcedure procedureId) {
        return Result.Success(new Review(dentistName, reviewDescription, professionalism, communication, cleanliness, dateReview, procedureId));
    }
    public Long getId(){
        return reviewId;
    }
    public String getDentistName() {
        return dentistName;
    }
    public String getReviewDescription() {
        return reviewDescription;
    }
    public Integer getProfessionalism() {
        return professionalism;
    }
    public Integer getCommunication() {
        return communication;
    }
    public Integer getCleanliness() {
        return cleanliness;
    }
    public Date getDateReview() {
        return dateReview;
    }
    public AppointmentProcedure getProcedureId() {
        return procedureId;
    }
}