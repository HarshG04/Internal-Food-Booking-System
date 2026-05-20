package com.interim.server.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interim.server.dtos.CreateUserRequest;
import com.interim.server.dtos.UserResponse;
import com.interim.server.enums.Role;
import com.interim.server.models.User;
import com.interim.server.repositories.UserRepository;
import com.interim.server.services.SessionService;
import com.interim.server.services.UserService;

import jakarta.servlet.http.Cookie;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private SessionService sessionService;

    // Required only to satisfy the seedUsers CommandLineRunner in ServerApplication;
    // the repository itself is not used in any test assertion.
    @MockitoBean
    private UserRepository userRepository;

    private static final String SESSION_ID_VALUE = "test-session-id";
    private static final Cookie SESSION_COOKIE = new Cookie("SESSION_ID", SESSION_ID_VALUE);

    private User adminUser;
    private User employeeUser;
    private UserResponse sampleUserResponse;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .employeeId(1)
                .email("admin@example.com")
                .fullName("Admin User")
                .role(Role.ADMIN)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        employeeUser = User.builder()
                .employeeId(2)
                .email("employee@example.com")
                .fullName("Regular Employee")
                .role(Role.EMPLOYEE)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        sampleUserResponse = UserResponse.builder()
                .employeeId(3)
                .email("newuser@example.com")
                .fullName("New User")
                .phone("1234567890")
                .role(Role.EMPLOYEE)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ── POST /api/users ──────────────────────────────────────────────────────

    @Test
    void createUser_asAdmin_shouldReturnCreated() throws Exception {
        when(sessionService.getUserBySessionId(SESSION_ID_VALUE)).thenReturn(Optional.of(adminUser));
        when(userService.createUser(any(CreateUserRequest.class))).thenReturn(sampleUserResponse);

        CreateUserRequest request = buildCreateUserRequest();

        mockMvc.perform(post("/api/users")
                        .cookie(SESSION_COOKIE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.employeeId").value(3))
                .andExpect(jsonPath("$.email").value("newuser@example.com"))
                .andExpect(jsonPath("$.role").value("EMPLOYEE"));
    }

    @Test
    void createUser_asNonAdmin_shouldReturnForbidden() throws Exception {
        when(sessionService.getUserBySessionId(SESSION_ID_VALUE)).thenReturn(Optional.of(employeeUser));

        CreateUserRequest request = buildCreateUserRequest();

        mockMvc.perform(post("/api/users")
                        .cookie(SESSION_COOKIE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void createUser_withNoSession_shouldReturnUnauthorized() throws Exception {
        CreateUserRequest request = buildCreateUserRequest();

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    // ── GET /api/users ───────────────────────────────────────────────────────

    @Test
    void getAllUsers_shouldReturnListOfUsers() throws Exception {
        when(sessionService.getUserBySessionId(SESSION_ID_VALUE)).thenReturn(Optional.of(adminUser));
        when(userService.getAllUsers()).thenReturn(List.of(sampleUserResponse));

        mockMvc.perform(get("/api/users")
                        .cookie(SESSION_COOKIE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].email").value("newuser@example.com"));
    }

    @Test
    void getAllUsers_withNoSession_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());
    }

    // ── GET /api/users/{employeeId} ──────────────────────────────────────────

    @Test
    void getUserByEmployeeId_whenFound_shouldReturnUser() throws Exception {
        when(sessionService.getUserBySessionId(SESSION_ID_VALUE)).thenReturn(Optional.of(adminUser));
        when(userService.getUserByEmployeeId(3)).thenReturn(Optional.of(sampleUserResponse));

        mockMvc.perform(get("/api/users/3")
                        .cookie(SESSION_COOKIE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value(3))
                .andExpect(jsonPath("$.email").value("newuser@example.com"));
    }

    @Test
    void getUserByEmployeeId_whenNotFound_shouldReturnNotFound() throws Exception {
        when(sessionService.getUserBySessionId(SESSION_ID_VALUE)).thenReturn(Optional.of(adminUser));
        when(userService.getUserByEmployeeId(999)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/999")
                        .cookie(SESSION_COOKIE))
                .andExpect(status().isNotFound());
    }

    // ── GET /api/users/by-email ──────────────────────────────────────────────

    @Test
    void getUserByEmail_whenFound_shouldReturnUser() throws Exception {
        when(sessionService.getUserBySessionId(SESSION_ID_VALUE)).thenReturn(Optional.of(adminUser));
        when(userService.getUserByEmail("newuser@example.com")).thenReturn(Optional.of(sampleUserResponse));

        mockMvc.perform(get("/api/users/by-email")
                        .param("email", "newuser@example.com")
                        .cookie(SESSION_COOKIE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("newuser@example.com"));
    }

    @Test
    void getUserByEmail_whenNotFound_shouldReturnNotFound() throws Exception {
        when(sessionService.getUserBySessionId(SESSION_ID_VALUE)).thenReturn(Optional.of(adminUser));
        when(userService.getUserByEmail("unknown@example.com")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/by-email")
                        .param("email", "unknown@example.com")
                        .cookie(SESSION_COOKIE))
                .andExpect(status().isNotFound());
    }

    // ── PATCH /api/users/{employeeId}/active ─────────────────────────────────

    @Test
    void setUserActive_shouldDeactivateUser() throws Exception {
        when(sessionService.getUserBySessionId(SESSION_ID_VALUE)).thenReturn(Optional.of(adminUser));

        UserResponse deactivatedResponse = UserResponse.builder()
                .employeeId(3)
                .email("newuser@example.com")
                .fullName("New User")
                .role(Role.EMPLOYEE)
                .isActive(false)
                .build();

        when(userService.setUserActive(3, false)).thenReturn(deactivatedResponse);

        mockMvc.perform(patch("/api/users/3/active")
                        .param("active", "false")
                        .cookie(SESSION_COOKIE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value(3))
                .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    void setUserActive_shouldActivateUser() throws Exception {
        when(sessionService.getUserBySessionId(SESSION_ID_VALUE)).thenReturn(Optional.of(adminUser));

        UserResponse activatedResponse = UserResponse.builder()
                .employeeId(3)
                .email("newuser@example.com")
                .fullName("New User")
                .role(Role.EMPLOYEE)
                .isActive(true)
                .build();

        when(userService.setUserActive(3, true)).thenReturn(activatedResponse);

        mockMvc.perform(patch("/api/users/3/active")
                        .param("active", "true")
                        .cookie(SESSION_COOKIE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(true));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private CreateUserRequest buildCreateUserRequest() {
        CreateUserRequest request = new CreateUserRequest();
        request.setEmployeeId(3);
        request.setEmail("newuser@example.com");
        request.setPassword("password123");
        request.setFullName("New User");
        request.setPhone("1234567890");
        request.setRole(Role.EMPLOYEE);
        return request;
    }
}
