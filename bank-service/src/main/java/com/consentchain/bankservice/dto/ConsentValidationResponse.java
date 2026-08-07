package com.consentchain.bankservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ConsentValidationResponse {
    private boolean valid;
    private String message;
}