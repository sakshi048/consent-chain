package com.consentchain.aggregatorservice.dto;

public class LoginResponse {

    private boolean success;
    private String message;
    private Long userId;
    private String username;
    private String name;
    private String role;
    private String accessToken;

    public LoginResponse() {
    }

    public LoginResponse(
            boolean success,
            String message,
            Long userId,
            String username,
            String name,
            String role) {

        this(success, message, userId, username, name, role, null);
    }

    public LoginResponse(boolean success, String message, Long userId, String username,
                         String name, String role, String accessToken) {

        this.success = success;
        this.message = message;
        this.userId = userId;
        this.username = username;
        this.name = name;
        this.role = role;
        this.accessToken = accessToken;
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

    public String getAccessToken() {
        return accessToken;
    }
}
