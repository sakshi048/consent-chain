package com.consentchain.aggregatorservice.config;

import com.consentchain.aggregatorservice.model.Role;
import com.consentchain.aggregatorservice.model.User;
import com.consentchain.aggregatorservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AdminBootstrap implements ApplicationRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String password;
    private final String email;
    private final String name;

    public AdminBootstrap(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          @Value("${AA_ADMIN_BOOTSTRAP_USERNAME:}") String username,
                          @Value("${AA_ADMIN_BOOTSTRAP_PASSWORD:}") String password,
                          @Value("${AA_ADMIN_BOOTSTRAP_EMAIL:}") String email,
                          @Value("${AA_ADMIN_BOOTSTRAP_NAME:Administrator}") String name) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.password = password;
        this.email = email;
        this.name = name;
    }

    @Override
    public void run(ApplicationArguments args) {
        boolean hasUsername = username != null && !username.isBlank();
        boolean hasPassword = password != null && !password.isBlank();
        if (!hasUsername && !hasPassword) return;
        if (!hasUsername || !hasPassword) {
            throw new IllegalStateException("Set both AA_ADMIN_BOOTSTRAP_USERNAME and AA_ADMIN_BOOTSTRAP_PASSWORD");
        }
        if (userRepository.existsByRole(Role.ADMIN)) return;
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalStateException("Admin bootstrap username already belongs to an existing user");
        }
        User admin = new User();
        admin.setUsername(username);
        admin.setEmail(email == null || email.isBlank() ? username + "@localhost" : email);
        admin.setName(name == null || name.isBlank() ? "Administrator" : name);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole(Role.ADMIN);
        admin.setCreatedAt(LocalDateTime.now());
        userRepository.save(admin);
    }
}
