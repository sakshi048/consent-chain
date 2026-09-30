package com.consentchain.aggregatorservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class FipClientService {

    private final RestTemplate restTemplate;

    @Value("${fip.base-url}")
    private String fipBaseUrl;

    @Value("${fip.aa-api-key}")
    private String aaApiKey;


    public FipClientService(
            RestTemplate restTemplate) {

        this.restTemplate = restTemplate;
    }


    // =========================================================
    // REGISTER CONSENT AT FIP
    // =========================================================

    public void registerConsentAtFip(
            String consentId,
            String purpose,
            String dataScope,
            LocalDateTime validTill) {

        String url =
                fipBaseUrl +
                        "/fip/consents";


        // FIP DTO expects:
        // consentId
        // purpose
        // dataScope
        // validTill

        Map<String, Object> body =
                new HashMap<>();

        body.put("consentId", consentId);
        body.put("purpose", purpose);
        body.put("dataScope", dataScope);
        body.put("validTill", validTill);


        HttpHeaders headers =
                new HttpHeaders();

        headers.set(
                "X-AA-Token",
                aaApiKey);

        headers.set(
                "Content-Type",
                "application/json");


        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(
                        body,
                        headers);


        ResponseEntity<String> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        entity,
                        String.class);


        if (!response.getStatusCode().is2xxSuccessful()) {

            throw new RuntimeException(
                    "FIP returned status: "
                            + response.getStatusCode());
        }
    }


    // =========================================================
    // REVOKE CONSENT AT FIP
    // =========================================================

    public void revokeConsentAtFip(
            String consentId) {

        String url =
                fipBaseUrl
                        + "/fip/consents/"
                        + consentId
                        + "/revoke";


        HttpHeaders headers =
                new HttpHeaders();

        headers.set(
                "X-AA-Token",
                aaApiKey);


        HttpEntity<Void> entity =
                new HttpEntity<>(headers);


        ResponseEntity<String> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.PUT,
                        entity,
                        String.class);


        if (!response.getStatusCode().is2xxSuccessful()) {

            throw new RuntimeException(
                    "FIP revoke failed. Status: "
                            + response.getStatusCode());
        }
    }
}