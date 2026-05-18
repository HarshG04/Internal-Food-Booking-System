package com.interim.server.services;

import com.interim.server.dtos.AuthResponse;
import com.interim.server.dtos.UserResponse;
import com.interim.server.models.User;
import com.interim.server.repositories.UserRepository;
import com.interim.server.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new RuntimeException("Account is inactive or banned");
        }

        if (!BCrypt.checkpw(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

//        String token = jwtUtil.generateToken(
//                user.getEmployeeId(),
//                user.getEmail(),
//                user.getRole().name()
//        );

        return AuthResponse.builder()
                .token(token)
                .user(mapToResponse(user))
                .build();
    }

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