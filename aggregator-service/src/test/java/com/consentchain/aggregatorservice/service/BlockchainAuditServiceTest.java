package com.consentchain.aggregatorservice.service;

import com.consentchain.aggregatorservice.config.BlockchainProperties;
import com.consentchain.aggregatorservice.model.BlockchainAuditEvent;
import com.consentchain.aggregatorservice.model.BlockchainAuditStatus;
import com.consentchain.aggregatorservice.model.BlockchainConsentEventType;
import com.consentchain.aggregatorservice.model.Consent;
import com.consentchain.aggregatorservice.repository.BlockchainAuditEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class BlockchainAuditServiceTest {
    private BlockchainAuditEventRepository repository;
    private BlockchainProperties properties;
    private BlockchainClient client;
    private BlockchainAuditService service;

    @SuppressWarnings("unchecked")
    @BeforeEach
    void setUp() {
        repository = mock(BlockchainAuditEventRepository.class);
        properties = new BlockchainProperties();
        properties.setEnabled(true);
        properties.setAuditHmacSecret("student-demo-secret-at-least-32-chars-long");
        client = mock(BlockchainClient.class);
        ObjectProvider<BlockchainClient> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(client);
        service = new BlockchainAuditService(repository, properties, provider);
    }

    @Test
    void queuesOnlyOpaqueKeyedValuesForConsentEvents() {
        Consent consent = consent();
        when(repository.existsByEventKey(anyString())).thenReturn(false);

        service.queueConsentEvent(consent, BlockchainConsentEventType.CREATED);

        var captor = org.mockito.ArgumentCaptor.forClass(BlockchainAuditEvent.class);
        verify(repository).save(captor.capture());
        BlockchainAuditEvent event = captor.getValue();
        assertEquals(BlockchainConsentEventType.CREATED, event.getEventType());
        assertTrue(event.getEventKey().matches("0x[0-9a-f]{64}"));
        assertTrue(event.getConsentReference().matches("0x[0-9a-f]{64}"));
        assertTrue(event.getCommitmentHash().matches("0x[0-9a-f]{64}"));
        assertFalse(event.getEventKey().contains(consent.getConsentId()));
        assertFalse(event.getCommitmentHash().contains(consent.getPurpose()));
    }

    @Test
    void retriesOutboxEventAndMarksItSubmitted() {
        BlockchainAuditEvent event = new BlockchainAuditEvent("CONSENT-123", BlockchainConsentEventType.APPROVED,
                "0x" + "1".repeat(64), "0x" + "2".repeat(64), "0x" + "3".repeat(64), LocalDateTime.now());
        when(repository.findTop50ByStatusInOrderByCreatedAtAsc(anyList())).thenReturn(List.of(event));
        when(client.submitEvent(anyString(), any(), anyString(), anyString())).thenReturn("0xtransaction");

        service.submitPendingEvents();

        assertEquals(BlockchainAuditStatus.SUBMITTED, event.getStatus());
        assertEquals("0xtransaction", event.getTransactionHash());
        verify(repository).save(event);
    }

    @Test
    void verifiesStoredCommitmentAgainstLocalConsentAndChainRecord() {
        Consent consent = consent();
        consent.setExpiresAt(consent.getExpiresAt().withNano(123456789));
        when(repository.existsByEventKey(anyString())).thenReturn(false);
        service.queueConsentEvent(consent, BlockchainConsentEventType.CREATED);
        var captor = org.mockito.ArgumentCaptor.forClass(BlockchainAuditEvent.class);
        verify(repository).save(captor.capture());
        BlockchainAuditEvent event = captor.getValue();
        event.markSubmitted("0xtx", LocalDateTime.now());
        when(repository.findByConsentIdOrderByCreatedAtAsc(consent.getConsentId())).thenReturn(List.of(event));
        when(client.isEventRecorded(event.getEventKey())).thenReturn(true);
        when(client.verifyEvent(event.getEventKey(), event.getEventType(), event.getConsentReference(), event.getCommitmentHash())).thenReturn(true);

        var proof = service.getAudit(consent.getConsentId(), consent);

        assertEquals(1, proof.size());
        assertTrue(proof.get(0).verifiedOnChain());
        assertEquals("0xtx", proof.get(0).transactionHash());
    }

    @Test
    void disabledBlockchainDoesNotBlockConsentCreation() {
        properties.setEnabled(false);
        service.queueConsentEvent(consent(), BlockchainConsentEventType.CREATED);
        verifyNoInteractions(repository, client);
    }

    private Consent consent() {
        Consent consent = new Consent();
        consent.setConsentId("CONSENT-123");
        consent.setFiuId("FIU-LOAN");
        consent.setPurpose("Loan assessment");
        consent.setDataScopes(List.of("ACCOUNT", "TRANSACTIONS"));
        consent.setFromDate(LocalDate.of(2026, 1, 1));
        consent.setToDate(LocalDate.of(2026, 6, 30));
        consent.setExpiresAt(LocalDateTime.of(2026, 11, 1, 0, 0));
        return consent;
    }
}
