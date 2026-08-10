package com.consentchain.bankservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "loan_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_id")
    private Long accountId;

    @Column(name = "loan_type")
    private String loanType;

    private BigDecimal amount;

    // ONGOING / CLOSED / DEFAULTED
    private String status;
}