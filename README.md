# ConsentChain

A blockchain-based reference implementation of RBI's **Account Aggregator (AA) framework** for secure, consent-driven financial data sharing.

ConsentChain demonstrates how a customer can authorize a Financial Information User (FIU) to access financial information held by one or more Financial Information Providers (FIPs) through an Account Aggregator. The project focuses on **consent management, secure data sharing, revocation, and tamper-evident audit logging**.

---

## What's Next

- [ ] Basic request logging (Slf4j) in `bank-service` — feeds into the audit trail
- [ ] Unit tests for `bank-service` (consent expiry, invalid status, etc.)
- [ ] `ConsentArtefact` model + repository in `aggregator-service`
- [ ] Consent creation API + consent state management
- [ ] FIU data-request model + FIP mapping/routing
- [ ] SHA-256 hash utility and blockchain ledger entity (hash + previousHash + timestamp)
- [ ] Revocation service + request/session invalidation
- [ ] Final integration between `bank-service` and `aggregator-service`

---

## Work Done So Far (Cumulative)

**Repository**
- [x] Repository structure created (3 module folders + docs)
- [x] Documentation folder created

**Bank Service** — `http://localhost:8081` | H2 console: `/h2-console` (JDBC: `jdbc:h2:mem:bankdb`)
- [x] Spring Boot project initialized — Java 21, Maven, Spring Web, Spring Data JPA, H2, Lombok
- [x] `application.yml` configured, server on port 8081
- [x] Health check endpoint: `GET /bank/health-check`
- [x] `BankAccount` entity model
- [x] Repository layer, seed data
- [x] `ConsentArtefact` model + repository
- [x] Validate-consent and fetch-data endpoints
- [x] Base64 encoding simulation for secure transfer
- [x] API contract documented in `docs/api-contracts.md`

**Aggregator Service** — `http://localhost:8082` | H2 console: `/h2-console` (JDBC: `jdbc:h2:mem:aggregatordb`)
- [x] Spring Boot project initialized — Java 21, Maven, Spring Web, Spring Data JPA, H2, Lombok
- [x] `application.yml` configured, port 8082
- [x] Health check endpoint: `GET /aggregator/health-check`

---

## Bank Service — Task Breakdown (10 Steps, incl. SQL)

1. **Set up the module**
   Separate Spring Boot service: `bank-service` (Java 21, Maven).
   Dependencies: Spring Web, Spring Data JPA, MySQL Driver, Lombok.

2. **Create the database + tables (SQL)**
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

3. **Create entity classes**
   `Customer`, `Account`, `Transaction`, `LoanHistory` — JPA `@Entity` classes mapped to the tables above.

4. **Create repository interfaces**
   `CustomerRepository`, `AccountRepository`, `TransactionRepository`, `LoanHistoryRepository` (`extends JpaRepository`).
   ```java
   public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
       Optional<BankAccount> findByAccountNumber(String accountNumber);
   }
   ```
   **Learn:** JpaRepository, `Optional`

5. **Seed data**
   Insert dummy customers/accounts/transactions on startup — either via `data.sql` in `src/main/resources`, or a `CommandLineRunner` bean.
   **Learn:** `CommandLineRunner`, `@Component`

6. **Build REST APIs (controller layer)**
   - `POST /bank/verify-account` — verify PAN/mobile + netbanking credentials, confirm account link
   - `POST /bank/fetch-statement` — return transactions for an account + date range
   - `GET /bank/loan-history/{accountNumber}` — return loan history
   - `POST /bank/validate-consent` — check `status = ACTIVE AND currentTime < validTill`
   - `POST /bank/fetch-data` — return account data only if consent is valid
   **Learn:** `@RequestBody`, `@RequestParam`, `ResponseEntity`, exception handling (`orElseThrow`)

7. **Add security**
   These APIs should only be callable by the AA service — add a simple API key/token filter (e.g. header `X-AA-Token`, hardcoded or JWT-verified).

8. **Handle multiple banks**
   To simulate HDFC/SBI/ICICI:
   - **Simplest:** one service, differentiate by a `bankName` field in the database.
   - **Realistic:** three instances of the same codebase on different ports (8081/8082/8083), each with `bank.name=HDFC/SBI/ICICI` in `application.properties`.

9. **Connect to the AA service**
   The `aggregator-service` checks its mapping table and calls the relevant bank service's URL/port via `RestTemplate`/`WebClient`, then consolidates the response for the FIU.

10. **Test end-to-end**
    First test `bank-service` standalone via Postman (`/fetch-statement` returns correct data), then test integrated with `aggregator-service`.

---

## Data Sharing Security Simulation

For the initial implementation, `bank-service` uses **Base64 encoding** to simulate encoded data transfer.

> Base64 is encoding, not encryption. It is used here only as a development/demo simulation. A production implementation would require proper encryption and secure key management.

---

## System Flow

![Account Aggregator System Flow](docs/Account%20Aggregator%20System%20Flow%20Infographic.png)

*Complete page-flow diagram — Customer/AA interface, FIU interface, and FIP interface across the full consent lifecycle.*

---

## Project Overview

ConsentChain simulates an Account Aggregator ecosystem with three major roles:

**Customer** — owner/controller of consent. Can create an account, connect financial accounts, view aggregated financial information, receive data-sharing requests, approve/deny consent, view active/expired/revoked consents, revoke consent, and view audit history.

**FIP (Financial Information Provider)** — the institution holding the requested data. In our simulation, a bank acts as an FIP (Bank A, Bank B, Bank C). Maintains customer details, accounts, balances, transactions. Provides data only when authorized by valid consent.

**FIU (Financial Information User)** — the institution requesting/using the data (e.g. a bank or fintech evaluating a loan application). Creates a data request specifying customer, purpose, required data, accounts, period, and consent validity.

**AA (Account Aggregator)** — the consent broker and orchestrator. Creates/manages consent artefacts, validates consent, routes requests between FIUs and FIPs, coordinates authorized data retrieval, handles revocation, and maintains a tamper-evident audit trail via a custom SHA-256 hash chain.

---

## FIP / FIU Role Logic

FIP and FIU are **roles in a particular data-sharing request**, not permanent identities. An institution can act as an FIP in one request and an FIU in another.

**Example 1 — Loan from HDFC**
```
Bank A ─────┐
Bank B ─────┼────> AA ─────> HDFC Bank
Bank C ─────┘
  FIPs                    FIU
```

**Example 2 — Loan from a Fintech**
```
Bank A ─────┐
Bank B ─────┼────> AA ─────> Fintech X
Bank C ─────┘
  FIPs                    FIU
```

**Example 3 — Same bank, different roles**
```
Bank A ─────> AA ─────> HDFC Bank        (HDFC = FIU)
HDFC Bank ─────> AA ─────> Fintech X     (HDFC = FIP)
```

The system should **not permanently classify an institution as only FIP or only FIU** — the role is determined per request.

---

## End-to-End System Flow

```
CUSTOMER → AA USER INTERFACE → AA DASHBOARD → Loan / Data Need
   → FIU creates data request → AA creates consent request → CUSTOMER
        ├── APPROVE → ACTIVE CONSENT → AA → FIP(s) → financial information
        │       → AA → authorized data → FIU → Loan / Financial Assessment
        └── DENY → Request Closed
```

---

## Consent Lifecycle

```
                  PENDING
                     │
              ┌──────┴──────┐
              ▼             ▼
           APPROVED       DENIED
              │
              ▼
            ACTIVE
              │
         ┌────┴─────┐
         ▼          ▼
      REVOKED     EXPIRED
```

Supported states: `PENDING`, `ACTIVE`, `DENIED`, `REVOKED`, `EXPIRED`. The AA validates whether a consent is currently usable.

---

## Example: Complete Loan Data Flow

Customer = Sakshi | FIPs = Bank A, Bank B | FIU = HDFC Bank | Purpose = Loan Application | Data = Balance + Transactions | Period = Last 6 Months

1. FIU creates request (requester, providers, purpose, data, period)
2. AA creates a consent artefact and sends it to the customer
3. Customer reviews: who's requesting, why, what data, which accounts, for how long, validity
4. Customer approves → consent becomes `ACTIVE`
5. AA requests data from Bank A and Bank B; each FIP validates the consent first
6. FIPs return data to AA
7. AA routes authorized data to HDFC Bank
8. Audit event recorded in the hash-chain
9. Customer can later revoke → `ACTIVE → REVOKED`; further access is rejected

---

## Project Structure

```
consent-chain/
│
├── bank-service/
│   └── Bank / FIP simulation
│
├── aggregator-service/
│   └── Account Aggregator + consent broker
│       + blockchain/hash-chain audit layer
│
├── frontend-consent-dashboard/
│   └── React UI
│       ├── Customer dashboard
│       ├── Consent management
│       ├── Financial data
│       └── Audit log view
│
├── docs/
│   ├── Account Aggregator System Flow Infographic.png
│   ├── Architecture diagrams
│   └── API contracts
│
└── README.md
```

---

## Team & Responsibilities

| Member  | Module                       | Responsibility                                                                      |
|---------|-------------------------------|--------------------------------------------------------------------------------------|
| Sakshi  | `bank-service`                | Bank/FIP simulation — account data, consent validation, authorized data retrieval    |
| Bhunesh | `aggregator-service`          | AA logic, consent broker, request routing, blockchain/hash-chain ledger, revocation  |
| [Name]  | `frontend-consent-dashboard`  | React UI — dashboard, consent grant/view/revoke, financial data, audit log           |

**Current approach:** Sakshi and Bhunesh are pairing on `bank-service` first to build shared understanding of the FIP side and the integration contract. After the FIP basics are stable, Bhunesh continues with `aggregator-service` while the frontend integrates against the defined API contracts.

---

## Technology Stack

**Backend:** Java 21, Spring Boot 3.3.4, Maven, Spring Web, Spring Data JPA, Lombok
**Database:** H2 (development/testing); MySQL for a persistent bank-service setup
**Frontend:** React
**Audit / Blockchain Layer:** Custom hash-chain, SHA-256, `MessageDigest`

---

## Bank/FIP Data Model

```
Customer                    Account                  Transaction              LoanHistory
├── id                      ├── id                   ├── id                   ├── id
├── PAN number              ├── customerId            ├── accountId            ├── accountId
├── name                    ├── bankName               ├── transactionDate      ├── loanType
├── mobile number           ├── accountNumber          ├── description          ├── amount
├── netbanking username     ├── IFSC                   ├── amount               └── status
└── netbanking password     └── balance                └── type
```

---

## Bank Service Consent Model

```
ConsentArtefact
├── consentId
├── purpose
├── dataScope
├── validTill
└── status   (ACTIVE / EXPIRED / REVOKED)
```

The aggregator maintains the broader consent lifecycle; the FIP validates whether the consent presented for a data request is usable.

---

## Aggregator Service — Responsibilities

1. **Consent Creation** — build a consent artefact from the FIU's data request
2. **Consent Management** — maintain states: `PENDING`, `ACTIVE`, `DENIED`, `REVOKED`, `EXPIRED`
3. **FIU Request Handling** — receive financial data requests
4. **FIP Identification** — determine which institution(s) hold the requested information
5. **Customer Consent** — send the request to the customer for approval/denial
6. **FIP Routing** — route the authorized request to relevant FIP service(s)
7. **Data Aggregation** — consolidate data from one or more FIPs for the FIU
8. **Revocation** — allow revocation and ensure revoked consent can't be reused
9. **Audit Trail** — record events in the SHA-256 hash-chain

### Dynamic FIP/FIU Request Model

```
DataRequest
├── requestId
├── customerId
├── requesterInstitutionId     (FIU)
├── providerInstitutionIds[]   (FIPs)
├── purpose
├── dataScope
├── accountIds[]
├── dataPeriod
├── consentId
└── status
```

---

## Blockchain / Hash-Chain Audit

ConsentChain uses a custom hash-chain instead of a full external blockchain network.

```
AuditBlock
├── data/event
├── timestamp
├── hash
└── previousHash
```

```
Block 1 → hash
Block 2 → previousHash = Block 1 hash, hash
Block 3 → previousHash = Block 2 hash, hash
```

Changing an earlier record breaks the subsequent hash chain.

**Events to audit:** `CONSENT_CREATED`, `CONSENT_APPROVED`, `CONSENT_DENIED`, `DATA_REQUESTED`, `FIP_DATA_REQUESTED`, `DATA_RECEIVED`, `DATA_SHARED`, `CONSENT_REVOKED`, `CONSENT_EXPIRED`

---

## Revocation Flow

```
Customer → My Consents → Select Active Consent → Revoke
   → AA updates consent → Consent = REVOKED
   → Audit event recorded
   → Future requests using that consent are rejected
```

The aggregator-service also handles session/request invalidation where required.

---

## Frontend Page Structure

The frontend represents the **Customer/AA experience**, not a traditional banking app. The main dashboard is an **AA dashboard**, not a bank dashboard.

```
Login → Signup → Profile Setup → Connect Financial Account
   → Account Discovery → AA Dashboard → Connected Accounts
   → Account Details (Overview / Transactions / 6-Month Statement)
   → Consent Requests → Consent Details → Approve / Deny
   → My Consents → Data Access History → Notifications → Settings
```

**FIU Interface**
```
FIU Login → FIU Dashboard → Create Data Request
   → Request List → Request Details → Received Authorized Data
```

**FIP Interface**
```
FIP Login → FIP Dashboard → Data Requests
   → Request Details → Validate Consent → Provide Authorized Data
   → Request Completed
```

The FIP does not independently create the customer's consent — it validates the applicable authorization and provides the permitted information.

---

## Bank Simulation Options

**Option 1 — Single Service (recommended):** One `bank-service`, differentiated by a `bankName` field (`HDFC`, `SBI`, `ICICI`).
**Option 2 — Multiple Instances:** Same codebase run as separate instances — `Bank A → 8081`, `Bank B → 8082`, `Bank C → 8083`.

---

## Service Communication

```
        FIU (Bank / Fintech)
                │  Data Request
                ▼
        AA (aggregator-service)
                │  Authorized Request
       ┌────────┴────────┐
       ▼                 ▼
   Bank A (FIP)      Bank B (FIP)
```

The aggregator-service uses `RestTemplate` or `WebClient` to communicate with the bank-service.

---

## Security

For development/testing, FIP APIs use a simple API key/token mechanism to ensure requests originate from the AA service.

```http
X-AA-Token: <token>
```

A production implementation would require stronger authentication, authorization, encryption, and secure key management.

---

## What Each Developer Should Focus On

**Sakshi — Bank/FIP:** Customer, Account, Transaction, Loan History, Consent Validation, Fetch Data, FIP API Contract.
> *"Is this request authorized, and if yes, what financial information am I allowed to provide?"*

**Bhunesh — Aggregator/AA:** FIU Request → Consent → Customer Approval → Consent Validation → FIP Routing → Data Aggregation → FIU Delivery → Audit Hash Chain → Revocation.
> *"Is there valid customer consent, which FIPs have the required data, what data is authorized, and where should the authorized data go?"*

**Frontend Developer:** Customer Dashboard, Accounts, Financial Data, Consent Requests, Consent Approval, Consent Management, Revocation, Access History.

---

## What We Are NOT Building

ConsentChain is a reference/simulation project, not a complete banking application. We are **not** building a real bank, real UPI/payment processing, real money transfers, real loan disbursement, a production RBI AA implementation, a production banking authentication system, or a real blockchain network.

The bank-service is a simulated FIP, and the FIU is simulated by a bank or fintech. The purpose is to demonstrate the **consent-driven financial data-sharing architecture**.

---

## Key Design Principle

```
FIP      = Has / Provides the requested financial information
FIU      = Requests / Uses the financial information
AA       = Manages consent and coordinates the authorized exchange
CUSTOMER = Controls consent
```

The FIP/FIU role is determined **per request**.

---

## Learning Goals

| Concept | Why it matters |
|---|---|
| Spring Boot | Backend service development |
| JPA Repository | Database access |
| REST APIs | Service-to-service communication |
| DTOs | API request/response structure |
| `ResponseEntity` | HTTP status handling |
| Exception Handling | Graceful API failures |
| Consent State Management | Core AA business logic |
| REST Service Integration | AA ↔ FIP communication |
| SHA-256 | Hash-chain implementation |
| Blockchain Concepts | Tamper-evident audit trail |
| React | Consent/dashboard UI |
| API Contracts | Parallel frontend/backend development |

---

## Development Guidelines

- Use **Java 21** consistently across all backend modules.
- Keep controllers thin and business logic inside services.
- Keep repository/database logic separate from controllers.
- Keep seed data separate from controllers (own file, e.g. `DataSeeder.java`).
- Follow endpoint naming conventions: `/bank/<action>`, `/aggregator/<action>`.
- Keep API contracts updated when request/response structures change.
- Commit small, working increments.
- Do not commit `.idea/` — it's in `.gitignore`.
- Use feature branches: `feature/<your-module>` → PR into `main` when ready.

---

## How to Run

**Bank Service**
```bash
cd bank-service
./mvnw spring-boot:run
```
`http://localhost:8081` | H2 console: `/h2-console` (JDBC: `jdbc:h2:mem:bankdb`)

**Aggregator Service**
```bash
cd aggregator-service
./mvnw spring-boot:run
```
`http://localhost:8082` | H2 console: `/h2-console` (JDBC: `jdbc:h2:mem:aggregatordb`)

---

## Final Architecture

```
                         CUSTOMER
                            │
                            ▼
                  ┌───────────────────┐
                  │   React Frontend  │
                  │ Customer / AA UI  │
                  └─────────┬─────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │ Aggregator Service │
                  │        AA          │
                  │  Consent Broker     │
                  │  Request Routing    │
                  │  Revocation         │
                  │  Audit Hash Chain   │
                  └───────┬───┬────────┘
                          │   │
                 ┌────────┘   └────────┐
                 ▼                     ▼
          ┌─────────────┐       ┌─────────────┐
          │ Bank/FIP A  │       │ Bank/FIP B  │
          │ Accounts    │       │ Accounts    │
          │ Transactions│       │ Transactions│
          └─────────────┘       └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │     FIU     │
                   │ Bank/Fintech│
                   │  Data User  │
                   └─────────────┘
```

---

## Final Project Story

> A customer applies for a financial service such as a loan. The requesting institution (FIU) needs financial information held by one or more institutions (FIPs). Instead of directly sharing credentials or financial data, the request passes through the Account Aggregator. The customer reviews the purpose, requested data, accounts, period, and validity before giving consent. Once approved, the AA coordinates authorized data retrieval from the relevant FIPs and delivers the permitted information to the FIU. Every important consent and data-sharing event is recorded in the tamper-evident audit trail, and the customer can revoke consent later.

**Core flow:**
```
FIU Request → AA Consent Request → Customer Approval → Active Consent
   → FIP Data Retrieval → AA Aggregation / Routing → FIU Receives Authorized Data
   → Audit Trail → Consent Revocation / Expiry
```
