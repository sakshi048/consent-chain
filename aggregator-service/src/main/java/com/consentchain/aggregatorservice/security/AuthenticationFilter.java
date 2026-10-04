package com.consentchain.aggregatorservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class AuthenticationFilter extends OncePerRequestFilter {
    private final AccessTokenService tokenService;

    public AuthenticationFilter(AccessTokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.equals("/aa/auth/login") || path.equals("/aa/auth/register") || path.equals("/error");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ") || header.length() <= 7) {
            reject(response, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }
        AuthenticatedPrincipal principal;
        try {
            principal = tokenService.verify(header.substring(7));
        } catch (IllegalArgumentException | IllegalStateException e) {
            reject(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired access token");
            return;
        }
        if (request.getRequestURI().startsWith("/aa/admin/") && !principal.hasRole("ADMIN")) {
            reject(response, HttpServletResponse.SC_FORBIDDEN, "Administrator role required");
            return;
        }
        request.setAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE, principal);
        chain.doFilter(request, response);
    }

    private void reject(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"success\":false,\"message\":\"" + message + "\"}");
    }
}
