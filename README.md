# ConsentChain

A consent-first reference implementation of RBI's Account Aggregator framework for secure, purpose-bound financial data sharing, with a blockchain audit layer.

**Branch: `blockchain-integrated`** (backend + blockchain; no frontend, no token-based auth)

## Progress Till Now (on `blockchain-integrated`)

**Overall system: ~65% complete | Backend + blockchain: ~90% complete**

| Module | Status |
|---|---|
| Database design and seed scripts | Done |
| Bank service (FIP + FIU) | Done |
| Aggregator service (auth, account linking, consent lifecycle, data requests) | Done |
| Blockchain audit layer (Besu network, smart contract, outbox, audit verification API) | Done |
| Credentials moved to environment variables | Done |
| Token-based authentication and access control | Not in this branch |
| Frontend | Not in this branch |
| Deployment | Not started |
