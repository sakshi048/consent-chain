package com.consentchain.bankservice.service;
import com.consentchain.bankservice.dto.DataRequestCreateRequest;
import com.consentchain.bankservice.dto.DataRequestResponse;
import com.consentchain.bankservice.model.DataRequest;
import com.consentchain.bankservice.model.RequestStatus;
import com.consentchain.bankservice.repository.DataRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class FiuDataRequestService {

    private final DataRequestRepository dataRequestRepository;

    public FiuDataRequestService(
            DataRequestRepository dataRequestRepository) {
        this.dataRequestRepository = dataRequestRepository;
    }

    public DataRequestResponse createDataRequest(
            DataRequestCreateRequest request) {

        DataRequest dataRequest = new DataRequest();

        String requestId = "REQ-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();

        dataRequest.setRequestId(requestId);
        dataRequest.setCustomerPan(request.getCustomerPan());
        dataRequest.setPurpose(request.getPurpose());
        dataRequest.setDataScope(request.getDataScope());
        dataRequest.setFromDate(request.getFromDate());
        dataRequest.setToDate(request.getToDate());

        dataRequest.setStatus(RequestStatus.CONSENT_REQUIRED);

        dataRequest.setConsentId(null);

        dataRequest.setCreatedAt(LocalDateTime.now());

        DataRequest saved =
                dataRequestRepository.save(dataRequest);

        return convertToResponse(saved);
    }

    private DataRequestResponse convertToResponse(
            DataRequest dataRequest) {

        DataRequestResponse response =
                new DataRequestResponse();

        response.setRequestId(dataRequest.getRequestId());
        response.setCustomerPan(dataRequest.getCustomerPan());
        response.setPurpose(dataRequest.getPurpose());
        response.setDataScope(dataRequest.getDataScope());
        response.setFromDate(dataRequest.getFromDate());
        response.setToDate(dataRequest.getToDate());
        response.setStatus(dataRequest.getStatus());
        response.setConsentId(dataRequest.getConsentId());

        response.setMessage(
                "Data request created. Consent is required."
        );

        return response;
    }
}