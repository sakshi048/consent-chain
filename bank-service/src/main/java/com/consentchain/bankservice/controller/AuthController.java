package com.consentchain.bankservice.controller;

import com.consentchain.bankservice.dto.LoginRequest;
import com.consentchain.bankservice.dto.LoginResponse;
import com.consentchain.bankservice.dto.RegisterRequest;
import com.consentchain.bankservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        java.util.Map<String, Object> result = authService.register(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login( @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        if (!response.isSuccess()) {
            return ResponseEntity.status(401).body(response);
        }
        return ResponseEntity.ok(response);
    }
}
