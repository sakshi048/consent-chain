package com.consentchain.aggregatorservice.dto;

import java.util.List;

public record AccountLinkResult(boolean verified, boolean linked, String message,
                                List<BankAccountOption> accounts, LinkedBankAccountResponse account) {}
