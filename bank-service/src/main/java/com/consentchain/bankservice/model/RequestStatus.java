package com.consentchain.bankservice.model;

public enum RequestStatus {

    PENDING,
    CONSENT_REQUIRED,
    CONSENT_APPROVED,
    DATA_REQUESTED,
    DATA_RECEIVED,
    REJECTED
}