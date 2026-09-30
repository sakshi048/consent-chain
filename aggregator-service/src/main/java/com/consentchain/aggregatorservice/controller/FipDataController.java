package com.consentchain.aggregatorservice.controller;

import com.consentchain.aggregatorservice.service.FipDataService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/aa/data")
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
    public ResponseEntity<?> fetchAccountData(
            @RequestParam String accountNumber,
            @RequestParam String consentId) {

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
            String toDate) {

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
            @RequestParam String consentId) {

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