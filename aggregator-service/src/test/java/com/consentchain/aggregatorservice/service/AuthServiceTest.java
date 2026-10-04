package com.consentchain.aggregatorservice.service;

import com.consentchain.aggregatorservice.dto.LoginRequest;
import com.consentchain.aggregatorservice.dto.LoginResponse;
import com.consentchain.aggregatorservice.dto.RegisterRequest;
import com.consentchain.aggregatorservice.model.Role;
import com.consentchain.aggregatorservice.model.User;
import com.consentchain.aggregatorservice.repository.UserRepository;
import com.consentchain.aggregatorservice.security.AccessTokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuditService auditService;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private final AccessTokenService accessTokenService = new AccessTokenService(
            objectMapper, "test-aa-token-secret-0123456789abcdef", "test-inst-token-secret-0123456789ab");
    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, auditService, passwordEncoder, accessTokenService);
    }

    @Test
    void registrationStoresBcryptHashAndDoesNotSerializePassword() throws Exception {
        RegisterRequest request = registerRequest();
        when(userRepository.findByUsername("new-demo-user")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("new-demo-user@example.test")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User registered = authService.register(request);

        assertNotEquals(request.getPassword(), registered.getPassword());
        assertTrue(registered.getPassword().matches("^\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}$"));
        assertTrue(passwordEncoder.matches(request.getPassword(), registered.getPassword()));

        String json = objectMapper.writeValueAsString(registered);
        assertCredentialFieldsAbsent(json);
        assertTrue(json.contains("new-demo-user"));
    }

    @Test
    void loginSucceedsWithCorrectRawPasswordAndStoredBcryptHash() {
        User user = userWithPassword(passwordEncoder.encode("correct-test-password"));
        when(userRepository.findByUsername("demo-user")).thenReturn(Optional.of(user));

        LoginResponse response = authService.login(loginRequest("correct-test-password"));

        assertTrue(response.isSuccess());
        assertEquals(user.getId(), response.getUserId());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginFailsWithIncorrectRawPassword() {
        User user = userWithPassword(passwordEncoder.encode("correct-test-password"));
        when(userRepository.findByUsername("demo-user")).thenReturn(Optional.of(user));

        LoginResponse response = authService.login(loginRequest("incorrect-test-password"));

        assertFalse(response.isSuccess());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void successfulLegacyPlaintextLoginUpgradesStoredPasswordToBcrypt() {
        User user = userWithPassword("legacy-test-password");
        when(userRepository.findByUsername("demo-user")).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        LoginResponse response = authService.login(loginRequest("legacy-test-password"));

        assertTrue(response.isSuccess());
        assertNotEquals("legacy-test-password", user.getPassword());
        assertTrue(passwordEncoder.matches("legacy-test-password", user.getPassword()));
        verify(userRepository).save(user);
    }

    private RegisterRequest registerRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Demo User");
        request.setEmail("new-demo-user@example.test");
        request.setUsername("new-demo-user");
        request.setPassword("registration-test-password");
        request.setMobile("0000000000");
        request.setPanNumber("DEMO-PAN-TEST");
        return request;
    }

    private LoginRequest loginRequest(String password) {
        LoginRequest request = new LoginRequest();
        request.setUsername("demo-user");
        request.setPassword(password);
        return request;
    }

    private User userWithPassword(String password) {
        User user = new User();
        ReflectionTestUtils.setField(user, "id", 7L);
        user.setName("Demo User");
        user.setEmail("demo-user@example.test");
        user.setUsername("demo-user");
        user.setPassword(password);
        user.setRole(Role.USER);
        return user;
    }

    static void assertCredentialFieldsAbsent(String json) {
        assertFalse(json.contains("\"password\""), json);
        assertFalse(json.contains("\"passwordHash\""), json);
        assertFalse(json.contains("\"credentials\""), json);
    }
}
