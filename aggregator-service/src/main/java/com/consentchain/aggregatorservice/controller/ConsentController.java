package com.consentchain.aggregatorservice.controller;

import com.consentchain.aggregatorservice.dto.ConsentRequest;
import com.consentchain.aggregatorservice.model.Consent;
import com.consentchain.aggregatorservice.service.ConsentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aa/consents")
public class ConsentController {

    private final ConsentService consentService;


    public ConsentController(
            ConsentService consentService) {

        this.consentService =
                consentService;
    }


    // =========================================================
    // CREATE CONSENT
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createConsent(
            @RequestBody ConsentRequest request) {

        try {

            Consent consent =
                    consentService.createConsent(
                            request.getRequestId(),
                            request.getUserId(),
                            request.getFiuId(),
                            request.getPurpose(),
                            request.getDataScopes(),
                            request.getFromDate(),
                            request.getToDate()
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(consent);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // GET USER CONSENTS
    // =========================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserConsents(
            @PathVariable Long userId) {

        try {

            List<Consent> consents =
                    consentService
                            .getUserConsents(userId);

            return ResponseEntity.ok(consents);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // GET CONSENT
    // =========================================================

    @GetMapping("/{consentId}")
    public ResponseEntity<?> getConsent(
            @PathVariable String consentId) {

        try {

            Consent consent =
                    consentService
                            .getConsent(consentId);

            return ResponseEntity.ok(consent);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // APPROVE CONSENT
    // =========================================================

    @PutMapping("/{consentId}/approve")
    public ResponseEntity<?> approveConsent(
            @PathVariable String consentId) {

        try {

            Consent consent =
                    consentService
                            .approveConsent(consentId);

            return ResponseEntity.ok(consent);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // REJECT CONSENT
    // =========================================================

    @PutMapping("/{consentId}/reject")
    public ResponseEntity<?> rejectConsent(
            @PathVariable String consentId) {

        try {

            Consent consent =
                    consentService
                            .rejectConsent(consentId);

            return ResponseEntity.ok(consent);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // REVOKE CONSENT
    // =========================================================

    @PutMapping("/{consentId}/revoke")
    public ResponseEntity<?> revokeConsent(
            @PathVariable String consentId) {

        try {

            Consent consent =
                    consentService
                            .revokeConsent(consentId);

            return ResponseEntity.ok(consent);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}