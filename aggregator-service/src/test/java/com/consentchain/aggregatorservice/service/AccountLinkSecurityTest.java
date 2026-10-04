package com.consentchain.aggregatorservice.service;

import com.consentchain.aggregatorservice.dto.LinkBankRequest;
import com.consentchain.aggregatorservice.model.LinkedBankAccount;
import com.consentchain.aggregatorservice.model.User;
import com.consentchain.aggregatorservice.repository.LinkedBankAccountRepository;
import com.consentchain.aggregatorservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AccountLinkSecurityTest {
    private UserRepository users;
    private LinkedBankAccountRepository accounts;
    private RestTemplate restTemplate;
    private AccountService service;
    private User user;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        accounts = mock(LinkedBankAccountRepository.class);
        restTemplate = mock(RestTemplate.class);
        service = new AccountService(users, accounts, restTemplate, mock(AuditService.class));
        ReflectionTestUtils.setField(service, "fipBaseUrl", "http://localhost:8081");
        ReflectionTestUtils.setField(service, "bankServiceAuthToken", "test-internal-secret");
        user = new User();
        user.setPanNumber(" abcdE1234f ");
        when(users.findById(9L)).thenReturn(Optional.of(user));
        when(accounts.existsByUserIdAndAccountNumber(anyLong(), anyString())).thenReturn(false);
        when(accounts.save(any(LinkedBankAccount.class))).thenAnswer(call -> call.getArgument(0));
    }

    @Test
    void rejectsPanMismatchBeforePersisting() {
        bankResponse("ZZZZZ9999Z", List.of(bankAccount(2L, "999900001111")));
        assertThrows(ResponseStatusException.class, () -> service.linkBank(request(null)));
        verify(accounts, never()).save(any());
    }

    @Test
    void matchingPanReturnsEligibleAccountsWithoutPersistingUntilSelection() {
        bankResponse("ABCDE1234F", List.of(bankAccount(1L, "111122223333"), bankAccount(2L, "999900001111")));
        var result = service.linkBank(request(null));
        assertTrue(result.verified());
        assertFalse(result.linked());
        assertEquals(List.of("3333", "1111"), result.accounts().stream().map(a -> a.accountNumberLastFour()).toList());
        verify(accounts, never()).save(any());
    }

    @Test
    void linksNonFirstAccountReturnedByBankAndSendsServiceCredential() {
        bankResponse("ABCDE1234F", List.of(bankAccount(2L, "999900001111")));
        var result = service.linkBank(request(2L));
        assertTrue(result.linked());
        assertEquals("999900001111", result.account().accountNumber());
        verify(accounts).save(argThat(account -> "999900001111".equals(account.getAccountNumber())));
        ArgumentCaptor<HttpEntity> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).exchange(eq("http://localhost:8081/bank/verify-account"), eq(HttpMethod.POST),
                entityCaptor.capture(), eq(AccountService.BankVerificationResponse.class));
        assertEquals("test-internal-secret", entityCaptor.getValue().getHeaders().getFirst("X-Internal-Service-Token"));
        assertEquals("bank-password", ((java.util.Map<?, ?>) entityCaptor.getValue().getBody()).get("password"));
    }

    @Test
    void rejectsSelectedAccountNotReturnedForCredentialAuthenticatedCustomer() {
        bankResponse("ABCDE1234F", List.of(bankAccount(1L, "111122223333")));
        assertThrows(ResponseStatusException.class, () -> service.linkBank(request(2L)));
        verify(accounts, never()).save(any());
    }

    @Test
    void linkedAccountResponseOmitsPanAndNestedUser() throws Exception {
        bankResponse("ABCDE1234F", List.of(bankAccount(2L, "999900001111")));
        String json = new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules()
                .writeValueAsString(service.linkBank(request(2L)));
        assertFalse(json.contains("panNumber"));
        assertFalse(json.contains("customerPan"));
        assertFalse(json.contains("bankCustomerId"));
        assertFalse(json.contains("\"user\""));
    }

    private LinkBankRequest request(Long bankAccountId) {
        LinkBankRequest request = new LinkBankRequest();
        request.setUserId(9L);
        request.setUsername("bank-user");
        request.setPassword("bank-password");
        request.setBankAccountId(bankAccountId);
        return request;
    }

    private AccountService.BankVerificationResponse.BankAccount bankAccount(Long id, String number) {
        var account = new AccountService.BankVerificationResponse.BankAccount();
        account.setAccountId(id);
        account.setBankName("Demo Bank");
        account.setAccountNumber(number);
        account.setIfsc("DEMO0001");
        return account;
    }

    private void bankResponse(String pan, List<AccountService.BankVerificationResponse.BankAccount> bankAccounts) {
        var response = new AccountService.BankVerificationResponse();
        response.setVerified(true);
        response.setCustomerId(41L);
        response.setPanNumber(pan);
        response.setAccounts(bankAccounts);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class),
                eq(AccountService.BankVerificationResponse.class))).thenReturn(ResponseEntity.ok(response));
    }
}
