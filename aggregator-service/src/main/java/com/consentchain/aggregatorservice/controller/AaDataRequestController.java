package com.consentchain.aggregatorservice.controller;

import com.consentchain.aggregatorservice.dto.AaDataRequestCreateRequest;
import com.consentchain.aggregatorservice.model.AaDataRequest;
import com.consentchain.aggregatorservice.service.AaDataRequestService;
import com.consentchain.aggregatorservice.security.AuthenticatedPrincipal;
import com.consentchain.aggregatorservice.security.ResourceAuthorizationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/aa/data-requests")
public class AaDataRequestController {

    private final AaDataRequestService dataRequestService;
    private final ResourceAuthorizationService authorizationService;

    public AaDataRequestController(
            AaDataRequestService dataRequestService,
            ResourceAuthorizationService authorizationService) {

        this.dataRequestService =
                dataRequestService;
        this.authorizationService = authorizationService;
    }

    // =========================================================
    // CREATE DATA REQUEST
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createDataRequest(
            @RequestBody
            AaDataRequestCreateRequest request,
            @RequestAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE) AuthenticatedPrincipal principal) {

        try {

            AaDataRequest response =
                    dataRequestService
                            .createDataRequest(request, principal);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // GET DATA REQUEST
    // =========================================================

    @GetMapping("/{requestId}")
    public ResponseEntity<?> getDataRequest(
            @PathVariable String requestId,
            @RequestAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE) AuthenticatedPrincipal principal) {

        AaDataRequest response;
        try {
            response = dataRequestService.getDataRequest(requestId);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
        authorizationService.requireDataRequestRead(response, principal);
        return ResponseEntity.ok(response);
    }
}
