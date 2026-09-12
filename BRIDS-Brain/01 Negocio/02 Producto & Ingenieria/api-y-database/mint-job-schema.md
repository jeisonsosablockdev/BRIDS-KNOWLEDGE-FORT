---
title: "Modelo de Datos: Cola de Trabajos de Minteo Asíncrono"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Database Architecture"
source_okf: "knowledge/database/models/mint-job.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "fc91e697b537a0c08fccb3121a77e785cc876ae4c87cb98f724ff9d47e950408"
tags: [database, mint-job, queue, idempotency, postgres]
updated_at: "2026-09-12T02:07:49.375Z"
---

# Modelo de Datos: Cola de Trabajos de Minteo Asíncrono

> [!NOTE]
> **Resumen Técnico:** Esquema de orquestación de minteo, intentos, reintentos exponenciales, idempotencia y hashes de transacciones.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Database Tables (Migration `001_mint_job_idempotency.sql` + later)
- `mint_jobs`
- `mint_job_batches`
- `mint_job_items`
- `mint_item_signatures`
- `webhook_events`

## Type Definitions
From `lib/mint-orchestrator-store.ts`:

### Mint Job
```typescript
export type MintJobStatus = 
  | "queued" 
  | "preparing" 
  | "signing" 
  | "submitting" 
  | "confirming" 
  | "partial" 
  | "completed" 
  | "failed";

export type MintJobRecord = {
  id: string;                    // UUID
  emission_id: string;           // Business identifier
  created_by: string;            // Admin wallet (immutable authority)
  total_items: number;
  status: MintJobStatus;
  current_batch: number;
  created_at: Date;
  updated_at: Date;
};
```

### Mint Job Batch
```typescript
export type MintBatchRecord = {
  id: string;
  job_id: string;
  batch_no: number;
  batch_token: string;           // Deterministic token
  status: "reserved" | "prepared" | "submitted" | "confirming" | "completed" | "partial" | "failed";
  items_count: number;
  idempotency_key: string;       // For next-batch idempotency
  created_at: Date;
  updated_at: Date;
};
```

### Mint Job Item
```typescript
export type MintItemRecord = {
  id: string;
  job_id: string;
  batch_no: number;
  serial_no: number;
  asset_pubkey: string | null;   // Expected address
  status: "pending" | "prepared" | "submitted" | "confirmed" | "failed";
  created_at: Date;
  updated_at: Date;
};
```

### Mint Item Signature
```typescript
export type MintItemSignatureRecord = {
  id: string;
  job_id: string;
  batch_no: number;
  serial_no: number;
  signature: string;             // Base58 transaction signature
  signer_pubkey: string;
  created_at: Date;
};
```

### Webhook Event
```typescript
export type WebhookEventRecord = {
  id: string;
  provider: "helius";
  event_id: string;
  event_fingerprint: string;
  job_id: string | null;
  payload: Record<string, unknown>;
  processed_at: Date;
  created_at: Date;
};
```

## Authority Model (H7)
- **Permanent job authority**: `created_by` wallet is immutable per job
- Manual mutations (`next-batch`, `submit`, `reconcile`) require `actorPubkey === job.created_by`
- Different admin wallet can read but cannot mutate
- Webhook/DAS reconciliation is server-initiated

## Reconciliation
| Method | Endpoint | Description |
| --- | --- | --- |
| RPC | `/reconcile` | Signature status via `getSignatureStatuses` |
| DAS | `/reconcile/das` | Paginated `getAssetsByGroup` by collection |

## State Machine
```
queued → preparing → signing → submitting → confirming → completed | partial | failed
```

## Illegal Transitions (Enforced)
- `completed` → `preparing` (immutable)
- `failed` → `signing` (requires recovery)
- `submitting` → `preparing` (duplicate risk)

## Related
- [Mint Orchestrator API](../api/endpoints/mint-orchestrator.md)
- [Devnet Proof](../architecture/devnet-proof.md)
- [State Machine](../architecture/state-machine.md)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/database/models/mint-job.md |
