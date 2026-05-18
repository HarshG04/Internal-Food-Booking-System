package com.interim.server.services;


import com.interim.server.dtos.UserResponse;
import com.interim.server.models.User;
import com.interim.server.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public Optional<UserResponse> getUserByEmployeeId(Integer employeeId) {
        return userRepository.findById(employeeId)
                .map(this::mapToResponse);
    }

    public Optional<UserResponse> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(this::mapToResponse);
    }

    public UserResponse setUserActive(Integer employeeId, Boolean active) {
        User user = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("User not found with employeeId: " + employeeId));
        user.setIsActive(active);
        return mapToResponse(userRepository.save(user));
    }

    // ---- private mapper ----
    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .employeeId(user.getEmployeeId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .isActive(user.getIsActive())
                .build();
    }
}