---
title: "Modelo de Datos: Catálogo Inmobiliario y Metadatos de Activos"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Database Architecture"
source_okf: "knowledge/database/models/marketplace-entry.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "2cf82aa2a0bb9237a0a2b903598a3f013b67a34ffaf9b514eb73c4834032443a"
tags: [database, marketplace, assets, rwa, postgres]
updated_at: "2026-09-12T02:07:49.375Z"
---

# Modelo de Datos: Catálogo Inmobiliario y Metadatos de Activos

> [!NOTE]
> **Resumen Técnico:** Esquema de propiedades listadas, proyecciones financieras, rentabilidades estimadas, estados de fondeo y galerías.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Database Table
`marketplace_entries` (migration `006_marketplace_entries.sql`)

## Type Definition
From `lib/marketplace/property-row-mapper.ts`:

```typescript
export type PersistedMarketplaceRow = {
  id: string;
  created_by: string;
  collection_address: string;
  candy_machine_address: string;
  asset_mint_address: string | null;
  listing_status: MarketplaceListingStatus;
  sync_status: MarketplaceSyncStatus;
  snapshot_id: string | null;
  title: string | null;
  description: string | null;
  project_json: ProjectJson | null;
  economics_json: EconomicsJson | null;
  governance_json: GovernanceJson | null;
  location_json: LocationJson | null;
  gallery_images: GalleryImage[] | null;
  property_images: PropertyImage[] | null;
  documents: Document[] | null;
  price_usdc_atomic: number | null;
  price_sol_lamports: number | null;
  quantity_total: number | null;
  quantity_remaining: number | null;
  created_at: Date;
  updated_at: Date;
};
```

## Related Types

### MarketplaceListingStatus
```typescript
type MarketplaceListingStatus = 
  | "draft" 
  | "funding" 
  | "active" 
  | "sold_out" 
  | "hidden";
```

### MarketplaceSyncStatus
```typescript
type MarketplaceSyncStatus = 
  | "unavailable" 
  | "syncing" 
  | "synced" 
  | "degraded";
```

### JSON Structures

#### ProjectJson
```typescript
type ProjectJson = {
  name: string;
  location: string;
  propertyType: "residential" | "commercial" | "mixed";
  totalUnits: number;
  description: string;
};
```

#### EconomicsJson
```typescript
type EconomicsJson = {
  pricePerUnitUsd: number;
  expectedYieldBps: number;
  yieldMode: "linear" | "cap";
  distributionFrequency: "monthly" | "quarterly";
  revenueShareBps: number;
};
```

#### GovernanceJson
```typescript
type GovernanceJson = {
  votingRights: boolean;
  quorumThreshold: number;
  adminWallet: string;
};
```

#### LocationJson
```typescript
type LocationJson = {
  placeId: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  embedUrl: string;
  directionsUrl: string;
};
```

#### GalleryImage / PropertyImage
```typescript
type GalleryImage = {
  url: string;
  caption: string;
  order: number;
};
```

#### Document
```typescript
type Document = {
  url: string;
  name: string;
  category: "brochure" | "legal" | "financial" | "media";
  order: number;
};
```

## Repository Operations
From `lib/marketplace/property-read-repository.ts` and `property-write-repository.ts`:

- `listMarketplaceProperties(filters)` → `PersistedMarketplaceRow[]`
- `getMarketplaceEntryById(id)` → `PersistedMarketplaceRow | null`
- `createMarketplaceEntry(input)` → `PersistedMarketplaceRow`
- `updateMarketplaceEntrySection(id, section, data)` → `PersistedMarketplaceRow`

## Indexes
- `idx_marketplace_entries_created_by` (admin listing)
- `idx_marketplace_entries_collection_address` (collection queries)
- `idx_marketplace_entries_listing_status` (public filtering)

## Related
- [Marketplace API](../api/endpoints/marketplace.md)
- [Collections API](../api/endpoints/collections.md)
- [Admin Assets API](../api/endpoints/admin-assets.md)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/database/models/marketplace-entry.md |
