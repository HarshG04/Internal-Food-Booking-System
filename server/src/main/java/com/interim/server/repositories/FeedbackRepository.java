package com.interim.server.repositories;

import com.interim.server.models.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    Optional<Feedback> findByOrderItemId(Integer orderItemId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.orderItem.foodItem.id = :foodItemId")
    Optional<BigDecimal> findAvgRatingByFoodItemId(@Param("foodItemId") Integer foodItemId);
}
