package com.consentchain.aggregatorservice.controller;

import com.consentchain.aggregatorservice.dto.ConsentRequest;
import com.consentchain.aggregatorservice.model.Consent;
import com.consentchain.aggregatorservice.service.ConsentService;
import com.consentchain.aggregatorservice.security.AuthenticatedPrincipal;
import com.consentchain.aggregatorservice.security.ResourceAuthorizationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aa/consents")
public class ConsentController {

    private final ConsentService consentService;
    private final ResourceAuthorizationService authorizationService;


    public ConsentController(
            ConsentService consentService,
            ResourceAuthorizationService authorizationService) {

        this.consentService =
                consentService;
        this.authorizationService = authorizationService;
    }


    // =========================================================
    // CREATE CONSENT
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createConsent(
            @RequestBody ConsentRequest request,
            @RequestAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE) AuthenticatedPrincipal principal) {

        authorizationService.requireRole(principal, "USER");
        request.setUserId(principal.userId());

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
            @PathVariable Long userId,
            @RequestAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE) AuthenticatedPrincipal principal) {

        authorizationService.requireAccountAccess(userId, principal);

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
            @PathVariable String consentId,
            @RequestAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE) AuthenticatedPrincipal principal) {

        Consent consent;
        try {
            consent = consentService.getConsent(consentId);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
        authorizationService.requireConsentRead(consent, principal);
        return ResponseEntity.ok(consent);
    }


    // =========================================================
    // APPROVE CONSENT
    // =========================================================

    @PutMapping("/{consentId}/approve")
    public ResponseEntity<?> approveConsent(
            @PathVariable String consentId,
            @RequestAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE) AuthenticatedPrincipal principal) {

        authorizationService.requireConsentOwner(consentService.getConsent(consentId), principal);

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
            @PathVariable String consentId,
            @RequestAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE) AuthenticatedPrincipal principal) {

        authorizationService.requireConsentOwner(consentService.getConsent(consentId), principal);

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
            @PathVariable String consentId,
            @RequestAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE) AuthenticatedPrincipal principal) {

        authorizationService.requireConsentOwner(consentService.getConsent(consentId), principal);

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
