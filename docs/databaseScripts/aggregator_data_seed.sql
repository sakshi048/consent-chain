USE aggregator_service_db;
 
-- Institutions
INSERT INTO institutions (id, name, type, api_key, status) VALUES
(1, 'HDFC Bank', 'BOTH', 'key-hdfc-001', 'ACTIVE'),
(2, 'SBI', 'FIP', 'key-sbi-002', 'ACTIVE'),
(3, 'ICICI Bank', 'FIP', 'key-icici-003', 'ACTIVE'),
(4, 'Bajaj Finserv', 'FIU', 'key-bajaj-004', 'ACTIVE');
 
-- Institution mapping (customer to linked banks)
INSERT INTO institution_mapping (pan_number, bank_name, account_number) VALUES
('ABCPL1234D', 'HDFC', 'AC1000234567'),
('ABCPL1234D', 'SBI',  'AC2000998877'),
('BXYPS5678E', 'HDFC', 'AC1000234568'),
('CQRTV9012F', 'ICICI','AC3000556644');
 
-- Sample consent artefact
INSERT INTO consent_artefacts (consent_id, customer_id, requester_institution_id, provider_institution_ids, purpose, status, valid_till, artefact_json) VALUES
('CNS-1024', 1, 'HDFC Bank', '["HDFC","SBI"]', 'Loan Application', 'ACTIVE', '2026-09-08 00:00:00', '{"consentId":"CNS-1024","purpose":"Loan Application","dataScope":["Account Information","Account Balance","Transactions"],"accounts":["Bank A - 1234","Bank B - 5678"],"period":"Last 6 Months","validTill":"2026-09-08T00:00:00","status":"ACTIVE"}');
 
-- Sample data request
INSERT INTO data_requests (request_id, customer_id, requester_institution_id, provider_institution_ids, purpose, data_scope, account_ids, data_period, consent_id, status) VALUES
('REQ-1001', 1, 'HDFC Bank', '["Bank A","Bank B"]', 'Loan Application', '["Account Information","Account Balance","Transactions"]', '["AC1000234567","AC2000998877"]', 'Last 6 Months', 'CNS-1024', 'PENDING_CONSENT');

SELECT * 
FROM institution_mapping;