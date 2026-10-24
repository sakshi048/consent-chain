package com.consentchain.aggregatorservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class FiuClientService {

    private final RestTemplate restTemplate;

    @Value("${fiu.base-url}")
    private String fiuBaseUrl;

    public FiuClientService(
            RestTemplate restTemplate) {

        this.restTemplate =
                restTemplate;
    }

    // =========================================================
    // SEND DATA REQUEST RESULT TO FIU
    // =========================================================

    public void sendDataRequestResult(
            String requestId,
            String consentId,
            String status,
            Object data) {

        String url =
                fiuBaseUrl
                        + "/fiu/data-request/"
                        + requestId
                        + "/result";

        Map<String, Object> body =
                new HashMap<>();

        body.put(
                "consentId",
                consentId);

        body.put(
                "status",
                status);

        body.put(
                "data",
                data);

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON);

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

        if (!response.getStatusCode()
                .is2xxSuccessful()) {

            throw new RuntimeException(
                    "FIU returned status: "
                            + response.getStatusCode());
        }
    }
}