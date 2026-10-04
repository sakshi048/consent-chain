package com.consentchain.aggregatorservice.service;

import com.consentchain.aggregatorservice.dto.LinkBankRequest;
import com.consentchain.aggregatorservice.dto.LoginRequest;
import com.consentchain.aggregatorservice.dto.RegisterRequest;
import com.consentchain.aggregatorservice.model.Consent;
import com.consentchain.aggregatorservice.model.LinkedBankAccount;
import com.consentchain.aggregatorservice.model.Role;
import com.consentchain.aggregatorservice.model.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SensitiveEntitySerializationTest {
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    void registrationConsentAndAdminUserResponsesOmitCredentialFields() throws Exception {
        User user = user();
        Consent consent = consent(user);

        assertNoCredentialFields(objectMapper.writeValueAsString(user));
        assertNoCredentialFields(objectMapper.writeValueAsString(consent));
        assertNoCredentialFields(objectMapper.writeValueAsString(List.of(user, user)));
        assertNoCredentialFields(objectMapper.writeValueAsString(List.of(consent)));

        String consentJson = objectMapper.writeValueAsString(consent);
        assertTrue(consentJson.contains("CONSENT-DTO-TEST"));
        assertTrue(consentJson.contains("Demo User"));
        assertTrue(consentJson.contains("DEMO-PURPOSE"));
    }

    @Test
    void accountAndAdminAccountResponsesOmitNestedUserCredentials() throws Exception {
        LinkedBankAccount account = new LinkedBankAccount();
        account.setUser(user());
        account.setBankName("Demo Bank");
        account.setAccountNumber("000000000001");
        account.setIfsc("DEMO000001");
        account.setCustomerPan("DEMO-PAN-TEST");

        assertNoCredentialFields(objectMapper.writeValueAsString(account));
        assertNoCredentialFields(objectMapper.writeValueAsString(List.of(account)));

        String json = objectMapper.writeValueAsString(account);
        assertTrue(json.contains("000000000001"));
        assertTrue(json.contains("DEMO-PAN-TEST"));
    }

    @Test
    void requestDtosAcceptButDoNotSerializePasswords() throws Exception {
        RegisterRequest register = new RegisterRequest();
        register.setPassword("input-only-registration-password");
        LoginRequest login = new LoginRequest();
        login.setPassword("input-only-login-password");
        LinkBankRequest link = new LinkBankRequest();
        link.setPassword("input-only-bank-password");

        assertEquals("kept-for-input", objectMapper.readValue(
                "{\"password\":\"kept-for-input\"}", LoginRequest.class).getPassword());
        assertNoCredentialFields(objectMapper.writeValueAsString(register));
        assertNoCredentialFields(objectMapper.writeValueAsString(login));
        assertNoCredentialFields(objectMapper.writeValueAsString(link));
    }

    private User user() {
        User user = new User();
        user.setName("Demo User");
        user.setEmail("demo@example.test");
        user.setUsername("demo-user");
        user.setPassword("test-hash-value");
        user.setMobile("0000000000");
        user.setPanNumber("DEMO-PAN-TEST");
        user.setRole(Role.USER);
        return user;
    }

    private Consent consent(User user) {
        Consent consent = new Consent();
        consent.setConsentId("CONSENT-DTO-TEST");
        consent.setUser(user);
        consent.setPurpose("DEMO-PURPOSE");
        return consent;
    }

    private void assertNoCredentialFields(String json) {
        assertFalse(json.contains("\"password\""), json);
        assertFalse(json.contains("\"passwordHash\""), json);
        assertFalse(json.contains("\"credentials\""), json);
    }
}
