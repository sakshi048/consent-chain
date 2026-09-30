package com.consentchain.aggregatorservice.service;
import com.consentchain.aggregatorservice.dto.ConsentRequest;
import com.consentchain.aggregatorservice.model.AuditAction;
import com.consentchain.aggregatorservice.model.Consent;
import com.consentchain.aggregatorservice.model.ConsentStatus;
import com.consentchain.aggregatorservice.model.User;
import com.consentchain.aggregatorservice.repository.ConsentRepository;
import com.consentchain.aggregatorservice.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ConsentService {

    private final ConsentRepository consentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public ConsentService(
            ConsentRepository consentRepository,
            UserRepository userRepository,
            AuditService auditService) {

        this.consentRepository = consentRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public Consent createConsent(
            ConsentRequest request) {

        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Consent consent = new Consent();

        consent.setConsentId(
                "CONSENT-" +
                        UUID.randomUUID()
                                .toString()
                                .substring(0, 8)
                                .toUpperCase()
        );

        consent.setRequestId(request.getRequestId());
        consent.setUser(user);
        consent.setFiuId(request.getFiuId());
        consent.setPurpose(request.getPurpose());
        consent.setDataScopes(request.getDataScopes());
        consent.setFromDate(request.getFromDate());
        consent.setToDate(request.getToDate());

        consent.setStatus(ConsentStatus.PENDING);

        consent.setCreatedAt(LocalDateTime.now());

        consent.setExpiresAt(
                LocalDateTime.now().plusDays(30)
        );

        Consent saved =
                consentRepository.save(consent);

        auditService.log(
                user,
                AuditAction.CONSENT_CREATED,
                "Consent created: "
                        + saved.getConsentId()
        );

        return saved;
    }

    public List<Consent> getUserConsents(
            Long userId) {

        return consentRepository.findByUserId(userId);
    }

    public Consent approve(
            String consentId) {

        Consent consent = getConsent(consentId);

        if (consent.getStatus() != ConsentStatus.PENDING) {
            throw new RuntimeException(
                    "Only pending consent can be approved"
            );
        }

        consent.setStatus(ConsentStatus.ACTIVE);

        Consent saved =
                consentRepository.save(consent);

        auditService.log(
                consent.getUser(),
                AuditAction.CONSENT_APPROVED,
                "Consent approved: " + consentId
        );

        return saved;
    }

    public Consent reject(
            String consentId) {

        Consent consent = getConsent(consentId);

        if (consent.getStatus() != ConsentStatus.PENDING) {
            throw new RuntimeException(
                    "Only pending consent can be rejected"
            );
        }

        consent.setStatus(ConsentStatus.REJECTED);

        Consent saved =
                consentRepository.save(consent);

        auditService.log(
                consent.getUser(),
                AuditAction.CONSENT_REJECTED,
                "Consent rejected: " + consentId
        );

        return saved;
    }


// blockchain
    public Consent revoke(
            String consentId) {

        Consent consent = getConsent(consentId);

        if (consent.getStatus() != ConsentStatus.ACTIVE) {
            throw new RuntimeException(
                    "Only active consent can be revoked"
            );
        }

        consent.setStatus(ConsentStatus.REVOKED);

        Consent saved =
                consentRepository.save(consent);

        auditService.log(
                consent.getUser(),
                AuditAction.CONSENT_REVOKED,
                "Consent revoked: " + consentId
        );

        return saved;
    }

    public Consent getConsent(
            String consentId) {

        return consentRepository
                .findByConsentId(consentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Consent not found"
                        ));
    }
}