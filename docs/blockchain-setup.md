# Local Besu QBFT consent audit

ConsentChain's blockchain integration is an optional audit/proof layer for the AA consent lifecycle. It does not hold financial data and it does not replace the AA, FIP, FIU, either MySQL database, the existing `X-AA-Token` service authentication, or the FIP's independent consent checks.

## What is recorded

The local `ConsentAuditRegistry` accepts four event codes: `CREATED` (0), `APPROVED` (1), `REJECTED` (2), and `REVOKED` (3). It stores an opaque keyed event ID, an opaque keyed consent reference, and a keyed commitment to the consent state. Raw consent IDs, purpose, scopes, dates, customer identity, PAN, account details, credentials, and financial data are not sent to Besu. The HMAC secret remains in the AA environment; losing it means the AA cannot recreate the same commitments for verification.

The AA writes each event to its MySQL outbox first. A background worker submits pending events to the local chain and retries failures. Consent behavior and FIP enforcement continue when blockchain is disabled or unavailable. `GET /aa/consents/{consentId}/blockchain-audit` shows the local event and checks whether the corresponding event key is recorded in the deployed contract.

## Prerequisites

- Java 21 and Maven 3.8 or newer
- Docker Desktop with Docker Compose
- Node.js 20 or newer and npm
- The existing MySQL databases and credentials used by the two services

No paid blockchain service, cloud account, or remote RPC endpoint is required. The four validator containers use the local QBFT network only. Generated validator keys and chain data live under `blockchain/besu/network/` and are git-ignored.

## 1. Start the local QBFT network (PowerShell)

From the repository root:

```powershell
Set-Location .\blockchain\besu
.\start-besu.ps1
```

On first start, the script uses the pinned Besu image to generate a four-validator QBFT genesis and local node keys, then starts the validators. The JSON-RPC endpoint is `http://localhost:8545` and the chain ID is `1337`. Keep the validator containers running while deploying and using the services.

Check that the RPC responds:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8545 -ContentType 'application/json' -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

Stop the network when finished:

```powershell
.\stop-besu.ps1
```

Stopping containers preserves generated validator keys and chain data. To reset the demo chain, stop it and remove the ignored `blockchain/besu/network` contents and Docker Compose volumes; a reset also removes the deployed contract and audit records on that local chain.

## 2. Install blockchain tools and deploy the contract

In a second PowerShell window, from the repository root:

```powershell
Set-Location .\blockchain
npm install
```

For a local demo only, Hardhat's well-known development key is funded in the local genesis. Do not reuse this publicly known key on any real network. Deploy using it:

```powershell
$env:BLOCKCHAIN_RPC_URL = 'http://localhost:8545'
$env:BLOCKCHAIN_CHAIN_ID = '1337'
$env:DEPLOYER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
npm run deploy:besu
```

Copy the printed contract address for the next step. The deployer is also set as the contract's only writer, so the AA must use this same local demo key.

Run the contract tests independently:

```powershell
npm test
```

## 3. Start the Spring Boot services

Configure the existing MySQL/FIP values as described in the main README and the existing service configuration. Set the blockchain values in the aggregator process environment (PowerShell):

```powershell
$env:BLOCKCHAIN_ENABLED = 'true'
$env:BLOCKCHAIN_RPC_URL = 'http://localhost:8545'
$env:BLOCKCHAIN_CHAIN_ID = '1337'
$env:BLOCKCHAIN_CONTRACT_ADDRESS = '<address printed by deploy:besu>'
$env:BLOCKCHAIN_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
$env:BLOCKCHAIN_AUDIT_HMAC_SECRET = 'replace-with-a-random-secret-of-at-least-32-characters'
```

In the FIP + FIU terminal, start the existing bank service:

```powershell
Set-Location .\bank-service
mvn spring-boot:run
```

In a separate AA terminal, set the same blockchain environment variables shown above (and the AA database/FIP configuration), then run:

```powershell
Set-Location .\aggregator-service
mvn spring-boot:run
```

The bank-service uses its existing database and FIP API key settings. Configure those as in the root README. The blockchain settings belong only to the AA process. If `BLOCKCHAIN_ENABLED` is omitted or `false`, the pre-existing application runs without blockchain writes.

## 4. Exercise consent lifecycle events

Use an existing AA user ID (replace `1` below with the ID returned by your registration/login flow). The sample assumes both services are running and the FIP database/API key is configured.

```powershell
$userId = 1
$headers = @{ 'Content-Type' = 'application/json' }
$createBody = @{
  requestId = 'REQ-BLOCKCHAIN-001'
  userId = $userId
  fiuId = 'DEMO-LENDER'
  purpose = 'Loan assessment'
  dataScopes = @('ACCOUNT', 'TRANSACTIONS')
  fromDate = '2026-01-01'
  toDate = '2026-06-30'
} | ConvertTo-Json
$approved = Invoke-RestMethod -Method Post -Uri 'http://localhost:8082/aa/consents' -Headers $headers -Body $createBody
$approved.consentId
Invoke-RestMethod -Method Put -Uri "http://localhost:8082/aa/consents/$($approved.consentId)/approve"
```

This queues `CREATED`, then `APPROVED` after the existing FIP registration succeeds. Create another consent to demonstrate rejection:

```powershell
$rejectBody = @{
  requestId = 'REQ-BLOCKCHAIN-002'
  userId = $userId
  fiuId = 'DEMO-LENDER'
  purpose = 'Loan assessment'
  dataScopes = @('ACCOUNT')
  fromDate = '2026-01-01'
  toDate = '2026-06-30'
} | ConvertTo-Json
$rejected = Invoke-RestMethod -Method Post -Uri 'http://localhost:8082/aa/consents' -Headers $headers -Body $rejectBody
Invoke-RestMethod -Method Put -Uri "http://localhost:8082/aa/consents/$($rejected.consentId)/reject"
```

Revoke the approved consent to queue `REVOKED` after the FIP accepts the revoke:

```powershell
Invoke-RestMethod -Method Put -Uri "http://localhost:8082/aa/consents/$($approved.consentId)/revoke"
```

The background worker usually anchors an event within a few seconds. The lifecycle calls do not wait for block inclusion. The FIP continues to deny data access once its own consent artefact is revoked or expired.

## 5. Verify an audit record

```powershell
$consentId = '<consent id returned by the AA>'
Invoke-RestMethod "http://localhost:8082/aa/consents/$consentId/blockchain-audit"
```

Each result has an event type, local outbox status, timestamp, transaction hash (when available), and `verifiedOnChain`. `verifiedOnChain: true` means the deployed contract currently reports the keyed event ID as recorded. A `PENDING` or `FAILED` result means the worker is waiting for Besu or retrying; inspect `docker compose logs` in `blockchain/besu` and the AA log, then query again.

## Configuration reference

| Environment variable | Purpose |
| --- | --- |
| `BLOCKCHAIN_ENABLED` | Enable AA outbox writes and Besu worker (`true` to demo) |
| `BLOCKCHAIN_RPC_URL` | Local Besu JSON-RPC URL (default `http://localhost:8545`) |
| `BLOCKCHAIN_CHAIN_ID` | Network ID used for transaction signing (default `1337`) |
| `BLOCKCHAIN_CONTRACT_ADDRESS` | Deployed `ConsentAuditRegistry` address |
| `BLOCKCHAIN_PRIVATE_KEY` | Local AA transaction-signing key; keep it out of source control |
| `BLOCKCHAIN_AUDIT_HMAC_SECRET` | Secret, at least 32 characters, used to create opaque identifiers/commitments |
| `BLOCKCHAIN_POLL_DELAY_MS` | Outbox retry poll interval (default `5000`) |
| `BLOCKCHAIN_GAS_PRICE_WEI` | Local transaction gas price (default `1000000000`) |
| `BLOCKCHAIN_GAS_LIMIT` | Transaction gas limit (default `300000`) |

For real deployments, each participating institution needs its own validator, access policy, and key-management process. This local demo intentionally uses a publicly known funded key and permissive RPC settings; use it only on a developer machine and never expose its RPC port to an untrusted network.


### Existing service environment (PowerShell)

In the bank-service terminal, use the bank database and the same AA service key as the aggregator:

```powershell
$env:SPRING_DATASOURCE_URL = 'jdbc:mysql://localhost:3306/bank_service_db'
$env:SPRING_DATASOURCE_USERNAME = 'root'
$env:SPRING_DATASOURCE_PASSWORD = 'your-mysql-password'
$env:BANK_AA_API_KEY = 'your-shared-aa-key'
Set-Location .\bank-service
mvn spring-boot:run
```

In the aggregator terminal, set its database, FIP/FIU URLs and the matching shared key, then set the blockchain variables from step 3:

```powershell
$env:SPRING_DATASOURCE_URL = 'jdbc:mysql://localhost:3306/aggregator_service_db'
$env:SPRING_DATASOURCE_USERNAME = 'root'
$env:SPRING_DATASOURCE_PASSWORD = 'your-mysql-password'
$env:FIP_BASE_URL = 'http://localhost:8081'
$env:FIP_AA_API_KEY = 'your-shared-aa-key'
$env:FIU_BASE_URL = 'http://localhost:8081'
Set-Location .\aggregator-service
mvn spring-boot:run
```

Besu should report exactly four validators:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8545 -ContentType 'application/json' -Body '{"jsonrpc":"2.0","method":"qbft_getValidatorsByBlockNumber","params":["latest"],"id":2}'
```
