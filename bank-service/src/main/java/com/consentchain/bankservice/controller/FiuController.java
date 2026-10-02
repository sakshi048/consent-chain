package com.consentchain.bankservice.controller;

import com.consentchain.bankservice.dto.DataRequestCreateRequest;
import com.consentchain.bankservice.dto.DataRequestResponse;
import com.consentchain.bankservice.dto.DataRequestResultRequest;
import com.consentchain.bankservice.service.FiuDataRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/fiu")
public class FiuController {

    private final FiuDataRequestService fiuDataRequestService;


    public FiuController(
            FiuDataRequestService fiuDataRequestService) {

        this.fiuDataRequestService =
                fiuDataRequestService;
    }


    // =========================================================
    // CREATE DATA REQUEST
    // =========================================================

    @PostMapping("/data-request")
    public ResponseEntity<DataRequestResponse> createDataRequest(
            @Valid
            @RequestBody
            DataRequestCreateRequest request) {

        DataRequestResponse response =
                fiuDataRequestService
                        .createDataRequest(
                                request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================================================
    // GET DATA REQUEST
    // =========================================================

    @GetMapping("/data-request/{requestId}")
    public ResponseEntity<DataRequestResponse> getDataRequest(
            @PathVariable String requestId) {

        DataRequestResponse response =
                fiuDataRequestService
                        .getDataRequest(
                                requestId);

        return ResponseEntity.ok(
                response);
    }


    // =========================================================
    // RECEIVE DATA FROM AA
    // =========================================================

    @PostMapping(
            "/data-request/{requestId}/result")
    public ResponseEntity<DataRequestResponse> receiveResult(
            @PathVariable String requestId,
            @RequestBody
            DataRequestResultRequest request) {

        DataRequestResponse response =
                fiuDataRequestService
                        .updateDataRequestResult(
                                requestId,
                                request);

        return ResponseEntity.ok(
                response);
    }
}