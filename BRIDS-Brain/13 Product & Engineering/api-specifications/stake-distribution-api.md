---
title: "Especificación de API: Staking y Distribución de Rendimientos"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "API Specifications"
source_okf: "knowledge/api/endpoints/stake-distribution.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "1c9c3e4e46f937f0da56f261e56c5038f4552dd5f97e363ceb85ff1f48de9e14"
tags: [api, staking, yields, claims, endpoints]
updated_at: "2026-09-12T02:07:49.381Z"
---

# Especificación de API: Staking y Distribución de Rendimientos

> [!NOTE]
> **Resumen Técnico:** Endpoints para consultar rentas devengadas, solicitar retiros de dividendos acumulados y verificar estado de claim.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[02 Strategy & Research/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[02 Strategy & Research/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[02 Strategy & Research/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[02 Strategy & Research/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## User Stake Flow (Protected)
Requires SIWS wallet session. Only NFTs owned by authenticated wallet in BRIDS-tracked collections.

### Endpoints
| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/protected/stake/assets` | GET | List eligible assets for stake/unstake |
| `/api/protected/stake/prepare` | POST | Build freeze/thaw tx for asset |
| `/api/protected/stake/submit` | POST | Submit signed stake tx |
| `/api/protected/profile/stake-history` | GET | User's stake history |

### Asset Eligibility
- Must be in BRIDS-tracked collection (persisted in DB)
- Must be currently owned by authenticated wallet
- Must have `FreezeDelegate` with `Owner` authority

### Replay Protection
- Prepared actions stored as server-owned attempts with `attemptId + idempotencyKey`
- Submit rejects mismatched wallet, mismatched prepared message, non-`prepared` attempts

### Blockhash Expired
`BLOCKHASH_EXPIRED` is recoverable: attempt marked failed, UI prompts fresh signature.

## Admin Distribution Preparation
Requires SIWS admin session (`getRequestRole` → `admin`).

### Endpoints
| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/admin/distributions/runs` | GET | List distribution runs |
| `/api/admin/distributions/runs` | POST | Create distribution run |
| `/api/admin/distributions/runs/[runId]/finalize` | POST | Finalize run (records admin actor) |

### Eligibility
Derived server-side from:
- Validated `user_profile_stake_events`
- Persisted `user_profiles.compliance_status`

### Webhook
| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/webhooks/helius/stake` | POST | Helius stake event ingestion (deduped) |

## Related
- [Purchase Flow API](purchase-flow.md) — acquire stakeable assets
- [Auth API](auth.md) — session requirements

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/api/endpoints/stake-distribution.md |
