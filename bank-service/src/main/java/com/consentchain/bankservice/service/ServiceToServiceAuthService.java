package com.consentchain.bankservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class ServiceToServiceAuthService {
    public static final String HEADER_NAME = "X-Internal-Service-Token";
    private final String configuredToken;

    public ServiceToServiceAuthService(@Value("${BANK_SERVICE_AUTH_TOKEN:}") String configuredToken) {
        this.configuredToken = configuredToken;
    }

    public void requireAggregator(String suppliedToken) {
        if (configuredToken == null || configuredToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Bank service authentication is not configured");
        }
        if (suppliedToken == null || !MessageDigest.isEqual(
                configuredToken.getBytes(StandardCharsets.UTF_8),
                suppliedToken.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Service authentication required");
        }
    }
}
