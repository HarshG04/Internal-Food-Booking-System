package com.interim.server.controllers;

import com.interim.server.dtos.AuthResponse;
import com.interim.server.dtos.LoginRequest;
import com.interim.server.services.AuthService;
import com.interim.server.services.SessionService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private SessionService sessionService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request.getEmail(), request.getPassword());

        Cookie sessionCookie = new Cookie("SESSION_ID", authResponse.getSessionId());
        sessionCookie.setHttpOnly(true);
        sessionCookie.setPath("/");
        sessionCookie.setMaxAge(60 * 60 * 24); // 24 hours
        response.addCookie(sessionCookie);

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("SESSION_ID".equals(cookie.getName())) {
                    sessionService.invalidateSession(cookie.getValue());
                    break;
                }
            }
        }

        Cookie expiredCookie = new Cookie("SESSION_ID", "");
        expiredCookie.setHttpOnly(true);
        expiredCookie.setPath("/");
        expiredCookie.setMaxAge(0);
        response.addCookie(expiredCookie);

        return ResponseEntity.noContent().build();
    }
}