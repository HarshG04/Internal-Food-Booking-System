package com.interim.server.services;

import com.interim.server.models.User;
import com.interim.server.models.UserSession;
import com.interim.server.repositories.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {

    private static final long SESSION_DURATION_HOURS = 24;

    private final UserSessionRepository userSessionRepository;

    /**
     * Creates a new session for the given user and returns the generated session ID.
     */
    public String createSession(User user) {
        // Evict any existing session for this user (enforces one-session-per-user)
        userSessionRepository.findByUser(user).ifPresent(userSessionRepository::delete);

        String sessionId = UUID.randomUUID().toString();
        UserSession session = UserSession.builder()
                .sessionId(sessionId)
                .user(user)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(SESSION_DURATION_HOURS))
                .build();
        userSessionRepository.save(session);
        return sessionId;
    }

    /**
     * Looks up the session by ID and returns the associated user if the session exists and has not expired.
     */
    public Optional<User> getUserBySessionId(String sessionId) {
        return userSessionRepository.findById(sessionId)
                .filter(session -> session.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(UserSession::getUser);
    }

    /**
     * Deletes the session with the given ID (logout / invalidation).
     */
    public void invalidateSession(String sessionId) {
        userSessionRepository.deleteById(sessionId);
    }
}
