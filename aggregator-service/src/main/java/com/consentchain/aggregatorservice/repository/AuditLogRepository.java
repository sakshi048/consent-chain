package com.consentchain.aggregatorservice.repository;


import com.consentchain.aggregatorservice.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {
}