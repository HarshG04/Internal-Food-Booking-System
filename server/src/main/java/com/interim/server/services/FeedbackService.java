package com.interim.server.services;



import com.interim.server.enums.OrderItemStatus;
import com.interim.server.models.Feedback;
import com.interim.server.models.OrderItem;
import com.interim.server.repositories.FeedbackRepository;
import com.interim.server.repositories.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final OrderItemRepository orderItemRepository;

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
        return feedbackRepository.save(feedback);
    }

    public Feedback updateFeedback(Integer id, Feedback updated) {
        return feedbackRepository.findById(id).map(existing -> {
            existing.setRating(updated.getRating());
            existing.setReview(updated.getReview());
            existing.setReviewedAt(updated.getReviewedAt());
            return feedbackRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Feedback not found with id: " + id));
    }

    public void deleteFeedback(Integer id) {
        feedbackRepository.deleteById(id);
    }
}
