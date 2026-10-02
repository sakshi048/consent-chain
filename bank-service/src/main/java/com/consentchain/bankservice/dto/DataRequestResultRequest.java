package com.consentchain.bankservice.dto;

import lombok.Data;

@Data
public class DataRequestResultRequest {

    private String consentId;

    private String status;

    private Object data;
}