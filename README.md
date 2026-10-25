# ConsentChain

A consent-first reference implementation of RBI's Account Aggregator framework for secure, purpose-bound financial data sharing, with a blockchain audit layer.

**Branch: `frontend-blockchain-backend`** (most complete branch: backend + blockchain + secure auth + integrated frontend)

## Progress Till Now (on `frontend-blockchain-backend`)

**Overall system: ~80% complete**

| Module | Status |
|---|---|
| Database design and seed scripts | Done |
| Bank service (FIP + FIU) | Done |
| Aggregator service (auth, account linking, consent lifecycle, data requests) | Done |
| Token-based authentication and access control | Done |
| Blockchain audit layer (Besu network, smart contract, outbox, audit verification) | Done |
| Credentials moved to environment variables | Done |
| Frontend for AA user, FIU and FIP flows (connected to backend) | Done |
| Automated tests (backend security, blockchain, contract, frontend flows) | Done (partial coverage) |
| Admin dashboard UI | Not in this branch (built in `feat/admin-dashboard`) |
| Customer dashboard, branch lookup and account lookup | Not in this branch (built in `feature/frontend-and-setup`) |
| Deployment | Not started |
