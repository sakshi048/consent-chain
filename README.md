
# ConsentChain 🔗

### A Consent-First Account Aggregator Ecosystem with a Privacy-Preserving Blockchain Audit Layer

ConsentChain is a financial data-sharing reference implementation inspired by India's Reserve Bank of India (RBI) Account Aggregator (AA) framework. It combines consent management, bank-side authorization, financial data routing, and a private blockchain-based audit trail.

The project demonstrates how customers can control access to their financial information while financial institutions coordinate data sharing through explicit, purpose-bound consent.

> **Project status:** Academic major-project reference implementation. Alignment with the RBI Account Aggregator framework does not, by itself, establish regulatory approval or certification. The system is intended for demonstration and development, not production financial transactions.

---

## 📌 Overview

Traditional financial data sharing often requires customers to download bank statements, upload documents, and repeatedly provide financial information to different institutions.

ConsentChain demonstrates an alternative approach.

A customer can authorize a financial institution to request specific financial information for a defined purpose. The Account Aggregator coordinates the request, while the bank independently validates consent before releasing data.

The system also records consent lifecycle events on a private Hyperledger Besu blockchain using cryptographic commitments. This provides an additional audit mechanism without intentionally placing raw customer or financial information on-chain.

### Project at a Glance

| Component | Description |
|---|---|
| Project name | ConsentChain |
| Domain | FinTech, data privacy, blockchain |
| Architecture | Java-based microservices |
| Backend | Java 21, Spring Boot 3.3.4 |
| Frontend | React 19, Vite, Tailwind CSS |
| Database | MySQL |
| Blockchain | Hyperledger Besu with QBFT consensus |
| Smart contracts | Solidity and Hardhat |
| Security | BCrypt, API-key authentication, HMAC-SHA256 |
| Primary objective | Consent-controlled financial data sharing and auditable consent events |

---

## 🚨 Problem Statement

Financial institutions maintain customer information in separate systems. Sharing this information securely and efficiently creates several challenges.

### 1. Data Silos and Manual Processes

Banks store financial records in their own systems. Customers may need to download statements and upload them manually whenever a lender requests income or transaction information.

This increases effort and delays financial services.

### 2. Privacy and Credential Risks

Some older data-collection approaches rely on screen scraping or requesting sensitive banking credentials.

Sharing netbanking passwords or OTPs with third-party applications can expose customers to unauthorized access and other security risks.

ConsentChain demonstrates a consent-oriented alternative rather than relying on shared banking credentials for financial data access.

### 3. Insufficiently Granular Consent

A financial institution may need only a limited subset of financial information for a particular task.

For example, a lender may need six months of transaction records to evaluate a loan application, rather than unrestricted access to all financial information.

ConsentChain models consent with fields such as purpose, data scope, validity period, and lifecycle status.

### 4. Difficulty Revoking Permission

Customers need a mechanism to withdraw permission for future data access.

ConsentChain includes a revocation workflow that updates the consent state and communicates the change to the bank so that subsequent requests can be denied.

Revocation does not automatically erase information that was lawfully obtained earlier. Retention and deletion obligations require separate handling.

### 5. Limited Independent Auditability

Conventional application logs are usually maintained by individual organizations. Disputes may arise over whether a consent was approved, rejected, or revoked at a particular time.

ConsentChain uses a private blockchain to provide an additional, independently queryable record of selected consent lifecycle events.

---

## 💡 Our Solution

ConsentChain combines four principal capabilities:

1. **Consent management:** Coordinates permission requests, approvals, rejections, and revocations.
2. **Independent bank-side authorization:** Checks consent before returning financial information.
3. **Financial data routing:** Coordinates requests between a Financial Information User and a Financial Information Provider.
4. **Blockchain-backed audit trail:** Records cryptographic commitments associated with consent events.

### High-Level Architecture

```text
                 CONSENTCHAIN ECOSYSTEM

+------------------+       +------------------------+
|                  |       |                        |
|  Customer / User |<----->|  Frontend Application  |
|                  |       |  React + Vite          |
+------------------+       +-----------+------------+
                                       |
                                       v
                           +------------------------+
                           |   Aggregator Service   |
                           |                        |
                           | Consent Management     |
                           | Data Request Routing   |
                           | Security and Outbox    |
                           +------+------------+----+
                                  |            |
                     REST API     |            | Audit events
                                  v            v
                       +----------------+  +-------------------+
                       | Bank Service   |  | Blockchain Audit  |
                       |                |  | Hyperledger Besu  |
                       | FIP / FIU      |  | QBFT Validators   |
                       | Simulation     |  | Smart Contract    |
                       +-------+--------+  +-------------------+
                               |
                               v
                       +----------------+
                       |     MySQL      |
                       | Accounts       |
                       | Transactions   |
                       | Consent Copies |
                       +----------------+
```

The diagram represents the main logical components. The exact runtime connections and enabled blockchain functionality depend on the application's configuration.

### Core Design Principles

- **Explicit consent:** Data requests are associated with consent records and their permitted scope.
- **Purpose limitation:** Consent includes the intended purpose of data sharing.
- **Time-bound access:** Validity periods determine when consent can be used.
- **Independent enforcement:** The bank maintains a local consent record and checks it before releasing data.
- **Data minimization:** Personal and financial information should not be included in blockchain transactions.
- **Auditable transitions:** Selected consent lifecycle events can be recorded on-chain.
- **Reliable event delivery:** A transactional outbox records audit events before asynchronous blockchain submission.

---

## 👥 Ecosystem Participants

| Participant | Full Name | Responsibility |
|---|---|---|
| Customer | Data Principal | Owns the financial information and approves or revokes consent. |
| FIP | Financial Information Provider | Holds financial information and validates authorization before releasing it. |
| FIU | Financial Information User | Requests permitted financial information for activities such as loan assessment. |
| AA | Account Aggregator | Coordinates consent and financial data requests. |
| Audit Layer | Private Blockchain | Records selected consent events and cryptographic commitments. |

### Example

Suppose a customer applies for a loan from a lending company.

- The lender acts as the FIU.
- The customer's bank acts as the FIP.
- ConsentChain acts as the AA in this demonstration.
- The customer reviews the request and decides whether to approve it.
- The blockchain stores the audit information associated with selected consent transitions.

The bank and lender are simulated within the project; the demonstration does not imply live integration with real financial institutions.

---

## 🏗️ System Architecture

ConsentChain consists of four major application modules.

| Module | Port | Responsibility |
|---|---:|---|
| Bank Service | 8081 | Simulates financial accounts, transactions, consent mirroring, and bank-side authorization. |
| Aggregator Service | 8082 | Manages users, linked accounts, consents, data requests, and audit event processing. |
| Blockchain RPC | 8545 | Provides access to the configured local Besu network. |
| Frontend | 5174 | Provides administrative, bank, and lender dashboards. |

### Request Flow

```text
React Frontend
      |
      v
Aggregator Service (:8082)
      |
      +------> MySQL: Aggregator Database
      |
      +------> Bank Service (:8081)
      |                |
      |                v
      |        MySQL: Bank Database
      |
      +------> Outbox Worker
                       |
                       v
                Besu Blockchain
                   (:8545)
                       |
                       v
              Consent Audit Contract
```

The frontend communicates with the backend services. The aggregator manages consent workflows and coordinates requests. The bank validates its local consent records before returning permitted data.

Blockchain submission is controlled by configuration and may be disabled during development.

---

## 💻 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Backend | Java 21 | Application development |
| Backend framework | Spring Boot 3.3.4 | REST APIs and service components |
| Persistence | Spring Data JPA | Database access |
| Relational database | MySQL 8.0+ | Persistent application data |
| Frontend | React 19 | User interface |
| Build tool | Vite | Frontend development server and build |
| Styling | Tailwind CSS | Interface styling |
| Routing | React Router DOM | Frontend navigation |
| Smart contracts | Solidity ^0.8.24 | On-chain audit logic |
| Contract tooling | Hardhat 2.22 | Contract compilation and deployment |
| Blockchain | Hyperledger Besu 24.12.2 | Private Ethereum-compatible network |
| Consensus | QBFT | Permissioned validator consensus |
| Password hashing | BCrypt | Password hash storage |
| Audit commitments | HMAC-SHA256 | Keyed cryptographic commitments |
| Backend communication | HTTP REST APIs | Service-to-service communication |
| Event reliability | Transactional outbox | Reliable asynchronous audit processing |

Versions listed above describe the intended project stack. Confirm installed versions from the project's actual configuration files before preparing a release.

---

## 🛠️ Project Modules

### 1. Aggregator Service

**Location:** `aggregator-service/`

**Technology:** Java 21, Spring Boot, Spring Data JPA, MySQL.

The aggregator is the central orchestration component.

Its responsibilities include:

- User registration and account linking.
- Bank account discovery using the configured customer identification flow.
- Creation and management of consent artefacts.
- Processing FIU data requests.
- Coordination with the bank service.
- Recording consent lifecycle events in a transactional outbox.
- Submitting audit events to the blockchain.
- Retrying failed audit submissions.
- Protecting service endpoints through authentication and authorization.

#### Consent Management

The aggregator manages consent states such as:

- `PENDING`
- `ACTIVE`
- `REJECTED`
- `REVOKED`
- `EXPIRED`

The exact permitted state transitions depend on the implemented business rules.

#### Transactional Outbox

The outbox pattern helps prevent audit events from being lost between a database update and a blockchain submission.

```text
Consent State Changes
         |
         v
Save Database Transaction
         |
         v
Write Outbox Event
         |
         v
Background Worker
         |
         v
Submit to Besu
      /     \
   Success  Failure
      |        |
      v        v
  SUBMITTED  Retry / FAILED
```

The outbox provides a durable record of work that needs to be submitted. It does not, on its own, guarantee successful delivery or eliminate every possible duplicate.

### 2. Bank Service

**Location:** `bank-service/`

**Technology:** Java 21, Spring Boot, Spring Data JPA, MySQL.

The bank service simulates a Financial Information Provider and includes data used by the lending demonstration.

Its responsibilities include:

- Managing customer profiles and bank accounts.
- Maintaining account balances and transaction records.
- Maintaining loan history.
- Receiving consent artefacts from the aggregator.
- Maintaining local copies of consent records.
- Validating consent before returning financial information.
- Providing bank-side data access APIs.

Important endpoints described by the project include:

- `/bank/health-check`
- `/bank/register-consent`
- `/bank/fetch-data`
- `/bank/fetch-statement`
- `/bank/loan-history/{accountNumber}`

Confirm the exact HTTP methods, query parameters, request bodies, and authentication requirements in the controller implementations or `docs/api-contracts.md`.

#### Independent Consent Validation

Before returning data, the bank uses its consent validation logic, including `isConsentUsable()` as described in the implementation.

Conceptually, it checks:

1. Does the consent record exist?
2. Is the consent active?
3. Has it expired?
4. Is the requested operation within the permitted scope?
5. Is the requesting service authorized?

The exact checks performed by the current implementation should be verified in the code.

The key design principle is that the aggregator's approval alone should not bypass the bank's authorization checks.

### 3. Blockchain Audit Layer

**Location:** `blockchain/`

**Technology:** Solidity, Hardhat, Hyperledger Besu, QBFT.

This module provides the blockchain-backed audit mechanism.

It includes:

- Besu network configuration.
- QBFT validator setup.
- The `ConsentAuditRegistry.sol` smart contract.
- Contract deployment scripts.
- Audit record submission and verification support.

The smart contract records consent event information and cryptographic commitments rather than raw customer financial information.

### 4. Frontend Application

**Location:** `frontend/`

**Technology:** React 19, Vite, Tailwind CSS, React Router DOM.

The frontend provides separate views for different roles.

#### Admin Dashboard — `/admin`

Designed to display:

- Total registered users.
- Active consents.
- Registered FIUs.
- Revocation statistics.
- Consent activity trends.
- Blockchain audit records.

#### FIP Dashboard — `/fip/dashboard`

Provides a bank-oriented view of:

- Linked accounts.
- Registered consent records.
- Financial data release activity.

#### FIU Dashboard — `/fiu/dashboard`

Provides a lender-oriented view of:

- Financial data requests.
- Request execution.
- Returned statements and financial information.
- Credit assessment information.

#### Authentication — `/login` and `/signup`

Provides the application's onboarding and login interfaces.

The actual availability of individual statistics, actions, and role restrictions depends on the implemented frontend and backend APIs.

---

## 🔄 End-to-End Workflow

The following example illustrates how the components work together.

### Step 1: Customer Onboarding

The customer registers on ConsentChain.

The system maintains a customer profile and supports discovering and linking eligible demo bank accounts.

For example, the customer may have accounts represented by two simulated banks.

### Step 2: Lender Requests Financial Information

A lending analyst initiates a data request.

Example:

```json
{
  "purpose": "Loan assessment",
  "dataScopes": [
    "ACCOUNT",
    "TRANSACTIONS"
  ],
  "fromDate": "2026-01-01",
  "toDate": "2026-06-30"
}
```

This is an illustrative payload. The actual API may use different field names or a different structure.

The request identifies the intended purpose, data scope, and requested period.

### Step 3: Customer Reviews Consent

The customer reviews the proposed data-sharing request.

The customer can approve or reject it.

If approved, the aggregator creates or activates the applicable consent record according to its implemented workflow.

### Step 4: Bank Registers Consent

The aggregator sends the approved consent information to the bank.

The bank maintains a local consent record that it can use to validate subsequent data requests.

### Step 5: Audit Event Is Submitted

The aggregator records an audit event in its outbox.

The background worker processes the event and submits the appropriate record to the Besu smart contract when blockchain integration is enabled.

The on-chain record contains audit metadata and cryptographic commitments, not the intended raw financial information.

### Step 6: Financial Data Is Requested

The FIU requests execution of the data request.

The aggregator coordinates with the bank and supplies the relevant consent reference.

The bank checks its local consent record before returning data.

If the request is authorized, the bank returns the permitted financial information to the aggregator, which routes it to the FIU.

### Step 7: Customer Revokes Consent

The customer revokes the consent through the supported workflow.

The aggregator updates the consent state and communicates the revocation to the bank.

The system records a revocation audit event when blockchain submission is enabled.

### Step 8: Further Access Is Denied

A later request using the revoked consent should fail the bank's consent validation.

The system should reject the request rather than returning financial information under the revoked permission.

```text
FIU Requests Data
       |
       v
Aggregator Receives Request
       |
       v
Bank Checks Local Consent
       |
       +---- Consent ACTIVE and valid? ----+
       |                                   |
      Yes                                  No
       |                                   |
       v                                   v
Return Permitted Data               Deny the Request
                                    (e.g. HTTP 403)
```

This workflow demonstrates why revocation must affect the bank's authorization decision and not merely change a status displayed on the frontend.

---

## 🔁 Consent Lifecycle

The consent lifecycle represents the different stages of a data-sharing permission.

| State | Meaning |
|---|---|
| `PENDING` | Consent is awaiting a decision or activation. |
| `ACTIVE` | Consent is currently approved, subject to its scope and validity. |
| `REJECTED` | The request was not approved. |
| `REVOKED` | The permission was withdrawn. |
| `EXPIRED` | The consent's validity period has ended. |

A simplified lifecycle is:

```text
                +----------+
                | PENDING  |
                +----+-----+
                     |
             +-------+-------+
             |               |
             v               v
        +---------+     +----------+
        | ACTIVE  |     | REJECTED |
        +----+----+     +----------+
             |
        +----+---------+
        |              |
        v              v
   +---------+    +---------+
   | REVOKED |    | EXPIRED |
   +---------+    +---------+
```

This is a conceptual diagram, not a complete state-transition specification. For example, the exact treatment of an expired consent, a pending request, or repeated revocation must follow the implemented transition rules.

---

## 🛡️ Security and Privacy Design

ConsentChain uses multiple security mechanisms to demonstrate defense in depth.

### 1. Data Minimization on the Blockchain

Raw customer names, PAN values, account numbers, transaction descriptions, and account balances should not be written to the blockchain.

Instead, the audit layer records opaque references and cryptographic commitments.

This reduces exposure of personal information, but does not automatically establish compliance with every applicable privacy law.

### 2. HMAC-SHA256 Commitments

HMAC-SHA256 is a keyed cryptographic construction.

Conceptually, the application may calculate:

```text
consentReference =
    HMAC-SHA256(secretKey, consentId)

commitmentHash =
    HMAC-SHA256(
        secretKey,
        canonicalConsentData
    )
```

The canonical consent data may represent fields such as the consent identifier, status, validity period, and permitted scopes.

The exact input format must be consistent between record creation and verification.

**Why use HMAC?**

- It produces a fixed-size cryptographic output.
- It requires a secret key.
- It helps protect underlying identifiers from straightforward disclosure.
- It can support integrity verification when the expected commitment can be independently recomputed.

HMAC is not encryption and is not a zero-knowledge proof. Its security depends on key protection, canonical input construction, and correct verification.

### 3. Bank-Side Authorization

The bank keeps its own consent records.

Before returning financial information, it validates the applicable consent rather than relying exclusively on a request from the aggregator.

This creates an additional authorization boundary.

### 4. Password Hashing

BCrypt is used to hash passwords before storage.

Passwords should not be stored in plaintext. Production systems also require suitable password policies, account protections, secure session management, and other controls.

### 5. Service-to-Service Authentication

The project uses an API-key header such as:

```http
X-AA-Token: <configured-secret>
```

The exact header and configuration must match the implemented services.

Secrets must be stored securely, rotated when necessary, and excluded from source control and logs.

### 6. Audit Verification

The audit verification process can compare a locally recomputed commitment with the corresponding on-chain commitment.

A matching commitment supports the conclusion that the compared value matches the recorded commitment under the assumed key and hashing process.

It does not independently prove that every underlying database field, business action, or real-world event was truthful.

### 7. Encoding Versus Encryption

If a financial payload is only Base64-encoded, Base64 provides no confidentiality.

It is a representation format, not an encryption algorithm.

Confidentiality requires appropriate encryption and secure key management, alongside transport security such as HTTPS/TLS.

The current implementation should be inspected before claiming that returned payloads are encrypted.

### Security Summary

| Security mechanism | Intended benefit | Important limitation |
|---|---|---|
| HMAC-SHA256 | Keyed commitments for audit verification | Depends on secret-key security and consistent input encoding |
| Private blockchain | Shared, tamper-evident audit history | Depends on validator security and network configuration |
| Bank-side consent checks | Independent authorization before data release | Must validate all relevant consent constraints |
| BCrypt | Safer password storage | Does not replace authentication and account security |
| API-key authentication | Authenticates configured service calls | Requires secure storage, rotation, and access control |
| Data minimization | Reduces personal data exposure on-chain | Does not by itself guarantee legal compliance |
| Base64 encoding | Represents data as text | Does not provide encryption or confidentiality |

---

## ⛓️ Blockchain Audit Layer

ConsentChain uses Hyperledger Besu, an Ethereum-compatible blockchain client, with a private QBFT-based network.

### What Is QBFT?

QBFT stands for Quorum Byzantine Fault Tolerance.

It is a consensus protocol designed for permissioned networks in which authorized validators participate in agreeing on blocks.

The project configuration describes a network with four validators.

The security properties of that network depend on correct validator configuration, node availability, key protection, and the assumptions of the consensus protocol.

### Smart Contract: `ConsentAuditRegistry.sol`

The smart contract records consent-related audit events.

The documented event codes are:

| Event | Code | Meaning |
|---|---:|---|
| `CREATED` | 0 | Consent record created |
| `APPROVED` | 1 | Consent approved |
| `REJECTED` | 2 | Consent rejected |
| `REVOKED` | 3 | Consent revoked |

The documented audit tuple is conceptually:

```text
(eventType, consentReference, commitmentHash, recordedAt)
```

The contract also uses writer authorization so that only an authorized account can submit records, and it rejects duplicate event keys according to its idempotency rules.

The exact storage layout, access-control implementation, and duplicate-event logic should be confirmed in `ConsentAuditRegistry.sol`.

### What Is Stored On-Chain?

The intended audit record contains:

- A consent event type.
- An opaque consent reference.
- A cryptographic commitment.
- A blockchain recording timestamp.

The blockchain should not contain raw financial records or personal identifiers.

### What Is Not Stored On-Chain?

The intended design keeps the following off-chain:

- Customer names.
- PAN values.
- Bank account numbers.
- Transaction histories.
- Account balances.
- Raw loan records.

A commitment does not make an on-chain record completely anonymous in every context. Metadata, repeated references, key compromise, and correlation with external information may still create privacy risks.

### Transactional Outbox and Blockchain Reliability

The aggregator first records an audit event in its database. A worker subsequently submits it to the blockchain.

This separates the application's database transaction from blockchain availability.

The outbox can support retries and recovery, while the smart contract's duplicate-event protection helps prevent duplicate logical records.

The final outcome still depends on transaction submission, confirmation handling, retry logic, and error recovery.

---

## 🗄️ Database Design

ConsentChain uses separate MySQL databases for the bank and aggregator services.

### 1. Bank Database: `bank_service_db`

| Table | Purpose |
|---|---|
| `customers` | Customer profiles and identification information |
| `accounts` | Bank accounts, account types, and balances |
| `transactions` | Credit and debit records |
| `loan_history` | Loan records and their statuses |
| `consent_artefacts` | Local consent records used for bank-side validation |

The exact column definitions and relationships are documented in the database schema scripts.

### 2. Aggregator Database: `aggregator_service_db`

| Table | Purpose |
|---|---|
| `users` | Registered ConsentChain users |
| `linked_bank_accounts` | Customer-linked bank account references |
| `consent_artefacts` | Consent details, scopes, purposes, and validity |
| `data_requests` | Financial information requests and execution states |
| `blockchain_audit_events` | Outbox records and blockchain submission status |

The outbox table tracks events using statuses such as `PENDING`, `SUBMITTED`, and `FAILED`, as described by the project.

### Database Setup Files

The SQL scripts are located in:

```text
docs/databaseScripts/
├── bank_service_table_scheme.sql
├── bank_data_seed.sql
├── aggregator_table_scheme.sql
└── aggregator_data_seed.sql
```

Check the filenames in the actual repository before executing the commands below. The setup instructions assume these filenames exist exactly as shown.

---

## 👤 Demo Personas

The project describes three sample customer profiles for demonstrating different financial scenarios.

### 1. Ramlal Patil — Agricultural Income

- Has simulated accounts with HDFC and SBI.
- Receives income from crop sales.
- Has tractor loan instalments and agricultural purchases.
- Demonstrates how financial transactions can support a loan assessment.

### 2. Anita Sharma — Salaried Professional

- Receives regular salary credits.
- Has recurring rent and utility payments.
- Demonstrates a relatively predictable income pattern.

### 3. Vikram Deshmukh — Irregular Income

- Has freelance income.
- Has partial credit card repayments.
- Has a defaulted loan in the sample data.
- Demonstrates how inconsistent cash flow and credit history can affect a financial assessment.

These are fictional demonstration personas. Their records should not be treated as real customer information or as a substitute for a regulated credit assessment.

---

## 🚀 Prerequisites

Before running ConsentChain locally, install the required tools.

- Java 21 JDK.
- MySQL 8.0 or a compatible supported version.
- Node.js and npm.
- Git.
- PowerShell on Windows.
- Docker and Docker Compose, if using the supplied Besu network setup.
- Network access for dependency installation.

The blockchain is optional for the basic application demonstration if the relevant integration is disabled.

---

## ⚙️ Installation and Setup

The commands below assume the repository is located at:

```text
D:\major project\consent-chain
```

Replace this path with your actual project directory if it differs.

### Step 1: Clone the Repository

```powershell
git clone <your-repository-url>
cd "consent-chain"
```

If you have already cloned the repository, open PowerShell in its root directory instead.

### Step 2: Configure MySQL

Start MySQL and create or prepare the two project databases.

Open a MySQL client and execute the schema and seed scripts in the correct order:

```sql
SOURCE docs/databaseScripts/bank_service_table_scheme.sql;
SOURCE docs/databaseScripts/bank_data_seed.sql;

SOURCE docs/databaseScripts/aggregator_table_scheme.sql;
SOURCE docs/databaseScripts/aggregator_data_seed.sql;
```

If the `SOURCE` command cannot resolve relative paths, use the full path to each SQL file.

Verify that both databases and their tables were created successfully.

### Step 3: Start the Bank Service

Open a new PowerShell terminal:

```powershell
cd "D:\major project\consent-chain\bank-service"

$env:SPRING_DATASOURCE_URL = "jdbc:mysql://localhost:3306/bank_service_db"
$env:SPRING_DATASOURCE_USERNAME = "root"
$env:SPRING_DATASOURCE_PASSWORD = "your-mysql-password"

$env:BANK_AA_API_KEY = "your-local-development-secret"

.\mvnw.cmd spring-boot:run
```

Replace the database password and API key with your own local development values.

If your project does not include the Maven Wrapper, use an installed Maven version supported by the project.

**Health check**

Open:

```text
http://localhost:8081/bank/health-check
```

The endpoint should return the health response defined by the bank service.

### Step 4: Start the Aggregator Service

Open a second PowerShell terminal:

```powershell
cd "D:\major project\consent-chain\aggregator-service"

$env:SPRING_DATASOURCE_URL = "jdbc:mysql://localhost:3306/aggregator_service_db"
$env:SPRING_DATASOURCE_USERNAME = "root"
$env:SPRING_DATASOURCE_PASSWORD = "your-mysql-password"

$env:FIP_BASE_URL = "http://localhost:8081"
$env:FIP_AA_API_KEY = "your-local-development-secret"

$env:BLOCKCHAIN_ENABLED = "false"

.\mvnw.cmd spring-boot:run
```

The bank and aggregator API-key configuration must match wherever the implementation expects the same shared secret.

Blockchain integration is disabled in this example so that the core services can be tested independently of Besu.

Confirm that the aggregator starts successfully and connects to its database.

### Step 5: Start the Frontend

Open a third PowerShell terminal:

```powershell
cd "D:\major project\consent-chain\frontend"

npm install
npm run dev
```

Open the frontend address reported by Vite. The documented development port is `5174`.

If Vite selects a different port, inspect `vite.config.js` and the terminal output.

### Step 6: Open the Dashboards

Assuming the frontend runs on port `5174`:

| Portal | URL |
|---|---|
| Main application | `http://localhost:5174` |
| Admin Dashboard | `http://localhost:5174/admin` |
| FIP Dashboard | `http://localhost:5174/fip/dashboard` |
| FIU Dashboard | `http://localhost:5174/fiu/dashboard` |
| Login | `http://localhost:5174/login` |
| Signup | `http://localhost:5174/signup` |

Some routes may require authentication or a particular user role.

---

## ⛓️ Optional: Start the Besu Blockchain

This step is needed only when demonstrating blockchain audit submissions.

### Step 1: Start the Network

Open PowerShell:

```powershell
cd "D:\major project\consent-chain\blockchain\besu"

.\start-besu.ps1
```

Ensure Docker is available and the supplied network configuration starts successfully.

The documented local RPC endpoint is:

```text
http://localhost:8545
```

### Step 2: Configure Contract Deployment

Open another PowerShell terminal:

```powershell
cd "D:\major project\consent-chain\blockchain"

$env:BLOCKCHAIN_RPC_URL = "http://localhost:8545"
$env:BLOCKCHAIN_CHAIN_ID = "1337"
```

Set the deployer private key using a key generated specifically for the local test network.

Then deploy the contract:

```powershell
npm install
npm run deploy:besu
```

The exact deployment script and required environment variables are defined by the project's Hardhat configuration.

After successful deployment, record the contract address printed by the script.

**Important:** A publicly known Hardhat development private key may appear in local examples. Never use that key or any other publicly known test key on a real network or with valuable assets.

### Step 3: Enable Blockchain Integration

In the aggregator terminal, configure the contract integration:

```powershell
$env:BLOCKCHAIN_ENABLED = "true"
$env:BLOCKCHAIN_CONTRACT_ADDRESS = "<deployed-contract-address>"
$env:BLOCKCHAIN_AUDIT_HMAC_SECRET = "<secure-local-secret>"
```

Use the exact HMAC secret requirements and other environment variable names expected by your source code.

Restart the aggregator after setting the environment variables.

### Step 4: Verify the Integration

Perform a consent lifecycle action and inspect:

1. The local outbox event.
2. The worker's submission logs.
3. The transaction receipt.
4. The contract's stored audit record.
5. The application's audit verification response.

A successful application-level request does not necessarily mean a blockchain transaction was confirmed. Verify the actual transaction outcome.

---

## 🧪 Testing and Demonstration

The following scenarios are suitable for validating the main project workflows.

### Test 1: Successful Consent Approval

1. Create or select a demo customer.
2. Submit a financial data request.
3. Approve the corresponding consent.
4. Verify that the consent becomes active.
5. Check that the bank receives and stores the consent record.

**Expected result:** The system records an approved consent that can be evaluated for subsequent requests.

### Test 2: Authorized Data Fetch

1. Select an active, unexpired consent.
2. Submit a data request within the permitted scope.
3. Execute the request.
4. Inspect the returned statement or financial data.

**Expected result:** The bank returns only data allowed by the applicable authorization rules.

### Test 3: Revoked Consent

1. Approve a consent.
2. Revoke it through the supported workflow.
3. Confirm that the bank's local consent record is updated.
4. Attempt another data fetch using the revoked consent.

**Expected result:** The bank denies the request rather than releasing financial data.

### Test 4: Expired Consent

1. Use a consent whose validity period has elapsed.
2. Attempt to fetch data with that consent.

**Expected result:** The bank denies access if the implementation enforces expiry as required.

### Test 5: Blockchain Audit

1. Enable blockchain integration.
2. Approve or revoke a consent.
3. Inspect the corresponding outbox event.
4. Verify the blockchain transaction and stored commitment.

**Expected result:** The corresponding event is recorded on-chain when submission succeeds.

### Test 6: Audit Verification

1. Retrieve an existing consent's audit record.
2. Recompute the expected commitment through the application's verification flow.
3. Compare it with the stored on-chain value.

**Expected result:** The verification process reports whether the compared commitment matches the on-chain record.

### Test 7: Failure Recovery

1. Temporarily make the blockchain endpoint unavailable in a local test environment.
2. Trigger an audit event.
3. Inspect the outbox status and retry behavior.
4. Restore the blockchain and observe whether the event is submitted.

**Expected result:** The worker handles submission failures according to its configured retry and recovery logic.

These are suggested validation scenarios. Their results must be confirmed by running the application and checking the implemented APIs, logs, and database records.

---

## 📂 Project Directory Structure

The main repository is organized as follows:

```text
consent-chain/
│
├── README.md
│
├── aggregator-service/
│   ├── src/main/java/
│   │   └── .../
│   │       ├── controller/
│   │       ├── model/
│   │       ├── repository/
│   │       ├── security/
│   │       └── service/
│   └── pom.xml
│
├── bank-service/
│   ├── src/main/java/
│   │   └── .../
│   │       ├── controller/
│   │       ├── model/
│   │       ├── repository/
│   │       └── service/
│   └── pom.xml
│
├── blockchain/
│   ├── besu/
│   │   ├── docker-compose.yml
│   │   └── start-besu.ps1
│   ├── contracts/
│   │   └── ConsentAuditRegistry.sol
│   ├── scripts/
│   ├── hardhat.config.js
│   └── package.json
│
├── docs/
│   ├── databaseScripts/
│   │   ├── bank_service_table_scheme.sql
│   │   ├── bank_data_seed.sql
│   │   ├── aggregator_table_scheme.sql
│   │   └── aggregator_data_seed.sql
│   ├── api-contracts.md
│   └── blockchain-setup.md
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   └── services/
    ├── vite.config.js
    └── package.json
```

This is a representative structure based on the documented modules. Verify the exact filenames and folders against the repository before treating it as a complete file listing.

---

## ⚠️ Limitations and Future Enhancements

ConsentChain is a reference implementation and has several areas that can be developed further.

### 1. Production-Grade Identity and Consent Signing

Introduce robust identity verification and verifiable consent signatures if they are not already implemented.

### 2. Stronger Financial Data Encryption

Use well-reviewed encryption mechanisms, secure key management, and TLS rather than relying on encoding or API-key protection alone.

### 3. Regulatory Integration

Evaluate the applicable RBI Account Aggregator requirements, consent artefact specifications, security controls, and integration protocols before claiming production compliance.

### 4. Stronger Authorization Policies

Validate consent purpose, data scope, requested date range, expiry, revocation, customer association, and requesting institution at every relevant access point.

### 5. Audit Key Management

Implement secure secret storage, rotation, access controls, and recovery procedures for HMAC keys and blockchain signing keys.

### 6. Monitoring and Operational Reliability

Improve metrics, structured logs, retry policies, duplicate-event handling, alerting, and recovery procedures for the outbox worker.

### 7. Privacy and Data Retention

Define retention and deletion policies for off-chain records, including financial data previously delivered to an FIU. Blockchain immutability makes it particularly important to minimize what is recorded on-chain.

### 8. Automated Testing

Expand unit, integration, security, and end-to-end tests covering consent transitions, invalid requests, expiry, revocation, authorization failures, and blockchain recovery.

---

## 🎓 Academic Significance

ConsentChain demonstrates the integration of several important computer science and financial technology concepts:

- **Microservices architecture:** Separates aggregation and banking responsibilities.
- **REST API development:** Enables communication between application components.
- **Relational database design:** Maintains customer, account, consent, and transaction records.
- **Authentication and authorization:** Protects access to services and financial data.
- **Cryptographic commitments:** Support integrity checks for selected audit information.
- **Blockchain and smart contracts:** Provide a shared audit history for consent events.
- **Transactional outbox pattern:** Helps coordinate database changes with asynchronous blockchain submissions.
- **Privacy-oriented system design:** Keeps raw financial information separate from the blockchain audit layer.

The project illustrates how consent management, independent authorization, and blockchain-based auditing can be combined in a financial data-sharing workflow.

It is an academic demonstration of these concepts, not proof of regulatory certification, complete legal compliance, or production-grade security.

---

## 📚 References

- [Reserve Bank of India](https://www.rbi.org.in/) — Regulatory information and applicable Account Aggregator requirements.
- [Sahamati](https://sahamati.org.in/) — India's Account Aggregator ecosystem and implementation resources.
- [Hyperledger Besu Documentation](https://besu.hyperledger.org/) — Besu configuration and network documentation.
- [Solidity Documentation](https://docs.soliditylang.org/) — Smart contract development.
- [Hardhat Documentation](https://hardhat.org/docs) — Contract compilation, testing, and deployment.
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/index.html) — Backend framework reference.
- [React Documentation](https://react.dev/) — Frontend development reference.

---

**ConsentChain — Consent first. Data by permission. Audits by design.**
