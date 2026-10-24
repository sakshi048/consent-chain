package com.consentchain.aggregatorservice.repository;

import com.consentchain.aggregatorservice.model.AaDataRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AaDataRequestRepository
        extends JpaRepository<AaDataRequest, Long> {

    Optional<AaDataRequest> findByRequestId(String requestId);

    Optional<AaDataRequest> findByConsentId(String consentId);

    boolean existsByRequestId(String requestId);
}