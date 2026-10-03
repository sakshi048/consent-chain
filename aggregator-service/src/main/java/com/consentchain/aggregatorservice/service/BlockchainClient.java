package com.consentchain.aggregatorservice.service;

import com.consentchain.aggregatorservice.model.BlockchainConsentEventType;

public interface BlockchainClient {
    String submitEvent(String eventKey, BlockchainConsentEventType eventType, String consentReference, String commitmentHash);
    boolean isEventRecorded(String eventKey);
    boolean verifyEvent(String eventKey, BlockchainConsentEventType eventType, String consentReference, String commitmentHash);
}
