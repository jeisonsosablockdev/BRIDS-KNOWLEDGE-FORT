---
title: "Playbook Operativo: Reclamos de Tesorería y Gobernanza del PDA Notario"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Operations & Runbooks"
source_okf: "knowledge/operations/playbooks/treasury-claims-and-notary-governance.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "4524e239f692b79e3531a6b2cbedd5643759bff65b51f556ae5c5cbeab7a39d8"
tags: [operations, playbook, treasury-claims, notary-pda]
updated_at: "2026-10-06T02:49:08.644Z"
---

# Playbook Operativo: Reclamos de Tesorería y Gobernanza del PDA Notario

> [!NOTE]
> **Resumen Técnico:** Guía de ejecución para operadores de tesorería sobre publicación de raíces Merkle y gobernanza con PDA Notario.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

Este playbook proporciona instrucciones prácticas y concisas para que los administradores y operadores del protocolo **BRIDS** gestionen lotes de pago, excepciones, cambios de fechas de proyectos y emergencias.

---

## 1. Gestión de Lotes de Distribución

### A. Revisar Propuesta de Distribución en UI
1. Navega a **`/admin/treasury/squads`** o **`/admin/distributions`**.
2. Verifica los balances:
   * **Total USDC balance**: Saldo total resguardado en el Vault.
   * **Committed funds**: Fondos asignados al lote activo.
   * **Available funds**: Fondos líquidos disponibles.
3. Inspecciona la tabla de destinatarios y montos.

### B. Aplicar Veto a un Ítem Anómalo (Pre-Sellado)
Si una billetera no califica o tiene un reporte de riesgo:
1. En la tabla de ítems del lote en estado `draft`, localiza el `Item ID`.
2. Haz clic en el botón **`Veto`** (o ejecuta vía API):
   ```bash
   curl -X POST https://brids.app/api/admin/payout-runs/{RUN_ID}/veto \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <ADMIN_SESSION_TOKEN>" \
     -d '{"itemId": "item-001", "reason": "Sancion AML detectada post-calculo"}'
   ```
3. El ítem pasará a estado `vetoed` y el árbol de Merkle se recalculará automáticamente excluyendo sus fondos.

### C. Rechazar un Lote Completo
Si el lote completo presenta inconsistencias:
1. Haz clic en **`Reject Proposal`** en la Consola de Tesorería.
2. O invoca:
   ```bash
   curl -X POST https://brids.app/api/admin/payout-runs/{RUN_ID}/reject \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <ADMIN_SESSION_TOKEN>" \
     -d '{"reason": "Discrepancia en snapshot de staking"}'
   ```
3. El lote pasará a estado `rejected` y no podrá ser sellado ni ejecutado.

---

## 2. Gobernanza de Fechas de Proyectos (`project_config_notary`)

### A. Solicitar Cambio de Fechas
Las fechas de inicio y fin de operación de un activo inmobiliario solo se pueden actualizar on-chain mediante el Squad multifirma.

1. En la Consola de Tesorería o en el panel de la colección, usa el formulario de solicitud:
   ```bash
   curl -X POST https://brids.app/api/admin/collections/{COLLECTION_ID}/date-change-request \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <ADMIN_SESSION_TOKEN>" \
     -d '{
       "proposedStartAt": "2026-06-01T00:00:00Z",
       "proposedEndAt": "2027-06-01T00:00:00Z",
       "justification": "Retraso de 60 dias en la entrega de la obra certificado por la constructora"
     }'
   ```
2. La solicitud queda en estado `PENDING_MULTISIG`.

### B. Votar y Ejecutar la Propuesta en Squads v4
1. Los miembros del comité ingresan a [https://backup.app.squads.so](https://backup.app.squads.so/#/multisig/rVKwqnxyq2RuU4sTBdXhifrZB9oY9mGoqw5oA6EHKaD).
2. Revisan la propuesta de invocación a la instrucción `update_project_dates` del programa notario (`HLp7YXKZZ8uPuzwN3CtuDxtgYoWhc5Fb1FHj5bHEe9zE`).
3. 2 de los 4 firmantes aprueban la transacción (`Approve`).
4. Se ejecuta la transacción (`Execute`).
5. El indexador en segundo plano sincroniza Postgres automáticamente con la firma y el slot de confirmación.

---

## 3. Protocolo ante Emergencias (*Circuit Breaker*)

### A. Activación Inmediata
Si se detecta un exploit o falla crítica:
1. En la Consola de Tesorería, haz clic en **`Emergency Pause`**.
2. O invoca el endpoint:
   ```bash
   curl -X POST https://brids.app/api/admin/payout-runs/{RUN_ID}/circuit-breaker \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <ADMIN_SESSION_TOKEN>" \
     -d '{"reason": "Alerta de seguridad - oraculo comprometido"}'
   ```
3. Esto detiene inmediatamente el bot local y prepara el payload de pausa on-chain con un TTL de 300 segundos.

---

## 4. Matriz de Errores Comunes y Solución

| Código de Error | Causa Raíz | Acción Correctiva |
| :--- | :--- | :--- |
| `IMMUTABLE_PROJECT_DATE_FIELD` | Se intentó modificar fechas de proyecto vía `PATCH /api/admin/collections/[id]`. | Utilizar el flujo notarial de `date-change-request` para procesar el cambio vía Squads. |
| `ERR_NOTARY_PDA_FETCH_FAILED` | El motor de cálculo no pudo leer la PDA on-chain del RPC. | Verificar conectividad con Solana Devnet RPC y que la colección haya sido inicializada con `initialize_project_config`. |
| `ERR_CANNOT_VETO_SEALED_RUN` | Se intentó vetar un ítem en un lote que ya fue sellado (`sealed`). | Si el lote ya fue sellado, utilizar el freno de emergencia (`Emergency Pause`) o rechazar la propuesta en Squads. |
| `ERR_INVALID_DATE_RANGE` | `proposedEndAt` es anterior o igual a `proposedStartAt`. | Ajustar las fechas de manera que la fecha de fin sea estrictamente posterior a la de inicio. |

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/operations/playbooks/treasury-claims-and-notary-governance.md |
