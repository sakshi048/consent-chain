package com.consentchain.aggregatorservice.dto;

import com.consentchain.aggregatorservice.model.BlockchainAuditStatus;
import com.consentchain.aggregatorservice.model.BlockchainConsentEventType;
import java.time.LocalDateTime;

public record BlockchainAuditRecordResponse(
        BlockchainConsentEventType eventType,
        BlockchainAuditStatus status,
        LocalDateTime recordedAt,
        String transactionHash,
        boolean verifiedOnChain,
        String message) {}
