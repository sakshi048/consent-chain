package com.consentchain.bankservice.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FipConsentRequest {

    private String consentId;

    private String purpose;

    private String dataScope;

    private LocalDateTime validTill;
}