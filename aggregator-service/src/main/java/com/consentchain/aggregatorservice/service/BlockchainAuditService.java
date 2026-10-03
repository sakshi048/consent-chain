package com.consentchain.aggregatorservice.service;

import com.consentchain.aggregatorservice.config.BlockchainProperties;
import com.consentchain.aggregatorservice.dto.BlockchainAuditRecordResponse;
import com.consentchain.aggregatorservice.model.BlockchainAuditEvent;
import com.consentchain.aggregatorservice.model.BlockchainAuditStatus;
import com.consentchain.aggregatorservice.model.BlockchainConsentEventType;
import com.consentchain.aggregatorservice.model.Consent;
import com.consentchain.aggregatorservice.repository.BlockchainAuditEventRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;

@Service
public class BlockchainAuditService {
    private static final Logger log = LoggerFactory.getLogger(BlockchainAuditService.class);
    private final BlockchainAuditEventRepository eventRepository;
    private final BlockchainProperties properties;
    private final BlockchainClient blockchainClient;

    public BlockchainAuditService(BlockchainAuditEventRepository eventRepository, BlockchainProperties properties,
                                  org.springframework.beans.factory.ObjectProvider<BlockchainClient> clientProvider) {
        this.eventRepository = eventRepository;
        this.properties = properties;
        this.blockchainClient = clientProvider.getIfAvailable();
    }

    public void queueConsentEvent(Consent consent, BlockchainConsentEventType eventType) {
        if (!properties.isEnabled()) return;
        if (properties.getAuditHmacSecret() == null || properties.getAuditHmacSecret().length() < 32) {
            throw new IllegalStateException("BLOCKCHAIN_AUDIT_HMAC_SECRET must contain at least 32 characters");
        }
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.MICROS);
        String eventKey = hmac("event|" + consent.getConsentId() + "|" + eventType.name());
        if (eventRepository.existsByEventKey(eventKey)) return;
        String reference = hmac("consent|" + consent.getConsentId());
        String commitment = hmac(canonicalConsent(consent, eventType, now));
        eventRepository.save(new BlockchainAuditEvent(consent.getConsentId(), eventType, eventKey, reference, commitment, now));
    }

    @Scheduled(fixedDelayString = "${blockchain.poll-delay-ms:5000}")
    public void submitPendingEvents() {
        if (!properties.isEnabled() || blockchainClient == null) return;
        List<BlockchainAuditEvent> pending = eventRepository.findTop50ByStatusInOrderByCreatedAtAsc(
                List.of(BlockchainAuditStatus.PENDING, BlockchainAuditStatus.FAILED));
        for (BlockchainAuditEvent event : pending) {
            try {
                String transactionHash = blockchainClient.submitEvent(event.getEventKey(), event.getEventType(),
                        event.getConsentReference(), event.getCommitmentHash());
                event.markSubmitted(transactionHash, LocalDateTime.now());
            } catch (RuntimeException error) {
                log.warn("Could not submit consent audit outbox event {}: {}", event.getId(), error.getMessage());
                event.markFailed(error.getMessage(), LocalDateTime.now());
            }
            eventRepository.save(event);
        }
    }

    public List<BlockchainAuditRecordResponse> getAudit(String consentId, Consent consent) {
        List<BlockchainAuditEvent> events = eventRepository.findByConsentIdOrderByCreatedAtAsc(consentId);
        return events.stream().map(event -> {
            boolean verified = false;
            String message;
            if (event.getStatus() != BlockchainAuditStatus.SUBMITTED) {
                message = event.getStatus() == BlockchainAuditStatus.FAILED ? "Waiting for local Besu network; retry scheduled" : "Waiting for local Besu network";
            } else if (blockchainClient == null) {
                message = "Transaction submitted; blockchain client is disabled";
            } else {
                try {
                    boolean localCommitmentMatches = hmac("event|" + consentId + "|" + event.getEventType().name()).equals(event.getEventKey())
                            && hmac("consent|" + consentId).equals(event.getConsentReference())
                            && hmac(canonicalConsent(consent, event.getEventType(), event.getCreatedAt())).equals(event.getCommitmentHash());
                    boolean eventExists = blockchainClient.isEventRecorded(event.getEventKey());
                    verified = localCommitmentMatches && eventExists && blockchainClient.verifyEvent(event.getEventKey(), event.getEventType(), event.getConsentReference(), event.getCommitmentHash());
                    message = verified ? "Local consent commitment matches the immutable Besu record" : eventExists
                            ? "The on-chain record or local consent commitment does not match"
                            : "Transaction submitted; waiting for block finality";
                } catch (RuntimeException error) {
                    message = "Could not verify against the local Besu network";
                }
            }
            return new BlockchainAuditRecordResponse(event.getEventType(), event.getStatus(), event.getCreatedAt(),
                    event.getTransactionHash(), verified, message);
        }).toList();
    }

    private String canonicalConsent(Consent c, BlockchainConsentEventType event, LocalDateTime at) {
        String scopes = c.getDataScopes() == null ? "" : c.getDataScopes().stream().sorted().reduce((a, b) -> a + "," + b).orElse("");
        List<String> fields = List.of("consent-audit-v1", c.getConsentId(), event.name(),
                String.valueOf(c.getFiuId()), String.valueOf(c.getPurpose()), scopes,
                String.valueOf(c.getFromDate()), String.valueOf(c.getToDate()),
                canonicalDateTime(c.getExpiresAt()), at.toString());
        StringBuilder canonical = new StringBuilder();
        for (String field : fields) canonical.append(field.length()).append(':').append(field);
        return canonical.toString();
    }

    private String canonicalDateTime(LocalDateTime value) {
        return value == null ? "null" : value.truncatedTo(ChronoUnit.MICROS).toString();
    }

    private String hmac(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(properties.getAuditHmacSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return "0x" + HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Could not prepare keyed consent commitment", e);
        }
    }
}

