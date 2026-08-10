CREATE DATABASE bank_service_db;
USE bank_service_db;
 
CREATE TABLE customers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    pan_number VARCHAR(10) UNIQUE,
    name VARCHAR(100),
    mobile_number VARCHAR(15),
    netbanking_username VARCHAR(50),
    netbanking_password VARCHAR(100)
);
 
CREATE TABLE accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT,
    bank_name VARCHAR(50),
    account_number VARCHAR(20) UNIQUE,
    ifsc VARCHAR(15),
    balance DECIMAL(12,2),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
 
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id BIGINT,
    txn_date DATE,
    description VARCHAR(200),
    amount DECIMAL(12,2),
    type VARCHAR(10),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);
 
CREATE TABLE loan_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id BIGINT,
    loan_type VARCHAR(50),
    amount DECIMAL(12,2),
    status VARCHAR(20),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);
 
CREATE TABLE consent_artefacts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    consent_id VARCHAR(50) UNIQUE,
    purpose VARCHAR(100),
    data_scope TEXT,
    valid_till DATETIME,
    status VARCHAR(20)
);