---
title: "Modelo de Datos: Intentos de Compra y Registro de Órdenes"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Database Architecture"
source_okf: "knowledge/database/models/purchase-attempt.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "9cf40f260684247eee3127e357589cfa79e936cd5984c5a220f1a059e85072d5"
tags: [database, purchase-attempt, checkout, inventory, postgres]
updated_at: "2026-09-12T02:07:49.376Z"
---

# Modelo de Datos: Intentos de Compra y Registro de Órdenes

> [!NOTE]
> **Resumen Técnico:** Esquema de seguimiento de órdenes de compra, locking de inventario, tiempos de expiración y estado de pago.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[02 Strategy & Research/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[02 Strategy & Research/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[02 Strategy & Research/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[02 Strategy & Research/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Database Table
`purchase_attempts` (migration `007_purchase_attempts.sql` + later migrations)

## Type Definition
From `lib/purchase-attempts-repository.ts`:

```typescript
export type PurchaseAttemptStatus = 
  | "created" 
  | "prepared" 
  | "submitted" 
  | "confirmed" 
  | "failed";

export type PurchaseAttemptAssetVerificationStatus = 
  | "not_required" 
  | "pending" 
  | "verified" 
  | "failed";

export type PurchaseAttemptRecord = {
  id: string;                          // UUIDv7
  wallet_public_key: string;           // Buyer wallet
  candy_machine_address: string;       // CM address
  challenge_id: string | null;         // FK to purchase_challenges
  client_ip: string | null;
  quantity: number;
  idempotency_key: string;             // UUIDv7, 5-min TTL
  idempotency_expires_at: Date;
  tx_signature: string | null;
  status: PurchaseAttemptStatus;
  error_code: string | null;
  error_message: string | null;
  expected_asset_addresses: string[];  // Expected mint addresses
  verified_asset_addresses: string[];  // Confirmed on-chain
  asset_verification_status: PurchaseAttemptAssetVerificationStatus;
  asset_verification_error: string | null;
  asset_verification_checked_at: Date | null;
  confirmed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type CreatePurchaseAttemptInput = {
  wallet_public_key: string;
  candy_machine_address: string;
  challenge_id: string | null;
  client_ip: string | null;
  quantity: number;
  idempotency_key: string;
  idempotency_expires_at: Date;
  expected_asset_addresses: string[];
};
```

## State Machine
```
created → prepared → submitted → confirmed | failed
                    ↘ confirmed (idempotent replay)
```

## Idempotency
- Unique key: `(wallet_public_key, idempotency_key)`
- TTL: 5 minutes (configurable)
- Replay returns existing `submitted` state without re-send

## Asset Verification
Post-submit verification checks:
1. Asset exists on-chain
2. Owner === buyer wallet
3. Collection === expected BRIDS collection
4. `freezeDelegate.authority === Owner` (for Stake eligibility)

## Related Tables
- `purchase_challenges` — challenge issuance/consumption
- `purchase_flow_events` — tracing (`request/success/error per step)
- `purchase_rate_limit_events` — rate limit evidence
- `purchase_webhook_events` — Helius webhook records

## Related
- [Purchase Flow API](../api/endpoints/purchase-flow.md)
- [Purchase Challenges](purchase-challenge.md)
- [Purchase Webhook Events](../api/schemas/purchase-webhook-events.md)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/database/models/purchase-attempt.md |
