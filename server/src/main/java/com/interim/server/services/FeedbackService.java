package com.interim.server.services;

import com.interim.server.enums.OrderItemStatus;
import com.interim.server.models.Feedback;
import com.interim.server.models.FoodItem;
import com.interim.server.models.OrderItem;
import com.interim.server.repositories.FeedbackRepository;
import com.interim.server.repositories.FoodItemRepository;
import com.interim.server.repositories.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private FoodItemRepository foodItemRepository;

    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAll();
    }

    public Optional<Feedback> getFeedbackById(Integer id) {
        return feedbackRepository.findById(id);
    }

    public Optional<Feedback> getFeedbackByOrderItem(Integer orderItemId) {
        return feedbackRepository.findByOrderItemId(orderItemId);
    }

    /**
     * Submit feedback only if the order item has been DELIVERED.
     * This enforces that the vendor must mark the item as delivered before the user can rate it.
     */
    @Transactional
    public Feedback createFeedback(Feedback feedback) {
        if (feedback.getOrderItem() == null || feedback.getOrderItem().getId() == null) {
            throw new RuntimeException("OrderItem reference is required");
        }
        OrderItem orderItem = orderItemRepository.findById(feedback.getOrderItem().getId())
                .orElseThrow(() -> new RuntimeException("OrderItem not found"));
        if (orderItem.getStatus() != OrderItemStatus.DELIVERED) {
            throw new RuntimeException("Feedback can only be submitted after the item has been delivered");
        }
        feedback.setOrderItem(orderItem);
        Feedback saved = feedbackRepository.save(feedback);
        recalculateAvgRating(orderItem.getFoodItem().getId());
        return saved;
    }

    @Transactional
    public Feedback updateFeedback(Integer id, Feedback updated) {
        Feedback existing = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + id));
        existing.setRating(updated.getRating());
        existing.setReview(updated.getReview());
        existing.setReviewedAt(updated.getReviewedAt());
        Feedback saved = feedbackRepository.save(existing);
        recalculateAvgRating(existing.getOrderItem().getFoodItem().getId());
        return saved;
    }

    @Transactional
    public void deleteFeedback(Integer id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + id));
        Integer foodItemId = feedback.getOrderItem().getFoodItem().getId();
        feedbackRepository.deleteById(id);
        recalculateAvgRating(foodItemId);
    }

    private void recalculateAvgRating(Integer foodItemId) {
        FoodItem foodItem = foodItemRepository.findById(foodItemId)
                .orElseThrow(() -> new RuntimeException("FoodItem not found: " + foodItemId));
        BigDecimal avg = feedbackRepository.findAvgRatingByFoodItemId(foodItemId)
                .map(v -> v.setScale(2, RoundingMode.HALF_UP))
                .orElse(null);
        foodItem.setAvgRating(avg);
        foodItemRepository.save(foodItem);
    }
}
