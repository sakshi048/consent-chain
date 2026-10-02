package com.consentchain.aggregatorservice.service;
import com.consentchain.aggregatorservice.model.AuditAction;
import com.consentchain.aggregatorservice.model.AuditLog;
import com.consentchain.aggregatorservice.model.User;
import com.consentchain.aggregatorservice.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(
            User user,
            AuditAction action,
            String description) {

        AuditLog log = new AuditLog();

        log.setUserId(user != null ? user.getId() : null);
        log.setUsername(user != null ? user.getUsername() : "SYSTEM");
        log.setAction(action);
        log.setDescription(description);
        log.setTimestamp(LocalDateTime.now());

        auditLogRepository.save(log);
    }
}