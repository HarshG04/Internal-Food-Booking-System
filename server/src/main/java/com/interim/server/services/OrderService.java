package com.interim.server.services;



import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.interim.server.dtos.OrderItemRequest;
import com.interim.server.enums.OrderItemStatus;
import com.interim.server.models.FoodItem;
import com.interim.server.models.Order;
import com.interim.server.models.OrderItem;
import com.interim.server.models.User;
import com.interim.server.repositories.FoodItemRepository;
import com.interim.server.repositories.OrderItemRepository;
import com.interim.server.repositories.OrderRepository;
import com.interim.server.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    @Autowired
    private  OrderRepository orderRepository;
    @Autowired
    private  UserRepository userRepository;
    @Autowired
    private FoodItemRepository foodItemRepository;
    @Autowired
    private  OrderItemRepository orderItemRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Integer id) {
        return orderRepository.findById(id);
    }

    public Optional<Order> getOrderByTokenNo(String tokenNo) {
        return orderRepository.findByTokenNo(tokenNo);
    }

    public List<Order> getOrdersByEmployee(Integer employeeId) {
        return orderRepository.findByUserEmployeeId(employeeId);
    }

    public List<Order> getOrdersByShopId(Integer shopId) {
        return orderRepository.findByShopId(shopId);
    }

    public List<com.interim.server.models.OrderItem> getOrderItemsByShopId(Integer shopId) {
        return orderItemRepository.findByFoodItemShopId(shopId);
    }

    /**
     * Place a new order atomically.
     * Validates stock, generates a unique 4-digit token, creates Order + OrderItems.
     */
    @Transactional
    public Order placeOrder(Integer userId, List<OrderItemRequest> items) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new RuntimeException("User account is inactive");
        }

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItemList = new ArrayList<>();

        for (OrderItemRequest req : items) {
            FoodItem foodItem = foodItemRepository.findById(req.getFoodItemId())
                    .orElseThrow(() -> new RuntimeException("FoodItem not found: " + req.getFoodItemId()));
            if (Boolean.FALSE.equals(foodItem.getShop().getIsOpen())) {
                throw new RuntimeException("Shop is currently closed: " + foodItem.getShop().getName());
            }
            if (foodItem.getStockQuantity() == null || foodItem.getStockQuantity() < req.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + foodItem.getName());
            }
            BigDecimal subtotal = foodItem.getPrice().multiply(BigDecimal.valueOf(req.getQuantity()));
            total = total.add(subtotal);

            foodItem.setStockQuantity(foodItem.getStockQuantity() - req.getQuantity());
            foodItemRepository.save(foodItem);

            orderItemList.add(OrderItem.builder()
                    .user(user)
                    .foodItem(foodItem)
                    .quantity(req.getQuantity())
                    .status(OrderItemStatus.ORDERED)
                    .subtotal(subtotal)
                    .build());
        }

        Order order = Order.builder()
                .user(user)
                .tokenNo(generateUniqueToken())
                .totalAmount(total)
                .createdAt(LocalDateTime.now())
                .build();
        Order savedOrder = orderRepository.save(order);

        for (OrderItem item : orderItemList) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);
        }
        return savedOrder;
    }

    /** Generates a unique 4-digit numeric token (1000–9999). */
    private String generateUniqueToken() {
        Random random = new Random();
        String token;
        do {
            token = String.format("%04d", 1000 + random.nextInt(9000));
        } while (orderRepository.findByTokenNo(token).isPresent());
        return token;
    }

    public Order createOrder(Order order) {
        return orderRepository.save(order);
    }

    public Order updateOrder(Integer id, Order updated) {
        return orderRepository.findById(id).map(existing -> {
            existing.setUser(updated.getUser());
            existing.setTokenNo(updated.getTokenNo());
            existing.setTotalAmount(updated.getTotalAmount());
            return orderRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    public void deleteOrder(Integer id) {
        orderRepository.deleteById(id);
    }
}
