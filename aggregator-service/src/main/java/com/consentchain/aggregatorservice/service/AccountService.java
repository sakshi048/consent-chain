package com.consentchain.aggregatorservice.service;
import com.consentchain.aggregatorservice.dto.LinkBankRequest;
import com.consentchain.aggregatorservice.dto.AccountLinkResult;
import com.consentchain.aggregatorservice.dto.BankAccountOption;
import com.consentchain.aggregatorservice.dto.LinkedBankAccountResponse;
import com.consentchain.aggregatorservice.model.AuditAction;
import com.consentchain.aggregatorservice.model.LinkedBankAccount;
import com.consentchain.aggregatorservice.model.User;
import com.consentchain.aggregatorservice.repository.LinkedBankAccountRepository;
import com.consentchain.aggregatorservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AccountService {

    private final UserRepository userRepository;
    private final LinkedBankAccountRepository accountRepository;
    private final RestTemplate restTemplate;
    private final AuditService auditService;

    @Value("${fip.base-url:http://localhost:8081}")
    private String fipBaseUrl;
    @Value("${BANK_SERVICE_AUTH_TOKEN:}")
    private String bankServiceAuthToken;


    public AccountService(
            UserRepository userRepository,
            LinkedBankAccountRepository accountRepository,
            RestTemplate restTemplate,
            AuditService auditService) {

        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.restTemplate = restTemplate;
        this.auditService = auditService;
    }

    public AccountLinkResult linkBank(LinkBankRequest request) {

        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("AA user not found"));

        if (bankServiceAuthToken == null || bankServiceAuthToken.isBlank()) {
            throw new IllegalStateException("BANK_SERVICE_AUTH_TOKEN is required for bank verification");
        }
        String url = fipBaseUrl + "/bank/verify-account";
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Service-Token", bankServiceAuthToken);
        Map<String, Object> verificationRequest = new LinkedHashMap<>();
        verificationRequest.put("username", request.getUsername());
        verificationRequest.put("password", request.getPassword());
        if (request.getBankAccountId() != null) verificationRequest.put("bankAccountId", request.getBankAccountId());
        ResponseEntity<BankVerificationResponse> response = restTemplate.exchange(
                url, HttpMethod.POST, new HttpEntity<>(verificationRequest, headers), BankVerificationResponse.class);

        BankVerificationResponse bank =
                response.getBody();

        if (bank == null || !bank.isVerified()) {
            throw new RuntimeException(
                    "Bank account verification failed"
            );
        }

        String aaPan = normalizePan(user.getPanNumber());
        String bankPan = normalizePan(bank.getPanNumber());
        if (aaPan == null || bankPan == null || !aaPan.equals(bankPan)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Bank customer PAN does not match AA user");
        }

        if (request.getBankAccountId() == null) {
            List<BankAccountOption> options = bank.getAccounts().stream()
                    .map(account -> new BankAccountOption(account.getAccountId(), account.getBankName(),
                            account.getAccountNumber().substring(Math.max(0, account.getAccountNumber().length() - 4)),
                            account.getIfsc()))
                    .toList();
            return new AccountLinkResult(true, false, "Select the bank account to link", options, null);
        }

        BankVerificationResponse.BankAccount selected = bank.getAccounts().stream()
                .filter(account -> request.getBankAccountId().equals(account.getAccountId()))
                .findFirst().orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.FORBIDDEN, "Selected account was not verified for this customer"));

        if (accountRepository.existsByUserIdAndAccountNumber(
                user.getId(),
                selected.getAccountNumber())) {

            throw new RuntimeException(
                    "Account already linked"
            );
        }

        LinkedBankAccount linked =
                new LinkedBankAccount();

        linked.setUser(user);
        linked.setBankName(selected.getBankName());
        linked.setAccountNumber(selected.getAccountNumber());
        linked.setIfsc(selected.getIfsc());
        linked.setBankCustomerId(
                String.valueOf(bank.getCustomerId())
        );
        linked.setCustomerPan(bank.getPanNumber());
        linked.setStatus("LINKED");
        linked.setLinkedAt(LocalDateTime.now());

        LinkedBankAccount saved =
                accountRepository.save(linked);

        auditService.log(
                user,
                AuditAction.BANK_LINKED,
                "Linked " + selected.getBankName()
                + " account ending "
                        + selected.getAccountNumber().substring(Math.max(0, selected.getAccountNumber().length() - 4))
        );

        return new AccountLinkResult(true, true, "Bank account linked", List.of(), LinkedBankAccountResponse.from(saved));
    }

    private String normalizePan(String pan) {
        return pan == null || pan.isBlank() ? null : pan.trim().toUpperCase(java.util.Locale.ROOT);
    }

    public List<LinkedBankAccount> getAccounts(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }

        return accountRepository.findByUserId(userId);
    }

    /*
     * This class represents the response
     * coming from the FIP.
     */
    public static class BankVerificationResponse {

        private boolean verified;
        private Long customerId;
        private String customerName;
        private String panNumber;
        private String bankName;
        private String accountNumber;
        private String ifsc;
        private List<BankAccount> accounts = List.of();

        public boolean isVerified() {
            return verified;
        }

        public void setVerified(boolean verified) {
            this.verified = verified;
        }

        public Long getCustomerId() {
            return customerId;
        }

        public void setCustomerId(Long customerId) {
            this.customerId = customerId;
        }

        public String getCustomerName() {
            return customerName;
        }

        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }

        public String getPanNumber() {
            return panNumber;
        }

        public void setPanNumber(String panNumber) {
            this.panNumber = panNumber;
        }

        public String getBankName() {
            return bankName;
        }

        public void setBankName(String bankName) {
            this.bankName = bankName;
        }

        public String getAccountNumber() {
            return accountNumber;
        }

        public void setAccountNumber(String accountNumber) {
            this.accountNumber = accountNumber;
        }

        public String getIfsc() {
            return ifsc;
        }

        public void setIfsc(String ifsc) {
            this.ifsc = ifsc;
        }

        public List<BankAccount> getAccounts() { return accounts == null ? List.of() : accounts; }
        public void setAccounts(List<BankAccount> accounts) { this.accounts = accounts; }

        public static class BankAccount {
            private Long accountId;
            private String bankName;
            private String accountNumber;
            private String ifsc;
            public Long getAccountId() { return accountId; }
            public void setAccountId(Long accountId) { this.accountId = accountId; }
            public String getBankName() { return bankName; }
            public void setBankName(String bankName) { this.bankName = bankName; }
            public String getAccountNumber() { return accountNumber; }
            public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
            public String getIfsc() { return ifsc; }
            public void setIfsc(String ifsc) { this.ifsc = ifsc; }
        }
    }
}
