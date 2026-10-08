---
title: "Playbook Operativo: Creación y Minteo de Colecciones Core"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Operations & Runbooks"
source_okf: "knowledge/operations/playbooks/collection-creation-minting.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "5e32b81ead697f0408567f6edfb8e66d9faa99f8ac6f48921b11cb16d15a65c6"
tags: [operations, playbook, collection-minting, metaplex-core]
updated_at: "2026-10-06T02:49:08.644Z"
---

# Playbook Operativo: Creación y Minteo de Colecciones Core

> [!NOTE]
> **Resumen Técnico:** Procedimiento para creación de colecciones Metaplex Core, configuración de guards y apertura de minteo.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Overview
This playbook covers the full lifecycle: form → deploy → mint → snapshot → marketplace handoff.

## Step 1: Admin Form (`/admin/assets/new`)

### Required Fields
| Field | Validation |
|-------|------------|
| Collection Name | ≤32 chars (on-chain limit) |
| Symbol | Symbol | ≤10 chars |
 | Description | Markdown supported |
 | Quantity | Positive integer |
 | Price per NFT | USDC atomic units |
 | Cover Image | Required, uploaded to Vercel Blob |
 | Gallery/Property Images | Optional, multiple |
 | Documents | Optional (brochure, legal, financial) |
 | Location | Google Maps place (optional) |

### Project/Economics/Governance (JSON)
- Auto-populated from form, editable in collection editor later

## Step 2: Deploy Collection & Candy Machine

### Actions (in order)
1. **Create Asset** → Prepares collection + CM deploy transactions
2. **Sign** → Phantom signs all transactions
3. **Submit** → Backend broadcasts, verifies on devnet
4. **Load Config** → Chunked config line loading
4. **Mint** → Batch mint via orchestrator (if quantity > 1)

## Step 3: Snapshot Finalization

### Automatic
- After mint completes, UI calls `POST /snapshot/finalize`
- DAS verification runs
- On success: `verificationStatus = verified`

### Manual Re-check
- If DAS not ready: auto re-check at 15s
- Manual button after auto re-check fails
- Reuses same deploy evidence

## Step 4: Marketplace Handoff

### Trigger
- `Create Asset` button enabled only when:
  - `verificationStatus = verified`
  - `mint_jobs.status = completed`

### Data Transferred
- Form snapshot → `marketplace_entries`
- Verified snapshot → `asset_mint_snapshots`
- On-chain proofs → `asset_mint_onchain_proofs`
- Upload refs → `asset_uploaded_files` (promoted)

### Collection Editor Bootstrap
- Gallery/property images from `form_snapshot.uploadRefs`
- Matched to finalized uploads by `fileRefId`
- Raw snapshot URLs as fallback

## Step 5: Collection Editor (`/admin/collections/[id]`)

### Editable Sections
| Section | Fields | Immutable |
|---------|--------|-----------|
| Summary | title, description | - |
| Property Info | project_json, economics_json, governance_json | - |
| Gallery | gallery_images | Cover image |
| Documents | documents | - |
| Location | location_json (Google Maps) | - |

### Ownership Enforcement
- `GET/PATCH /api/admin/collections/:id` require:
  - `marketplace_entries.created_by === admin wallet`
  - Matching `asset_mint_snapshots` evidence

## Verification Checklist
- [ ] Form submitted without errors
- [ ] Collection + CM deployed, verified on devnet
- [ ] Assets minted, signatures finalized
- [ ] Snapshot verified (DAS)
- [ ] Marketplace entry created with `snapshot_id`
- [ ] Collection editor loads with bootstrap data
- [ ] Public marketplace shows listing

## Related
- [Admin Assets API](../api/endpoints/admin-assets.md)
- [Collections API](../api/endpoints/collections.md)
- [Marketplace Entry Model](../database/models/marketplace-entry.md)
- [Mint Job Model](../database/models/mint-job.md)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/operations/playbooks/collection-creation-minting.md |
