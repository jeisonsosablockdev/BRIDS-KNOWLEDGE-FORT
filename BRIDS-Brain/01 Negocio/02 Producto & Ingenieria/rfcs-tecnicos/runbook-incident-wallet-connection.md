---
title: "Runbook de Incidentes: Recuperación de Conexión de Wallet y SIWS"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Operations & Runbooks"
source_okf: "knowledge/operations/runbooks/incident-wallet-connection.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "a4109b87b2f973cc32d4ce3ddc212622622b0c173a3e76519a023e9aed83caac"
tags: [operations, runbook, wallet, siws]
updated_at: "2026-10-06T02:49:08.645Z"
---

# Runbook de Incidentes: Recuperación de Conexión de Wallet y SIWS

> [!NOTE]
> **Resumen Técnico:** Resolución de problemas de firma SIWS, sesiones desincronizadas y adaptadores de billetera.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Trigger
- User reports "Cannot connect wallet"
- SIWS verification fails repeatedly
- Wallet modal shows errors
- `GET /api/auth/me` returns unauthenticated

## Triage Steps

### 1. Check User Context
- Browser: Chrome/Firefox/Safari? Mobile/Desktop?
- Phantom installed? Version?
- Multiple tabs open?

### 2. Verify SIWS Flow
| Step | Expected | Debug |
|------|----------|-------|
| `GET /api/auth/nonce` | 200 + nonce cookie | Check `siws_nonce` cookie set |
| Wallet signs message | Phantom popup opens | Check console for `signMessage` |
| `POST /api/auth/verify` | 200 + `siws_session` cookie | Check response + cookies |

### 3. Common Issues
| Symptom | Cause | Fix |
|---------|-------|-----|
| "Nonce expired" | >5 min between nonce/verify | User must retry |
| "Signature invalid" | Wrong message format | Check SIWS message building |
| "Wallet already connected" | Phantom state stale | Disconnect in Phantom, retry |
| `403` on `/admin/**` | Wallet not in `ADMIN_WALLETS` | Add to env var |

### 4. Phantom-Specific
- **AutoConnect**: Only enabled for `/admin/assets/new`
- **Mobile deep link**: Must preserve `?ref=` param
- **Disconnect**: Clears `siws_session` via `POST /api/auth/logout`

### 5. Server-Side Checks
```bash
# Verify nonce store (in-memory)
curl -H "Cookie: siws_nonce=..." /api/auth/nonce

# Check session validation
curl -H "Cookie: siws_session=..." /api/auth/me
```

## Resolution
1. Clear cookies (`siws_nonce`, `siws_session`, `workos_session`)
2. Disconnect in Phantom extension
3. Hard refresh (Cmd+Shift+R)
4. Retry connection flow

## Escalation
- **5 min**: Single user → Guide through steps
- **15 min**: Multiple users → Check for SIWS code deploy
- **30 min**: Widespread → Rollback auth changes

## Related
- [Auth Flow](../architecture/auth-flow.md)
- [Session Model](../architecture/session-model.md)
- [SIWS Implementation](../lib/siws.ts)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/operations/runbooks/incident-wallet-connection.md |
