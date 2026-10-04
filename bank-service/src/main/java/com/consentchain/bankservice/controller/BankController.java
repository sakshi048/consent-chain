package com.consentchain.bankservice.controller;

import com.consentchain.bankservice.dto.ConsentValidationRequest;
import com.consentchain.bankservice.dto.ConsentValidationResponse;
import com.consentchain.bankservice.dto.VerifyAccountRequest;
import com.consentchain.bankservice.dto.VerifyAccountResponse;
import com.consentchain.bankservice.dto.VerifiedBankAccount;
import com.consentchain.bankservice.model.*;
import com.consentchain.bankservice.repository.*;
import com.consentchain.bankservice.service.ServiceToServiceAuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/bank")
public class BankController {

    private static final Logger log = LoggerFactory.getLogger(BankController.class);

    private final ConsentArtefactRepository consentArtefactRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LoanHistoryRepository loanHistoryRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final ServiceToServiceAuthService serviceAuthService;

    public BankController(ConsentArtefactRepository consentArtefactRepository,
                          AccountRepository accountRepository,
                          CustomerRepository customerRepository,
                          TransactionRepository transactionRepository,
                          LoanHistoryRepository loanHistoryRepository,
                          PasswordEncoder passwordEncoder,
                          ServiceToServiceAuthService serviceAuthService) {
        this.consentArtefactRepository = consentArtefactRepository;
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
        this.transactionRepository = transactionRepository;
        this.loanHistoryRepository = loanHistoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.serviceAuthService = serviceAuthService;
    }

    // Shared helper: re-validate consent before releasing any data
    private boolean isConsentUsable(String consentId) {
        Optional<ConsentArtefact> consentOpt = consentArtefactRepository.findByConsentId(consentId);
        if (consentOpt.isEmpty()) {
            return false;
        }
        ConsentArtefact consent = consentOpt.get();
        boolean isActive = consent.getStatus() == ConsentStatus.ACTIVE;
        boolean notExpired = consent.getValidTill().isAfter(LocalDateTime.now());
        return isActive && notExpired;
    }

    @GetMapping("/health-check")
    public String healthCheck() {
        return "Bank service is up";
    }

    @PostMapping("/validate-consent")
    public ResponseEntity<ConsentValidationResponse> validateConsent(
            @RequestBody ConsentValidationRequest request) {

        log.info("Validate-consent request received for consentId={}", request.getConsentId());

        Optional<ConsentArtefact> consentOpt =
                consentArtefactRepository.findByConsentId(request.getConsentId());

        if (consentOpt.isEmpty()) {
            log.warn("Consent not found: consentId={}", request.getConsentId());
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ConsentValidationResponse(false, "Consent not found"));
        }

        ConsentArtefact consent = consentOpt.get();

        boolean isActive = consent.getStatus() == ConsentStatus.ACTIVE;
        boolean notExpired = consent.getValidTill().isAfter(LocalDateTime.now());

        if (isActive && notExpired) {
            log.info("Consent valid: consentId={}", request.getConsentId());
            return ResponseEntity.ok(new ConsentValidationResponse(true, "Consent is valid"));
        } else {
            log.warn("Consent expired or revoked: consentId={}, status={}", request.getConsentId(), consent.getStatus());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ConsentValidationResponse(false, "Consent is expired or revoked"));
        }
    }

    @PostMapping("/fetch-data")
    public ResponseEntity<?> fetchData(
            @RequestParam String accountNumber,
            @RequestParam String consentId) {

        log.info("Fetch-data request: accountNumber={}, consentId={}", accountNumber, consentId);

        if (!isConsentUsable(consentId)) {
            log.warn("Fetch-data rejected — invalid consent: consentId={}", consentId);
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new ConsentValidationResponse(false, "Consent invalid, data not shared"));
        }

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        String rawData = String.format(
                "{\"accountNumber\":\"%s\",\"bankName\":\"%s\",\"balance\":%.2f,\"ifsc\":\"%s\"}",
                account.getAccountNumber(), account.getBankName(),
                account.getBalance(), account.getIfsc()
        );

        String encodedData = Base64.getEncoder().encodeToString(rawData.getBytes(StandardCharsets.UTF_8));

        log.info("Fetch-data success: accountNumber={}", accountNumber);
        return ResponseEntity.ok(Map.of("encodedData", encodedData));
    }

    @PostMapping("/fetch-statement")
    public ResponseEntity<?> fetchStatement(
            @RequestParam String accountNumber,
            @RequestParam String consentId,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {

        log.info("Fetch-statement request: accountNumber={}, consentId={}, from={}, to={}",
                accountNumber, consentId, fromDate, toDate);

        if (!isConsentUsable(consentId)) {
            log.warn("Fetch-statement rejected — invalid consent: consentId={}", consentId);
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new ConsentValidationResponse(false, "Consent invalid, data not shared"));
        }

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        List<Transaction> transactions;
        if (fromDate != null && toDate != null) {
            transactions = transactionRepository.findByAccountIdAndTxnDateBetween(
                    account.getId(), LocalDate.parse(fromDate), LocalDate.parse(toDate));
        } else {
            transactions = transactionRepository.findByAccountId(account.getId());
        }

        log.info("Fetch-statement success: accountNumber={}, txnCount={}", accountNumber, transactions.size());

        return ResponseEntity.ok(Map.of(
                "accountNumber", account.getAccountNumber(),
                "bankName", account.getBankName(),
                "transactions", transactions
        ));
    }

    @GetMapping("/loan-history/{accountNumber}")
    public ResponseEntity<?> loanHistory(@PathVariable String accountNumber) {

        log.info("Loan-history request: accountNumber={}", accountNumber);

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        List<LoanHistory> loans = loanHistoryRepository.findByAccountId(account.getId());

        log.info("Loan-history success: accountNumber={}, loanCount={}", accountNumber, loans.size());

        return ResponseEntity.ok(loans);
    }
    @PostMapping("/verify-account")
    public ResponseEntity<VerifyAccountResponse> verifyAccount(
            @RequestHeader(value = ServiceToServiceAuthService.HEADER_NAME, required = false) String serviceToken,
            @RequestBody VerifyAccountRequest request) {

        serviceAuthService.requireAggregator(serviceToken);

        log.info("Account verification request received for username={}",
                request.getUsername());

        // 1. Find customer using net banking username
        Optional<Customer> customerOpt =
                customerRepository.findByNetbankingUsername(
                        request.getUsername());

        if (customerOpt.isEmpty()) {
            return ResponseEntity.ok(new VerifyAccountResponse(false, "Customer not found", null, null, null, List.of()));
        }

        Customer customer = customerOpt.get();

        // 2. Verify password
        if (!verifyAndUpgradeCustomerPassword(customer, request.getPassword())) {

            return ResponseEntity.ok(new VerifyAccountResponse(false, "Invalid bank credentials", null, null, null, List.of()));
        }

        // 3. Find customer's bank accounts
        List<Account> accounts =
                accountRepository.findByCustomerId(
                        customer.getId());

        if (accounts.isEmpty()) {
            return ResponseEntity.ok(new VerifyAccountResponse(false, "No bank account found", null, null, null, List.of()));
        }

        if (request.getBankAccountId() != null) {
            Account selected = accounts.stream()
                    .filter(account -> request.getBankAccountId().equals(account.getId()))
                    .findFirst().orElse(null);
            if (selected == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new VerifyAccountResponse(false, "Selected account does not belong to verified customer", null, null, null, List.of()));
            }
            accounts = List.of(selected);
        }

        List<VerifiedBankAccount> verifiedAccounts = accounts.stream()
                .map(account -> new VerifiedBankAccount(account.getId(), account.getBankName(),
                        account.getAccountNumber(), account.getIfsc()))
                .toList();
        return ResponseEntity.ok(new VerifyAccountResponse(true, "Bank credentials verified",
                customer.getId(), customer.getName(), customer.getPanNumber(), verifiedAccounts));
    }

    private boolean verifyAndUpgradeCustomerPassword(Customer customer, String rawPassword) {
        if (rawPassword == null || customer.getNetbankingPassword() == null) return false;
        String stored = customer.getNetbankingPassword();
        if (stored.matches("^\\$2[aby]\\$[0-9]{2}\\$.*")) {
            return passwordEncoder.matches(rawPassword, stored);
        }
        if (!java.security.MessageDigest.isEqual(stored.getBytes(StandardCharsets.UTF_8), rawPassword.getBytes(StandardCharsets.UTF_8))) {
            return false;
        }
        customer.setNetbankingPassword(passwordEncoder.encode(rawPassword));
        customerRepository.save(customer);
        return true;
    }

}
