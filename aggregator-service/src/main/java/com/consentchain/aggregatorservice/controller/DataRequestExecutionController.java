package com.consentchain.aggregatorservice.controller;

import com.consentchain.aggregatorservice.service.DataRequestExecutionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/aa/data-requests")
public class DataRequestExecutionController {

    private final DataRequestExecutionService executionService;

    public DataRequestExecutionController(
            DataRequestExecutionService executionService) {

        this.executionService =
                executionService;
    }

    @PostMapping("/{requestId}/execute")
    public ResponseEntity<?> executeDataRequest(
            @PathVariable String requestId,
            @RequestParam String accountNumber) {

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