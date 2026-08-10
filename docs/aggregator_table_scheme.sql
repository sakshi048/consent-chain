CREATE DATABASE aggregator_service_db;
USE aggregator_service_db;
 
CREATE TABLE consent_artefacts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    consent_id VARCHAR(50) UNIQUE,
    customer_id BIGINT,
    requester_institution_id VARCHAR(50),
    provider_institution_ids TEXT,      -- JSON array e.g. ["Bank A","Bank B"]
    purpose VARCHAR(100),
    status VARCHAR(20),                 -- PENDING / ACTIVE / DENIED / REVOKED / EXPIRED
    valid_till DATETIME,
    artefact_json TEXT,                 -- full nested consent object (see JSON section)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
 
CREATE TABLE data_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(50) UNIQUE,
    customer_id BIGINT,
    requester_institution_id VARCHAR(50),   -- FIU
    provider_institution_ids TEXT,          -- FIPs, JSON array
    purpose VARCHAR(100),
    data_scope TEXT,
    account_ids TEXT,
    data_period VARCHAR(50),
    consent_id VARCHAR(50),
    status VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
 
CREATE TABLE institution_mapping (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    pan_number VARCHAR(10),
    bank_name VARCHAR(50),
    account_number VARCHAR(20)
);
 
CREATE TABLE institutions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    type VARCHAR(20),          -- FIP / FIU / BOTH
    api_key VARCHAR(100),
    status VARCHAR(20)         -- ACTIVE / SUSPENDED
);
 
CREATE TABLE audit_blocks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event VARCHAR(50),
    data TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    hash VARCHAR(100),
    previous_hash VARCHAR(100)
);