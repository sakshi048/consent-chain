package com.consentchain.bankservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class DataRequestCreateRequest {

    @NotBlank
    private String customerPan;

    @NotBlank
    private String purpose;

    @NotBlank
    private String dataScope;

    @NotNull
    private LocalDate fromDate;

    @NotNull
    private LocalDate toDate;

    public String getCustomerPan() {
        return customerPan;
    }

    public void setCustomerPan(String customerPan) {
        this.customerPan = customerPan;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getDataScope() {
        return dataScope;
    }

    public void setDataScope(String dataScope) {
        this.dataScope = dataScope;
    }

    public LocalDate getFromDate() {
        return fromDate;
    }

    public void setFromDate(LocalDate fromDate) {
        this.fromDate = fromDate;
    }

    public LocalDate getToDate() {
        return toDate;
    }

    public void setToDate(LocalDate toDate) {
        this.toDate = toDate;
    }
}