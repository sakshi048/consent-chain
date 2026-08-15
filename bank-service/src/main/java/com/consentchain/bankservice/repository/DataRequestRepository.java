package com.consentchain.bankservice.repository;
import com.consentchain.bankservice.model.DataRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface DataRequestRepository
        extends JpaRepository<DataRequest, Long> {

    Optional<DataRequest> findByRequestId(String requestId);
}