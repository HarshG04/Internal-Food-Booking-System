package com.interim.server.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String sessionId;
    private UserResponse user;
}
