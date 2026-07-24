package com.consentchain.bankservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/bank")
public class HealthCheck {

    @GetMapping("/health-check")
    public String healthCheck() {
        return "Consent chain bank-service is running...";
    }
}