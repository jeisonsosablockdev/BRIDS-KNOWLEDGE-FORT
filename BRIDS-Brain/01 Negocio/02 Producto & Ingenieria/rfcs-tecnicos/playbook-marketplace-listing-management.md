---
title: "Playbook Operativo: Gestión y Publicación en Marketplace"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Operations & Runbooks"
source_okf: "knowledge/operations/playbooks/marketplace-listing-management.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "b1c4d075b2a8a9cd32963f39ff3b3f7a690efdab2c6421d7395aa917895a0ae0"
tags: [operations, playbook, marketplace, publishing]
updated_at: "2026-10-06T02:49:08.644Z"
---

# Playbook Operativo: Gestión y Publicación en Marketplace

> [!NOTE]
> **Resumen Técnico:** Checklist operativo para activación comercial y gestión de proyectos inmobiliarios en el catálogo público.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Listing Lifecycle

### States
| State | Description | Transitions |
|-------|-------------|-------------|
| `draft` | Created but not published | → `funding` |
| `funding` | Mint in progress | → `active` \| `draft` |
| `active` | Published, purchasable | → `sold_out` \| `hidden` |
| `sold_out` | Quantity = 0 | → `active` (if restocked) |
| `hidden` | Admin hidden | → `active` |

## Admin Operations

### 1. View Listings
- **Endpoint**: `GET /api/admin/collections`
- **Filters**: status, search, pagination
- **Data**: title, status, quantity, created_at, sync_status

### 2. Edit Listing Content
- **Endpoint**: `PATCH /api/admin/collections/:id`
- **Sections** (one per request):
  - `summary` - title, description
  - `propertyInformation` - project/economics/governance JSON
  - `gallery` - gallery_images array
  - `documents` - documents array
  - `googleMapsPlace` - location_json

### 3. Ownership Verification
Every edit requires:
```
marketplace_entries.created_by === admin_wallet
AND
asset_mint_snapshots.created_by === admin_wallet (matching collection)
```

### 4. Immutable Fields (Rejected)
- `image_url`, `imageUrl`, `coverImageUrl` - set at deploy only
- `collection_address`, `candy_machine_address` - on-chain immutable

## Status Management

### Hide Listing
```json
PATCH /api/admin/collections/:id
{ "section": "summary", "listing_status": "hidden" }
```

### Restock (if applicable)
- Not supported in v1 (fixed quantity per collection)
- Future: new collection + link from old

### Bulk Operations
- Not implemented in v1
- Future: CSV import, bulk status change

## Sync Status
| Sync Status | Meaning |
|-------------|---------|
| `unavailable` | No DAS verification yet |
| `syncing` | DAS reconciliation in progress |
| `synced` | DAS verified, data current |
| `degraded` | Fallback to CM counters |

### Re-sync
- Manual: `POST /api/admin/mint-orchestrator/jobs/:jobId/reconcile/das`
- Auto: After snapshot finalize

## Public Marketplace
- Reads from `marketplace_entries` with `listing_status = active`
- Merges with seed records for demo data
- Images served from Vercel Blob / Pinata

## Common Operations

### Update Price/Economics
1. Edit `economics_json` in `propertyInformation` section
2. Price changes reflect immediately on public marketplace
3. Active purchases use quote cache (5-min TTL)

### Update Gallery/Images
1. Upload new images via Vercel Blob (separate flow)
2. Update `gallery_images` or `property_images` in gallery section
3. Order field controls display order

### Update Location
1. Use Google Maps autocomplete in admin
2. Select place → resolves to `location_json`
3. Generates embed + directions URLs

## Monitoring
- Listing count by status (admin dashboard)
- Sync status health (alert if `degraded` > 1hr)
- Purchase conversion per listing (analytics)

## Related
- [Collections API](../api/endpoints/collections.md)
- [Marketplace API](../api/endpoints/marketplace.md)
- [Marketplace Entry Model](../database/models/marketplace-entry.md)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/operations/playbooks/marketplace-listing-management.md |
