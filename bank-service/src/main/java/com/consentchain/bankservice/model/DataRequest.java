package com.consentchain.bankservice.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "data_requests")
public class DataRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "request_id",
            unique = true,
            nullable = false
    )
    private String requestId;

    @Column(
            name = "customer_pan",
            nullable = false
    )
    private String customerPan;

    @Column(nullable = false)
    private String purpose;

    @Column(
            name = "data_scope",
            nullable = false
    )
    private String dataScope;

    @Column(name = "from_date")
    private LocalDate fromDate;

    @Column(name = "to_date")
    private LocalDate toDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    @Column(name = "consent_id")
    private String consentId;

    @Column(
            name = "response_data",
            columnDefinition = "LONGTEXT"
    )
    private String responseData;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public DataRequest() {
    }


    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }


    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(
            String requestId) {

        this.requestId = requestId;
    }


    public String getCustomerPan() {
        return customerPan;
    }

    public void setCustomerPan(
            String customerPan) {

        this.customerPan = customerPan;
    }


    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(
            String purpose) {

        this.purpose = purpose;
    }


    public String getDataScope() {
        return dataScope;
    }

    public void setDataScope(
            String dataScope) {

        this.dataScope = dataScope;
    }


    public LocalDate getFromDate() {
        return fromDate;
    }

    public void setFromDate(
            LocalDate fromDate) {

        this.fromDate = fromDate;
    }


    public LocalDate getToDate() {
        return toDate;
    }

    public void setToDate(
            LocalDate toDate) {

        this.toDate = toDate;
    }


    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(
            RequestStatus status) {

        this.status = status;
    }


    public String getConsentId() {
        return consentId;
    }

    public void setConsentId(
            String consentId) {

        this.consentId = consentId;
    }


    public String getResponseData() {
        return responseData;
    }

    public void setResponseData(
            String responseData) {

        this.responseData = responseData;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt = createdAt;
    }
}