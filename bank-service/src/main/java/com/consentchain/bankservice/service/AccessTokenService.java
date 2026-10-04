package com.consentchain.bankservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class AccessTokenService {
    private static final long TOKEN_TTL_SECONDS = 8 * 60 * 60;
    private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();

    private final ObjectMapper objectMapper;
    private final String sharedSecret;

    public AccessTokenService(ObjectMapper objectMapper,
                              @Value("${INSTITUTION_AUTH_TOKEN_SECRET:}") String sharedSecret) {
        this.objectMapper = objectMapper;
        this.sharedSecret = sharedSecret;
    }

    public String issue(Long userId, String username, String role, String institutionId) {
        requireSecret();
        try {
            long now = Instant.now().getEpochSecond();
            String header = URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(Map.of("alg", "HS256", "typ", "JWT")));
            Map<String, Object> claims = new HashMap<>();
            if (!"FIU".equals(role) && !"FIP".equals(role)) {
                throw new IllegalArgumentException("Only FIU/FIP accounts can receive institution tokens");
            }
            claims.put("iss", "consentchain-institution");
            claims.put("sub", userId.toString());
            claims.put("username", username);
            claims.put("role", role);
            claims.put("institutionId", institutionId);
            claims.put("iat", now);
            claims.put("exp", now + TOKEN_TTL_SECONDS);
            String payload = URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(claims));
            String signingInput = header + "." + payload;
            return signingInput + "." + URL_ENCODER.encodeToString(hmac(signingInput));
        } catch (Exception e) {
            throw new IllegalStateException("Unable to issue access token", e);
        }
    }

    private byte[] hmac(String value) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(sharedSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return mac.doFinal(value.getBytes(StandardCharsets.US_ASCII));
    }

    private void requireSecret() {
        if (sharedSecret == null || sharedSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("INSTITUTION_AUTH_TOKEN_SECRET must contain at least 32 characters");
        }
    }
}
