package com.consentchain.bankservice.dto;

import com.consentchain.bankservice.model.Role;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String mobileNo;
    private String username;
    private String password;
    private String institutionId;
    private Role role;

    private String state;
    private String city;
    private String bankName;
    private String ifscCode;
    private String accountNumber;
    private String accountHolderName;
    private String accountType;

    private PersonalDetails personalDetails;
    private BankDetails bankDetails;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PersonalDetails {
        private String name;
        private String email;
        private String mobileNo;
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BankDetails {
        private String state;
        private String city;
        private String bankName;
        private String ifscCode;
        private String accountNumber;
        private String accountHolderName;
        private String accountType;
    }
}
