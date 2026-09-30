package com.consentchain.aggregatorservice.service;

import com.consentchain.aggregatorservice.model.AaDataRequest;
import com.consentchain.aggregatorservice.model.DataRequestStatus;
import com.consentchain.aggregatorservice.repository.AaDataRequestRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class DataRequestExecutionService {

    private final AaDataRequestRepository dataRequestRepository;

    private final FipDataService fipDataService;

    private final FiuClientService fiuClientService;

    public DataRequestExecutionService(
            AaDataRequestRepository dataRequestRepository,
            FipDataService fipDataService,
            FiuClientService fiuClientService) {

        this.dataRequestRepository =
                dataRequestRepository;

        this.fipDataService =
                fipDataService;

        this.fiuClientService =
                fiuClientService;
    }

    // =========================================================
    // EXECUTE DATA REQUEST
    // =========================================================

    public Map<String, Object> executeDataRequest(
            String requestId,
            String accountNumber) {

        AaDataRequest request =
                dataRequestRepository
                        .findByRequestId(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Data request not found"));

        // -----------------------------------------------------
        // CHECK CONSENT
        // -----------------------------------------------------

        if (request.getStatus() !=
                DataRequestStatus.CONSENT_APPROVED) {

            throw new RuntimeException(
                    "Consent has not been approved");
        }

        if (request.getConsentId() == null ||
                request.getConsentId().isBlank()) {

            throw new RuntimeException(
                    "Consent ID is missing");
        }

        if (accountNumber == null ||
                accountNumber.isBlank()) {

            throw new RuntimeException(
                    "Account number is required");
        }

        // -----------------------------------------------------
        // DATA REQUESTED
        // -----------------------------------------------------

        request.setStatus(
                DataRequestStatus.DATA_REQUESTED);

        dataRequestRepository.save(
                request);

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "requestId",
                request.getRequestId());

        response.put(
                "consentId",
                request.getConsentId());

        response.put(
                "purpose",
                request.getPurpose());

        response.put(
                "dataScopes",
                request.getDataScopes());

        response.put(
                "accountNumber",
                accountNumber);

        // -----------------------------------------------------
        // ACCOUNT
        // -----------------------------------------------------

        if (hasScope(
                request.getDataScopes(),
                "ACCOUNT")) {

            String accountData =
                    fipDataService.fetchAccountData(
                            accountNumber,
                            request.getConsentId());

            response.put(
                    "account",
                    accountData);
        }

        // -----------------------------------------------------
        // TRANSACTIONS
        // -----------------------------------------------------

        if (hasScope(
                request.getDataScopes(),
                "TRANSACTIONS")) {

            String transactionData =
                    fipDataService.fetchTransactions(
                            accountNumber,
                            request.getConsentId(),
                            request.getFromDate()
                                    .toString(),
                            request.getToDate()
                                    .toString());

            response.put(
                    "transactions",
                    transactionData);
        }

        // -----------------------------------------------------
        // LOANS
        // -----------------------------------------------------

        if (hasScope(
                request.getDataScopes(),
                "LOANS")) {

            String loanData =
                    fipDataService.fetchLoans(
                            accountNumber,
                            request.getConsentId());

            response.put(
                    "loans",
                    loanData);
        }

        // -----------------------------------------------------
        // DATA RECEIVED
        // -----------------------------------------------------

        request.setStatus(
                DataRequestStatus.DATA_RECEIVED);

        dataRequestRepository.save(
                request);

        response.put(
                "status",
                DataRequestStatus.DATA_RECEIVED);

        // -----------------------------------------------------
        // SEND RESULT TO FIU
        // -----------------------------------------------------

        try {

            fiuClientService.sendDataRequestResult(
                    request.getRequestId(),
                    request.getConsentId(),
                    "DATA_RECEIVED",
                    response
            );

        } catch (Exception e) {

            /*
             * FIP data was received successfully,
             * but AA could not notify FIU.
             *
             * Keep AA status as DATA_RECEIVED.
             */

            throw new RuntimeException(
                    "Data received from FIP, "
                            + "but failed to notify FIU: "
                            + e.getMessage());
        }

        return response;
    }

    // =========================================================
    // CHECK DATA SCOPE
    // =========================================================

    private boolean hasScope(
            String scopes,
            String requiredScope) {

        if (scopes == null ||
                scopes.isBlank()) {

            return false;
        }

        String[] scopeArray =
                scopes.split(",");

        for (String scope : scopeArray) {

            if (scope.trim()
                    .equalsIgnoreCase(
                            requiredScope)) {

                return true;
            }
        }

        return false;
    }
}