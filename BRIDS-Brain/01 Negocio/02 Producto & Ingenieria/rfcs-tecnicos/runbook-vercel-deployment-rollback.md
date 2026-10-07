---
title: "Runbook de Incidentes: Rollback de Despliegues en Vercel"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Operations & Runbooks"
source_okf: "knowledge/operations/runbooks/vercel-deployment-rollback.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "9723900a0655a86887c2e1aca714ed887b7113adcdcbe85812f64899062d26f3"
tags: [operations, runbook, vercel, rollback]
updated_at: "2026-10-06T02:46:34.466Z"
---

# Runbook de Incidentes: Rollback de Despliegues en Vercel

> [!NOTE]
> **Resumen Técnico:** Protocolo rápido de reversión de releases en producción y verificación de variables de entorno.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Trigger
- New deployment causes errors (500s, build failures, runtime errors)
- Performance regression detected
- Feature flag not working as expected

## Quick Rollback (Vercel Dashboard)

### 1. Via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → Project → Deployments
2. Find last working deployment (green checkmark)
3. Click `...` → **Promote to Production**
4. Confirm promotion

### 2. Via Vercel CLI
```bash
# List recent deployments
vercel list --token=$VERCEL_TOKEN

# Promote specific deployment
vercel promote <deployment-url> --token=$VERCEL_TOKEN --scope=<team>
```

## Git-Based Rollback (If Needed)

### 1. Revert Commit
```bash
# Find bad commit
git log --oneline -10

# Revert (creates new commit)
git revert <bad-commit-hash>

# Push to trigger new deployment
git push origin develop
```

### 2. Force Push (Emergency Only)
```bash
# DANGEROUS: Rewrites history
git push origin develop --force-with-lease
```

## Verification Checklist
- [ ] Production URL loads without 500s
- [ ] Key user flows work (auth, purchase, admin)
- [ ] No console errors in browser
- [ ] API endpoints respond correctly
- [ ] Database migrations applied (if any)

## Rollback Decision Matrix

| Scenario | Action |
|----------|--------|
| Build fails | Fix build, redeploy (no rollback needed) |
| Runtime errors in new code | Promote previous deployment |
| Performance regression | Promote previous deployment |
| Database migration issue | Rollback migration + promote previous |
| Security vulnerability | Immediate rollback + hotfix |

## Post-Rollback
1. Create incident ticket with root cause
2. Add failing test case
3. Schedule fix deployment
4. Update feature flags if used

## Related
- [Vercel Documentation](https://vercel.com/docs)
- [Git Monorepo Policy](../governance/git-monorepo-policy.md)
- [Release Tagging](../governance/git-monorepo-policy.md#release-tagging-rule)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/operations/runbooks/vercel-deployment-rollback.md |
