package com.consentchain.aggregatorservice.service;

import com.consentchain.aggregatorservice.model.AaDataRequest;
import com.consentchain.aggregatorservice.model.BlockchainConsentEventType;
import com.consentchain.aggregatorservice.model.AuditAction;
import com.consentchain.aggregatorservice.model.Consent;
import com.consentchain.aggregatorservice.model.ConsentStatus;
import com.consentchain.aggregatorservice.model.DataRequestStatus;
import com.consentchain.aggregatorservice.model.User;
import com.consentchain.aggregatorservice.repository.AaDataRequestRepository;
import com.consentchain.aggregatorservice.repository.ConsentRepository;
import com.consentchain.aggregatorservice.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ConsentService {

    private final ConsentRepository consentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final FipClientService fipClientService;
    private final AaDataRequestRepository dataRequestRepository;
    private final BlockchainAuditService blockchainAuditService;

    public ConsentService(
            ConsentRepository consentRepository,
            UserRepository userRepository,
            AuditService auditService,
            FipClientService fipClientService,
            AaDataRequestRepository dataRequestRepository,
            BlockchainAuditService blockchainAuditService) {

        this.consentRepository = consentRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.fipClientService = fipClientService;
        this.dataRequestRepository = dataRequestRepository;
        this.blockchainAuditService = blockchainAuditService;
    }

    // =========================================================
    // CREATE CONSENT
    // =========================================================

    public Consent createConsent(
            String requestId,
            Long userId,
            String fiuId,
            String purpose,
            List<String> dataScopes,
            LocalDate fromDate,
            LocalDate toDate) {

        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (requestId == null ||
                requestId.isBlank()) {

            throw new RuntimeException(
                    "Request ID is required");
        }

        if (userId == null) {

            throw new RuntimeException(
                    "User ID is required");
        }

        if (fiuId == null ||
                fiuId.isBlank()) {

            throw new RuntimeException(
                    "FIU ID is required");
        }

        if (purpose == null ||
                purpose.isBlank()) {

            throw new RuntimeException(
                    "Purpose is required");
        }

        if (dataScopes == null ||
                dataScopes.isEmpty()) {

            throw new RuntimeException(
                    "At least one data scope is required");
        }

        if (fromDate == null) {

            throw new RuntimeException(
                    "From date is required");
        }

        if (toDate == null) {

            throw new RuntimeException(
                    "To date is required");
        }

        if (toDate.isBefore(fromDate)) {

            throw new RuntimeException(
                    "To date cannot be before from date");
        }

        // -----------------------------------------------------
        // CHECK USER
        // -----------------------------------------------------

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"));

        // -----------------------------------------------------
        // GENERATE CONSENT ID
        // -----------------------------------------------------

        String consentId =
                "CONSENT-" +
                        UUID.randomUUID()
                                .toString()
                                .substring(0, 8)
                                .toUpperCase();

        // -----------------------------------------------------
        // CREATE CONSENT
        // -----------------------------------------------------

        Consent consent =
                new Consent();

        consent.setConsentId(
                consentId);

        consent.setRequestId(
                requestId);

        consent.setUser(
                user);

        consent.setFiuId(
                fiuId);

        consent.setPurpose(
                purpose);

        consent.setDataScopes(
                dataScopes);

        consent.setFromDate(
                fromDate);

        consent.setToDate(
                toDate);

        consent.setStatus(
                ConsentStatus.PENDING);

        consent.setCreatedAt(
                LocalDateTime.now());

        consent.setExpiresAt(
                LocalDateTime.now()
                        .plusDays(30));

        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        Consent saved =
                consentRepository.save(
                        consent);

        // -----------------------------------------------------
        // AUDIT
        // -----------------------------------------------------

        auditService.log(
                user,
                AuditAction.CONSENT_CREATED,
                "Created consent "
                        + saved.getConsentId());
        blockchainAuditService.queueConsentEvent(saved, BlockchainConsentEventType.CREATED);

        return saved;
    }

    // =========================================================
    // APPROVE CONSENT
    // =========================================================

    public Consent approveConsent(
            String consentId) {

        // -----------------------------------------------------
        // FIND CONSENT
        // -----------------------------------------------------

        Consent consent =
                consentRepository
                        .findByConsentId(
                                consentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Consent not found"));

        // -----------------------------------------------------
        // CHECK STATUS
        // -----------------------------------------------------

        if (consent.getStatus() !=
                ConsentStatus.PENDING) {

            throw new RuntimeException(
                    "Only PENDING consent can be approved");
        }

        // -----------------------------------------------------
        // CHECK DATA SCOPES
        // -----------------------------------------------------

        if (consent.getDataScopes() == null ||
                consent.getDataScopes().isEmpty()) {

            throw new RuntimeException(
                    "Consent data scope is empty");
        }

        // -----------------------------------------------------
        // CONVERT DATA SCOPES
        //
        // AA:
        // ["ACCOUNT", "TRANSACTIONS", "LOANS"]
        //
        // FIP:
        // "ACCOUNT,TRANSACTIONS,LOANS"
        // -----------------------------------------------------

        String dataScope =
                String.join(
                        ",",
                        consent.getDataScopes());

        // -----------------------------------------------------
        // REGISTER CONSENT AT FIP
        // -----------------------------------------------------

        try {

            fipClientService.registerConsentAtFip(
                    consent.getConsentId(),
                    consent.getPurpose(),
                    dataScope,
                    consent.getExpiresAt()
            );

        } catch (Exception e) {

            /*
             * If FIP registration fails,
             * AA consent remains PENDING.
             */

            throw new RuntimeException(
                    "FIP consent registration failed: "
                            + extractErrorMessage(e));
        }

        // -----------------------------------------------------
        // ACTIVATE AA CONSENT
        // -----------------------------------------------------

        consent.setStatus(
                ConsentStatus.ACTIVE);

        Consent saved =
                consentRepository.save(
                        consent);

        // -----------------------------------------------------
        // UPDATE RELATED DATA REQUEST
        // -----------------------------------------------------

        AaDataRequest dataRequest =
                dataRequestRepository
                        .findByConsentId(
                                consent.getConsentId())
                        .orElse(null);

        if (dataRequest != null) {

            dataRequest.setStatus(
                    DataRequestStatus.CONSENT_APPROVED);

            dataRequestRepository.save(
                    dataRequest);
        }

        // -----------------------------------------------------
        // AUDIT
        // -----------------------------------------------------

        auditService.log(
                consent.getUser(),
                AuditAction.CONSENT_APPROVED,
                "Approved consent "
                        + consent.getConsentId()
                        + " and registered it at FIP");
        blockchainAuditService.queueConsentEvent(saved, BlockchainConsentEventType.APPROVED);

        return saved;
    }

    // =========================================================
    // REJECT CONSENT
    // =========================================================

    public Consent rejectConsent(
            String consentId) {

        // -----------------------------------------------------
        // FIND CONSENT
        // -----------------------------------------------------

        Consent consent =
                consentRepository
                        .findByConsentId(
                                consentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Consent not found"));

        // -----------------------------------------------------
        // CHECK STATUS
        // -----------------------------------------------------

        if (consent.getStatus() !=
                ConsentStatus.PENDING) {

            throw new RuntimeException(
                    "Only PENDING consent can be rejected");
        }

        // -----------------------------------------------------
        // REJECT CONSENT
        // -----------------------------------------------------

        consent.setStatus(
                ConsentStatus.REJECTED);

        Consent saved =
                consentRepository.save(
                        consent);

        // -----------------------------------------------------
        // UPDATE DATA REQUEST
        // -----------------------------------------------------

        AaDataRequest dataRequest =
                dataRequestRepository
                        .findByConsentId(
                                consent.getConsentId())
                        .orElse(null);

        if (dataRequest != null) {

            dataRequest.setStatus(
                    DataRequestStatus.REJECTED);

            dataRequestRepository.save(
                    dataRequest);
        }

        // -----------------------------------------------------
        // AUDIT
        // -----------------------------------------------------

        auditService.log(
                consent.getUser(),
                AuditAction.CONSENT_REJECTED,
                "Rejected consent "
                        + consent.getConsentId());
        blockchainAuditService.queueConsentEvent(saved, BlockchainConsentEventType.REJECTED);

        return saved;
    }

    // =========================================================
    // REVOKE CONSENT
    // =========================================================

    public Consent revokeConsent(
            String consentId) {

        // -----------------------------------------------------
        // FIND CONSENT
        // -----------------------------------------------------

        Consent consent =
                consentRepository
                        .findByConsentId(
                                consentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Consent not found"));

        // -----------------------------------------------------
        // CHECK STATUS
        // -----------------------------------------------------

        if (consent.getStatus() !=
                ConsentStatus.ACTIVE) {

            throw new RuntimeException(
                    "Only ACTIVE consent can be revoked");
        }

        // -----------------------------------------------------
        // REVOKE AT FIP FIRST
        // -----------------------------------------------------

        try {

            fipClientService.revokeConsentAtFip(
                    consent.getConsentId());

        } catch (Exception e) {

            /*
             * If FIP revoke fails,
             * AA consent remains ACTIVE.
             */

            throw new RuntimeException(
                    "FIP consent revocation failed: "
                            + extractErrorMessage(e));
        }

        // -----------------------------------------------------
        // REVOKE AA CONSENT
        // -----------------------------------------------------

        consent.setStatus(
                ConsentStatus.REVOKED);

        Consent saved =
                consentRepository.save(
                        consent);

        // -----------------------------------------------------
        // UPDATE DATA REQUEST
        // -----------------------------------------------------

        AaDataRequest dataRequest =
                dataRequestRepository
                        .findByConsentId(
                                consent.getConsentId())
                        .orElse(null);

        if (dataRequest != null) {

            dataRequest.setStatus(
                    DataRequestStatus.REJECTED);

            dataRequestRepository.save(
                    dataRequest);
        }

        // -----------------------------------------------------
        // AUDIT
        // -----------------------------------------------------

        auditService.log(
                consent.getUser(),
                AuditAction.CONSENT_REVOKED,
                "Revoked consent "
                        + consent.getConsentId()
                        + " at FIP");
        blockchainAuditService.queueConsentEvent(saved, BlockchainConsentEventType.REVOKED);

        return saved;
    }

    // =========================================================
    // GET USER CONSENTS
    // =========================================================

    public List<Consent> getUserConsents(
            Long userId) {

        if (!userRepository.existsById(userId)) {

            throw new RuntimeException(
                    "User not found");
        }

        return consentRepository
                .findByUserId(userId);
    }

    // =========================================================
    // GET CONSENT
    // =========================================================

    public Consent getConsent(
            String consentId) {

        return consentRepository
                .findByConsentId(
                        consentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Consent not found"));
    }

    // =========================================================
    // ERROR MESSAGE
    // =========================================================

    private String extractErrorMessage(
            Exception e) {

        Throwable cause = e;

        while (cause.getCause() != null) {
            cause = cause.getCause();
        }

        if (cause.getMessage() != null &&
                !cause.getMessage().isBlank()) {

            return cause.getMessage();
        }

        return e.getMessage();
    }
}