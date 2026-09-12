---
title: "Modelo de Datos: Registro de Acciones de Staking y Rentas"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Database Architecture"
source_okf: "knowledge/database/models/stake-action.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "0488c71d48b8cf1a5f39c167991e367e0ef77c5d6032bf415e164adbd89fe0f7"
tags: [database, staking, yield-distribution, postgres]
updated_at: "2026-09-12T02:07:49.376Z"
---

# Modelo de Datos: Registro de Acciones de Staking y Rentas

> [!NOTE]
> **Resumen Técnico:** Esquema de transacciones de staking, bloqueo de NFTs, cálculo de periodos y reclamos de rendimientos acumulados.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[02 Strategy & Research/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[02 Strategy & Research/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[02 Strategy & Research/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[02 Strategy & Research/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Database Tables
- `stake_action_attempts` (migration `031_stake_profile_persistence.sql`)
- `stake_profile_events` (profile history)
- `user_profile_stake_events` (validated events for distribution)

## Type Definitions
From `lib/stake-attempts-repository.ts`:

```typescript
export type StakeProductAction = "stake" | "unstake";

export type StakeAttemptStatus = 
  | "prepared" 
  | "submitted" 
  | "validated" 
  | "reconcile_pending" 
  | "rejected" 
  | "failed";

export type StakeActionAttemptRecord = {
  id: string;                    // UUID
  wallet_public_key: string;     // Owner wallet
  asset_mint_address: string;    // NFT mint
  action: StakeProductAction;    // stake | unstake
  status: StakeAttemptStatus;
  tx_signature: string | null;
  idempotency_key: string;       // Server-issued
  idempotency_expires_at: Date;
  error_code: string | null;
  error_message: string | null;
  prepared_at: Date;
  submitted_at: Date | null;
  validated_at: Date | null;
  created_at: Date;
  updated_at: Date;
};
```

From `lib/stake-profile-events-repository.ts`:

```typescript
export type StakeProfileValidationStatus = 
  | "pending" 
  | "validated" 
  | "reconcile_pending" 
  | "rejected";

export type StakeProfileEventRecord = {
  id: string;
  wallet_public_key: string;
  asset_mint_address: string;
  action: StakeProductAction;
  status: StakeProfileValidationStatus;
  tx_signature: string | null;
  source: "webhook" | "manual";
  helius_event_id: string | null;
  created_at: Date;
  validated_at: Date | null;
};
```

## State Machine
```
prepared → submitted → validated | reconcile_pending → validated | rejected | failed
```

## Blockhash Expiry Handling
- `BLOCKHASH_EXPIRED` → status = `failed`, error_code = `BLOCKHASH_EXPIRED`
- Recoverable: UI prompts fresh signature, new attempt created

## Eligibility Requirements
Asset must:
1. Be in BRIDS-tracked collection (persisted in DB)
2. Be currently owned by authenticated wallet
3. Have `FreezeDelegate` with `Owner` authority

## Webhook Reconciliation
- Helius webhook (`/api/webhooks/helius/stake`) observes `freezeAsset` / `thawAsset`
- Canonical RPC revalidation required before profile persistence
- Dedupe by `(provider, eventId)` and `(provider, eventFingerprint)`

## Related
- [Stake Distribution API](../api/endpoints/stake-distribution.md)
- [Stake Service](../lib/stake-service.ts)
- [Helius Webhook](../api/endpoints/webhooks.md)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/database/models/stake-action.md |
