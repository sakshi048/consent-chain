package com.consentchain.bankservice.dto;

public class LoginResponse {
    private boolean success;
    private String message;
    private Long userId;
    private String institutionId;
    private String username;
    private String role;
    private String accessToken;

    public LoginResponse(
            boolean success,
            String message,
            Long userId,
            String institutionId,
            String username,
            String role
    ) {
        this(success, message, userId, institutionId, username, role, null);
    }

    public LoginResponse(boolean success, String message, Long userId, String institutionId,
                         String username, String role, String accessToken) {
        this.success = success;
        this.message = message;
        this.userId = userId;
        this.institutionId = institutionId;
        this.username = username;
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

    public String getInstitutionId() {
        return institutionId;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public String getAccessToken() {
        return accessToken;
    }
}
