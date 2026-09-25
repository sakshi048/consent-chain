package com.consentchain.aggregatorservice.controller;


import com.consentchain.aggregatorservice.dto.ConsentRequest;
import com.consentchain.aggregatorservice.model.Consent;
import com.consentchain.aggregatorservice.service.ConsentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aa/consents")
public class ConsentController {

    private final ConsentService consentService;

    public ConsentController(
            ConsentService consentService) {

        this.consentService = consentService;
    }

    @PostMapping
    public ResponseEntity<Consent> createConsent(
            @RequestBody ConsentRequest request) {

        return ResponseEntity.ok(
                consentService.createConsent(request)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Consent>> getUserConsents(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                consentService.getUserConsents(userId)
        );
    }

    @GetMapping("/{consentId}")
    public ResponseEntity<Consent> getConsent(
            @PathVariable String consentId) {

        return ResponseEntity.ok(
                consentService.getConsent(consentId)
        );
    }

    @PutMapping("/{consentId}/approve")
    public ResponseEntity<Consent> approve(
            @PathVariable String consentId) {

        return ResponseEntity.ok(
                consentService.approve(consentId)
        );
    }

    @PutMapping("/{consentId}/reject")
    public ResponseEntity<Consent> reject(
            @PathVariable String consentId) {

        return ResponseEntity.ok(
                consentService.reject(consentId)
        );
    }

    @PutMapping("/{consentId}/revoke")
    public ResponseEntity<Consent> revoke(
            @PathVariable String consentId) {

        return ResponseEntity.ok(
                consentService.revoke(consentId)
        );
    }
}