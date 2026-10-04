package com.consentchain.aggregatorservice.controller;

import com.consentchain.aggregatorservice.service.DataRequestExecutionService;
import com.consentchain.aggregatorservice.service.AaDataRequestService;
import com.consentchain.aggregatorservice.security.AuthenticatedPrincipal;
import com.consentchain.aggregatorservice.security.ResourceAuthorizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/aa/data-requests")
public class DataRequestExecutionController {

    private final DataRequestExecutionService executionService;
    private final AaDataRequestService dataRequestService;
    private final ResourceAuthorizationService authorizationService;

    public DataRequestExecutionController(
            DataRequestExecutionService executionService,
            AaDataRequestService dataRequestService,
            ResourceAuthorizationService authorizationService) {

        this.executionService =
                executionService;
        this.dataRequestService = dataRequestService;
        this.authorizationService = authorizationService;
    }

    @PostMapping("/{requestId}/execute")
    public ResponseEntity<?> executeDataRequest(
            @PathVariable String requestId,
            @RequestParam String accountNumber,
            @RequestAttribute(AuthenticatedPrincipal.REQUEST_ATTRIBUTE) AuthenticatedPrincipal principal) {

        authorizationService.requireDataRequestOwner(dataRequestService.getDataRequest(requestId), principal);

        try {

            Map<String, Object> response =
                    executionService
                            .executeDataRequest(
                                    requestId,
                                    accountNumber);

            return ResponseEntity.ok(
                    response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }
}
