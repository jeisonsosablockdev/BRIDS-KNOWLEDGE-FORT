---
title: "Playbook Operativo: Creación y Alta de Activos Inmobiliarios"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Operations & Runbooks"
source_okf: "knowledge/operations/playbooks/admin-asset-creation.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "17307f080dbcd01c490e71fa5ef9abc0b67d61805b6f4db2bdbc905391b52d02"
tags: [operations, playbook, asset-creation, admin]
updated_at: "2026-10-06T02:49:08.643Z"
---

# Playbook Operativo: Creación y Alta de Activos Inmobiliarios

> [!NOTE]
> **Resumen Técnico:** Guía operativa para originación, carga de metadatos y validación de nuevos activos en la consola administrativa.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Workflow Stages

### Stage 1: Form Completion (`/admin/assets/new`)
- Admin fills all required fields
- Uploads images/documents (Vercel Blob)
- Form validates client + server side
- **Output**: `draftId` + `uploadRefs`

### Stage 2: Deploy & Mint
- Click **Create Asset** → triggers deploy
- **Collection + CM Deploy** (atomic)
- **Config Lines Load** (chunked)
- **Batch Mint** (via orchestrator if qty > 1)
- **Progress UI** shows: preparing → signing → submitting → confirming

### Stage 3: Snapshot Finalization
- Auto-triggered after mint
- **DAS Verification** (primary)
- **Fallback**: CM counters (`degraded`)
- **Retry**: Auto at 15s, then manual button

### Stage 4: Marketplace Handoff
- **Create Asset** button enabled when verified
- Creates `marketplace_entries` with:
  - Form data (project, economics, governance)
  - Verified snapshot reference
  - On-chain proofs
- Promotes uploads: `asset_uploaded_files.promoted_at`

### Stage 5: Collection Editor
- Redirects to `/admin/collections/[id]`
- Bootstrap from `form_snapshot.uploadRefs`
- Admin edits content, saves per section
- Ownership verified on each save

## Error Handling

| Stage | Common Errors | Resolution |
|-------|---------------|------------|
| Form | Validation, upload fail | Fix input, re-upload |
| Deploy | Blockhash, insufficient funds | Fund wallet, retry |
| Config | Serialization overflow | Smaller chunks |
| Mint | Batch failure | Re-submit batch (idempotent) |
| Snapshot | DAS timeout | Auto re-check 15s, then manual |
| Handoff | Snapshot not ready | Wait for verification |

## Status Tracking

### Job States
```
queued → preparing → signing → submitting → confirming → completed|partial|failed
```

### Snapshot States
```
pending → verifying → verified|degraded|failed
```

### Marketplace Entry States
```
draft → funding → active → sold_out → hidden
```

## Monitoring
- Admin dashboard: `/admin` shows recent jobs
- `GET /api/admin/mint-orchestrator/jobs` lists with progress
- Devnet explorer links on all signatures

## Rollback
- No automatic rollback
- Manual: Delete collection (if no mints), re-create
- If mints exist: Mark entry `hidden`, create new

## Related
- [Collection Creation Playbook](collection-creation-minting.md)
- [Mint Orchestrator API](../api/endpoints/mint-orchestrator.md)
- [Admin Assets API](../api/endpoints/admin-assets.md)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/operations/playbooks/admin-asset-creation.md |
