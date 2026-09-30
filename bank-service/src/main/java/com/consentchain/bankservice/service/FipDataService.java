package com.consentchain.bankservice.service;

import com.consentchain.bankservice.model.Account;
import com.consentchain.bankservice.model.ConsentArtefact;
import com.consentchain.bankservice.model.ConsentStatus;
import com.consentchain.bankservice.model.LoanHistory;
import com.consentchain.bankservice.model.Transaction;
import com.consentchain.bankservice.repository.AccountRepository;
import com.consentchain.bankservice.repository.ConsentArtefactRepository;
import com.consentchain.bankservice.repository.LoanHistoryRepository;
import com.consentchain.bankservice.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FipDataService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LoanHistoryRepository loanHistoryRepository;
    private final ConsentArtefactRepository consentArtefactRepository;

    public FipDataService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            LoanHistoryRepository loanHistoryRepository,
            ConsentArtefactRepository consentArtefactRepository) {

        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.loanHistoryRepository = loanHistoryRepository;
        this.consentArtefactRepository = consentArtefactRepository;
    }

    // =========================================================
    // COMMON CONSENT VALIDATION
    // =========================================================

    private ConsentArtefact validateConsent(String consentId) {

        if (consentId == null || consentId.isBlank()) {
            throw new RuntimeException("Consent ID is required");
        }

        ConsentArtefact consent =
                consentArtefactRepository
                        .findByConsentId(consentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Consent not found"));

        // Check status
        if (consent.getStatus() != ConsentStatus.ACTIVE) {
            throw new RuntimeException(
                    "Consent is not active");
        }

        // Check expiry
        if (consent.getValidTill() == null) {
            throw new RuntimeException(
                    "Consent validity date is missing");
        }

        if (!consent.getValidTill()
                .isAfter(LocalDateTime.now())) {

            throw new RuntimeException(
                    "Consent has expired");
        }

        return consent;
    }

    // =========================================================
    // FIND ACCOUNT
    // =========================================================

    private Account findAccount(String accountNumber) {

        if (accountNumber == null ||
                accountNumber.isBlank()) {

            throw new RuntimeException(
                    "Account number is required");
        }

        return accountRepository
                .findByAccountNumber(accountNumber)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Account not found"));
    }

    // =========================================================
    // ACCOUNT DATA
    // =========================================================

    public Map<String, Object> fetchAccountData(
            String accountNumber,
            String consentId) {

        // 1. Validate consent
        ConsentArtefact consent =
                validateConsent(consentId);

        // 2. Find account
        Account account =
                findAccount(accountNumber);

        // 3. Prepare response
        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "consentId",
                consent.getConsentId());

        response.put(
                "purpose",
                consent.getPurpose());

        response.put(
                "dataScope",
                consent.getDataScope());

        response.put(
                "accountNumber",
                account.getAccountNumber());

        response.put(
                "bankName",
                account.getBankName());

        response.put(
                "ifsc",
                account.getIfsc());

        response.put(
                "balance",
                account.getBalance());

        return response;
    }

    // =========================================================
    // TRANSACTION DATA
    // =========================================================

    public Map<String, Object> fetchTransactions(
            String accountNumber,
            String consentId,
            LocalDate fromDate,
            LocalDate toDate) {

        // 1. Validate consent
        ConsentArtefact consent =
                validateConsent(consentId);

        // 2. Find account
        Account account =
                findAccount(accountNumber);

        // 3. Fetch transactions
        List<Transaction> transactions;

        if (fromDate != null && toDate != null) {

            if (fromDate.isAfter(toDate)) {
                throw new RuntimeException(
                        "fromDate cannot be after toDate");
            }

            transactions =
                    transactionRepository
                            .findByAccountIdAndTxnDateBetween(
                                    account.getId(),
                                    fromDate,
                                    toDate);

        } else {

            transactions =
                    transactionRepository
                            .findByAccountId(
                                    account.getId());
        }

        // 4. Prepare response
        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "consentId",
                consent.getConsentId());

        response.put(
                "purpose",
                consent.getPurpose());

        response.put(
                "dataScope",
                consent.getDataScope());

        response.put(
                "accountNumber",
                account.getAccountNumber());

        response.put(
                "bankName",
                account.getBankName());

        response.put(
                "transactions",
                transactions);

        return response;
    }

    // =========================================================
    // LOAN DATA
    // =========================================================

    public Map<String, Object> fetchLoanHistory(
            String accountNumber,
            String consentId) {

        // 1. Validate consent
        ConsentArtefact consent =
                validateConsent(consentId);

        // 2. Find account
        Account account =
                findAccount(accountNumber);

        // 3. Fetch loans
        List<LoanHistory> loans =
                loanHistoryRepository
                        .findByAccountId(
                                account.getId());

        // 4. Prepare response
        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "consentId",
                consent.getConsentId());

        response.put(
                "purpose",
                consent.getPurpose());

        response.put(
                "dataScope",
                consent.getDataScope());

        response.put(
                "accountNumber",
                account.getAccountNumber());

        response.put(
                "bankName",
                account.getBankName());

        response.put(
                "loans",
                loans);

        return response;
    }
}