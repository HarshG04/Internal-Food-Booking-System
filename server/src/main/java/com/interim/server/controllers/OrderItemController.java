package com.interim.server.controllers;



import com.interim.server.enums.OrderItemStatus;
import com.interim.server.models.OrderItem;
import com.interim.server.services.OrderItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-items")
@RequiredArgsConstructor
public class OrderItemController {

    @Autowired
    private OrderItemService orderItemService;

    @GetMapping
    public List<OrderItem> getAllOrderItems() {
        return orderItemService.getAllOrderItems();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderItem> getOrderItemById(@PathVariable Integer id) {
        return orderItemService.getOrderItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/order/{orderId}")
    public List<OrderItem> getOrderItemsByOrder(@PathVariable Integer orderId) {
        return orderItemService.getOrderItemsByOrder(orderId);
    }

    @GetMapping("/user/{userId}")
    public List<OrderItem> getOrderItemsByUser(@PathVariable Integer userId) {
        return orderItemService.getOrderItemsByUser(userId);
    }

    @GetMapping("/status/{status}")
    public List<OrderItem> getOrderItemsByStatus(@PathVariable OrderItemStatus status) {
        return orderItemService.getOrderItemsByStatus(status);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderItem> updateStatus(@PathVariable Integer id, @RequestParam OrderItemStatus status) {
        return ResponseEntity.ok(orderItemService.updateStatus(id, status));
    }
}
