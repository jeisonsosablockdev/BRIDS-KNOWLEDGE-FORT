---
title: "Runbook de Incidentes: Rollback de Migraciones de Base de Datos"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Operations & Runbooks"
source_okf: "knowledge/operations/runbooks/db-migration-rollback.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "acdbea2c4ed4db951d6deaf9db2896c7507112ca69342f30e9555999b0459c49"
tags: [operations, runbook, database, rollback]
updated_at: "2026-10-06T02:46:34.465Z"
---

# Runbook de Incidentes: Rollback de Migraciones de Base de Datos

> [!NOTE]
> **Resumen Técnico:** Procedimiento de emergencia para revertir migraciones fallidas en PostgreSQL/Prisma sin pérdida de datos.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Trigger
- Migration fails in CI/CD
- Migration succeeds but causes application errors
- Schema change breaks existing functionality

## Pre-Rollback Checks

### 1. Identify Failed Migration
```bash
# Check migration status
npm run db:migrate:status

# Or query directly
psql $DATABASE_URL -c "SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 5;"
```

### 2. Assess Impact
- Is data loss possible? (DROP COLUMN, DROP TABLE)
- Are there dependent objects? (views, functions, foreign keys)
- Can application tolerate rollback downtime?

### 3. Backup (if possible)
```bash
# Quick schema-only backup
pg_dump --schema-only $DATABASE_URL > rollback-backup-$(date +%s).sql
```

## Rollback Procedure

### Option A: Down Migration (Preferred)
If migration has `DOWN` script:
```bash
# Rollback specific migration
npm run db:migrate:down -- --to <previous_version>

# Or using raw SQL
psql $DATABASE_URL -f db/migrations/<version>_<name>.down.sql
```

### Option B: Manual Revert
If no `DOWN` script:
1. Create reversal migration:
   ```bash
   # Create new migration file
   db/migrations/$(date +%s)_rollback_<name>.sql
   ```
2. Write inverse operations (ADD COLUMN, CREATE INDEX, etc.)
3. Apply: `npm run db:migrate`

### Option C: Point-in-Time Recovery (Emergency)
If data corruption:
```bash
# Restore from PITR (if using managed PG)
# Or restore from latest backup
pg_restore -d $DATABASE_URL backup.dump
```

## Post-Rollback
1. Verify schema: `npm run db:migrate:status`
2. Run application tests: `npm test`
3. Check application logs for errors
4. Update migration tracking table if manual

## Prevention
- Always write `DOWN` migrations
- Test migrations on staging first
- Use `npm run validate:db` in CI
- Keep migrations small and reversible

## Related
- [Database Migrations](../database/index.md)
- [Migration Tooling](../scripts/db-migrate.js)
- [Validate DB](../scripts/db-validate.js)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/operations/runbooks/db-migration-rollback.md |
