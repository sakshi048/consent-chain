# ConsentChain

A consent-first reference implementation of RBI's Account Aggregator framework for secure, purpose-bound financial data sharing.

**Branch: `feature/bank-service`** (early bank-service work only; superseded by later branches)

## Progress Till Now (on `feature/bank-service`)

**Overall system: ~10% complete | Bank service basics: ~40% complete**

| Module | Status |
|---|---|
| Repository structure and Spring Boot setup | Done |
| Bank health-check endpoint | Done |
| Bank account model, repository and seed data (H2 in-memory) | Done |
| Consent artefact model and repository | Done |
| `POST /bank/validate-consent` | Done |
| `POST /bank/fetch-data` (Base64-encoded response) | Done |
| Bank service API contract document | Done |
| MySQL, customers, transactions, loan history, auth | Not in this branch |
| Aggregator service | Only a health-check endpoint |
| Blockchain audit layer | Not in this branch |
| Frontend | Not in this branch |
| Deployment | Not started |
