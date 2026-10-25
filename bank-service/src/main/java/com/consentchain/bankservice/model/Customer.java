package com.consentchain.bankservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pan_number", unique = true)
    private String panNumber;

    private String name;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @Column(name = "netbanking_username")
    private String netbankingUsername;

    @Column(name = "netbanking_password")
    private String netbankingPassword;
}