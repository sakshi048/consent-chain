package com.consentchain.aggregatorservice.controller;

import com.consentchain.aggregatorservice.dto.LinkBankRequest;
import com.consentchain.aggregatorservice.model.LinkedBankAccount;
import com.consentchain.aggregatorservice.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aa/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping("/link")
    public ResponseEntity<?> linkBank(
            @RequestBody LinkBankRequest request) {

        return ResponseEntity.ok(
                accountService.linkBank(request)
        );
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<LinkedBankAccount>> getAccounts(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                accountService.getAccounts(userId)
        );
    }
}