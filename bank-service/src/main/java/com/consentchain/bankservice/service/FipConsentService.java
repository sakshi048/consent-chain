package com.consentchain.bankservice.service;

import com.consentchain.bankservice.dto.FipConsentRequest;
import com.consentchain.bankservice.model.ConsentArtefact;
import com.consentchain.bankservice.model.ConsentStatus;
import com.consentchain.bankservice.repository.ConsentArtefactRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class FipConsentService {

    private final ConsentArtefactRepository consentArtefactRepository;

    public FipConsentService(
            ConsentArtefactRepository consentArtefactRepository) {

        this.consentArtefactRepository =
                consentArtefactRepository;
    }

    // =========================================================
    // REGISTER CONSENT
    // =========================================================

    public ConsentArtefact registerConsent(
            FipConsentRequest request) {

        if (request.getConsentId() == null ||
                request.getConsentId().isBlank()) {

            throw new RuntimeException(
                    "Consent ID is required");
        }

        if (request.getPurpose() == null ||
                request.getPurpose().isBlank()) {

            throw new RuntimeException(
                    "Purpose is required");
        }

        if (request.getDataScope() == null ||
                request.getDataScope().isBlank()) {

            throw new RuntimeException(
                    "Data scope is required");
        }

        if (request.getValidTill() == null) {

            throw new RuntimeException(
                    "Valid till is required");
        }

        if (consentArtefactRepository
                .findByConsentId(request.getConsentId())
                .isPresent()) {

            throw new RuntimeException(
                    "Consent already exists");
        }

        if (!request.getValidTill()
                .isAfter(LocalDateTime.now())) {

            throw new RuntimeException(
                    "Valid till must be a future date");
        }

        ConsentArtefact consent =
                new ConsentArtefact();

        consent.setConsentId(
                request.getConsentId());

        consent.setPurpose(
                request.getPurpose());

        consent.setDataScope(
                request.getDataScope());

        consent.setValidTill(
                request.getValidTill());

        consent.setStatus(
                ConsentStatus.ACTIVE);

        return consentArtefactRepository.save(consent);
    }


    // =========================================================
    // REVOKE CONSENT
    // =========================================================

    public ConsentArtefact revokeConsent(
            String consentId) {

        if (consentId == null ||
                consentId.isBlank()) {

            throw new RuntimeException(
                    "Consent ID is required");
        }

        ConsentArtefact consent =
                consentArtefactRepository
                        .findByConsentId(consentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Consent not found"));

        if (consent.getStatus() ==
                ConsentStatus.REVOKED) {

            throw new RuntimeException(
                    "Consent already revoked");
        }

        consent.setStatus(
                ConsentStatus.REVOKED);

        return consentArtefactRepository.save(
                consent);
    }
}