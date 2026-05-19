package com.interim.server.config;

import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.interim.server.models.User;
import com.interim.server.services.SessionService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final SessionService sessionService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // OPTIONS pre-flight requests should always pass through
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String sessionId = extractSessionIdFromCookies(request);

        if (sessionId != null) {
            Optional<User> userOptional = sessionService.getUserBySessionId(sessionId);
            if (userOptional.isPresent()) {
                request.setAttribute("currentUser", userOptional.get());
                return true;
            }
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"Unauthorized: valid session required\"}");
        return false;
    }

    private String extractSessionIdFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("SESSION_ID".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
