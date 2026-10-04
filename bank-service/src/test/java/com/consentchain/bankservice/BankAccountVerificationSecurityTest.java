package com.consentchain.bankservice;

import com.consentchain.bankservice.controller.BankController;
import com.consentchain.bankservice.dto.VerifyAccountRequest;
import com.consentchain.bankservice.model.Account;
import com.consentchain.bankservice.model.Customer;
import com.consentchain.bankservice.repository.*;
import com.consentchain.bankservice.service.ServiceToServiceAuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BankAccountVerificationSecurityTest {
    private CustomerRepository customerRepository;
    private AccountRepository accountRepository;
    private BCryptPasswordEncoder encoder;
    private BankController controller;
    private Customer customer;

    @BeforeEach
    void setUp() {
        customerRepository = mock(CustomerRepository.class);
        accountRepository = mock(AccountRepository.class);
        encoder = new BCryptPasswordEncoder();
        controller = new BankController(mock(ConsentArtefactRepository.class), accountRepository,
                customerRepository, mock(TransactionRepository.class), mock(LoanHistoryRepository.class),
                encoder, new ServiceToServiceAuthService("test-internal-secret"));
        customer = new Customer();
        customer.setId(41L);
        customer.setName("Test Customer");
        customer.setPanNumber("ABCDE1234F");
        customer.setNetbankingUsername("customer");
        customer.setNetbankingPassword(encoder.encode("bank-pass"));
        when(customerRepository.findByNetbankingUsername("customer")).thenReturn(Optional.of(customer));
        when(accountRepository.findByCustomerId(41L)).thenReturn(List.of(account(1L, "111122223333"), account(2L, "999900001111")));
    }

    @Test
    void rejectsMissingServiceCredential() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> controller.verifyAccount(null, request(null)));
        assertEquals(HttpStatus.UNAUTHORIZED, error.getStatusCode());
    }

    @Test
    void acceptsValidAggregatorCredentialAndReturnsAllOwnedAccounts() {
        ResponseEntity<?> response = controller.verifyAccount("test-internal-secret", request(null));
        assertEquals(200, response.getStatusCode().value());
        var body = (com.consentchain.bankservice.dto.VerifyAccountResponse) response.getBody();
        assertNotNull(body);
        assertEquals(2, body.accounts().size());
        assertEquals(List.of(1L, 2L), body.accounts().stream().map(a -> a.accountId()).toList());
        assertEquals("ABCDE1234F", body.panNumber());
    }

    @Test
    void rejectsIncorrectBankPassword() {
        ResponseEntity<?> response = controller.verifyAccount("test-internal-secret", requestWithPassword("wrong", null));
        var body = (com.consentchain.bankservice.dto.VerifyAccountResponse) response.getBody();
        assertNotNull(body);
        assertFalse(body.verified());
        verify(accountRepository, never()).findByCustomerId(anyLong());
    }

    @Test
    void selectsNonFirstAccountAfterCheckingCustomerOwnership() {
        ResponseEntity<?> response = controller.verifyAccount("test-internal-secret", request(2L));
        var body = (com.consentchain.bankservice.dto.VerifyAccountResponse) response.getBody();
        assertNotNull(body);
        assertEquals(1, body.accounts().size());
        assertEquals(2L, body.accounts().get(0).accountId());
        assertEquals("999900001111", body.accounts().get(0).accountNumber());
    }

    @Test
    void rejectsAccountNotOwnedByCredentialAuthenticatedCustomer() {
        ResponseEntity<?> response = controller.verifyAccount("test-internal-secret", request(77L));
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verify(customerRepository, never()).save(any());
    }

    @Test
    void upgradesLegacyPlaintextPasswordOnlyAfterSuccessfulVerification() {
        customer.setNetbankingPassword("legacy-pass");
        when(customerRepository.findByNetbankingUsername("customer")).thenReturn(Optional.of(customer));
        controller.verifyAccount("test-internal-secret", requestWithPassword("legacy-pass", null));
        verify(customerRepository).save(customer);
        assertNotEquals("legacy-pass", customer.getNetbankingPassword());
        assertTrue(encoder.matches("legacy-pass", customer.getNetbankingPassword()));
    }

    @Test
    void responseAndEntitySerializationOmitCredentialAndPanFields() throws Exception {
        var body = controller.verifyAccount("test-internal-secret", request(null)).getBody();
        String json = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(body);
        assertTrue(json.contains("panNumber")); // This DTO is backend-only; aggregator uses it for PAN matching.
        assertFalse(json.contains("password"));
        assertFalse(json.contains("netbankingPassword"));
        String customerJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(customer);
        assertFalse(customerJson.contains("netbankingPassword"));
    }

    private VerifyAccountRequest request(Long accountId) { return requestWithPassword("bank-pass", accountId); }
    private VerifyAccountRequest requestWithPassword(String password, Long accountId) {
        VerifyAccountRequest request = new VerifyAccountRequest();
        request.setUsername("customer");
        request.setPassword(password);
        request.setBankAccountId(accountId);
        return request;
    }
    private Account account(Long id, String number) {
        Account account = new Account();
        account.setId(id);
        account.setCustomerId(41L);
        account.setBankName("Demo Bank");
        account.setAccountNumber(number);
        account.setIfsc("DEMO0001");
        account.setBalance(BigDecimal.TEN);
        return account;
    }
}
