package com.consentchain.bankservice.dto;

import com.consentchain.bankservice.model.RequestStatus;

import java.time.LocalDate;

public class DataRequestResponse {

    private String requestId;

    private String customerPan;

    private String purpose;

    private String dataScope;

    private LocalDate fromDate;

    private LocalDate toDate;

    private RequestStatus status;

    private String consentId;

    private String responseData;

    private String message;


    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(
            String requestId) {

        this.requestId = requestId;
    }


    public String getCustomerPan() {
        return customerPan;
    }

    public void setCustomerPan(
            String customerPan) {

        this.customerPan = customerPan;
    }


    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(
            String purpose) {

        this.purpose = purpose;
    }


    public String getDataScope() {
        return dataScope;
    }

    public void setDataScope(
            String dataScope) {

        this.dataScope = dataScope;
    }


    public LocalDate getFromDate() {
        return fromDate;
    }

    public void setFromDate(
            LocalDate fromDate) {

        this.fromDate = fromDate;
    }


    public LocalDate getToDate() {
        return toDate;
    }

    public void setToDate(
            LocalDate toDate) {

        this.toDate = toDate;
    }


    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(
            RequestStatus status) {

        this.status = status;
    }


    public String getConsentId() {
        return consentId;
    }

    public void setConsentId(
            String consentId) {

        this.consentId = consentId;
    }


    public String getResponseData() {
        return responseData;
    }

    public void setResponseData(
            String responseData) {

        this.responseData = responseData;
    }


    public String getMessage() {
        return message;
    }

    public void setMessage(
            String message) {

        this.message = message;
    }
}