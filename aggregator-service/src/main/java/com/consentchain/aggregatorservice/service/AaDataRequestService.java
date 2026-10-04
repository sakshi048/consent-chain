package com.consentchain.aggregatorservice.service;

import com.consentchain.aggregatorservice.dto.AaDataRequestCreateRequest;
import com.consentchain.aggregatorservice.model.AaDataRequest;
import com.consentchain.aggregatorservice.model.Consent;
import com.consentchain.aggregatorservice.model.DataRequestStatus;
import com.consentchain.aggregatorservice.repository.AaDataRequestRepository;
import com.consentchain.aggregatorservice.repository.UserRepository;
import com.consentchain.aggregatorservice.security.AuthenticatedPrincipal;
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
            AaDataRequestCreateRequest request,
            AuthenticatedPrincipal principal) {

        if (request.getRequestId() == null ||
                request.getRequestId().isBlank()) {

            throw new RuntimeException(
                    "Request ID is required");
        }

        String pan = normalizePan(request.getCustomerPan());
        if (pan == null) {
            throw new RuntimeException("Customer PAN is required to resolve the AA user");
        }

        Long ownerUserId;
        String fiuId;
        if (principal.hasRole("FIU")) {
            if (principal.institutionId() == null || principal.institutionId().isBlank()) {
                throw new RuntimeException("Authenticated FIU institution is missing");
            }
            ownerUserId = userRepository.findByPanNumber(pan)
                    .orElseThrow(() -> new RuntimeException("No AA user matches the requested customer PAN"))
                    .getId();
            fiuId = principal.institutionId();
        } else if (principal.hasRole("USER")) {
            var owner = userRepository.findById(principal.userId())
                    .orElseThrow(() -> new RuntimeException("AA user not found"));
            if (!pan.equals(normalizePan(owner.getPanNumber()))) {
                throw new RuntimeException("Customer PAN does not match the authenticated AA user");
            }
            ownerUserId = owner.getId();
            fiuId = request.getFiuId();
        } else {
            throw new RuntimeException("Only an AA user or FIU can create a data request");
        }

        if (fiuId == null || fiuId.isBlank()) {

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

        // Create consent using existing service
        Consent consent =
                consentService.createConsent(
                        request.getRequestId(),
                        ownerUserId,
                        fiuId,
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
                ownerUserId);

        dataRequest.setFiuId(
                fiuId);

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

    private String normalizePan(String pan) {
        return pan == null || pan.isBlank() ? null : pan.trim().toUpperCase(java.util.Locale.ROOT);
    }
}
