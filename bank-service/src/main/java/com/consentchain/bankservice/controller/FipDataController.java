package com.consentchain.bankservice.controller;

import com.consentchain.bankservice.service.FipDataService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/fip/data")
public class FipDataController {

    private final FipDataService fipDataService;

    public FipDataController(
            FipDataService fipDataService) {

        this.fipDataService = fipDataService;
    }

    // =========================================================
    // ACCOUNT DATA
    // =========================================================

    @PostMapping("/account")
    public ResponseEntity<?> accountData(
            @RequestParam String accountNumber,
            @RequestParam String consentId) {

        try {

            Map<String, Object> response =
                    fipDataService.fetchAccountData(
                            accountNumber,
                            consentId);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // TRANSACTIONS
    // =========================================================

    @PostMapping("/transactions")
    public ResponseEntity<?> transactions(
            @RequestParam String accountNumber,
            @RequestParam String consentId,
            @RequestParam(required = false)
            String fromDate,
            @RequestParam(required = false)
            String toDate) {

        try {

            LocalDate from = null;
            LocalDate to = null;

            if (fromDate != null &&
                    !fromDate.isBlank()) {

                from = LocalDate.parse(fromDate);
            }

            if (toDate != null &&
                    !toDate.isBlank()) {

                to = LocalDate.parse(toDate);
            }

            Map<String, Object> response =
                    fipDataService.fetchTransactions(
                            accountNumber,
                            consentId,
                            from,
                            to);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // LOANS
    // =========================================================

    @PostMapping("/loans")
    public ResponseEntity<?> loans(
            @RequestParam String accountNumber,
            @RequestParam String consentId) {

        try {

            Map<String, Object> response =
                    fipDataService.fetchLoanHistory(
                            accountNumber,
                            consentId);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }
}