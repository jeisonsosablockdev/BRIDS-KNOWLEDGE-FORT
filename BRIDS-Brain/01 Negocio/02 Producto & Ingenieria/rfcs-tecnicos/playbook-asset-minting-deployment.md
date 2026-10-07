---
title: "Playbook Operativo: Despliegue y Minteo de Activos On-Chain"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Operations & Runbooks"
source_okf: "knowledge/operations/playbooks/asset-minting-deployment.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "8cdb2e94c2b352ec6b8c5e4c528d1f56dd8784bff60bc7ec34dc1579efc13b4f"
tags: [operations, playbook, asset-minting, solana]
updated_at: "2026-10-06T02:49:08.643Z"
---

# Playbook Operativo: Despliegue y Minteo de Activos On-Chain

> [!NOTE]
> **Resumen Técnico:** Procedimiento operativo para despliegue de activos individuales, validación de metadatos y emisión en Solana.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Prerequisites
- Admin wallet in `ADMIN_WALLETS` env
- Devnet SOL funded (>2 SOL for deploy)
- `SQUADS_FREEZE_AUTHORITY`, `SQUADS_TRANSFER_AUTHORITY` configured
- `PURCHASE_THIRD_PARTY_SIGNER_SECRET_KEY` configured
- Pinata JWT configured (optional, for metadata)

## Phase 1: Collection Creation

### 1. Prepare Deploy
- Admin completes `/admin/assets/new` form
- Form validates: name, symbol, description, quantity, price
- Click **Create Asset** → triggers `POST /api/admin/core-candy-machine/deploy/prepare`

### 2. Sign Transaction
- Frontend prompts Phantom to sign
- Returns signed transaction to backend

### 3. Submit & Verify
- `POST /api/admin/core-candy-machine/submit`
- Backend broadcasts, waits for `finalized`
- Verifies on-chain: program = `CoREENx...`, authority = admin

## Phase 2: Candy Machine Creation

### 1. Prepare CM
- Config: `startDate`, `tokenPayment` (USDC), `thirdPartySigner`
- `POST /api/admin/core-candy-machine/mint/prepare`

### 2. Load Config Lines
- Chunked loading (adaptive sizing)
- Each chunk signed + submitted
- Progress tracked in UI

### 3. Verify CM
- `getAccountInfo` → owner = `CMACYFEN...`
- Config lines loaded = quantity
- Guards active: `startDate`, `tokenPayment`, `thirdPartySigner`

## Phase 3: Batch Mint (Admin Orchestrator)

### 1. Create Mint Job
- `POST /api/admin/mint-orchestrator/jobs` with `emission_id`
- Returns `job_id`

### 2. Request Batches
- `POST /api/admin/mint-orchestrator/jobs/:jobId/next-batch`
- Returns batch items with `asset_pubkey` + transaction

### 3. Sign Batch
- Frontend: `signAllTransactions` (or sequential)
- Collect signatures per item

### 4. Submit Signatures
- `POST /api/admin/mint-orchestrator/jobs/:jobId/batches/:batchNo/submit`
- Enforces `createdBy` authority (H7)

### 5. Reconcile
- RPC: `POST /reconcile` (signature status)
- DAS: `POST /reconcile/das` (paginated `getAssetsByGroup`)

## Phase 4: Snapshot Finalization

### 1. Finalize Snapshot
- `POST /api/admin/core-candy-machine/snapshot/finalize`
- DAS verification: `getAssetsByGroup` by collection
- Persists: `asset_mint_snapshots` + `asset_mint_onchain_proofs`

### 2. Create Asset Gate
- Enabled only when: `verificationStatus=verified` AND `status=completed`
- Creates `marketplace_entries` row with `snapshot_id`

## Devnet Verification Checklist
- [ ] Collection account exists, owned by Core program
- [ ] Candy Machine account exists, owned by CM program
- [ ] Config lines loaded = expected quantity
- [ ] Mint signatures `finalized` on devnet
- [ ] DAS reconciliation matches expected count
- [ ] Snapshot `verificationStatus = verified`
- [ ] Explorer links recorded for all signatures

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `Blockhash expired` | Re-request batch, re-sign, re-submit |
| `Insufficient funds` | Fund admin wallet (`solana airdrop 2`) |
| `Config line overflow` | Reduce chunk size, retry |
| `DAS reconciliation incomplete` | Increase `maxPages`, re-run DAS reconcile |
| `Snapshot verification degraded` | Fallback to CM counters, manual review |

## Related
- [Mint Orchestrator API](../api/endpoints/mint-orchestrator.md)
- [Mint Job Model](../database/models/mint-job.md)
- [Devnet Proof](../architecture/devnet-proof.md)
- [NFT Spec](../architecture/nft-spec.md)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/operations/playbooks/asset-minting-deployment.md |
