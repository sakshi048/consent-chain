package com.consentchain.bankservice.service;

import com.consentchain.bankservice.dto.LoginRequest;
import com.consentchain.bankservice.dto.LoginResponse;
import com.consentchain.bankservice.dto.RegisterRequest;
import com.consentchain.bankservice.model.User;
import com.consentchain.bankservice.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String register(RegisterRequest request) {

        if (userRepository.existsByUsername(
                request.getUsername())) {

            return "Username already exists";
        }

        User user = new User();

        user.setInstitutionId(
                request.getInstitutionId()
        );

        user.setUsername(
                request.getUsername()
        );

        user.setPassword(
                request.getPassword()
        );

        user.setRole(
                request.getRole()
        );

        user.setActive(true);

        userRepository.save(user);

        return "Registration successful";
    }

    public LoginResponse login(LoginRequest request) {

        User user =
                userRepository
                        .findByInstitutionIdAndUsername(
                                request.getInstitutionId(),
                                request.getUsername()
                        )
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

        if (!user.isActive()) {

            return new LoginResponse(
                    false,
                    "User account is inactive",
                    null,
                    null,
                    null,
                    null
            );
        }

        if (!user.getPassword()
                .equals(request.getPassword())) {

            return new LoginResponse(
                    false,
                    "Invalid password",
                    null,
                    null,
                    null,
                    null
            );
        }

        return new LoginResponse(
                true,
                "Login successful",
                user.getId(),
                user.getInstitutionId(),
                user.getUsername(),
                user.getRole().name()
        );
    }
}
