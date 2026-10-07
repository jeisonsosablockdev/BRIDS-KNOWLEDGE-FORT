---
title: "Procedimiento Operativo: Reclamos de Tesorería con Squads v4"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Operations & Runbooks"
source_okf: "knowledge/operations/procedures/squads-v4-treasury-claims-operation.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "3b4848aad74f65556a85caffd7adab69720da176beee0095b4a67025cb5497c2"
tags: [operations, squads-v4, treasury-claims, merkle, settlement]
updated_at: "2026-10-06T02:46:34.458Z"
---

# Procedimiento Operativo: Reclamos de Tesorería con Squads v4

> [!NOTE]
> **Resumen Técnico:** Flujo paso a paso para generación de Merkle roots, notarización on-chain y liquidación verificable de reclamos de tesorería.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

Este documento describe la arquitectura de operación, los componentes técnicos, los invariantes de seguridad y el modo de uso paso a paso de los flujos de dispersión de tesorería con Squads v4, reclamos de inversionistas vía Merkle Proof, y gobernanza notarial de fechas on-chain en **BRIDS**.

---

## 1. Arquitectura y Componentes del Sistema

El sistema opera bajo una arquitectura de **4 capas** (Feature-Driven Design) sobre **Solana Devnet**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          CAPA 1: PRESENTATION                            │
│  - Consola de Tesorería (/admin/treasury/squads)                         │
│  - Consola de Distribuciones (/admin/distributions)                      │
│  - Módulo de Inversión y Reclamos (/profile)                             │
└──────────────────────────────────────────────────────────────────────────┘
                                     │
┌──────────────────────────────────────────────────────────────────────────┐
│                   CAPA 2: APPLICATION / CONSUMPTION                      │
│  - Payout Settlement Flow (payout-settlement-flow.ts)                    │
│  - Endpoints de Excepciones: reject, veto, circuit-breaker               │
│  - Endpoint de Gobernanza: date-change-request                           │
└──────────────────────────────────────────────────────────────────────────┘
                                     │
┌──────────────────────────────────────────────────────────────────────────┐
│                   CAPA 3: DOMAIN / PIPELINES / RULES                     │
│  - Merkle Tree Engine (merkle-tree.ts): 191-byte leaf encoding           │
│  - Collection Patch Validator (collection-patch-validator.ts)            │
│  - Claim Fee Policy & Distribution Committee Models                      │
└──────────────────────────────────────────────────────────────────────────┘
                                     │
┌──────────────────────────────────────────────────────────────────────────┐
│                   CAPA 4: INFRASTRUCTURE & SMART CONTRACTS               │
│  - Programa Payout Settlement (payout_settlement)                         │
│  - Programa Notario de Fechas (project_config_notary - 134 bytes)        │
│  - Squads v4 Multisig PDA (rVKwqnxyq2RuU4sTBdXhifrZB9oY9mGoqw5oA6EHKaD)   │
│  - Squads Vault PDA (D9i1XNftRpB68WTYrpCau5fEYYS2eiJa8Q738N5idSXB)       │
│  - Indexador y Réplica Read-Model en Postgres                            │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Parámetros On-Chain Canónicos (Solana Devnet)

* **Cluster:** `Solana Devnet` (`https://api.devnet.solana.com`)
* **Squads v4 Program ID:** `SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf`
* **Multisig PDA:** `rVKwqnxyq2RuU4sTBdXhifrZB9oY9mGoqw5oA6EHKaD`
* **Vault PDA (Index 0):** `D9i1XNftRpB68WTYrpCau5fEYYS2eiJa8Q738N5idSXB`
* **Payout Settlement Program ID:** `HLp7YXKZZ8uPuzwN3CtuDxtgYoWhc5Fb1FHj5bHEe9zE`
* **Project Config Notary Program ID:** `HLp7YXKZZ8uPuzwN3CtuDxtgYoWhc5Fb1FHj5bHEe9zE`
* **Umbral Multifirma (*Threshold*):** **2 de 4 firmas requeridas** ($2/4$)

---

## 3. Flujo Operativo: Ciclo de Vida de una Distribución

### Paso 1: Preparación del Lote (*Draft & Audit*)
1. El motor de cálculo (`distribution-engine.ts`) lee las fechas de operación directamente desde la **PDA Notario on-chain** (`ProjectConfigState`) vía Solana RPC.
2. El sistema calcula las participaciones de staking basándose en los eventos de congelamiento validados y estados de cumplimiento KYC/AML.
3. Se genera un `payout_run` en estado `draft`.

### Paso 2: Generación del Árbol de Merkle
1. Se genera la raíz criptográfica de Merkle codificando cada hoja con 191 bytes canónicos (`[claim_id, recipient, amount, epoch_id, collection]`).
2. Se almacena la raíz de Merkle y se computan las pruebas individuales para cada inversionista elegible.

### Paso 3: Aprobación del Comité y Sellado (*Seal*)
1. Los miembros del comité revisan la propuesta en la Consola de Tesorería.
2. Si se detecta alguna anomalía previa al sellado:
   * **Rechazo total:** `POST /api/admin/payout-runs/[id]/reject` (marca la corrida como `rejected`).
   * **Veto granular:** `POST /api/admin/payout-runs/[id]/veto` (excluye el ítem y recalcula el árbol de Merkle excluyendo el ítem vetado).
3. Una vez verificado, se sella el lote (`seal_run`) registrando la raíz de Merkle on-chain.

### Paso 4: Propuesta y Votación en Squads v4
1. Se crea la propuesta de retiro de fondos en el Squads Vault:
   * `vaultTransactionCreate` con la transferencia del monto total de USDC.
   * `proposalCreate` asociada a la transacción del vault.
2. 2 de los 4 miembros del comité firman la propuesta (`proposalApprove`).
3. Se ejecuta la propuesta en Squads (`proposalExecute`), transfiriendo la asignación delegada al programa de liquidación.

### Paso 5: Reclamo de Inversionistas (*Claim*)
1. El inversionista ingresa a su panel `/profile` o `/rentas`.
2. El frontend solicita su prueba de Merkle al endpoint de reclamos.
3. El usuario firma la transacción de reclamo on-chain:
   * El programa `payout_settlement` verifica la prueba contra la raíz sellada.
   * Transfiere los fondos directamente a la billetera del inversionista.
   * Marca la hoja como reclamada (`claimed = true`) previniendo doble gasto.

---

## 4. Gobernanza Notarial de Fechas On-Chain (`project_config_notary`)

### Invariantes de Seguridad:
* **Inmutabilidad en Base de Datos:** Las fechas de inicio (`start_at`) y fin (`end_at`) de los proyectos no pueden ser editadas mediante la API web estándar (peticiones `PATCH` son bloqueadas con HTTP 400 `IMMUTABLE_PROJECT_DATE_FIELD`).
* **Autoridad Exclusiva:** Solo la **Vault PDA de Squads** (`D9i1XNftRpB68WTYrpCau5fEYYS2eiJa8Q738N5idSXB`) mediante una transacción aprobada por 2 de 4 miembros puede invocar la instrucción `update_project_dates`.
* **Regla Temporal:** Se impone la verificación `start_at <= end_at` a nivel de contrato inteligente en Rust.

### Solicitud de Cambio de Fecha (*Date Change Request*):
1. El administrador ingresa a `/admin/collections/[id]` o a la Consola de Tesorería.
2. Llena el formulario con la fecha propuesta y la justificación.
3. Se envía `POST /api/admin/collections/[id]/date-change-request`.
4. El sistema registra la intención con estado `PENDING_MULTISIG`.
5. Se crea la propuesta en Squads v4 para invocar la instrucción `update_project_dates` del programa notario.
6. Tras la confirmación on-chain (2/4 firmas), el indexador actualiza la réplica de lectura en Postgres marcando `syncStatus: "SYNCHRONIZED"`.

---

## 5. Protocolo de Emergencia (*Circuit Breaker*)

En caso de detectarse un compromiso de seguridad, discrepancia contable o falla de oráculo:
1. El administrador activa el **Freno de Emergencia** en la Consola de Tesorería (`POST /api/admin/payout-runs/[id]/circuit-breaker`).
2. El bot local se detiene de forma instantánea.
3. Se genera un payload de pausa con un TTL de 300 segundos para ejecución rápida on-chain.
4. El comité ejecuta `pause_run` en el contrato, suspendiendo todo reclamo hasta que se audite la situación.

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/operations/procedures/squads-v4-treasury-claims-operation.md |
