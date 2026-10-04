package com.consentchain.aggregatorservice.dto;

public record BankAccountOption(Long bankAccountId, String bankName, String accountNumberLastFour, String ifsc) {}
