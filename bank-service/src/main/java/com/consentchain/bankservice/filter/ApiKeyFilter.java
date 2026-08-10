package com.consentchain.bankservice.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Simple API key check so only the trusted AA (aggregator-service) can call
 * the /bank/** data endpoints. This is intentionally lightweight (no JWT) —
 * bank-service only needs to trust "is this the AA calling me", not manage
 * sessions or roles. See README "Authentication Strategy" for the reasoning.
 */
@Component
public class ApiKeyFilter extends OncePerRequestFilter {

    private static final String HEADER_NAME = "X-AA-Token";

    @Value("${bank.aa-api-key}")
    private String expectedApiKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Only protect the actual data-sharing endpoints — health-check and
        // auth endpoints stay open (login/register need to be reachable first).
        boolean isProtectedPath = path.startsWith("/bank/validate-consent")
                || path.startsWith("/bank/fetch-data")
                || path.startsWith("/bank/fetch-statement")
                || path.startsWith("/bank/loan-history");

        if (isProtectedPath) {
            String providedKey = request.getHeader(HEADER_NAME);

            if (providedKey == null || !providedKey.equals(expectedApiKey)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Missing or invalid X-AA-Token header\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}