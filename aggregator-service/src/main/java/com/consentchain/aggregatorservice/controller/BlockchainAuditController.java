package com.consentchain.aggregatorservice.controller;

import com.consentchain.aggregatorservice.dto.BlockchainAuditRecordResponse;
import com.consentchain.aggregatorservice.service.BlockchainAuditService;
import com.consentchain.aggregatorservice.service.ConsentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/aa/consents")
public class BlockchainAuditController {
    private final BlockchainAuditService auditService;
    private final ConsentService consentService;

    public BlockchainAuditController(BlockchainAuditService auditService, ConsentService consentService) {
        this.auditService = auditService;
        this.consentService = consentService;
    }

    @GetMapping("/{consentId}/blockchain-audit")
    public ResponseEntity<List<BlockchainAuditRecordResponse>> getConsentAudit(@PathVariable String consentId) {
        var consent = consentService.getConsent(consentId);
        return ResponseEntity.ok(auditService.getAudit(consentId, consent));
    }
}
