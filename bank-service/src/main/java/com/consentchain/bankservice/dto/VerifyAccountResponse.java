package com.consentchain.bankservice.dto;

import java.util.List;

public record VerifyAccountResponse(boolean verified, String message, Long customerId, String customerName,
                                    String panNumber, List<VerifiedBankAccount> accounts) {}
