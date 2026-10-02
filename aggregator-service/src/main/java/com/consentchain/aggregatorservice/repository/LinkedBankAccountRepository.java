package com.consentchain.aggregatorservice.repository;


import com.consentchain.aggregatorservice.model.LinkedBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LinkedBankAccountRepository
        extends JpaRepository<LinkedBankAccount, Long> {

    List<LinkedBankAccount> findByUserId(Long userId);

    boolean existsByUserIdAndAccountNumber(
            Long userId,
            String accountNumber
    );
}