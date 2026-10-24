# 🔗 Consent Chain

![Spring Boot](https://img.shields.io/badge/Backend-Spring_Boot-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React_+_Vite-61DAFB?logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/DB-MySQL-4479A1?logo=mysql&logoColor=white)
![Solidity](https://img.shields.io/badge/Contract-Solidity-363636?logo=solidity&logoColor=white)
![Besu](https://img.shields.io/badge/Ledger-Hyperledger_Besu-2F3134)

A consent-based financial data-sharing system. An **FIU** asks for a customer's data, the **AA** (Account Aggregator) gets the customer's consent, and the **FIP** (bank) releases only the permitted data. Every consent event is also recorded on a **Besu blockchain** so it can be audited later.

> **Note:** This is an academic project, not a production Account Aggregator. FIU and FIP run inside one `bank-service`, and deployment hardening is not finished (see [Known Issues](#known-issues)).

**Status:** Authentication, secure account linking, password hashing, consent lifecycle, blockchain audit and frontend are implemented. Full live end-to-end testing and an Admin dashboard are still pending.

---

## 1. What is in this repo

```
frontend/             React + Vite web app (AA, FIU, FIP portals)      port 5173
aggregator-service/   Spring Boot - the AA (consents, linking, audit)  port 8082
bank-service/         Spring Boot - FIP + FIU (bank data, institutions) port 8081
blockchain/           Solidity contract, Hardhat deploy/test, Besu setup
docs/                 api-contracts.md, blockchain-setup.md, SQL scripts
```

How they talk: the **frontend** calls the **aggregator** (`/aa/*`) and the **bank-service** (`/auth`, `/fiu`). The **aggregator** calls the **bank-service** for bank verification and data. The aggregator saves audit events and sends them to **Besu**. Each service has its own MySQL database (`aggregator_service_db`, `bank_service_db`).

---

## 2. Who uses it (roles)

| Role | How the account is made | Logs in at | Can do |
|---|---|---|---|
| **AA USER** | Public registration | Aggregator `/aa/auth/login` | Link bank, create/approve/reject/revoke own consents, fetch data, view audit |
| **ADMIN** | Not by registration. Created at startup from `AA_ADMIN_BOOTSTRAP_*` env vars | Aggregator `/aa/auth/login` | Read-only `/aa/admin/**` (users, accounts, consents, audit logs) |
| **FIU** | Institution account in bank-service (role `FIU`) | Bank `/auth/login` | Create data requests, receive data |
| **FIP** | Institution account in bank-service (role `FIP`) | Bank `/auth/login` | Validate consent, serve permitted data |

Which accounts actually exist depends on your local database. Check it, because seed scripts are in `docs/databaseScripts/`.

---

## 3. Setup and run

### Prerequisites
Java + Maven, Node.js + npm, MySQL, and (only for audit) a running Besu network.

### Step 1: Create two databases
`aggregator_service_db` and `bank_service_db`. Tables are created by Hibernate (`ddl-auto: update`).

### Step 2: Set environment variables
Use **placeholders only in files**. Never commit real values.

**bank-service**
```powershell
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/bank_service_db"
$env:SPRING_DATASOURCE_USERNAME="<db-user>"
$env:SPRING_DATASOURCE_PASSWORD="<db-password>"
$env:BANK_AA_API_KEY="<api-key>"
$env:BANK_SERVICE_AUTH_TOKEN="<strong-random-secret>"
$env:INSTITUTION_AUTH_TOKEN_SECRET="<strong-random-secret>"
```

**aggregator-service**
```powershell
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/aggregator_service_db"
$env:SPRING_DATASOURCE_USERNAME="<db-user>"
$env:SPRING_DATASOURCE_PASSWORD="<db-password>"
$env:FIP_BASE_URL="http://localhost:8081"
$env:FIU_BASE_URL="http://localhost:8081"
$env:FIP_AA_API_KEY="<api-key>"
$env:BANK_SERVICE_AUTH_TOKEN="<strong-random-secret>"
$env:AA_AUTH_TOKEN_SECRET="<strong-random-secret>"
$env:INSTITUTION_AUTH_TOKEN_SECRET="<strong-random-secret>"
$env:BLOCKCHAIN_ENABLED="false"
```

**These must be identical in both services**

| Value | Aggregator variable | Bank variable |
|---|---|---|
| Internal service token | `BANK_SERVICE_AUTH_TOKEN` | `BANK_SERVICE_AUTH_TOKEN` |
| AA API key | `FIP_AA_API_KEY` | `BANK_AA_API_KEY` |
| Institution token secret | `INSTITUTION_AUTH_TOKEN_SECRET` | `INSTITUTION_AUTH_TOKEN_SECRET` |

Generate each secret randomly (for example 32 random bytes as hex). Keep them out of the frontend, Git, API responses and chat. For deployment, use a secrets manager and HTTPS/mTLS between aggregator and bank-service.

**Optional variables**

| Variable | Service | Purpose |
|---|---|---|
| `AA_ADMIN_BOOTSTRAP_USERNAME`, `_PASSWORD`, `_EMAIL`, `_NAME` | aggregator | Creates an ADMIN at startup when username and password are set (`_NAME` defaults to `Administrator`) |
| `BLOCKCHAIN_ENABLED` | aggregator | `false` by default |
| `BLOCKCHAIN_RPC_URL` (`http://localhost:8545`), `BLOCKCHAIN_CHAIN_ID` (`1337`) | aggregator | Besu connection |
| `BLOCKCHAIN_CONTRACT_ADDRESS`, `BLOCKCHAIN_PRIVATE_KEY` | aggregator | Deployed contract and local-dev writer key (never a real wallet) |
| `BLOCKCHAIN_AUDIT_HMAC_SECRET` | aggregator | Audit HMAC key, at least 32 characters |
| `BLOCKCHAIN_POLL_DELAY_MS`, `BLOCKCHAIN_GAS_PRICE_WEI`, `BLOCKCHAIN_GAS_LIMIT` | aggregator | Outbox poll delay and gas settings |

### Step 3: Start the services (separate terminals)

```powershell
# bank-service
cd bank-service
mvn spring-boot:run

# aggregator-service
cd aggregator-service
$env:BLOCKCHAIN_ENABLED="false"
mvn spring-boot:run

# frontend
cd frontend
npm run dev
```

Open http://127.0.0.1:5173.

**Why `BLOCKCHAIN_ENABLED=false`?** For login and account-linking tests you do not need the ledger. Turn it on only when you want to test the audit.

### Step 4: Enable blockchain (only for audit testing)
The Besu network is maintained from the separate main checkout (`C:\Academic Projects\consent-chain`). Do not recreate or restart it unnecessarily. Set `BLOCKCHAIN_ENABLED=true`, the RPC URL, contract address, writer key and HMAC secret, then restart the aggregator. See `docs/blockchain-setup.md`.

> Warning: do not change `BLOCKCHAIN_AUDIT_HMAC_SECRET` after audit data exists. Old events were signed with the old key and will stop verifying.

---

## 4. How the system works

### Login and security
- AA login (`/aa/auth/login`) and bank login (`/auth/login`) return a **signed token** (HMAC-SHA256) with the user's role.
- The aggregator requires `Authorization: Bearer <token>` on everything except login and register. No token gives `401`. A non-admin on `/aa/admin/**` gives `403`.
- The **backend takes identity and role from the token**. A `userId` sent in a request is not trusted; ownership is checked on the server. Frontend role checks are only for UX.
- Aggregator passwords and bank customer passwords are stored with **BCrypt**. Old plaintext passwords are upgraded after a successful login, and a wrong password never triggers an upgrade. Password fields are excluded from API responses.

### Linking a bank account
1. The logged-in AA user sends their bank username and password to `POST /aa/accounts/link`.
2. The aggregator calls the bank's `/bank/verify-account` with the internal `X-Internal-Service-Token` (the token never reaches the browser).
3. The bank checks the credentials and returns the customer's eligible accounts and PAN.
4. The aggregator compares the PAN with the AA user server-side. Mismatch gives `403`.
5. The user picks an account. It must be in the list the bank verified, otherwise `403`. Several accounts are supported.
6. The linked account is saved. The bank password is not stored, and the response shows the account number only masked.

Credentials are not described as "encrypted at rest" anywhere because the code does not do that.

### Data sharing flow
1. **FIU** creates a data request (`/fiu/data-request`).
2. The **AA user** creates a consent for it (`POST /aa/consents`). Status: `PENDING`.
3. The user **approves** (`ACTIVE`) or **rejects** (`REJECTED`).
4. The user **executes** the data request (`POST /aa/data-requests/{id}/execute`). The aggregator asks the FIP, which re-validates the consent and returns only permitted data, and the aggregator delivers it to the FIU.
5. The user can **revoke** an active consent (`REVOKED`). After that, data access stops.
6. Each create/approve/reject/revoke is written to the blockchain audit.

### Consent statuses

| Action | Endpoint | Who | Allowed when | Result |
|---|---|---|---|---|
| Create | `POST /aa/consents` | USER | always (validated) | `PENDING` |
| Approve | `PUT /aa/consents/{id}/approve` | owning USER | `PENDING` | `ACTIVE` |
| Reject | `PUT /aa/consents/{id}/reject` | owning USER | `PENDING` | `REJECTED` |
| Revoke | `PUT /aa/consents/{id}/revoke` | owning USER | `ACTIVE` | `REVOKED` |

`EXPIRED` exists in the enum, but no code sets it, so automatic expiry is not implemented.

### Blockchain audit
1. A consent event builds a **canonical payload**.
2. An **HMAC-SHA256** commitment is calculated from it.
3. The event is saved in the **outbox** table (`PENDING`).
4. A scheduler sends it to **Besu**; the status becomes `SUBMITTED` (or `FAILED` and is retried).
5. The `ConsentAuditRegistry` contract stores the event key, type, consent reference and commitment. No personal or financial data goes on-chain.
6. `GET /aa/consents/{consentId}/blockchain-audit` recomputes the commitment and compares it with the chain.

New events store the `canonical_payload` at event time, so later consent changes cannot break old verification. **Limitation:** older audit rows without `canonical_payload` still use the previous fallback. The old `CREATED` event that mismatched cannot be rebuilt because its original payload was never saved. Old records were not repaired.

---

## 5. API overview

**Authentication**

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/aa/auth/register` | AA user sign-up (never ADMIN) | Public |
| POST | `/aa/auth/login` | AA login | Public |
| POST | `/auth/register` | Bank institution sign-up (role in body) | Public ⚠️ |
| POST | `/auth/login` | FIU/FIP login | Public |

**Aggregator** (Bearer token)

| Method | Endpoint | Purpose | Role |
|---|---|---|---|
| POST | `/aa/accounts/link` | Link bank account | USER |
| GET | `/aa/accounts/{userId}` | Linked accounts | Owner / ADMIN |
| POST | `/aa/consents` | Create consent | USER |
| GET | `/aa/consents/user/{userId}` | User's consents | Owner / ADMIN |
| GET | `/aa/consents/{consentId}` | One consent | Owner, ADMIN, matching FIU, FIP |
| PUT | `/aa/consents/{id}/approve` · `/reject` · `/revoke` | Change status | Owning USER |
| POST | `/aa/data-requests` | Create AA data request | Bearer |
| GET | `/aa/data-requests/{requestId}` | Read data request | Owner, ADMIN, matching FIU, FIP |
| POST | `/aa/data-requests/{requestId}/execute` | Fetch and deliver data | Owning USER |
| POST | `/aa/data/account` · `/transactions` · `/loans` | Scoped data via AA | Owning USER |
| GET | `/aa/consents/{consentId}/blockchain-audit` | Verify audit | Owner, ADMIN, matching FIU, FIP |
| GET | `/aa/admin/users` · `/accounts` · `/consents` · `/audit-logs` | Admin lists | ADMIN |

**Bank-service**

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/fiu/data-request` | Create FIU request | None enforced ⚠️ |
| GET | `/fiu/data-request/{requestId}` | Read request | None enforced ⚠️ |
| POST | `/fiu/data-request/{requestId}/result` | Receive data | None enforced ⚠️ |
| POST | `/fip/consents` · PUT `/fip/consents/{id}/revoke` | Register / revoke consent artefact | `X-AA-Token` |
| POST | `/fip/data/account` · `/transactions` · `/loans` | Consent-scoped data | `X-AA-Token` |
| POST | `/bank/validate-consent` · `/fetch-data` · `/fetch-statement` | Validate / fetch | `X-AA-Token` |
| GET | `/bank/loan-history/{accountNumber}` | Loan history | `X-AA-Token` |
| POST | `/bank/verify-account` | Verify bank credentials | `X-Internal-Service-Token` |
| GET | `/bank/health-check` | Health | Public |

More detail on bank contracts: `docs/api-contracts.md`.

---

## 6. Frontend

React 19 + Vite. The sign-in screen has tabs for **AA**, **FIU** and **FIP** portals. It has a shared API helper (`src/api.js`) that adds the token, a responsive layout, loading/error/empty states, account linking, consent screens and an audit panel. Playwright tests are in `frontend/tests/flows.spec.js`.

The old `feature/frontend-and-setup` branch was inspected and **not merged wholesale**, because it uses older mock/fixture API behavior. Only presentation ideas may be borrowed from it.

**Admin:** the backend ADMIN role and protected endpoints exist, but the frontend has **no dedicated Admin dashboard yet**.

---

## 7. Testing

**Verified (PASS)**
- Aggregator focused suite (auth/authorization): 14 passed, 0 failures
- Bank credential serialization: 2 passed
- Bank account-linking tests: 9 passed
- Aggregator account-linking tests: 5 passed
- Frontend production build passed; `git diff --check` passed
- Services reachable: bank 8081, aggregator 8082 (protected), frontend 5173
- `/bank/verify-account` without or with a wrong service token: `401`
- Unauthenticated aggregator account request: `401`
- Service token not found in frontend, build, probe responses or inspected logs; passwords not exposed in inspected responses/logs

**Not yet verified live**
- Real AA login and account linking, matching-PAN linking, PAN mismatch, non-first account selection, foreign-account rejection
- Full FIU → AA → FIP → data retrieval lifecycle
- Live legacy-password migration
- Complete blockchain lifecycle in the final state
- The Playwright and Hardhat tests exist, but their results are not recorded here

**Manual checklist**
- [ ] Start bank-service, aggregator (`BLOCKCHAIN_ENABLED=false`), frontend
- [ ] AA login → link bank account → check PAN match and mismatch
- [ ] Select a non-first account; try a foreign account (expect 403)
- [ ] FIU login → create data request
- [ ] AA creates and approves consent → FIP validates → execute → FIU receives data
- [ ] Enable blockchain → check `/aa/consents/{id}/blockchain-audit`
- [ ] Test reject and revoke
- [ ] No token → 401; USER on `/aa/admin/**` → 403; another user's consent → 403
- [ ] Admin login with bootstrapped ADMIN
- [ ] Legacy plaintext password login upgrades to BCrypt

---

## Known Issues

| Priority | Issue |
|---|---|
| **P0** | Bank-service `/fiu/**` has no Bearer or API-key check, and `/auth/register` accepts a `role` from the request, so FIU/FIP self-registration is not blocked |
| **P0** | Use HTTPS/mTLS for deployed aggregator → bank-service traffic |
| **P0** | Full account numbers are still returned by data endpoints; review this |
| **P1** | Complete the live end-to-end test |
| **P1** | Legacy audit rows without `canonical_payload` |
| **P1** | Any `FIP` token can read all consents (single shared FIP store, by design in this demo) |
| **P1** | Consent `EXPIRED` is not implemented |
| **P1** | Replace Hibernate `ddl-auto: update` with a migration tool |
| **P2** | Dedicated Admin dashboard (users, accounts, consents, audit, navigation) |

**Fixed in this branch:** missing backend authentication, client-only role checks, admin endpoint exposure, `userId` ownership trust, plaintext AA and bank passwords, password serialization, unauthenticated `/bank/verify-account`, missing PAN binding, and first-account-only selection. Live checks for several of these are still pending (see above).
