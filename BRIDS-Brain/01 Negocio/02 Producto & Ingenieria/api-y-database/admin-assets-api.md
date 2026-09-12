---
title: "Especificación de API: Administración de Activos Inmobiliarios"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "API Specifications"
source_okf: "knowledge/api/endpoints/admin-assets.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "ca974c8445f68ef03d0f0535de07914a17e281b4921578810576eb7f2531eed2"
tags: [api, admin, assets, rest, endpoints]
updated_at: "2026-09-12T02:07:49.377Z"
---

# Especificación de API: Administración de Activos Inmobiliarios

> [!NOTE]
> **Resumen Técnico:** Endpoints REST para creación, edición, carga de documentación y publicación de propiedades en el marketplace.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Overview
Endpoints for admin-driven asset creation, upload management, and marketplace publishing.

## Endpoints

### Asset Creation & Deploy
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/admin/metaplex-core/prepare` | POST | admin | Prepare Core Candy Machine deploy transaction |
| `/api/admin/metaplex-core/submit` | POST | admin | Submit signed deploy transaction |
| `/api/admin/core-candy-machine/deploy/prepare` | POST | admin | Prepare Core Candy Machine deployment |
| `/api/admin/core-candy-machine/metadata` | POST | admin | Generate/upload metadata to Pinata |
| `/api/admin/core-candy-machine/snapshot/finalize` | POST | admin | Finalize mint snapshot with DAS verification |

### Upload Management
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/admin/assets/uploads/signed-url` | POST | admin | Get signed upload URL for Vercel Blob |
| `/api/admin/assets/uploads/client-upload` | POST | admin | Client direct upload handler |
| `/api/admin/assets/uploads/[uploadId]/finalize` | POST | admin | Finalize upload after client upload |
| `/api/admin/assets/uploads/orphan-reconciler` | POST | admin | Clean up abandoned uploads |

### Edit Session Lifecycle
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/admin/assets/uploads/edit-session/promote` | POST | admin | Promote session uploads to permanent |
| `/api/admin/assets/uploads/edit-session/cancel` | POST | admin | Cancel and mark session uploads for cleanup |

### Marketplace Handoff
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/admin/marketplace/entries` | POST | admin | Create marketplace entry from deployed asset |

### Import & Preview
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/admin/assets/import-preview` | POST | admin | Preview CSV/JSON import |
| `/api/admin/assets/import-jobs` | POST | admin | Create bulk import job |
| `/api/admin/assets/import-jobs/[id]` | GET | admin | Get import job status |
| `/api/admin/assets/import-jobs/[id]/errors` | GET | admin | Get import errors |
| `/api/admin/assets/import-jobs/process` | POST | admin | Process import job |

## Authentication
All endpoints require valid SIWS session with `admin` role (wallet in `ADMIN_WALLETS`).

## Related
- [Marketplace API](../endpoints/marketplace.md)
- [Collections API](../endpoints/collections.md)
- [Mint Orchestrator API](../endpoints/mint-orchestrator.md)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/api/endpoints/admin-assets.md |
