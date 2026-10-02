package com.consentchain.bankservice.service;

import com.consentchain.bankservice.dto.DataRequestCreateRequest;
import com.consentchain.bankservice.dto.DataRequestResponse;
import com.consentchain.bankservice.dto.DataRequestResultRequest;
import com.consentchain.bankservice.model.DataRequest;
import com.consentchain.bankservice.model.RequestStatus;
import com.consentchain.bankservice.repository.DataRequestRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class FiuDataRequestService {

    private final DataRequestRepository dataRequestRepository;

    private final ObjectMapper objectMapper;


    public FiuDataRequestService(
            DataRequestRepository dataRequestRepository,
            ObjectMapper objectMapper) {

        this.dataRequestRepository =
                dataRequestRepository;

        this.objectMapper =
                objectMapper;
    }


    // =========================================================
    // CREATE DATA REQUEST
    // =========================================================

    public DataRequestResponse createDataRequest(
            DataRequestCreateRequest request) {

        DataRequest dataRequest =
                new DataRequest();

        String requestId =
                "REQ-" +
                        UUID.randomUUID()
                                .toString()
                                .substring(0, 8)
                                .toUpperCase();


        dataRequest.setRequestId(
                requestId);

        dataRequest.setCustomerPan(
                request.getCustomerPan());

        dataRequest.setPurpose(
                request.getPurpose());

        dataRequest.setDataScope(
                request.getDataScope());

        dataRequest.setFromDate(
                request.getFromDate());

        dataRequest.setToDate(
                request.getToDate());

        dataRequest.setStatus(
                RequestStatus.CONSENT_REQUIRED);

        dataRequest.setConsentId(
                null);

        dataRequest.setResponseData(
                null);

        dataRequest.setCreatedAt(
                LocalDateTime.now());


        DataRequest saved =
                dataRequestRepository.save(
                        dataRequest);


        return convertToResponse(
                saved);
    }


    // =========================================================
    // RECEIVE DATA FROM AA
    // =========================================================

    public DataRequestResponse updateDataRequestResult(
            String requestId,
            DataRequestResultRequest request) {

        DataRequest dataRequest =
                dataRequestRepository
                        .findByRequestId(
                                requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Data request not found"));


        // -----------------------------------------------------
        // UPDATE CONSENT ID
        // -----------------------------------------------------

        if (request.getConsentId() != null &&
                !request.getConsentId().isBlank()) {

            dataRequest.setConsentId(
                    request.getConsentId());
        }


        // -----------------------------------------------------
        // UPDATE STATUS
        // -----------------------------------------------------

        if (request.getStatus() == null ||
                request.getStatus().isBlank()) {

            throw new RuntimeException(
                    "Status is required");
        }


        RequestStatus status;

        try {

            status =
                    RequestStatus.valueOf(
                            request.getStatus()
                                    .toUpperCase());

        } catch (IllegalArgumentException e) {

            throw new RuntimeException(
                    "Invalid request status: "
                            + request.getStatus());
        }


        dataRequest.setStatus(
                status);


        // -----------------------------------------------------
        // SAVE RESPONSE DATA
        // -----------------------------------------------------

        if (request.getData() != null) {

            try {

                String jsonData =
                        objectMapper.writeValueAsString(
                                request.getData());

                dataRequest.setResponseData(
                        jsonData);

            } catch (JsonProcessingException e) {

                throw new RuntimeException(
                        "Unable to convert response data to JSON",
                        e);
            }
        }


        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        DataRequest saved =
                dataRequestRepository.save(
                        dataRequest);


        return convertToResponse(
                saved);
    }


    // =========================================================
    // GET DATA REQUEST
    // =========================================================

    public DataRequestResponse getDataRequest(
            String requestId) {

        DataRequest dataRequest =
                dataRequestRepository
                        .findByRequestId(
                                requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Data request not found"));


        return convertToResponse(
                dataRequest);
    }


    // =========================================================
    // CONVERT ENTITY → RESPONSE
    // =========================================================

    private DataRequestResponse convertToResponse(
            DataRequest dataRequest) {

        DataRequestResponse response =
                new DataRequestResponse();


        response.setRequestId(
                dataRequest.getRequestId());

        response.setCustomerPan(
                dataRequest.getCustomerPan());

        response.setPurpose(
                dataRequest.getPurpose());

        response.setDataScope(
                dataRequest.getDataScope());

        response.setFromDate(
                dataRequest.getFromDate());

        response.setToDate(
                dataRequest.getToDate());

        response.setStatus(
                dataRequest.getStatus());

        response.setConsentId(
                dataRequest.getConsentId());

        response.setResponseData(
                dataRequest.getResponseData());

        response.setMessage(
                "Data request processed successfully");


        return response;
    }
}