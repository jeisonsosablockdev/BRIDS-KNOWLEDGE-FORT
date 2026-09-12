---
title: "Especificación de API: Orquestador de Minteo y Emisión"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "API Specifications"
source_okf: "knowledge/api/endpoints/mint-orchestrator.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "7ba4100909a2704ffe412f15da7fdcf5c2a4256cee0cba197953746243968be6"
tags: [api, minting, orchestration, endpoints]
updated_at: "2026-09-12T02:07:49.379Z"
---

# Especificación de API: Orquestador de Minteo y Emisión

> [!NOTE]
> **Resumen Técnico:** Endpoints internos y de webhook para coordinar la emisión on-chain tras confirmación de fondos en custodia.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Overview
Server-side batch mint orchestration for Core Candy Machine. Admin creates jobs, requests batches, collects signatures, submits, and reconciles.

## Authority
- All endpoints require SIWS `admin` role
- **Permanent job authority (H7)**: Manual mutations (`next-batch`, `submit`, `reconcile`) require `actorPubkey === job.createdBy`
- Webhook/DAS reconciliation is server-initiated, not wallet-bound

## Job Lifecycle
```
created → preparing → signing → submitting → confirming → completed|partial|failed
```

## Endpoints

### Job Management
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/admin/mint-orchestrator/jobs` | POST | admin | Create mint job (`job_id`) |
| `/api/admin/mint-orchestrator/jobs` | GET | admin | List recent jobs with progress |
| `/api/admin/mint-orchestrator/jobs/:jobId` | GET | admin | Get job snapshot |

### Batch Operations
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/admin/mint-orchestrator/jobs/:jobId/next-batch` | POST | admin | Reserve next batch idempotently |
| `/api/admin/mint-orchestrator/jobs/:jobId/batches/:batchNo/submit` | POST | admin | Submit signed item signatures |

### Reconciliation
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/admin/mint-orchestrator/jobs/:jobId/reconcile` | POST | admin | RPC-based signature confirmation |
| `/api/admin/mint-orchestrator/jobs/:jobId/reconcile/das` | POST | admin | DAS paginated asset confirmation |

## Idempotency
| Operation | Key | TTL |
| --- | --- | --- |
| `next-batch` | `jobId + idempotency_key` | Permanent (DB unique) |
| `submit` | Signature uniqueness per item | Permanent |
| DAS reconcile | Bounded pagination (`page`, `limit`, `maxPages`) | Per-request |

## Authority Gates (H7)
```typescript
// Every manual mutation endpoint validates:
if (actorPubkey !== job.createdBy) return 403; // "Authority mismatch"
```

## DAS Reconciliation Parameters
```json
{
  "page": 1,
  "limit": 1000,
  "maxPages": 10
}
```
Returns `nextPage` token for continuation.

## Snapshot Finalization
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/admin/core-candy-machine/snapshot/finalize` | POST | admin | DAS verify quantity, persist snapshot + on-chain proofs |

**Create Asset Gate**: Enabled only when `verificationStatus=verified` AND `mint_jobs.status=completed`.

## Webhook Ingestion
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/webhooks/helius/mint-orchestrator?jobId=<jobId>` | POST | None | Ingest Helius events, dedupe, reconcile signatures |

**Dedupe**: In-memory by `(provider, eventId)` and `(provider, eventFingerprint)`.

## Error Codes
| Code | Description |
| --- | --- |
| `JOB_NOT_FOUND` | Job ID doesn't exist |
| `AUTHORITY_MISMATCH` | Actor ≠ job.createdBy |
| `BATCH_ALREADY_RESERVED` | Idempotency key collision |
| `INVALID_SIGNATURE` | Signature verification failed |
| `RECONCILIATION_INCOMPLETE` | Some items unconfirmed after maxPages |

## Related
- [Admin Assets API](admin-assets.md) — Deploy triggers job creation
- [Solana RPC Methods](../rpc/solana-methods.md) — RPC reconciliation patterns
- [Auth Flow](../architecture/auth-flow.md) — Session requirements

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/api/endpoints/mint-orchestrator.md |
