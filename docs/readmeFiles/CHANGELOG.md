# ConsentChain — Changelog

Detailed work log. For architecture, current status summary, and API docs, see [README.md](README.md).

---

## Repository

- [x] Repository structure created (3 module folders + docs)
- [x] Documentation folder created

---

## Bank Service — `http://localhost:8081` | MySQL: `bank_service_db`

- [x] Spring Boot project initialized — Java 21, Maven, Spring Web, Spring Data JPA, MySQL, Lombok
- [x] `application.yml` configured, server on port 8081, connected to MySQL (`ddl-auto: validate`)
- [x] Health check endpoint: `GET /bank/health-check`
- [x] Entities aligned to the MySQL schema: `Customer`, `Account`, `Transaction`, `LoanHistory`, `ConsentArtefact`, `ConsentStatus`, `User`, `Role`
- [x] Repositories: `CustomerRepository`, `AccountRepository`, `TransactionRepository`, `LoanHistoryRepository`, `ConsentArtefactRepository`, `UserRepository`
- [x] Auth module: `AuthController`, `AuthService`, `LoginRequest/Response`, `RegisterRequest` — `POST /auth/register`, `POST /auth/login`
- [x] `POST /bank/validate-consent` — tested, working
- [x] `POST /bank/fetch-data` — tested, working (Base64-encoded account data)
- [x] `POST /bank/fetch-statement` — tested, working (returns transactions, optional date range)
- [x] `GET /bank/loan-history/{accountNumber}` — tested, working
- [x] Basic Slf4j request logging added on all `/bank/**` endpoints
- [x] Seed data (customers, accounts, transactions, loan history, a sample consent artefact) loaded via SQL scripts directly into MySQL — the old `DataSeeder.java` (which seeded an unrelated `BankAccount` table) was removed since it didn't match the finalized schema

**`bank-service` is feature-complete for this project's scope.**

---

## Aggregator Service — `http://localhost:8082` | MySQL: `aggregator_service_db`

- [x] Spring Boot project initialized — Java 21, Maven, Spring Web, Spring Data JPA, MySQL, Lombok
- [x] `application.yml` configured, port 8082
- [x] Health check endpoint: `GET /aggregator/health-check`
- [x] Table schema created: `consent_artefacts`, `data_requests`, `institution_mapping`, `institutions`, `audit_blocks`
- [x] Seed data loaded: sample institutions (incl. a third-party FIU, Bajaj Finserv), institution mapping, one sample consent artefact + data request
- [ ] Application code (entities, repositories, services, controllers) — not yet started; this is the next major focus

---

## Today's Session — bank-service debugging and completion

- [x] Found and fixed a schema mismatch: an earlier `BankAccount` entity + `DataSeeder` didn't match the finalized MySQL schema (`accounts`, `transactions`, `loan_history` tables) — replaced with schema-accurate `Customer`, `Account`, `Transaction`, `LoanHistory` entities and repositories; removed the stale `BankAccount`/`DataSeeder`
- [x] Fixed `application.yml` — pointed `datasource.url` at the correct `bank_service_db` (was pointing at an unrelated `consentchain_auth` DB), switched `ddl-auto` from `update` to `validate` to protect manually-seeded data, and resolved a MySQL auth (`Access denied`) error by correcting the password
- [x] Fixed a table-name mismatch on `ConsentArtefact` (`consent_artefact` → `consent_artefacts`) that was causing a schema-validation failure at startup
- [x] Rewrote `BankController` to use the new `Account` entity/repository (was still referencing the deleted `BankAccount`)
- [x] Added two new endpoints — `POST /bank/fetch-statement` (transactions, with optional date range) and `GET /bank/loan-history/{accountNumber}` — both using the new `TransactionRepository`/`LoanHistoryRepository`
- [x] Added Slf4j logging across all `/bank/**` endpoints
- [x] End-to-end tested in Postman: `validate-consent`, `fetch-data`, `fetch-statement`, `loan-history` — all returning correct data against the seeded MySQL rows
- [x] Decided and documented the authentication split: `bank-service` uses a simple API key check, `aggregator-service` will carry full JWT (see README's "Authentication Strategy")
- [x] Added `BCryptPasswordEncoder` (via `PasswordConfig`) — `AuthService` now hashes passwords on register and verifies with `passwordEncoder.matches()` on login, replacing the earlier plaintext comparison
- [x] Added `ApiKeyFilter` — checks the `X-AA-Token` header on `/bank/validate-consent`, `/bank/fetch-data`, `/bank/fetch-statement`, and `/bank/loan-history`; requests without a valid key get `401 Unauthorized`
- [x] Moved DB credentials and the API key to environment variables (`DB_USERNAME`, `DB_PASSWORD`, `AA_API_KEY`) instead of hardcoding them in `application.yml`, to keep credentials out of the Git repository
- [x] Verified end-to-end in Postman: register/login with BCrypt hashing (confirmed hashed password in MySQL, correct password logs in, wrong password is rejected with 401), and confirmed all protected `/bank/**` endpoints correctly reject requests missing the `X-AA-Token` header and accept them once it's present

---

## What's Next

- [ ] Unit tests for `bank-service` (consent expiry, invalid status, etc.) — optional
- [ ] `ConsentArtefact` model + repository in `aggregator-service`
- [ ] Consent creation API + consent state management
- [ ] FIU data-request model + FIP mapping/routing
- [ ] SHA-256 hash utility and blockchain ledger entity (hash + previousHash + timestamp)
- [ ] JWT-based auth + revocation service + session invalidation (in aggregator-service)
- [ ] Final integration between `bank-service` and `aggregator-service`