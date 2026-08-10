package com.consentchain.bankservice.repository;

import com.consentchain.bankservice.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByPanNumber(String panNumber);
    Optional<Customer> findByNetbankingUsername(String netbankingUsername);
}