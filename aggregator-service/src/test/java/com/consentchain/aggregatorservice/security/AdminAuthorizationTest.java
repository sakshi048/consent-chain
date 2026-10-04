package com.consentchain.aggregatorservice.security;

import com.consentchain.aggregatorservice.repository.AuditLogRepository;
import com.consentchain.aggregatorservice.repository.ConsentRepository;
import com.consentchain.aggregatorservice.repository.LinkedBankAccountRepository;
import com.consentchain.aggregatorservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(com.consentchain.aggregatorservice.controller.AdminController.class)
@Import({AuthenticationFilter.class, AccessTokenService.class})
@TestPropertySource(properties = {"AA_AUTH_TOKEN_SECRET=test-aa-auth-secret-0123456789abcdef", "INSTITUTION_AUTH_TOKEN_SECRET=test-inst-auth-secret-0123456789abcdef"})
class AdminAuthorizationTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private AccessTokenService tokenService;
    @MockBean private UserRepository userRepository;
    @MockBean private LinkedBankAccountRepository accountRepository;
    @MockBean private ConsentRepository consentRepository;
    @MockBean private AuditLogRepository auditLogRepository;

    @Test
    void unauthenticatedRequestIsRejected() throws Exception {
        mockMvc.perform(get("/aa/admin/users")).andExpect(status().isUnauthorized());
    }

    @Test
    void normalUserCannotAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/aa/admin/users").header("Authorization", bearer("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanAccessAdminEndpoints() throws Exception {
        when(userRepository.findAll()).thenReturn(List.of());
        mockMvc.perform(get("/aa/admin/users").header("Authorization", bearer("ADMIN")))
                .andExpect(status().isOk());
    }

    private String bearer(String role) {
        return "Bearer " + tokenService.issue(10L, "test-account", role, null);
    }
}
