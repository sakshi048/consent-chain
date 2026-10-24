package com.consentchain.bankservice.controller;

import com.consentchain.bankservice.dto.FipConsentRequest;
import com.consentchain.bankservice.model.ConsentArtefact;
import com.consentchain.bankservice.service.FipConsentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/fip/consents")
public class FipConsentController {

    private final FipConsentService fipConsentService;

    public FipConsentController(
            FipConsentService service) {

        this.fipConsentService = service;
    }


    // =========================================================
    // REGISTER CONSENT
    // =========================================================

    @PostMapping
    public ResponseEntity<?> registerConsent(
            @RequestBody FipConsentRequest request) {

        try {

            ConsentArtefact consent =
                    fipConsentService
                            .registerConsent(request);

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
    // REVOKE CONSENT
    // =========================================================

    @PutMapping("/{consentId}/revoke")
    public ResponseEntity<?> revokeConsent(
            @PathVariable String consentId) {

        try {

            ConsentArtefact consent =
                    fipConsentService
                            .revokeConsent(consentId);

            return ResponseEntity
                    .ok(consent);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}