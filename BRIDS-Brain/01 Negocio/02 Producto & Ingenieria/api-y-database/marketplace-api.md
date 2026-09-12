---
title: "Especificación de API: Catálogo Público y Detalle de Inversión"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "API Specifications"
source_okf: "knowledge/api/endpoints/marketplace.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "160e1269c3c20116cf199aa1c37d41a90bdd70035a873201d7b4867038988937"
tags: [api, marketplace, public, investor, endpoints]
updated_at: "2026-09-12T02:07:49.379Z"
---

# Especificación de API: Catálogo Público y Detalle de Inversión

> [!NOTE]
> **Resumen Técnico:** Endpoints públicos para alimentar el explorador de inmuebles, cálculo de retornos y estado de disponibilidad en tiempo real.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Overview
Public read-only endpoints for marketplace discovery. No authentication required.

## Endpoints

### Listings & Collections
| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/marketplace/entries` | GET | List marketplace entries with filters |
| `/api/marketplace/entries/[id]` | GET | Get single property detail |
| `/api/marketplace/collections` | GET | List collections |
| `/api/marketplace/collections/[id]` | GET | Get collection detail |

### Search & Discovery
| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/marketplace/search` | GET | Full-text search with filters |
| `/api/marketplace/featured` | GET | Featured properties for landing |
| `/api/marketplace/map/bounds` | GET | Properties within map viewport |

### Location & Maps
| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/marketplace/[id]/location-maps` | GET | Google Maps embed/outbound URLs |
| `/api/marketplace/[id]/location-maps/autocomplete` | GET | Google Places autocomplete suggestions |
| `/api/marketplace/[id]/location-maps/resolve` | GET | Resolve place to reduced payload |

## Response Format
All endpoints return JSON with standard structure:
```json
{
  "data": {},
  "meta": { "timestamp": "ISO8601" }
}
```

## Rate Limiting
Public endpoints have generous rate limits. See headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`.

## Related
- [Admin Assets API](admin-assets.md) — write/admin side
- [Purchase Flow API](purchase-flow.md) — mint/purchase

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/api/endpoints/marketplace.md |
