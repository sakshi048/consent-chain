package com.consentchain.bankservice.controller;

import com.consentchain.bankservice.dto.ConsentValidationRequest;
import com.consentchain.bankservice.dto.ConsentValidationResponse;
import com.consentchain.bankservice.dto.VerifyAccountRequest;
import com.consentchain.bankservice.model.*;
import com.consentchain.bankservice.repository.*;
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

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/bank")
public class BankController {

    private static final Logger log = LoggerFactory.getLogger(BankController.class);

    private final ConsentArtefactRepository consentArtefactRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LoanHistoryRepository loanHistoryRepository;
    private final CustomerRepository customerRepository;

    public BankController(ConsentArtefactRepository consentArtefactRepository,
                          AccountRepository accountRepository,
                          CustomerRepository customerRepository,
                          TransactionRepository transactionRepository,
                          LoanHistoryRepository loanHistoryRepository) {
        this.consentArtefactRepository = consentArtefactRepository;
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
        this.transactionRepository = transactionRepository;
        this.loanHistoryRepository = loanHistoryRepository;
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

    @GetMapping("/branches")
    public ResponseEntity<List<Map<String, String>>> getBranches(
            @RequestParam(defaultValue = "Maharashtra") String state,
            @RequestParam(defaultValue = "Mumbai") String city) {

        log.info("Get branches request: state={}, city={}", state, city);

        List<Map<String, String>> branches;

        if ("Maharashtra".equalsIgnoreCase(state) && "Pune".equalsIgnoreCase(city)) {
            branches = List.of(
                    Map.of("bankName", "HDFC Bank", "ifscCode", "HDFC0001234", "branchName", "FC Road Branch, Pune"),
                    Map.of("bankName", "State Bank of India (SBI)", "ifscCode", "SBIN0004567", "branchName", "Shivajinagar Branch, Pune"),
                    Map.of("bankName", "ICICI Bank", "ifscCode", "ICIC0007890", "branchName", "Kothrud Branch, Pune")
            );
        } else if ("Karnataka".equalsIgnoreCase(state)) {
            branches = List.of(
                    Map.of("bankName", "HDFC Bank", "ifscCode", "HDFC0001234", "branchName", "MG Road Branch, Bengaluru"),
                    Map.of("bankName", "State Bank of India (SBI)", "ifscCode", "SBIN0004567", "branchName", "Koramangala Branch, Bengaluru"),
                    Map.of("bankName", "ICICI Bank", "ifscCode", "ICIC0007890", "branchName", "Indiranagar Branch, Bengaluru")
            );
        } else if ("Delhi".equalsIgnoreCase(state)) {
            branches = List.of(
                    Map.of("bankName", "HDFC Bank", "ifscCode", "HDFC0001234", "branchName", "Connaught Place, New Delhi"),
                    Map.of("bankName", "State Bank of India (SBI)", "ifscCode", "SBIN0004567", "branchName", "Parliament Street, New Delhi"),
                    Map.of("bankName", "ICICI Bank", "ifscCode", "ICIC0007890", "branchName", "Nehru Place, New Delhi")
            );
        } else {
            // Default Maharashtra / Mumbai branches matching seed data
            branches = List.of(
                    Map.of("bankName", "HDFC Bank", "ifscCode", "HDFC0001234", "branchName", "Mumbai Main Branch"),
                    Map.of("bankName", "State Bank of India (SBI)", "ifscCode", "SBIN0004567", "branchName", "Fort Branch, Mumbai"),
                    Map.of("bankName", "ICICI Bank", "ifscCode", "ICIC0007890", "branchName", "BKC Branch, Mumbai")
            );
        }

        return ResponseEntity.ok(branches);
    }

    @GetMapping("/account-lookup")
    public ResponseEntity<?> accountLookup(
            @RequestParam String accNo,
            @RequestParam(required = false) String ifsc) {

        log.info("Account-lookup request: accNo={}, ifsc={}", accNo, ifsc);

        String cleanedAcc = accNo != null ? accNo.trim().toUpperCase() : "";
        Optional<Account> accountOpt = accountRepository.findByAccountNumber(cleanedAcc);

        List<String> seedAccs = List.of("AC1000234567", "AC2000998877", "AC1000234568", "AC3000556644");

        if (accountOpt.isEmpty() && !seedAccs.contains(cleanedAcc)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "verified", false,
                    "message", "Invalid account number. Account not found in seed database."
            ));
        }

        String accountHolderName = "Verified Customer";
        String accountType = "Savings";

        if (accountOpt.isPresent()) {
            Account account = accountOpt.get();
            Optional<Customer> customerOpt = customerRepository.findById(account.getCustomerId());
            if (customerOpt.isPresent()) {
                accountHolderName = customerOpt.get().getName();
            }
        }

        String maskedAccNo = "XXXX" + (cleanedAcc.length() >= 4 ? cleanedAcc.substring(cleanedAcc.length() - 4) : cleanedAcc);

        return ResponseEntity.ok(Map.of(
                "verified", true,
                "accountHolderName", accountHolderName,
                "accountType", accountType,
                "maskedAccNo", maskedAccNo
        ));
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
    public ResponseEntity<?> verifyAccount(
            @RequestBody VerifyAccountRequest request) {

        log.info("Account verification request received for username={}",
                request.getUsername());

        // 1. Find customer using net banking username
        Optional<Customer> customerOpt =
                customerRepository.findByNetbankingUsername(
                        request.getUsername());

        if (customerOpt.isEmpty()) {
            return ResponseEntity.ok(
                    Map.of(
                            "verified", false,
                            "message", "Customer not found"
                    )
            );
        }

        Customer customer = customerOpt.get();

        // 2. Verify password
        if (!customer.getNetbankingPassword()
                .equals(request.getPassword())) {

            return ResponseEntity.ok(
                    Map.of(
                            "verified", false,
                            "message", "Invalid bank credentials"
                    )
            );
        }

        // 3. Find customer's bank accounts
        List<Account> accounts =
                accountRepository.findByCustomerId(
                        customer.getId());

        if (accounts.isEmpty()) {
            return ResponseEntity.ok(
                    Map.of(
                            "verified", false,
                            "message", "No bank account found"
                    )
            );
        }

        // For now use the first account
        Account account = accounts.get(0);

        // 4. Return verified account information
        return ResponseEntity.ok(
                Map.of(
                        "verified", true,
                        "customerId", customer.getId(),
                        "customerName", customer.getName(),
                        "panNumber", customer.getPanNumber(),
                        "bankName", account.getBankName(),
                        "accountNumber", account.getAccountNumber(),
                        "ifsc", account.getIfsc()
                )
        );
    }

}