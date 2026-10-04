package com.consentchain.aggregatorservice.controller;

import com.consentchain.aggregatorservice.dto.LinkBankRequest;
import com.consentchain.aggregatorservice.dto.LinkedBankAccountResponse;
import com.consentchain.aggregatorservice.service.AccountService;
import com.consentchain.aggregatorservice.security.AuthenticatedPrincipal;
import com.consentchain.aggregatorservice.security.ResourceAuthorizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aa/accounts")
public class AccountController {

    private final AccountService accountService;
    private final ResourceAuthorizationService authorizationService;

    public AccountController(AccountService accountService, ResourceAuthorizationService authorizationService) {
        this.accountService = accountService;
        this.authorizationService = authorizationService;
    }

    @PostMapping("/link")
    public ResponseEntity<?> linkBank(
            @RequestBody LinkBankRequest request,
            @RequestAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE) AuthenticatedPrincipal principal) {

        authorizationService.requireRole(principal, "USER");
        request.setUserId(principal.userId());

        return ResponseEntity.ok(
                accountService.linkBank(request)
        );
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<LinkedBankAccountResponse>> getAccounts(
            @PathVariable Long userId,
            @RequestAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE) AuthenticatedPrincipal principal) {

        authorizationService.requireAccountAccess(userId, principal);

        return ResponseEntity.ok(
                accountService.getAccounts(userId).stream().map(LinkedBankAccountResponse::from).toList()
        );
    }
}
