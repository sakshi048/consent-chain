package com.consentchain.aggregatorservice.service;
import com.consentchain.aggregatorservice.dto.LoginRequest;
import com.consentchain.aggregatorservice.dto.LoginResponse;
import com.consentchain.aggregatorservice.dto.RegisterRequest;
import com.consentchain.aggregatorservice.model.AuditAction;
import com.consentchain.aggregatorservice.model.Role;
import com.consentchain.aggregatorservice.model.User;
import com.consentchain.aggregatorservice.repository.UserRepository;
import com.consentchain.aggregatorservice.security.AccessTokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;
    private final AccessTokenService accessTokenService;

    public AuthService(
            UserRepository userRepository,
            AuditService auditService,
            PasswordEncoder passwordEncoder,
            AccessTokenService accessTokenService) {

        this.userRepository = userRepository;
        this.auditService = auditService;
        this.passwordEncoder = passwordEncoder;
        this.accessTokenService = accessTokenService;
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
        user.setPassword(passwordEncoder.encode(request.getPassword()));
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

        if (!passwordMatchesAndUpgradeLegacy(user, request.getPassword())) {

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
                user.getRole().name(),
                accessTokenService.issue(user.getId(), user.getUsername(), user.getRole().name(), null)
        );
    }

    private boolean passwordMatchesAndUpgradeLegacy(User user, String rawPassword) {
        String storedPassword = user.getPassword();
        if (storedPassword == null || rawPassword == null) {
            return false;
        }

        if (isBcryptHash(storedPassword)) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }

        // Existing AA accounts stored raw passwords. Accept them once, then upgrade
        // the stored value so a successful login migrates the account to BCrypt.
        if (!storedPassword.equals(rawPassword)) {
            return false;
        }

        user.setPassword(passwordEncoder.encode(rawPassword));
        userRepository.save(user);
        return true;
    }

    private boolean isBcryptHash(String value) {
        return value.matches("^\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}$");
    }
}
