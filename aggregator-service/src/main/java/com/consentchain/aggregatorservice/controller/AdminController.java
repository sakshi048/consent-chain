package com.consentchain.aggregatorservice.controller;
import com.consentchain.aggregatorservice.model.AuditLog;
import com.consentchain.aggregatorservice.model.Consent;
import com.consentchain.aggregatorservice.model.LinkedBankAccount;
import com.consentchain.aggregatorservice.model.User;
import com.consentchain.aggregatorservice.repository.AuditLogRepository;
import com.consentchain.aggregatorservice.repository.ConsentRepository;
import com.consentchain.aggregatorservice.repository.LinkedBankAccountRepository;
import com.consentchain.aggregatorservice.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aa/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final LinkedBankAccountRepository accountRepository;
    private final ConsentRepository consentRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminController(
            UserRepository userRepository,
            LinkedBankAccountRepository accountRepository,
            ConsentRepository consentRepository,
            AuditLogRepository auditLogRepository) {

        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.consentRepository = consentRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/users")
    public List<User> users() {
        return userRepository.findAll();
    }

    @GetMapping("/accounts")
    public List<LinkedBankAccount> accounts() {
        return accountRepository.findAll();
    }

    @GetMapping("/consents")
    public List<Consent> consents() {
        return consentRepository.findAll();
    }

    @GetMapping("/audit-logs")
    public List<AuditLog> auditLogs() {
        return auditLogRepository.findAll();
    }
}