package com.consentchain.bankservice.repository;

import com.consentchain.bankservice.model.DataRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DataRequestRepository
        extends JpaRepository<DataRequest, Long> {

    Optional<DataRequest> findByRequestId(
            String requestId);
}