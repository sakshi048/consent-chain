# ConsentChain

A blockchain-based reference implementation of RBI's Account Aggregator (AA) framework for secure, consent-driven financial data sharing.

## Project Structure

```
consent-chain/
├── bank-service/              → Bank / FIP (Financial Information Provider) simulation
├── aggregator-service/        → Account Aggregator + Blockchain audit layer
├── frontend-consent-dashboard/→ React UI (Consent management + dashboard)
├── docs/                      → Architecture diagrams, API contracts
└── README.md
```

## Team & Responsibilities

| Member  | Module | Responsibility |
|---------|---|---|
| Sakshi  | `bank-service` | Bank/FIP simulation — validate consent, fetch & encrypt account data |
| Bhunesh | `aggregator-service` | Account Aggregator logic, consent broker, blockchain ledger, revocation |
| [Name]  | `frontend-consent-dashboard` | React UI — consent grant/view/revoke, dashboard, audit log view |

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.3.4, Maven
- **Database:** H2 (in-memory, dev)
- **Frontend:** React
- **Blockchain layer:** Custom hash-chain (SHA-256 based audit trail)

---

### Progress So Far

- [x] Repository structure set up (3 module folders + docs)
- [x] Spring Boot project initialized — Java 21, Maven, dependencies: Web, Data JPA, H2, Lombok
- [x] `application.yml` configured — H2 in-memory DB, H2 console enabled, server running on **port 8081**
- [x] Health check endpoint working: `GET /bank/health-check`
- [x] `BankAccount` entity model created (id, accountNumber, ifscCode, holderName, balance)
- [x] Repository layer, seed data, ConsentArtefact model, validate-consent + fetch-data endpoints, and API contract doc completed

### Task Breakdown (In Order)

#### 1. Repository Layer
Create `BankAccountRepository` extending `JpaRepository`.
```java
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    Optional<BankAccount> findByAccountNumber(String accountNumber);
}
```
**Learn:** JpaRepository, `Optional`
**Status:** [x] Done

#### 2. Seed Data
Add 2-3 dummy bank accounts on startup using `CommandLineRunner`, so there's data to test against.
**Learn:** `CommandLineRunner`, `@Component`
**Status:** [x] Done

#### 3. ConsentArtefact Model
Define the structure of a consent record: `consentId`, `purpose`, `dataScope`, `validTill`, `status` (ACTIVE / EXPIRED / REVOKED)
**Learn:** `LocalDateTime`, entity design
**Status:** [x] Done — `ConsentArtefactRepository` also added

#### 4. Validate Consent Endpoint
`POST /bank/validate-consent` — checks if a consent artefact is still valid (status = ACTIVE and not expired).
**Learn:** `@RequestBody`, `ResponseEntity`
**Status:** [x] Done

#### 5. Fetch Data Endpoint
`POST /bank/fetch-data` — returns account data if consent is valid.
**Learn:** `@RequestParam`, exception handling (`orElseThrow`)
**Status:** [x] Done — combined with encoding step (see #6)

#### 6. Encrypt & Send
Simple encoding (Base64 for now, not full encryption) to simulate secure data transfer to the aggregator.
**Learn:** Base64 encoding basics
**Status:** [x] Done — implemented inside `/bank/fetch-data`

#### 7. Share API Contract
Once endpoints 4-6 are working, document exact request/response JSON shapes in `docs/api-contracts.md` and share with the aggregator-service dev, so integration can begin without waiting for full completion.
**Status:** [x] Done — see `docs/api-contracts.md`

#### 8. Basic Logging
Add simple logs (e.g. `System.out.println` or `Slf4j`) for each request — will feed into the audit trail later.
**Status:** [ ] Not started

#### 9. Unit Tests
Basic tests for validation logic (consent expiry, invalid status, etc.)
**Status:** [ ] Not started

## How to Run (bank-service)

```bash
cd bank-service
./mvnw spring-boot:run
```
App runs on `http://localhost:8081`
H2 console: `http://localhost:8081/h2-console` (JDBC URL: `jdbc:h2:mem:bankdb`)

---

## Setup Notes for Contributors

- Clone the repo, create your module folder under the project root (already scaffolded)
- Use **Java 17** (not newer previews — Lombok compatibility issues on newer JDKs)
- Keep `.idea/` out of commits — it's in `.gitignore`
- Branch naming: `feature/<your-module>` → PR into `main` when ready