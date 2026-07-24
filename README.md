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

## Progress So Far — `bank-service`

- [x] Repo structure set up (3 module folders + docs)
- [x] Spring Boot project initialized (`bank-service`) — Java 17, Maven, dependencies: Web, Data JPA, H2, Lombok
- [x] `application.yml` configured — H2 in-memory DB, H2 console enabled, server running on **port 8081**
- [x] Health check endpoint working: `GET /bank/health-check`
- [x] `BankAccount` entity model created (id, accountNumber, ifscCode, holderName, balance)

## Next Steps — `bank-service`

- [ ] `BankAccountRepository` (JPA repository interface)
- [ ] Seed 2–3 dummy bank accounts (Bank A / Bank B simulation) into H2 on startup
- [ ] `ConsentRequest` model (consentId, purpose, dataScope, validTill)
- [ ] Endpoint: `POST /bank/validate-consent` — check consent artefact validity
- [ ] Endpoint: `POST /bank/fetch-data` — return account data per consent scope
- [ ] Endpoint: `POST /bank/encrypt-send` — encrypt & simulate sending data to FIU
- [ ] Share API contract (request/response JSON shape) with `aggregator-service` dev
- [ ] Basic logging for each request (useful for audit trail later)
- [ ] Unit tests for validation logic

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