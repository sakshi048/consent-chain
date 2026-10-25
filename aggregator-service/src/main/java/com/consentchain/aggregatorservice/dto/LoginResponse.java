package com.consentchain.aggregatorservice.dto;

public class LoginResponse {

    private boolean success;
    private String message;
    private Long userId;
    private String username;
    private String name;
    private String role;

    public LoginResponse() {
    }

    public LoginResponse(
            boolean success,
            String message,
            Long userId,
            String username,
            String name,
            String role) {

        this.success = success;
        this.message = message;
        this.userId = userId;
        this.username = username;
        this.name = name;
        this.role = role;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }
}