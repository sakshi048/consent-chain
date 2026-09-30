package com.consentchain.aggregatorservice.service;

import com.consentchain.aggregatorservice.dto.AaDataRequestCreateRequest;
import com.consentchain.aggregatorservice.model.AaDataRequest;
import com.consentchain.aggregatorservice.model.Consent;
import com.consentchain.aggregatorservice.model.DataRequestStatus;
import com.consentchain.aggregatorservice.repository.AaDataRequestRepository;
import com.consentchain.aggregatorservice.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AaDataRequestService {

    private final AaDataRequestRepository dataRequestRepository;

    private final UserRepository userRepository;

    private final ConsentService consentService;

    public AaDataRequestService(
            AaDataRequestRepository dataRequestRepository,
            UserRepository userRepository,
            ConsentService consentService) {

        this.dataRequestRepository =
                dataRequestRepository;

        this.userRepository =
                userRepository;

        this.consentService =
                consentService;
    }

    // =========================================================
    // CREATE DATA REQUEST
    // =========================================================

    public AaDataRequest createDataRequest(
            AaDataRequestCreateRequest request) {

        if (request.getRequestId() == null ||
                request.getRequestId().isBlank()) {

            throw new RuntimeException(
                    "Request ID is required");
        }

        if (request.getUserId() == null) {

            throw new RuntimeException(
                    "User ID is required");
        }

        if (request.getFiuId() == null ||
                request.getFiuId().isBlank()) {

            throw new RuntimeException(
                    "FIU ID is required");
        }

        if (request.getPurpose() == null ||
                request.getPurpose().isBlank()) {

            throw new RuntimeException(
                    "Purpose is required");
        }

        if (request.getDataScopes() == null ||
                request.getDataScopes().isEmpty()) {

            throw new RuntimeException(
                    "Data scopes are required");
        }

        if (request.getFromDate() == null ||
                request.getToDate() == null) {

            throw new RuntimeException(
                    "From date and to date are required");
        }

        if (request.getToDate()
                .isBefore(request.getFromDate())) {

            throw new RuntimeException(
                    "To date cannot be before from date");
        }

        if (dataRequestRepository
                .existsByRequestId(
                        request.getRequestId())) {

            throw new RuntimeException(
                    "Data request already exists");
        }

        if (!userRepository.existsById(
                request.getUserId())) {

            throw new RuntimeException(
                    "AA user not found");
        }

        // Create consent using existing service
        Consent consent =
                consentService.createConsent(
                        request.getRequestId(),
                        request.getUserId(),
                        request.getFiuId(),
                        request.getPurpose(),
                        request.getDataScopes(),
                        request.getFromDate(),
                        request.getToDate()
                );

        AaDataRequest dataRequest =
                new AaDataRequest();

        dataRequest.setRequestId(
                request.getRequestId());

        dataRequest.setUserId(
                request.getUserId());

        dataRequest.setFiuId(
                request.getFiuId());

        dataRequest.setPurpose(
                request.getPurpose());

        dataRequest.setDataScopes(
                String.join(
                        ",",
                        request.getDataScopes()
                )
        );

        dataRequest.setFromDate(
                request.getFromDate());

        dataRequest.setToDate(
                request.getToDate());

        dataRequest.setConsentId(
                consent.getConsentId());

        dataRequest.setStatus(
                DataRequestStatus.PENDING_CONSENT);

        dataRequest.setCreatedAt(
                LocalDateTime.now());

        return dataRequestRepository.save(
                dataRequest
        );
    }

    // =========================================================
    // GET DATA REQUEST
    // =========================================================

    public AaDataRequest getDataRequest(
            String requestId) {

        return dataRequestRepository
                .findByRequestId(requestId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Data request not found"));
    }
}