---
title: "Especificación de RPC: Métodos On-Chain de Metaplex Core"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "API Specifications"
source_okf: "knowledge/api/rpc/metaplex-core.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "8c6989886be6a702d474296dc7c79a0a81d3269ef0a7b03362a77f9d99987138"
tags: [rpc, metaplex-core, solana, read-methods]
updated_at: "2026-09-12T02:07:49.382Z"
---

# Especificación de RPC: Métodos On-Chain de Metaplex Core

> [!NOTE]
> **Resumen Técnico:** Detalle de llamadas RPC para lectura directa de assets, plugins, atributos y registros de autoridad en Solana.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Program IDs
| Program | Address |
| --- | --- |
| Metaplex Core | `CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d` |
| Core Candy Machine | `CMACYFENjoBMHzapRXyo1JZkVS6EtaDDzkjMrmQLvr4J` |

## Core Instructions (via UMI)

### Collection
| Instruction | Purpose | Required Signers |
| --- | --- | --- |
| `createCollectionV2` | Create Core collection | payer, collection keypair |
| `updateCollection` | Update collection metadata | updateAuthority |

### Asset
| Instruction | Purpose | Required Signers |
| --- | --- | --- |
| `createV2` | Mint asset into collection | payer, asset keypair, collection |
| `updateV2` | Update asset metadata | updateAuthority |
| `transferV2` | Transfer asset | owner |

### Plugins
| Instruction | Purpose | Required Signers |
| --- | --- | --- |
| `addExternalPluginAdapter` | Attach AppData adapter | updateAuthority |
| `writeExternalPluginAdapterDataV1` | Write AppData payload | updateAuthority |

### Candy Machine
| Instruction | Purpose | Required Signers |
| --- | --- | --- |
| `createCandyMachine` | Create CM with config | payer, CM keypair, collection |
| `loadConfigLines` | Load mint config lines | payer, CM |
| `mintV1` | Mint from CM | payer, buyer, CM, collection |

### Guards
| Guard | Config | Purpose |
| --- | --- | --- |
| `startDate` | `startDate` | Mint not before date |
| `tokenPayment` | `amount`, `mint`, `destinationAta` | USDC payment |
| `solPayment` | `amount`, `destinationAta` | SOL payment (legacy) |
| `thirdPartySigner` | `signer` | Backend co-sign required |

## BRIDS Plugin Usage

### PermanentFreezeDelegate
- Attached at collection creation
- Authority: `SQUADS_FREEZE_AUTHORITY` env
- Enables admin freeze (not user stake)

### PermanentTransferDelegate
- Attached at collection creation
- Authority: `SQUADS_TRANSFER_AUTHORITY` env
- Controls transfer permissions

### FreezeDelegate (Owner)
- Attached per-asset at marketplace mint
- Authority: `Owner` (buyer wallet)
- **Required for Stake/Unstake eligibility**

### AppData (ExternalPluginAdapter)
- Schema: `ExternalPluginAdapterSchema.Json`
- Data Authority: `UpdateAuthority`
- Payload: `AppData v1` economic fields

## Account Structure

### Collection Account
- Owner: `CoREENx...` (Core program)
- Data: name, URI, plugins[], updateAuthority

### Asset Account
- Owner: `CoREENx...`
- Data: name, URI, collection, plugins[]
- No separate metadata PDA (Core stores inline)

### Candy Machine Account
- Owner: `CMACYFEN...`
- Data: config lines, itemsLoaded, itemsRedeemed, guards

## Read Methods (via DAS)
| Query | Purpose |
| --- | --- |
| `getAssetsByGroup` | All assets in collection |
| `getAsset` | Single asset with plugin state |
| `searchAssets` | Filter by plugin/attribute |

## Devnet Verification
All BRIDS deployments on devnet. Verify via:
- `getAccountInfo` → owner = Core program
- `getAssetsByGroup` → assets in collection
- `getParsedTransaction` → instruction logs show plugin attachment

## Related
- [NFT Spec](../architecture/nft-spec.md) — full specification
- [Solana RPC Methods](solana-methods.md) — base RPC
- [Admin Assets API](../endpoints/admin-assets.md) — deploy endpoints

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/api/rpc/metaplex-core.md |
