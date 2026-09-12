---
title: "Procedimiento Operativo: Monitoreo de Salud y Disponibilidad"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Operations & Runbooks"
source_okf: "knowledge/operations/procedures/health-checks-monitoring.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "6841137c21391e46a39693c546162f82672653d4f18ba30ba41e604e57097c5c"
tags: [operations, monitoring, health-check, reliability]
updated_at: "2026-09-12T02:07:49.385Z"
---

# Procedimiento Operativo: Monitoreo de Salud y Disponibilidad

> [!NOTE]
> **Resumen Técnico:** Métricas de disponibilidad del nodo RPC, estado de conexiones a bases de datos y endpoints de health check.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Endpoints

### Public Health
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | None | Basic liveness/readiness |
| `/api/health/db` | GET | None | Database connectivity |
| `/api/health/rpc` | GET | None | Solana RPC connectivity |

### Admin Health
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/admin/health` | GET | admin | Full system health |
| `/api/admin/monitoring/analytics` | GET | admin | Analytics pipeline health |
| `/api/admin/monitoring/logs` | GET | admin | Log aggregation health |
| `/api/admin/notifications/health` | GET | admin | Push notification health |

## Standard Checks

### 1. Application Health (`/api/health`)
```bash
curl https://brids.app/api/health
# Expected: { "status": "ok", "timestamp": "ISO8601" }
```

### 2. Database Connectivity
```bash
curl https://brids.app/api/health/db
# Expected: { "status": "ok", "latency_ms": <N>, "pool": { "total": 10, "idle": 8 } }
```

Checks:
- Pool acquisition < 100ms
- Simple query (`SELECT 1`) succeeds
- Migration status: all applied

### 3. Solana RPC Connectivity
```bash
curl https://brids.app/api/health/rpc
# Expected: { "status": "ok", "rpc": "devnet", "slot": <N>, "latency_ms": <N> }
```

Checks:
- `getSlot` succeeds < 500ms
- Slot advancing (not stuck)
- Helius/Alchemy fallback works

### 4. Admin Health Dashboard
```bash
curl -H "Cookie: siws_session=..." https://brids.app/api/admin/health
```

Returns:
```json
{
  "status": "healthy|degraded|down",
  "checks": {
    "database": { "status": "ok", "latency_ms": 5 },
    "rpc": { "status": "ok", "latency_ms": 120 },
    "vercel": { "status": "ok", "deployment": "ready" },
    "webhooks": { "helius": "ok", "stripe": "ok" },
    "migrations": { "status": "current", "pending": 0 }
  }
}
```

## Monitoring Alerts

### Critical Alerts (Page Immediately)
| Alert | Condition | Runbook |
|-------|-----------|---------|
| App Down | `/api/health` 5xx > 1 min | [App Down](../runbooks/incident-app-down.md) |
| DB Unreachable | `/api/health/db` fails > 2 min | [DB Migration Rollback](../runbooks/db-migration-rollback.md) |
| RPC Stuck | Slot not advancing > 5 min | [Solana Deployment](../runbooks/incident-solana-deployment.md) |
| Migration Failed | CI `db:migrate` fails | [DB Migration Rollback](../runbooks/db-migration-rollback.md) |

### Warning Alerts (Notify Within 15 min)
| Alert | Condition |
|-------|-----------|
| High Latency | P99 > 2s for 5 min |
| Error Rate | 5xx > 1% for 5 min |
| Sync Degraded | `sync_status = degraded` > 1 hr |
| Webhook Failures | >5% failure rate 10 min |
| Pool Exhaustion | DB pool idle < 2 for 5 min |

### Info Alerts (Daily Digest)
- Deployment count
- Purchase volume
- Stake/unstake count
- New user registrations
- Error rate trends

## Vercel Monitoring
- **Deployments**: Vercel Dashboard → Project → Deployments
- **Functions**: Logs, duration, errors
- **Edge**: Cold starts, latency
- **Analytics**: Web Vitals (LCP, FID, CLS)

## Solana Devnet Monitoring
- **Slot Height**: Should advance ~400ms/slot
- **RPC Latency**: < 500ms for `getSlot`
- **Program Logs**: Helius enhanced API for program logs
- **DAS Indexing**: `getAssetsByGroup` latency < 2s

## Log Aggregation
- **Application**: Vercel function logs + structured JSON
- **Database**: `pg_stat_activity`, slow query log
- **Webhooks**: Ingestion success/failure rates
- **Purchase Flow**: `purchase_flow_events` per `flow_id`

## Dashboards
- **Grafana** (if configured): System metrics, business metrics
- **Vercel Analytics**: Web Vitals, function performance
- **Custom**: Admin dashboard `/admin/monitoring`

## On-Call Procedures
1. Receive alert → Acknowledge within 5 min
2. Run relevant health checks
3. Follow runbook for alert type
4. Update incident status
5. Post-incident review within 24h

## Related
- [Incident Runbooks](../runbooks/)
- [Admin Monitoring API](../api/endpoints/admin-monitoring.md)
- [Observability](../architecture/observability.md)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/operations/procedures/health-checks-monitoring.md |
