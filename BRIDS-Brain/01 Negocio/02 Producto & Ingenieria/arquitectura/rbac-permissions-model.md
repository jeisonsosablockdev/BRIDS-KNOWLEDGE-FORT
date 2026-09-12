---
title: "Modelo de Control de Acceso Basado en Roles (RBAC)"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Solana Architecture"
source_okf: "knowledge/architecture/rbac.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "9389f966d7a116f8805298a5369d1ee0ef34cc7fed01e237642daadd16cbfbac"
tags: [rbac, permissions, roles, security, compliance]
updated_at: "2026-09-12T02:07:49.366Z"
---

# Modelo de Control de Acceso Basado en Roles (RBAC)

> [!NOTE]
> **Resumen Técnico:** Matriz de permisos para administradores, operadores, sponsors inmobiliarios, compliance officers e inversores.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Scope
- Role model: `user` and `admin`.
- Authentication prerequisite: SIWS server session is required to be considered a user.
- Admin source of truth: `ADMIN_WALLETS` environment variable.

## Role Calculation
1. Validate SIWS session on server and resolve wallet public key.
2. Parse `ADMIN_WALLETS` as comma-separated base58 addresses.
3. Compare wallet key with exact string match (base58).
4. Assign role:
   - Match -> `admin`
   - No match -> `user`

If SIWS session is not valid, request is unauthenticated and no role is assigned.

## Allowlist Format
- Environment variable: `ADMIN_WALLETS`
- Example:
  - `ADMIN_WALLETS=9h2...abc,7Xy...def`
- Parsing rules:
  - split by comma
  - trim whitespace
  - drop empty entries

## Route Enforcement
- Admin route prefix: `/admin/**`
- Proxy gate:
  - unauthenticated -> redirect `/403`
  - authenticated but non-admin -> redirect `/403`
  - authenticated admin -> allow
- Defense in depth:
  - Admin pages re-check role server-side
  - Admin API handlers under `/api/admin/*` re-check role and return `403` JSON

## Route Matrix
| Route | Requirement | Enforcement |
| --- | --- | --- |
| `/protected` | Authenticated SIWS session | Server component redirects to `/` without session |
| `/api/protected/me` | Authenticated SIWS session | Returns `401` when unauthenticated |
| `/admin/**` | `admin` role | Proxy redirect to `/403` + page-level role check |
| `/api/admin/*` | `admin` role | Handler-level role check with `403` JSON |

## Security Notes
- Client state is not trusted for authorization.
- Role is computed server-side per request.
- UI role indicators and menus are presentation only.
- Proxy is not sufficient by itself; handlers/pages must enforce role checks directly.

Last Updated: 2026-03-03 UTC

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/architecture/rbac.md |
