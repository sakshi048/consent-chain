package com.consentchain.aggregatorservice.controller;

import com.consentchain.aggregatorservice.service.FipDataService;
import com.consentchain.aggregatorservice.service.ConsentService;
import com.consentchain.aggregatorservice.security.AuthenticatedPrincipal;
import com.consentchain.aggregatorservice.security.ResourceAuthorizationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/aa/data")
public class FipDataController {

    private final FipDataService fipDataService;
    private final ConsentService consentService;
    private final ResourceAuthorizationService authorizationService;

    public FipDataController(
            FipDataService fipDataService,
            ConsentService consentService,
            ResourceAuthorizationService authorizationService) {

        this.fipDataService = fipDataService;
        this.consentService = consentService;
        this.authorizationService = authorizationService;
    }

    // =========================================================
    // ACCOUNT DATA
    // =========================================================

    @PostMapping("/account")
    public ResponseEntity<?> fetchAccountData(
            @RequestParam String accountNumber,
            @RequestParam String consentId,
            @RequestAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE) AuthenticatedPrincipal principal) {

        authorizationService.requireConsentOwner(consentService.getConsent(consentId), principal);

        try {

            String response =
                    fipDataService.fetchAccountData(
                            accountNumber,
                            consentId
                    );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // TRANSACTIONS
    // =========================================================

    @PostMapping("/transactions")
    public ResponseEntity<?> fetchTransactions(
            @RequestParam String accountNumber,
            @RequestParam String consentId,
            @RequestParam(required = false)
            String fromDate,
            @RequestParam(required = false)
            String toDate,
            @RequestAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE) AuthenticatedPrincipal principal) {

        authorizationService.requireConsentOwner(consentService.getConsent(consentId), principal);

        try {

            String response =
                    fipDataService.fetchTransactions(
                            accountNumber,
                            consentId,
                            fromDate,
                            toDate
                    );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // LOANS
    // =========================================================

    @PostMapping("/loans")
    public ResponseEntity<?> fetchLoans(
            @RequestParam String accountNumber,
            @RequestParam String consentId,
            @RequestAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE) AuthenticatedPrincipal principal) {

        authorizationService.requireConsentOwner(consentService.getConsent(consentId), principal);

        try {

            String response =
                    fipDataService.fetchLoans(
                            accountNumber,
                            consentId
                    );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
}
