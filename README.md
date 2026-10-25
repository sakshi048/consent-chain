# ConsentChain

A consent-first reference implementation of RBI's Account Aggregator framework for secure, purpose-bound financial data sharing.

**Branch: `feat/admin-dashboard`** (backend + early frontend + admin dashboard UI; no blockchain layer)

## Progress Till Now (on `feat/admin-dashboard`)

**Overall system: ~45% complete | Admin dashboard UI: ~70% built, ~30% connected to the real backend**

| Module | Status |
|---|---|
| Database design and seed scripts | Done |
| Bank service (FIP + FIU) | Done |
| Aggregator service (auth, account linking, consent lifecycle, data requests) | Done |
| Frontend login, signup, FIP and FIU dashboards | Done (static / sample data) |
| Admin dashboard UI (metrics, consent chart, audit logs, health, blockchain sync cards) | Built |
| Admin dashboard connected to backend | Partial (users, consents, audit logs only; rest is sample data) |
| Blockchain audit layer | Not in this branch |
| Token-based authentication and access control | Not in this branch |
| Deployment | Not started |
