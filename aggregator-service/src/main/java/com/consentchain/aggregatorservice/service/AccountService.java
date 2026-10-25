package com.consentchain.aggregatorservice.service;
import com.consentchain.aggregatorservice.dto.LinkBankRequest;
import com.consentchain.aggregatorservice.model.AuditAction;
import com.consentchain.aggregatorservice.model.LinkedBankAccount;
import com.consentchain.aggregatorservice.model.User;
import com.consentchain.aggregatorservice.repository.LinkedBankAccountRepository;
import com.consentchain.aggregatorservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AccountService {

    private final UserRepository userRepository;
    private final LinkedBankAccountRepository accountRepository;
    private final RestTemplate restTemplate;
    private final AuditService auditService;

  @Value("${fip.base-url:http://localhost:8081}")
    private String fipBaseUrl;


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

    public Object linkBank(LinkBankRequest request) {

        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("AA user not found"));

        String url = fipBaseUrl + "/bank/verify-account";

        ResponseEntity<BankVerificationResponse> response =
                restTemplate.postForEntity(
                        url,
                        request,
                        BankVerificationResponse.class
                );

        BankVerificationResponse bank =
                response.getBody();

        if (bank == null || !bank.isVerified()) {
            throw new RuntimeException(
                    "Bank account verification failed"
            );
        }

        if (accountRepository.existsByUserIdAndAccountNumber(
                user.getId(),
                bank.getAccountNumber())) {

            throw new RuntimeException(
                    "Account already linked"
            );
        }

        LinkedBankAccount linked =
                new LinkedBankAccount();

        linked.setUser(user);
        linked.setBankName(bank.getBankName());
        linked.setAccountNumber(bank.getAccountNumber());
        linked.setIfsc(bank.getIfsc());
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
                "Linked " + bank.getBankName()
                        + " account "
                        + bank.getAccountNumber()
        );

        return saved;
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
    }
}