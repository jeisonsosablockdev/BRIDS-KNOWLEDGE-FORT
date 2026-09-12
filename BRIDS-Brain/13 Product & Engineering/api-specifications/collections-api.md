---
title: "Especificación de API: Gestión de Colecciones Metaplex Core"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "API Specifications"
source_okf: "knowledge/api/endpoints/collections.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "569239b00c21bb50fc7bac992e8c866351c18ea714bbaef6043536bbe80daac3"
tags: [api, collections, metaplex-core, endpoints]
updated_at: "2026-09-12T02:07:49.378Z"
---

# Especificación de API: Gestión de Colecciones Metaplex Core

> [!NOTE]
> **Resumen Técnico:** Endpoints para consulta y sincronización de colecciones on-chain, atributos de proyectos y metadatos maestros.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[02 Strategy & Research/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[02 Strategy & Research/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[02 Strategy & Research/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[02 Strategy & Research/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Overview
Admin-only endpoints for managing marketplace collection content with strict ownership verification.

## Ownership Verification
All endpoints use `assertAdminCollectionOwnership(adminId, collectionId)` which verifies:
1. `marketplace_entries.created_by` === authenticated admin wallet
2. Matching `asset_mint_snapshots` evidence exists for same admin

## Endpoints

### Read
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/admin/collections` | GET | admin | List admin's collections |
| `/api/admin/collections/[id]` | GET | admin | Get collection detail with editable content |
| `/api/admin/collections/[id]/location-maps` | GET | admin | Get normalized location/maps section |

### Write
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/admin/collections/[id]` | PATCH | admin | Update one editable section |

#### PATCH Sections
Allowed section discriminators:
- `summary`
- `propertyInformation`
- `gallery`
- `documents`
- `googleMapsPlace`

**Immutable fields rejected**: `image_url`, `imageUrl`, `coverImageUrl`

### Location Maps Helpers
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/admin/collections/[id]/location-maps/autocomplete` | GET | admin | Google Places autocomplete |
| `/api/admin/collections/[id]/location-maps/resolve` | GET | admin | Resolve place to reduced payload |

## Error Codes
| Code | HTTP | Description |
| --- | --- | --- |
| `COLLECTION_NOT_FOUND` | 404 | Marketplace entry doesn't exist |
| `COLLECTION_OWNERSHIP_MISMATCH` | 403 | Admin doesn't own or missing snapshot evidence |
| `COLLECTION_CONTENT_NOT_FOUND` | 404 | Ownership OK but no editable content |
| `INVALID_SECTION` | 400 | Unknown or immutable section |

## Related
- [Marketplace API](marketplace.md) — public read side
- [Admin Assets API](admin-assets.md) — creation/handoff

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/api/endpoints/collections.md |
