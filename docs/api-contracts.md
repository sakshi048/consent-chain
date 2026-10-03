# Bank Service — API Contracts

Base URL: `http://localhost:8081/bank`

---

## 1. Health Check

**GET** `/bank/health-check`

**Response:** `200 OK`
Bank service is up


---

## 2. Validate Consent

**POST** `/bank/validate-consent`

**Request Body:**
```json
{
  "consentId": "consent-abc-123"
}
```

**Response — Valid (200 OK):**
```json
{
  "valid": true,
  "message": "Consent is valid"
}
```

**Response — Invalid/Expired (400 Bad Request):**
```json
{
  "valid": false,
  "message": "Consent is expired or revoked"
}
```

**Response — Not Found (404 Not Found):**
```json
{
  "valid": false,
  "message": "Consent not found"
}
```

---

## 3. Fetch Data

**POST** `/bank/fetch-data?accountNumber=SBIN0001234&consentId=consent-abc-123`

(Query params — no request body)

**Response — Success (200 OK):**
```json
{
  "encodedData": "eyJhY2NvdW50TnVtYmVyIjoi..."
}
```
Note: `encodedData` is a Base64-encoded JSON string containing `accountNumber`, `holderName`, `balance`, `ifscCode`. Decode it to read the actual data.

**Response — Consent Invalid (403 Forbidden):**
```json
{
  "valid": false,
  "message": "Consent invalid, data not shared"
}
```

**Response — Account/Consent Not Found (500):**
Currently a generic error — will be improved with custom exception handling.

---

## Status Codes Summary

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Consent expired/revoked |
| 403 | Consent invalid — data not shared |
| 404 | Consent not found |
| 500 | Account not found (temporary — needs proper exception handling) |
---

## 4. AA Consent Blockchain Audit Proof

**GET** `/aa/consents/{consentId}/blockchain-audit`

Returns the off-chain outbox status and checks that the on-chain event type, opaque consent reference, and keyed commitment match the AA's local commitment. The endpoint returns no consent content, identity, PAN, account, or financial data.

**Response — Example (200 OK):**

```json
[
  {
    "eventType": "APPROVED",
    "status": "SUBMITTED",
    "recordedAt": "2026-10-02T10:20:30.123456",
    "transactionHash": "0x...",
    "verifiedOnChain": true,
    "message": "Local consent commitment matches the immutable Besu record"
  }
]
```

`eventType` is one of `CREATED`, `APPROVED`, `REJECTED`, or `REVOKED`. `status` is the AA outbox state (`PENDING`, `SUBMITTED`, or `FAILED`). A `PENDING` or `FAILED` entry is retried by the AA worker. `verifiedOnChain` is true only after the mined contract record and locally recomputed keyed commitment match.
