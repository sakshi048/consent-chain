package com.consentchain.aggregatorservice.controller;


import com.consentchain.aggregatorservice.dto.LoginRequest;
import com.consentchain.aggregatorservice.dto.LoginResponse;
import com.consentchain.aggregatorservice.dto.RegisterRequest;
import com.consentchain.aggregatorservice.model.User;
import com.consentchain.aggregatorservice.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/aa/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }
}