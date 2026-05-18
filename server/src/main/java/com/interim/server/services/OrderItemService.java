package com.interim.server.services;



import com.interim.server.enums.OrderItemStatus;
import com.interim.server.models.OrderItem;
import com.interim.server.repositories.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderItemService {
    @Autowired
    private  OrderItemRepository orderItemRepository;

    public List<OrderItem> getAllOrderItems() {
        return orderItemRepository.findAll();
    }

    public Optional<OrderItem> getOrderItemById(Integer id) {
        return orderItemRepository.findById(id);
    }

    public List<OrderItem> getOrderItemsByOrder(Integer orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    public List<OrderItem> getOrderItemsByUser(Integer userId) {
        return orderItemRepository.findByUser_EmployeeId(userId);
    }

    public List<OrderItem> getOrderItemsByStatus(OrderItemStatus status) {
        return orderItemRepository.findByStatus(status);
    }

    public OrderItem createOrderItem(OrderItem orderItem) {
        return orderItemRepository.save(orderItem);
    }

    public OrderItem updateStatus(Integer id, OrderItemStatus status) {
        return orderItemRepository.findById(id).map(existing -> {
            existing.setStatus(status);
            return orderItemRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("OrderItem not found with id: " + id));
    }

    public OrderItem updateOrderItem(Integer id, OrderItem updated) {
        return orderItemRepository.findById(id).map(existing -> {
            existing.setUser(updated.getUser());
            existing.setOrder(updated.getOrder());
            existing.setFoodItem(updated.getFoodItem());
            existing.setQuantity(updated.getQuantity());
            existing.setStatus(updated.getStatus());
            existing.setSubtotal(updated.getSubtotal());
            return orderItemRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("OrderItem not found with id: " + id));
    }

    public void deleteOrderItem(Integer id) {
        orderItemRepository.deleteById(id);
    }
}
