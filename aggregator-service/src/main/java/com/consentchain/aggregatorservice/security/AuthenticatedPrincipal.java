package com.consentchain.aggregatorservice.security;

public record AuthenticatedPrincipal(Long userId, String username, String role, String institutionId) {
    public static final String REQUEST_ATTRIBUTE = "authenticatedPrincipal";

    public boolean hasRole(String expectedRole) {
        return expectedRole.equals(role);
    }
}
