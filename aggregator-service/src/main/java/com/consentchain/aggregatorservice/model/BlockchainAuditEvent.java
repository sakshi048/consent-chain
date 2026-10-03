package com.consentchain.aggregatorservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blockchain_audit_events", uniqueConstraints = @UniqueConstraint(name = "uk_blockchain_event_key", columnNames = "event_key"))
public class BlockchainAuditEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "consent_id", nullable = false, length = 80)
    private String consentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 20)
    private BlockchainConsentEventType eventType;

    @Column(name = "event_key", nullable = false, unique = true, length = 66)
    private String eventKey;

    @Column(name = "consent_reference", nullable = false, length = 66)
    private String consentReference;

    @Column(name = "commitment_hash", nullable = false, length = 66)
    private String commitmentHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BlockchainAuditStatus status = BlockchainAuditStatus.PENDING;

    @Column(name = "transaction_hash", length = 80)
    private String transactionHash;

    @Column(nullable = false)
    private int attempts;

    @Column(name = "last_error", length = 1000)
    private String lastError;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected BlockchainAuditEvent() {}

    public BlockchainAuditEvent(String consentId, BlockchainConsentEventType eventType, String eventKey,
                                String consentReference, String commitmentHash, LocalDateTime createdAt) {
        this.consentId = consentId;
        this.eventType = eventType;
        this.eventKey = eventKey;
        this.consentReference = consentReference;
        this.commitmentHash = commitmentHash;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
        this.status = BlockchainAuditStatus.PENDING;
    }

    public Long getId() { return id; }
    public String getConsentId() { return consentId; }
    public BlockchainConsentEventType getEventType() { return eventType; }
    public String getEventKey() { return eventKey; }
    public String getConsentReference() { return consentReference; }
    public String getCommitmentHash() { return commitmentHash; }
    public BlockchainAuditStatus getStatus() { return status; }
    public String getTransactionHash() { return transactionHash; }
    public int getAttempts() { return attempts; }
    public String getLastError() { return lastError; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void markSubmitted(String transactionHash, LocalDateTime now) {
        this.status = BlockchainAuditStatus.SUBMITTED;
        this.transactionHash = transactionHash;
        this.lastError = null;
        this.attempts++;
        this.updatedAt = now;
    }

    public void markFailed(String error, LocalDateTime now) {
        this.status = BlockchainAuditStatus.FAILED;
        this.lastError = error == null ? "Unknown blockchain error" : error.substring(0, Math.min(error.length(), 1000));
        this.attempts++;
        this.updatedAt = now;
    }
}
