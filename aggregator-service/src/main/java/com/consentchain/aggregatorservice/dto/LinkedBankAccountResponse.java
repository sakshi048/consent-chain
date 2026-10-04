package com.consentchain.aggregatorservice.dto;

import com.consentchain.aggregatorservice.model.LinkedBankAccount;

import java.time.LocalDateTime;

public record LinkedBankAccountResponse(Long id, String bankName, String accountNumber, String ifsc,
                                        String status, LocalDateTime linkedAt) {
    public static LinkedBankAccountResponse from(LinkedBankAccount account) {
        return new LinkedBankAccountResponse(account.getId(), account.getBankName(), account.getAccountNumber(),
                account.getIfsc(), account.getStatus(), account.getLinkedAt());
    }
}
