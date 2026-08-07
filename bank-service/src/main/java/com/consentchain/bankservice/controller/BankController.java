package com.consentchain.bankservice.controller;

import com.consentchain.bankservice.dto.ConsentValidationRequest;
import com.consentchain.bankservice.dto.ConsentValidationResponse;
import com.consentchain.bankservice.model.ConsentArtefact;
import com.consentchain.bankservice.model.ConsentStatus;
import com.consentchain.bankservice.repository.ConsentArtefactRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.consentchain.bankservice.model.BankAccount;
import com.consentchain.bankservice.repository.BankAccountRepository;
import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/bank")
public class BankController {

    private final ConsentArtefactRepository consentArtefactRepository;
    private final BankAccountRepository bankAccountRepository;

    public BankController(ConsentArtefactRepository consentArtefactRepository,
                          BankAccountRepository bankAccountRepository) {
        this.consentArtefactRepository = consentArtefactRepository;
        this.bankAccountRepository = bankAccountRepository;
    }

    @GetMapping("/health-check")
    public String healthCheck() {
        return "Bank service is up";
    }

    @PostMapping("/validate-consent")
    public ResponseEntity<ConsentValidationResponse> validateConsent(
            @RequestBody ConsentValidationRequest request) {

        Optional<ConsentArtefact> consentOpt =
                consentArtefactRepository.findByConsentId(request.getConsentId());

        if (consentOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ConsentValidationResponse(false, "Consent not found"));
        }

        ConsentArtefact consent = consentOpt.get();

        boolean isActive = consent.getStatus() == ConsentStatus.ACTIVE;
        boolean notExpired = consent.getValidTill().isAfter(LocalDateTime.now());

        if (isActive && notExpired) {
            return ResponseEntity.ok(new ConsentValidationResponse(true, "Consent is valid"));
        } else {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ConsentValidationResponse(false, "Consent is expired or revoked"));
        }
    }

    @PostMapping("/fetch-data")
    public ResponseEntity<?> fetchData(
            @RequestParam String accountNumber,
            @RequestParam String consentId) {

        // Step 1: Re-validate consent (reused logic)
        ConsentArtefact consent = consentArtefactRepository.findByConsentId(consentId)
                .orElseThrow(() -> new RuntimeException("Consent not found"));

        boolean isActive = consent.getStatus() == ConsentStatus.ACTIVE;
        boolean notExpired = consent.getValidTill().isAfter(LocalDateTime.now());

        if (!isActive || !notExpired) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new ConsentValidationResponse(false, "Consent invalid, data not shared"));
        }

        // Step 2: Fetch account
        BankAccount account = bankAccountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // Step 3: Encode data (simulate secure transfer)
        String rawData = String.format(
                "{\"accountNumber\":\"%s\",\"holderName\":\"%s\",\"balance\":%.2f,\"ifscCode\":\"%s\"}",
                account.getAccountNumber(), account.getHolderName(),
                account.getBalance(), account.getIfscCode()
        );

        String encodedData = Base64.getEncoder().encodeToString(rawData.getBytes(StandardCharsets.UTF_8));

        return ResponseEntity.ok(Map.of("encodedData", encodedData));
    }


}