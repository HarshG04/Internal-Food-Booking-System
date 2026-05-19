package com.interim.server.controllers;

import com.interim.server.dtos.PlaceOrderRequest;
import com.interim.server.enums.Role;
import com.interim.server.models.Order;
import com.interim.server.models.OrderItem;
import com.interim.server.models.Shop;
import com.interim.server.models.User;
import com.interim.server.services.OrderService;
import com.interim.server.services.ShopService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final ShopService shopService;

    @GetMapping("/my-shop")
    public ResponseEntity<List<OrderItem>> getOrdersForMyShop(HttpServletRequest request) {
        User currentUser = (User) request.getAttribute("currentUser");
        if (currentUser.getRole() != Role.VENDOR) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Shop shop = shopService.getShopByVendorId(currentUser.getEmployeeId())
                .orElse(null);
        if (shop == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(orderService.getOrderItemsByShopId(shop.getId()));
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Integer id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/token/{tokenNo}")
    public ResponseEntity<Order> getOrderByToken(@PathVariable String tokenNo) {
        return orderService.getOrderByTokenNo(tokenNo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/employee/{employeeId}")
    public List<Order> getOrdersByEmployee(@PathVariable Integer employeeId) {
        return orderService.getOrdersByEmployee(employeeId);
    }

    /**
     * POST /api/orders/place
     * Body: { "userId": 1, "items": [ { "foodItemId": 3, "quantity": 2 }, ... ] }
     * Creates the order + all order items atomically and returns the order with its unique 4-digit token.
     */
    @PostMapping("/place")
    public ResponseEntity<Order> placeOrder(@RequestBody PlaceOrderRequest request) {
        return ResponseEntity.ok(orderService.placeOrder(request.getUserId(), request.getItems()));
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        return ResponseEntity.ok(orderService.createOrder(order));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable Integer id, @RequestBody Order order) {
        return ResponseEntity.ok(orderService.updateOrder(id, order));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Integer id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}



