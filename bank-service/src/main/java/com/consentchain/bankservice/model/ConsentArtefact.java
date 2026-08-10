package com.consentchain.bankservice.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "consent_artefacts")
@Data
public class ConsentArtefact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String consentId;

    private String purpose;

    private String dataScope;

    private LocalDateTime validTill;

    @Enumerated(EnumType.STRING)
    private ConsentStatus status;
}