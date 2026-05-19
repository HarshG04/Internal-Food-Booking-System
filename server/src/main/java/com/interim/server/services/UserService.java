package com.interim.server.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.interim.server.dtos.CreateUserRequest;
import com.interim.server.dtos.UserResponse;
import com.interim.server.models.User;
import com.interim.server.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

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

    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use: " + request.getEmail());
        }
        if (userRepository.existsById(request.getEmployeeId())) {
            throw new RuntimeException("Employee ID already exists: " + request.getEmployeeId());
        }
        User user = User.builder()
                .employeeId(request.getEmployeeId())
                .email(request.getEmail())
                .password(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(request.getRole())
                .createdAt(LocalDateTime.now())
                .isActive(true)
                .build();
        return mapToResponse(userRepository.save(user));
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