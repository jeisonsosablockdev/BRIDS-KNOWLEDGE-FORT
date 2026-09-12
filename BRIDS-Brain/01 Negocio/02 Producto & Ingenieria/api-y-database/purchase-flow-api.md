---
title: "Especificación de API: Flujo de Compra y Checkout Unificado"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "API Specifications"
source_okf: "knowledge/api/endpoints/purchase-flow.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "299137cd94337db030d9c61a8b84e548b15e587f9502b4653fda5f4ece480495"
tags: [api, checkout, purchase, usdc, endpoints]
updated_at: "2026-09-12T02:07:49.380Z"
---

# Especificación de API: Flujo de Compra y Checkout Unificado

> [!NOTE]
> **Resumen Técnico:** Endpoints para inicio de orden, verificación de balance en USDC, cotización de comisiones y confirmación de pago.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Overview
User-facing mint flow for BRIDS NFT fractions from Candy Machine listings.
Requires SIWS wallet session. All endpoints wallet-bound server-side.

## Flow
```
quote → challenge → prepare → submit
```

## Endpoints

### Quote (Public Cache)
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/purchase/quote` | POST | None | Cached Candy Guard quote + quantity contract |

**Response**:
```json
{
  "priceLamports": 1000000,
  "priceUsdcAtomic": 1000000,
  "paymentCurrency": "USDC",
  "startDate": "ISO8601",
  "itemsRemaining": 100,
  "quantityMode": "MULTI_ENABLED",
  "quantity": 1,
  "totalPriceLamports": 1000000
}
```

### Challenge (Anti-Bot)
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/purchase/challenge` | POST | SIWS | Issue one-time challenge bound to quantity |

**Request**: `{ "quantity": 2 }`
**Response**: `{ "challengeId", "nonce", "message", "expiresAt" }`

### Prepare (On-Chain Revalidation)
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/purchase/prepare` | POST | SIWS | Verify challenge, revalidate guard, return tx + idempotencyKey |

**Request**: `{ "quantity": 2, "challengeSignature": "..." }`
**Response**: `{ "transactionBase64", "attemptId", "idempotencyKey", "expectedAssetAddresses" }`

### Submit (Idempotent)
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/purchase/submit` | POST | SIWS | Lock attempt, validate tx, persist submitted |

**Request**: `{ "attemptId", "idempotencyKey", "signedTransactionBase64" }`
**Response**: `{ "status": "confirmed", "txSignature", "verifiedAssetAddresses" }`

**Idempotency**: Deduped by `(wallet_public_key, idempotency_key)` with 5-min TTL.

## Quantity Contract
- Mode: `PURCHASE_QUANTITY_MODE` (default `MULTI_ENABLED`)
- Max per order: `PURCHASE_MAX_QUANTITY_PER_ORDER` (default `10`)
- Invalid/out-of-policy → `INVALID_QUANTITY`

## Error Codes
| Code | Description |
| --- | --- |
| `MINT_NOT_STARTED` | Guard startDate not reached |
| `SOLD_OUT` | itemsRemaining === 0 |
| `PRICE_CHANGED` | Quote cache diverged from fresh guard |
| `INVALID_QUANTITY` | Quantity out of policy or doesn't fit in tx |
| `INSUFFICIENT_FUNDS` | Wallet balance too low |
| `INVALID_CHALLENGE` | Challenge expired/consumed/invalid signature |
| `RATE_LIMITED` | Wallet/IP rate limit exceeded |
| `TRANSACTION_FAILED` | On-chain tx failed |

## Asset Verification
Post-submit verifies each expected asset:
- Asset exists on-chain
- Owner === buyer wallet
- Collection === expected BRIDS collection
- `freezeDelegate.authority === Owner` (for Stake eligibility)

## Tracing
Send `x-flow-id` header to correlate all steps in `purchase_flow_events`.

## Related
- [Mint Orchestrator API](mint-orchestrator.md) — admin batch mint
- [Stake API](../endpoints/stake.md) — stake/unstake purchased assets

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/api/endpoints/purchase-flow.md |
