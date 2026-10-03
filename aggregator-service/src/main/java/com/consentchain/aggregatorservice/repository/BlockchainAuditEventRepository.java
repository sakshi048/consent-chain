package com.consentchain.aggregatorservice.repository;

import com.consentchain.aggregatorservice.model.BlockchainAuditEvent;
import com.consentchain.aggregatorservice.model.BlockchainAuditStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BlockchainAuditEventRepository extends JpaRepository<BlockchainAuditEvent, Long> {
    boolean existsByEventKey(String eventKey);
    Optional<BlockchainAuditEvent> findByEventKey(String eventKey);
    List<BlockchainAuditEvent> findByConsentIdOrderByCreatedAtAsc(String consentId);
    List<BlockchainAuditEvent> findTop50ByStatusInOrderByCreatedAtAsc(List<BlockchainAuditStatus> statuses);
}
