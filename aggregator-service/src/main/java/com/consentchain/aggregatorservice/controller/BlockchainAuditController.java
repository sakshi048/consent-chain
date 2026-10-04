package com.consentchain.aggregatorservice.controller;

import com.consentchain.aggregatorservice.dto.BlockchainAuditRecordResponse;
import com.consentchain.aggregatorservice.service.BlockchainAuditService;
import com.consentchain.aggregatorservice.service.ConsentService;
import com.consentchain.aggregatorservice.security.AuthenticatedPrincipal;
import com.consentchain.aggregatorservice.security.ResourceAuthorizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/aa/consents")
public class BlockchainAuditController {
    private final BlockchainAuditService auditService;
    private final ConsentService consentService;
    private final ResourceAuthorizationService authorizationService;

    public BlockchainAuditController(BlockchainAuditService auditService, ConsentService consentService,
                                     ResourceAuthorizationService authorizationService) {
        this.auditService = auditService;
        this.consentService = consentService;
        this.authorizationService = authorizationService;
    }

    @GetMapping("/{consentId}/blockchain-audit")
    public ResponseEntity<List<BlockchainAuditRecordResponse>> getConsentAudit(
            @PathVariable String consentId,
            @RequestAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE) AuthenticatedPrincipal principal) {
        var consent = consentService.getConsent(consentId);
        authorizationService.requireConsentRead(consent, principal);
        return ResponseEntity.ok(auditService.getAudit(consentId, consent));
    }
}
