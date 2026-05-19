package com.interim.server.dtos;

import com.interim.server.enums.Role;

import lombok.Data;

@Data
public class CreateUserRequest {
    private Integer employeeId;
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private Role role;
}
