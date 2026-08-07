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

**Current working approach:** Sakshi and Bhunesh are pairing on `bank-service` first (build shared understanding, move faster), before splitting off to `aggregator-service` work.

## Tech Stack

- **Backend:** Java 21, Spring Boot 3.3.4, Maven
- **Database:** H2 (in-memory, dev)
- **Frontend:** React
- **Blockchain layer:** Custom hash-chain (SHA-256 based audit trail)

---

<<<<<<< HEAD
## `bank-service` — Overview

Simulates a **Financial Information Provider (FIP)** — i.e., a bank — in the RBI Account Aggregator framework. Provides account data, validates consent, and simulates encrypted data sharing with the Account Aggregator.
=======
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
>>>>>>> feature/bank-service

### How to Run
```bash
cd bank-service
./mvnw spring-boot:run
```
- App runs on: `http://localhost:8081`
- H2 console: `http://localhost:8081/h2-console` (JDBC URL: `jdbc:h2:mem:bankdb`)

### Progress So Far

- [x] Repo structure set up (3 module folders + docs)
- [x] Spring Boot project initialized — Java 21, Maven, dependencies: Web, Data JPA, H2, Lombok
- [x] `application.yml` configured — H2 in-memory DB, H2 console enabled, server running on **port 8081**
- [x] Health check endpoint working: `GET /bank/health-check`
- [x] `BankAccount` entity model created (id, accountNumber, ifscCode, holderName, balance)

### Task Breakdown (In Order)

#### 1. Repository Layer
Create `BankAccountRepository` extending `JpaRepository`.
```java
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    Optional<BankAccount> findByAccountNumber(String accountNumber);
}
```
**Learn:** JpaRepository, `Optional`
**Status:** [ ] Not started

#### 2. Seed Data
Add 2-3 dummy bank accounts on startup using `CommandLineRunner`, so there's data to test against.
**Learn:** `CommandLineRunner`, `@Component`
**Status:** [ ] Not started

#### 3. ConsentArtefact Model
Define the structure of a consent record: `consentId`, `purpose`, `dataScope`, `validTill`, `status` (ACTIVE / EXPIRED / REVOKED)
**Learn:** `LocalDateTime`, entity design
**Status:** [ ] Not started

#### 4. Validate Consent Endpoint
`POST /bank/validate-consent` — checks if a consent artefact is still valid (status = ACTIVE and not expired).
**Learn:** `@RequestBody`, `ResponseEntity`
**Status:** [ ] Not started

#### 5. Fetch Data Endpoint
`POST /bank/fetch-data` — returns account data if consent is valid.
**Learn:** `@RequestParam`, exception handling (`orElseThrow`)
**Status:** [ ] Not started

#### 6. Encrypt & Send
Simple encoding (Base64 for now, not full encryption) to simulate secure data transfer to the aggregator.
**Learn:** Base64 encoding basics
**Status:** [ ] Not started

#### 7. Share API Contract
Once endpoints 4-6 are working, document exact request/response JSON shapes in `docs/api-contracts.md` and share with the aggregator-service dev, so integration can begin without waiting for full completion.
**Status:** [ ] Not started

#### 8. Basic Logging
Add simple logs (e.g. `System.out.println` or `Slf4j`) for each request — will feed into the audit trail later.
**Status:** [ ] Not started

#### 9. Unit Tests
Basic tests for validation logic (consent expiry, invalid status, etc.)
**Status:** [ ] Not started

### What to Learn Along the Way

| Concept | Why it matters |
|---|---|
| JPA Repository pattern | Core to how every entity is queried/saved |
| REST annotations (`@GetMapping`, `@PostMapping`, `@RequestBody`, `@RequestParam`) | Building blocks for every endpoint |
| `ResponseEntity` + status codes | Proper API responses (200, 400, 404, etc.) |
| `CommandLineRunner` | Seeding test data on startup |
| Exception handling basics | Graceful error responses instead of crashes |
| Base64 encoding | Simulating secure data transfer (not real encryption, but demonstrates the concept) |

---

## `aggregator-service` — Overview

Account Aggregator (consent broker) + custom blockchain hash-chain for immutable audit trail.

### How to Run
```bash
cd aggregator-service
./mvnw spring-boot:run
```
- App runs on: `http://localhost:8082`
- H2 console: `http://localhost:8082/h2-console` (JDBC URL: `jdbc:h2:mem:aggregatordb`)

### Progress So Far

- [x] Spring Boot project initialized — Java 21, Maven, dependencies: Web, Data JPA, H2, Lombok
- [x] `application.yml` configured — port `8082`
- [x] Health check endpoint working: `GET /aggregator/health-check`

### Next Steps (after bank-service basics are done)

- [ ] `ConsentArtefact` model (mirrors bank-service structure)
- [ ] SHA-256 hash utility (`MessageDigest`)
- [ ] Blockchain ledger entity (hash + previousHash + timestamp)
- [ ] Consent validation/routing logic
- [ ] Revocation service + session invalidation

---

**Bank Service (mock HDFC/SBI/ICICI) — exact steps:**

1. **Naya Spring Boot module banao**
   - Separate service: `bank-service` (ya agar time kam hai, same project mein alag package `com.consentchain.bankservice`)
   - Dependencies: Spring Web, Spring Data JPA, MySQL Driver, Lombok

2. **MySQL database + tables banao**
   ```sql
   CREATE DATABASE bank_service_db;
   
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
   ```

3. **Entity classes banao** — `Customer`, `Account`, `Transaction`, `LoanHistory` (JPA `@Entity` annotations ke saath, upar wale tables se map)

4. **Repository interfaces** — `CustomerRepository`, `AccountRepository` etc. (`extends JpaRepository`)

5. **Seed data insert karo** — pehle diye JSON ko convert karke `data.sql` file mein daal do (`src/main/resources/data.sql`), Spring Boot startup pe automatically load ho jayega.

6. **REST APIs banao (controller layer):**
   - `POST /bank/verify-account` — PAN/mobile + netbanking credentials leke verify kare, account link confirm kare
   - `POST /bank/fetch-statement` — account number + date range leke transactions return kare
   - `GET /bank/loan-history/{accountNumber}` — loan history return kare

7. **Security add karo** — yeh APIs sirf AA service se hi call hone chahiye, isliye ek simple **API key/token check** filter lagao (jaise header mein `X-AA-Token`, hardcoded ya JWT verify karo).

8. **Port alag rakho** — agar teen alag banks simulate karni hain (HDFC, SBI, ICICI), toh:
   - Simplest: ek hi service, `bankName` parameter se differentiate karo database mein
   - Realistic: teen alag Spring Boot instances (alag ports — 8081, 8082, 8083) run karo, same codebase, sirf application.properties mein `bank.name=HDFC/SBI/ICICI` set karo

9. **AA service se connect karo** — tumhara main Spring Boot (AA layer) mapping table check karke, respective bank service ke port/URL pe REST call karega (RestTemplate/WebClient use karke), response consolidate karke FIU ko dega.

10. **Test karo** — Postman se pehle bank service standalone test karo (`/fetch-statement` sahi data de raha hai kya), phir AA se integrate karke end-to-end test karo.

Yeh 10 steps hain complete setup ke liye. Konse step pe detailed code chahiye — jaise Entity class ka full code, ya Controller ka?

## Setup Notes for Contributors

- Clone the repo, create your module folder under the project root (already scaffolded)
- Use **Java 21** consistently across all backend modules
- Keep `.idea/` out of commits — it's in `.gitignore`
- Branch naming: `feature/<your-module>` → PR into `main` when ready
- Keep seed data logic separate from controllers (own file, e.g. `DataSeeder.java`)
- Endpoint naming convention: `/bank/<action>`, `/aggregator/<action>`
- Commit small, working increments — don't wait to finish everything before pushing
