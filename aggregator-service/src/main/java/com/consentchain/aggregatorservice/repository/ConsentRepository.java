package com.consentchain.aggregatorservice.repository;
import com.consentchain.aggregatorservice.model.Consent;
import com.consentchain.aggregatorservice.model.ConsentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConsentRepository
        extends JpaRepository<Consent, Long> {

    Optional<Consent> findByConsentId(String consentId);

    List<Consent> findByUserId(Long userId);

    List<Consent> findByStatus(ConsentStatus status);
}