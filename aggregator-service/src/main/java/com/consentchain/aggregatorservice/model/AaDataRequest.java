package com.consentchain.aggregatorservice.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "aa_data_requests")
public class AaDataRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "request_id",
            unique = true,
            nullable = false
    )
    private String requestId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String fiuId;

    @Column(nullable = false)
    private String purpose;

    @Column(
            name = "data_scopes",
            nullable = false
    )
    private String dataScopes;

    private LocalDate fromDate;

    private LocalDate toDate;

    @Column(name = "consent_id")
    private String consentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DataRequestStatus status;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    public AaDataRequest() {
    }

    public Long getId() {
        return id;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFiuId() {
        return fiuId;
    }

    public void setFiuId(String fiuId) {
        this.fiuId = fiuId;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getDataScopes() {
        return dataScopes;
    }

    public void setDataScopes(String dataScopes) {
        this.dataScopes = dataScopes;
    }

    public LocalDate getFromDate() {
        return fromDate;
    }

    public void setFromDate(LocalDate fromDate) {
        this.fromDate = fromDate;
    }

    public LocalDate getToDate() {
        return toDate;
    }

    public void setToDate(LocalDate toDate) {
        this.toDate = toDate;
    }

    public String getConsentId() {
        return consentId;
    }

    public void setConsentId(String consentId) {
        this.consentId = consentId;
    }

    public DataRequestStatus getStatus() {
        return status;
    }

    public void setStatus(DataRequestStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}