---
title: "Runbook de Incidentes: Alerta de Frescura de Datos e Indexación"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Operations & Runbooks"
source_okf: "knowledge/operations/runbooks/incident-data-freshness-alert.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "ab026f0b2164a6529a2e2bbbb636301641e7b34fd497e30ac6d67a70b520f581"
tags: [operations, runbook, data-freshness, cache]
updated_at: "2026-10-06T02:49:08.645Z"
---

# Runbook de Incidentes: Alerta de Frescura de Datos e Indexación

> [!NOTE]
> **Resumen Técnico:** Acciones correctivas ante desfase de cachés, webhooks retrasados o estado on-chain desactualizado.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Trigger
A freshness alert fires when `orders` lags more than 30 minutes behind its expected SLA.

## Detection
- Alert source: Monitoring system (e.g., Datadog, custom cron)
- Metric: `orders_freshness_minutes` > 30
- Related table: `orders` (last `placed_at` vs `now()`)

## Triage Steps

### 1. Check Ingestion Job Dashboard
- URL: https://example.com/dash (replace with actual)
- Look for: Failed runs, backlog, error rates
- Check: `ingestion_job_status` table for recent failures

### 2. Verify Pipeline Components
| Component | Check |
|-----------|-------|
| Source API | Responding? Rate limited? |
| ETL Worker | Running? Logs show errors? |
| Database | Write latency? Locks? |
| Message Queue | Backlog? Dead letter queue? |

### 3. Check Recent Deployments
- Any schema changes to `orders` table?
- Any ETL code changes in last 24h?
- Rollback if correlated

## Resolution

### If Ingestion Job Failed
1. Check logs for error details
2. Fix root cause (data issue, API change, timeout)
3. Re-run failed batch manually
4. Verify catch-up completes

### If Source API Issues
1. Contact upstream team
2. Implement backoff/retry if not present
3. Alert on-call for upstream dependency

### If Database Performance
1. Check for long-running queries
2. Check index usage on `orders.placed_at`
3. Consider partition maintenance

## Escalation
- **15 min**: No progress → Page on-call engineer
- **30 min**: Still unresolved → Engage team lead
- **60 min**: Business impact → Notify stakeholders

## Post-Incident
- Document root cause in incident tracker
- Add preventive monitoring if missing
- Update runbook if gaps found

## Related
- [Orders Table Schema](../database/models/orders.md)
- [Ingestion Job Monitoring](../architecture/observability.md)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/operations/runbooks/incident-data-freshness-alert.md |
