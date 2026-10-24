package com.consentchain.aggregatorservice.controller;

import com.consentchain.aggregatorservice.dto.AaDataRequestCreateRequest;
import com.consentchain.aggregatorservice.model.AaDataRequest;
import com.consentchain.aggregatorservice.service.AaDataRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/aa/data-requests")
public class AaDataRequestController {

    private final AaDataRequestService dataRequestService;

    public AaDataRequestController(
            AaDataRequestService dataRequestService) {

        this.dataRequestService =
                dataRequestService;
    }

    // =========================================================
    // CREATE DATA REQUEST
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createDataRequest(
            @RequestBody
            AaDataRequestCreateRequest request) {

        try {

            AaDataRequest response =
                    dataRequestService
                            .createDataRequest(request);

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
            @PathVariable String requestId) {

        try {

            AaDataRequest response =
                    dataRequestService
                            .getDataRequest(requestId);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }
}