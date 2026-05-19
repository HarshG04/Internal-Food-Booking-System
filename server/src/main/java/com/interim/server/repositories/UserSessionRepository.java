package com.interim.server.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.interim.server.models.User;
import com.interim.server.models.UserSession;

public interface UserSessionRepository extends JpaRepository<UserSession, String> {
    Optional<UserSession> findByUser(User user);
}
