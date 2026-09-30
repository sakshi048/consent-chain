package com.consentchain.bankservice.controller;

import com.consentchain.bankservice.dto.DataRequestCreateRequest;
import com.consentchain.bankservice.dto.DataRequestResponse;
import com.consentchain.bankservice.service.FiuDataRequestService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fiu")
@CrossOrigin(origins = "*")
public class FiuController {

    private final FiuDataRequestService fiuDataRequestService;

    public FiuController(
            FiuDataRequestService fiuDataRequestService) {
        this.fiuDataRequestService = fiuDataRequestService;
    }

    @PostMapping("/data-request")
    public ResponseEntity<DataRequestResponse> createDataRequest(
            @Valid @RequestBody DataRequestCreateRequest request) {

        DataRequestResponse response =
                fiuDataRequestService.createDataRequest(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/data-requests")
    public ResponseEntity<List<DataRequestResponse>> getAllDataRequests() {
        List<DataRequestResponse> requests = fiuDataRequestService.getAllDataRequests();
        return ResponseEntity.ok(requests);
    }
}