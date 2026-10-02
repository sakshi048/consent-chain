package com.consentchain.bankservice.filter;



import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class ApiKeyFilter
        extends OncePerRequestFilter {

    private static final String API_KEY_HEADER =
            "X-AA-Token";

    @Value("${bank.aa-api-key}")
    private String expectedApiKey;


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {


        String path =
                request.getRequestURI();


        if (!isProtectedPath(path)) {

            filterChain.doFilter(
                    request,
                    response);

            return;
        }


        String providedApiKey =
                request.getHeader(
                        API_KEY_HEADER);


        if (providedApiKey == null ||
                providedApiKey.isBlank() ||
                !expectedApiKey.equals(
                        providedApiKey)) {

            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED);

            response.setContentType(
                    "application/json");


            response.getWriter().write("""
                    {
                      "success": false,
                      "error": "Missing or invalid X-AA-Token header"
                    }
                    """);

            return;
        }


        filterChain.doFilter(
                request,
                response);
    }


    private boolean isProtectedPath(
            String path) {

        if (path.startsWith(
                "/bank/validate-consent")) {

            return true;
        }

        if (path.startsWith(
                "/bank/fetch-data")) {

            return true;
        }

        if (path.startsWith(
                "/bank/fetch-statement")) {

            return true;
        }

        if (path.startsWith(
                "/bank/loan-history")) {

            return true;
        }

        if (path.startsWith(
                "/fip/consents")) {

            return true;
        }

        if (path.startsWith(
                "/fip/data/")) {

            return true;
        }

        return false;
    }
}