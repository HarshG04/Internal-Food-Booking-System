package com.interim.server.controllers;

import com.interim.server.dtos.UserResponse;
import com.interim.server.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<UserResponse> getUserByEmployeeId(@PathVariable Integer employeeId) {
        return userService.getUserByEmployeeId(employeeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-email")
    public ResponseEntity<UserResponse> getUserByEmail(@RequestParam String email) {
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{employeeId}/active")
    public ResponseEntity<UserResponse> setUserActive(
            @PathVariable Integer employeeId,
            @RequestParam Boolean active) {
        return ResponseEntity.ok(userService.setUserActive(employeeId, active));
    }
}