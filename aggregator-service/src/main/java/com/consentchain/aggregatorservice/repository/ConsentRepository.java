package com.consentchain.aggregatorservice.repository;

import com.consentchain.aggregatorservice.model.Consent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsentRepository
        extends JpaRepository<Consent, Long> {

    Optional<Consent> findByConsentId(
            String consentId);

    List<Consent> findByUserId(
            Long userId);
}