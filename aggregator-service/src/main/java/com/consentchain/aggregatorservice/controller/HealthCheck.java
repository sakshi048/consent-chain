package com.consentchain.aggregatorservice.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/aggregator")
public class HealthCheck {
    @GetMapping("/health-check")
    public String healthCheck() {
        return "Aggregator service is running...";
    }

}
