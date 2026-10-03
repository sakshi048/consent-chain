package com.consentchain.aggregatorservice.model;

public enum BlockchainConsentEventType {
    CREATED(0), APPROVED(1), REJECTED(2), REVOKED(3);

    private final int contractValue;

    BlockchainConsentEventType(int contractValue) {
        this.contractValue = contractValue;
    }

    public int getContractValue() {
        return contractValue;
    }
}
