package com.consentchain.aggregatorservice.security;

import com.consentchain.aggregatorservice.controller.AccountController;
import com.consentchain.aggregatorservice.controller.ConsentController;
import com.consentchain.aggregatorservice.model.Consent;
import com.consentchain.aggregatorservice.model.User;
import com.consentchain.aggregatorservice.service.AccountService;
import com.consentchain.aggregatorservice.service.ConsentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({AccountController.class, ConsentController.class})
@Import({AuthenticationFilter.class, AccessTokenService.class, ResourceAuthorizationService.class})
@TestPropertySource(properties = {"AA_AUTH_TOKEN_SECRET=test-aa-auth-secret-0123456789abcdef", "INSTITUTION_AUTH_TOKEN_SECRET=test-inst-auth-secret-0123456789abcdef"})
class UserResourceAuthorizationTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private AccessTokenService tokenService;
    @MockBean private AccountService accountService;
    @MockBean private ConsentService consentService;

    @Test
    void userCannotReadAnotherUsersAccountsByChangingUserId() throws Exception {
        mockMvc.perform(get("/aa/accounts/2").header("Authorization", userBearer(1L)))
                .andExpect(status().isForbidden());
    }

    @Test
    void userCannotListAnotherUsersConsentsByChangingUserId() throws Exception {
        mockMvc.perform(get("/aa/consents/user/2").header("Authorization", userBearer(1L)))
                .andExpect(status().isForbidden());
    }

    @Test
    void userCannotReadAnotherUsersConsentByChangingConsentId() throws Exception {
        User owner = new User();
        ReflectionTestUtils.setField(owner, "id", 2L);
        Consent consent = new Consent();
        consent.setUser(owner);
        when(consentService.getConsent("CONSENT-OTHER")).thenReturn(consent);
        mockMvc.perform(get("/aa/consents/CONSENT-OTHER").header("Authorization", userBearer(1L)))
                .andExpect(status().isForbidden());
    }

    @Test
    void unauthenticatedUserOwnedRequestIsRejected() throws Exception {
        mockMvc.perform(get("/aa/accounts/1")).andExpect(status().isUnauthorized());
    }

    private String userBearer(Long id) {
        return "Bearer " + tokenService.issue(id, "aa-user-" + id, "USER", null);
    }
}
