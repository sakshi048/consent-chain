package com.consentchain.aggregatorservice.dto;

import java.time.LocalDate;
import java.util.List;

public class ConsentRequest {

    private String requestId;

    private Long userId;

    private String fiuId;

    private String purpose;

    private List<String> dataScopes;

    private LocalDate fromDate;

    private LocalDate toDate;


    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }


    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }


    public String getFiuId() {
        return fiuId;
    }

    public void setFiuId(String fiuId) {
        this.fiuId = fiuId;
    }


    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }


    public List<String> getDataScopes() {
        return dataScopes;
    }

    public void setDataScopes(
            List<String> dataScopes) {

        this.dataScopes = dataScopes;
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
}