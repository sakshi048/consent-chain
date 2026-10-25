package com.consentchain.aggregatorservice.service;
import com.consentchain.aggregatorservice.dto.LoginRequest;
import com.consentchain.aggregatorservice.dto.LoginResponse;
import com.consentchain.aggregatorservice.dto.RegisterRequest;
import com.consentchain.aggregatorservice.model.AuditAction;
import com.consentchain.aggregatorservice.model.Role;
import com.consentchain.aggregatorservice.model.User;
import com.consentchain.aggregatorservice.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AuditService auditService;

    public AuthService(
            UserRepository userRepository,
            AuditService auditService) {

        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public User register(RegisterRequest request) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setMobile(request.getMobile());
        user.setPanNumber(request.getPanNumber());

        // New customers are always USER
        user.setRole(Role.USER);

        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);

        auditService.log(
                saved,
                AuditAction.USER_REGISTERED,
                "AA user registered"
        );

        return saved;
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                .findByUsername(request.getUsername())
                .orElse(null);

        if (user == null) {

            return new LoginResponse(
                    false,
                    "User not found",
                    null,
                    null,
                    null,
                    null
            );
        }

        if (!user.getPassword().equals(request.getPassword())) {

            return new LoginResponse(
                    false,
                    "Invalid password",
                    null,
                    null,
                    null,
                    null
            );
        }

        auditService.log(
                user,
                AuditAction.USER_LOGIN,
                "User logged into AA"
        );

        return new LoginResponse(
                true,
                "Login successful",
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getRole().name()
        );
    }
}