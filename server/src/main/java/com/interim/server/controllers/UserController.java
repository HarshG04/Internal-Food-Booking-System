package com.interim.server.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.interim.server.dtos.CreateUserRequest;
import com.interim.server.dtos.UserResponse;
import com.interim.server.enums.Role;
import com.interim.server.models.User;
import com.interim.server.services.UserService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest request, HttpServletRequest httpRequest) {
        User currentUser = (User) httpRequest.getAttribute("currentUser");
        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

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