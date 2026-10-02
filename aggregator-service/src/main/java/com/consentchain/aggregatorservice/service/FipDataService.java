package com.consentchain.aggregatorservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class FipDataService {

    private final RestTemplate restTemplate;

    @Value("${fip.base-url}")
    private String fipBaseUrl;

    @Value("${fip.aa-api-key}")
    private String aaApiKey;

    public FipDataService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // =========================================================
    // FETCH ACCOUNT DATA
    // =========================================================

    public String fetchAccountData(
            String accountNumber,
            String consentId) {

        String url = fipBaseUrl
                + "/fip/data/account"
                + "?accountNumber=" + accountNumber
                + "&consentId=" + consentId;

        HttpHeaders headers = createHeaders();

        HttpEntity<Void> entity =
                new HttpEntity<>(headers);

        ResponseEntity<String> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        entity,
                        String.class
                );

        return response.getBody();
    }

    // =========================================================
    // FETCH TRANSACTIONS
    // =========================================================

    public String fetchTransactions(
            String accountNumber,
            String consentId,
            String fromDate,
            String toDate) {

        StringBuilder url = new StringBuilder(
                fipBaseUrl
                        + "/fip/data/transactions"
                        + "?accountNumber=" + accountNumber
                        + "&consentId=" + consentId
        );

        if (fromDate != null &&
                !fromDate.isBlank()) {

            url.append("&fromDate=")
                    .append(fromDate);
        }

        if (toDate != null &&
                !toDate.isBlank()) {

            url.append("&toDate=")
                    .append(toDate);
        }

        HttpHeaders headers = createHeaders();

        HttpEntity<Void> entity =
                new HttpEntity<>(headers);

        ResponseEntity<String> response =
                restTemplate.exchange(
                        url.toString(),
                        HttpMethod.POST,
                        entity,
                        String.class
                );

        return response.getBody();
    }

    // =========================================================
    // FETCH LOANS
    // =========================================================

    public String fetchLoans(
            String accountNumber,
            String consentId) {

        String url = fipBaseUrl
                + "/fip/data/loans"
                + "?accountNumber=" + accountNumber
                + "&consentId=" + consentId;

        HttpHeaders headers = createHeaders();

        HttpEntity<Void> entity =
                new HttpEntity<>(headers);

        ResponseEntity<String> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        entity,
                        String.class
                );

        return response.getBody();
    }

    // =========================================================
    // HEADERS
    // =========================================================

    private HttpHeaders createHeaders() {

        HttpHeaders headers =
                new HttpHeaders();

        headers.set(
                "X-AA-Token",
                aaApiKey
        );

        return headers;
    }
}