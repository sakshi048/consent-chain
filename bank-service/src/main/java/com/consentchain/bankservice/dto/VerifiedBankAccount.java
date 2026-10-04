package com.consentchain.bankservice.dto;

public record VerifiedBankAccount(Long accountId, String bankName, String accountNumber, String ifsc) {}
