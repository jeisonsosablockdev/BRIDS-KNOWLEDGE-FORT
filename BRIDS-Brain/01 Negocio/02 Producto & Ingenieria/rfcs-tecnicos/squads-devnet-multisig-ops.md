---
title: "Operaciones Multi-Sig de Squads en Devnet"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Operations & Runbooks"
source_okf: "knowledge/operations/squads-devnet-multisig.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "4fc71167d783ddc05ffd92cb7abcc5b508c505b72cd639f988ef403190a47564"
tags: [operations, squads, multisig, devnet, treasury]
updated_at: "2026-10-06T02:46:34.456Z"
---

# Operaciones Multi-Sig de Squads en Devnet

> [!NOTE]
> **Resumen Técnico:** Configuración operativa, direcciones verificadas y flujo de aprobación de propuestas en la bóveda Squads v4 de devnet.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

Documento canónico de registro y operación del Squad multifirma desplegado en **Solana Devnet** para la administración de gobernanza, resguardo de tesorería y dispersión de recompensas del protocolo **BRIDS**.

---

## 1. Ficha Técnica y Cuentas On-Chain

| Parámetro / Cuenta | Valor / Dirección On-Chain | Enlace de Explorador |
| :--- | :--- | :--- |
| **Nombre del Squad** | `BRIDS Devnet Gov and Treasury` | — |
| **Descripción / Memo** | `Governance, Treasury and rewards distribution for BRIDS project.` | — |
| **Cluster** | `Solana Devnet` (`https://api.devnet.solana.com`) | — |
| **Programa On-Chain** | Squads Protocol v4 (`SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf`) | [Ver Programa](https://explorer.solana.com/address/SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf?cluster=devnet) |
| **Multisig PDA** | `rVKwqnxyq2RuU4sTBdXhifrZB9oY9mGoqw5oA6EHKaD` | [Ver Multisig PDA](https://explorer.solana.com/address/rVKwqnxyq2RuU4sTBdXhifrZB9oY9mGoqw5oA6EHKaD?cluster=devnet) |
| **Vault PDA (Index 0)** | `D9i1XNftRpB68WTYrpCau5fEYYS2eiJa8Q738N5idSXB` | [Ver Vault PDA](https://explorer.solana.com/address/D9i1XNftRpB68WTYrpCau5fEYYS2eiJa8Q738N5idSXB?cluster=devnet) |
| **Create Key** | `AZGhDBuomd6cRf1LZoUNfk4fWn6HpoZjmp8dzZibZK7c` | [Ver Create Key](https://explorer.solana.com/address/AZGhDBuomd6cRf1LZoUNfk4fWn6HpoZjmp8dzZibZK7c?cluster=devnet) |
| **Config Authority** | `null` (Controlado 100% por el propio Multisig) | — |
| **Umbral (*Threshold*)** | **2 de 4 firmas requeridas** ($2/4$) | — |
| **Time Lock** | `0 segundos` (Ejecución inmediata tras alcanzar quórum) | — |
| **Transacción de Despliegue** | `418eESq3jDrz4M7cFKUKoSN1qG9M2Gt22Jqk7RsphnCb2XTmR42ngW1PV9KiSnpTech6Jo9hy2K2LwHeg4YfZVvP` | [Ver Tx en Solana Explorer](https://explorer.solana.com/tx/418eESq3jDrz4M7cFKUKoSN1qG9M2Gt22Jqk7RsphnCb2XTmR42ngW1PV9KiSnpTech6Jo9hy2K2LwHeg4YfZVvP?cluster=devnet) |

---

## 2. Registro de Miembros y Permisos

El Squad cuenta con **4 miembros activos** con permisos completos de propuesta, votación y ejecución (`Permissions.all()` con máscara de bits `7`):

| # | Dirección Solana (Public Key) | Rol / Identificador | Permisos On-Chain |
| :-: | :--- | :--- | :--- |
| **1** | `AdNNTBSMy4yndiSNVmgEBTkJJuXLBrb7PKFWCdEf8Kxi` | Firmante de Gobernanza 1 | `Full (Propose, Vote, Execute)` |
| **2** | `D4gcC27mX7qMqMGaszHdEjMLE3poC4jcpxm5nsGKPpRF` | Firmante de Gobernanza 2 | `Full (Propose, Vote, Execute)` |
| **3** | `DhJ5pUo513rUARqDTy9W7AXaG4ET9ryX78iHxUP4YBgU` | Phantom Wallet (Admin / Operador) | `Full (Propose, Vote, Execute)` |
| **4** | `3tW8Jp3QAMqY2KM27KgddizUyS7rvc7hEsbwCU8siATd` | CLI Wallet (Desarrollo & Automatización) | `Full (Propose, Vote, Execute)` |

---

## 3. Acceso e Interacción

### A. Interfaz Web de Recuperación / Backup (UI)
Para interactuar visualmente con las propuestas, votaciones o ejecuciones:
* **URL:** [https://backup.app.squads.so](https://backup.app.squads.so)
* **Conexión:** Conectar wallet (ej. Phantom en modo Devnet).
* **Multisig Address:** `rVKwqnxyq2RuU4sTBdXhifrZB9oY9mGoqw5oA6EHKaD`
* **Enlace Directo:** `https://backup.app.squads.so/#/multisig/rVKwqnxyq2RuU4sTBdXhifrZB9oY9mGoqw5oA6EHKaD`

---

### B. Integración vía `@solana/kit` Compat (`squads.ts`)

```typescript
import { deriveSquadsPdasFromCreateKey } from '@/lib/solana-kit/compat/squads';

const { squadsMultisigPda, squadsVaultPda } = await deriveSquadsPdasFromCreateKey(
  'AZGhDBuomd6cRf1LZoUNfk4fWn6HpoZjmp8dzZibZK7c',
  0n,
  0
);
// squadsMultisigPda: "rVKwqnxyq2RuU4sTBdXhifrZB9oY9mGoqw5oA6EHKaD"
// squadsVaultPda:    "D9i1XNftRpB68WTYrpCau5fEYYS2eiJa8Q738N5idSXB"
```

---

## 4. Propuesta de Setup e Integración con Programa `payout_settlement`

Para activar la gobernanza de dispersión de fondos sobre el programa [`payout_settlement`](https://explorer.solana.com/address/HLp7YXKZZ8uPuzwN3CtuDxtgYoWhc5Fb1FHj5bHEe9zE?cluster=devnet):

1. **Instrucción CPI:** `payout_settlement::initialize_policy(vault_index=0, attester_a, attester_b, emergency_pause)`.
2. **Firmante Autorizado:** Squads Vault PDA `D9i1XNftRpB68WTYrpCau5fEYYS2eiJa8Q738N5idSXB`.
3. **Cuenta Creada:** `TreasuryPolicy` PDA (`[b"treasury_policy", multisig_pda]`).
4. **Builder de Infraestructura:** [`squads-proposals.ts`](file:///Users/jaymusicmachine/Documents/Desarrollo/brids/apps/web/src/features/staking-distribution/infrastructure/squads-proposals.ts).

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/operations/squads-devnet-multisig.md |
