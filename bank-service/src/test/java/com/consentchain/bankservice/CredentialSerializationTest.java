package com.consentchain.bankservice;

import com.consentchain.bankservice.dto.LoginRequest;
import com.consentchain.bankservice.dto.RegisterRequest;
import com.consentchain.bankservice.dto.VerifyAccountRequest;
import com.consentchain.bankservice.model.Customer;
import com.consentchain.bankservice.model.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CredentialSerializationTest {
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    void bankCredentialEntitiesNeverSerializeSecrets() throws Exception {
        User user = new User();
        user.setUsername("demo-bank-user");
        user.setPassword("bcrypt-hash-value");
        assertNoCredentials(objectMapper.writeValueAsString(user));

        Customer customer = new Customer();
        customer.setNetbankingUsername("demo-netbanking-user");
        customer.setNetbankingPassword("demo-bank-password");
        assertNoCredentials(objectMapper.writeValueAsString(customer));
    }

    @Test
    void bankRequestDtosKeepPasswordsWriteOnly() throws Exception {
        RegisterRequest register = new RegisterRequest();
        register.setPassword("registration-password");
        LoginRequest login = new LoginRequest();
        login.setPassword("login-password");
        VerifyAccountRequest verify = new VerifyAccountRequest();
        verify.setPassword("bank-account-password");

        assertEquals("accepted", objectMapper.readValue(
                "{\"password\":\"accepted\"}", LoginRequest.class).getPassword());
        assertNoCredentials(objectMapper.writeValueAsString(register));
        assertNoCredentials(objectMapper.writeValueAsString(login));
        assertNoCredentials(objectMapper.writeValueAsString(verify));
    }

    private void assertNoCredentials(String json) {
        assertFalse(json.contains("\"password\""), json);
        assertFalse(json.contains("\"passwordHash\""), json);
        assertFalse(json.contains("\"netbankingPassword\""), json);
        assertFalse(json.contains("\"credentials\""), json);
    }
}
