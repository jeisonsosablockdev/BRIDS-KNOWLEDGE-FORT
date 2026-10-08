---
title: "Esquema de Eventos de Webhook de Compras y Pagos"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "API Specifications"
source_okf: "knowledge/api/schemas/purchase-webhook-events.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "d9346295733823d45761f22ae4c896e8629785e2d71795da4d7d276d4fd8c4bf"
tags: [api, webhooks, schemas, checkout, events]
updated_at: "2026-10-06T02:46:34.447Z"
---

# Esquema de Eventos de Webhook de Compras y Pagos

> [!NOTE]
> **Resumen Técnico:** Contratos de payload, validación de firmas criptográficas e idempotencia para eventos de compra y liquidación.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Helius Webhooks

### Mint Orchestrator
**Endpoint**: `POST /api/webhooks/helius/mint-orchestrator?jobId=<jobId>`

**Headers**:
- `x-helius-webhook-secret` (optional, if `HELIUS_WEBHOOK_SECRET` configured)
- `Content-Type: application/json`

**Payload** (Helius enhanced transaction):
```json
{
  "signature": "base58",
  "slot": 123456,
  "blockTime": 1234567890,
  "meta": {
    "err": null,
    "logMessages": ["Program log: MintV1", "..."]
  },
  "events": {
    "nft": {
      "mints": [{ "mint": "base58", "collection": "base58" }]
    }
  }
}
```

**Idempotency**: Deduped by `(provider, eventId)` and `(provider, eventFingerprint)` in memory.

### Stake
**Endpoint**: `POST /api/webhooks/helius/stake`

Similar structure, observes `freezeAsset` / `thawAsset` for profile history reconciliation.

## Stripe Webhooks

### KYC Identity Verification
**Endpoint**: `POST /api/webhooks/stripe/identity`

**Headers**:
- `Stripe-Signature` — HMAC-SHA256 verified against `STRIPE_IDENTITY_WEBHOOK_SECRET`

**Event Types**:
| Event | Action |
| --- | --- |
| `identity.verification_session.verified` | Trigger AML screening, update compliance |
| `identity.verification_session.requires_input` | Update status, notify user |

**Idempotency**: By `provider_event_id` (Stripe event ID).

## Airwallex Webhooks (Suspended)

**Endpoint**: `POST /api/webhooks/airwallex`

**Headers**:
- `x-timestamp` + `x-signature` (HMAC-SHA256 with `AIRWALLEX_WEBHOOK_SECRET`)

**Status**: Card checkout suspended — webhook retained for infrastructure.

## Validation Rules

| Rule | Implementation |
| --- | --- |
| HMAC verification | Required for Stripe/Airwallex; optional for Helius |
| Timestamp freshness | Airwallex: ±5 min tolerance |
| Idempotent ingestion | In-memory dedupe (Helius); event ID (Stripe) |
| Signature-level state transition | Only transition on confirmed signatures |

## Error Responses
| Code | HTTP | Description |
| --- | --- | --- |
| `WEBHOOK_SECRET_INVALID` | 401 | Missing/wrong secret |
| `SIGNATURE_INVALID` | 400 | HMAC verification failed |
| `IDEMPOTENT_DUPLICATE` | 200 | Already processed (silent success) |
| `PAYLOAD_INVALID` | 400 | Malformed JSON |

## Related
- [Purchase Flow API](../endpoints/purchase-flow.md) — flow that generates events
- [Auth API](../endpoints/auth.md) — no SIWS on webhook endpoints

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/api/schemas/purchase-webhook-events.md |
