package com.consentchain.aggregatorservice.security;

import com.consentchain.aggregatorservice.model.Role;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class AccessTokenService {
    private static final String AA_ISSUER = "consentchain-aa";
    private static final String INSTITUTION_ISSUER = "consentchain-institution";
    private static final long TOKEN_TTL_SECONDS = 8 * 60 * 60;
    private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder URL_DECODER = Base64.getUrlDecoder();

    private final ObjectMapper objectMapper;
    private final String aaSecret;
    private final String institutionSecret;

    public AccessTokenService(ObjectMapper objectMapper,
                              @Value("${AA_AUTH_TOKEN_SECRET:}") String aaSecret,
                              @Value("${INSTITUTION_AUTH_TOKEN_SECRET:}") String institutionSecret) {
        this.objectMapper = objectMapper;
        this.aaSecret = aaSecret;
        this.institutionSecret = institutionSecret;
    }

    public String issue(Long userId, String username, String role, String institutionId) {
        requireSecret(aaSecret, "AA_AUTH_TOKEN_SECRET");
        try {
            long now = Instant.now().getEpochSecond();
            String header = URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(Map.of("alg", "HS256", "typ", "JWT")));
            Map<String, Object> claims = new HashMap<>();
            claims.put("iss", AA_ISSUER);
            claims.put("sub", userId.toString());
            claims.put("username", username);
            claims.put("role", role);
            if (institutionId != null) claims.put("institutionId", institutionId);
            claims.put("iat", now);
            claims.put("exp", now + TOKEN_TTL_SECONDS);
            String payload = URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(claims));
            String signingInput = header + "." + payload;
            return signingInput + "." + URL_ENCODER.encodeToString(hmac(signingInput, aaSecret));
        } catch (Exception e) {
            throw new IllegalStateException("Unable to issue access token", e);
        }
    }

    public AuthenticatedPrincipal verify(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) throw new IllegalArgumentException("Invalid token");
            Map<String, Object> header = objectMapper.readValue(URL_DECODER.decode(parts[0]), new TypeReference<>() {});
            if (!"HS256".equals(header.get("alg")) || !"JWT".equals(header.get("typ"))) {
                throw new IllegalArgumentException("Invalid token header");
            }
            byte[] actual = URL_DECODER.decode(parts[2]);
            Map<String, Object> claims = objectMapper.readValue(URL_DECODER.decode(parts[1]), new TypeReference<>() {});
            String issuer = String.valueOf(claims.get("iss"));
            String secret = switch (issuer) {
                case AA_ISSUER -> aaSecret;
                case INSTITUTION_ISSUER -> institutionSecret;
                default -> throw new IllegalArgumentException("Invalid token issuer");
            };
            requireSecret(secret, AA_ISSUER.equals(issuer) ? "AA_AUTH_TOKEN_SECRET" : "INSTITUTION_AUTH_TOKEN_SECRET");
            byte[] expected = hmac(parts[0] + "." + parts[1], secret);
            if (!MessageDigest.isEqual(expected, actual)) throw new IllegalArgumentException("Invalid token signature");
            if (AA_ISSUER.equals(issuer) && !isAaRole(String.valueOf(claims.get("role")))) {
                throw new IllegalArgumentException("Invalid AA token role");
            }
            if (INSTITUTION_ISSUER.equals(issuer) && !isInstitutionRole(String.valueOf(claims.get("role")))) {
                throw new IllegalArgumentException("Invalid institution token role");
            }
            Object exp = claims.get("exp");
            if (!(exp instanceof Number expiry) || expiry.longValue() <= Instant.now().getEpochSecond()) {
                throw new IllegalArgumentException("Access token expired");
            }
            Long id = Long.valueOf(String.valueOf(claims.get("sub")));
            String username = String.valueOf(claims.get("username"));
            String role = String.valueOf(claims.get("role"));
            if (!isKnownRole(role)) throw new IllegalArgumentException("Invalid token role");
            Object institution = claims.get("institutionId");
            return new AuthenticatedPrincipal(id, username, role, institution == null ? null : institution.toString());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid or expired access token", e);
        }
    }

    private boolean isKnownRole(String role) {
        return role.equals(Role.USER.name()) || role.equals(Role.ADMIN.name())
                || role.equals("FIU") || role.equals("FIP");
    }

    private boolean isAaRole(String role) {
        return Role.USER.name().equals(role) || Role.ADMIN.name().equals(role);
    }

    private boolean isInstitutionRole(String role) {
        return "FIU".equals(role) || "FIP".equals(role);
    }

    private byte[] hmac(String value, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return mac.doFinal(value.getBytes(StandardCharsets.US_ASCII));
    }

    private void requireSecret(String secret, String property) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(property + " must contain at least 32 characters");
        }
    }
}
