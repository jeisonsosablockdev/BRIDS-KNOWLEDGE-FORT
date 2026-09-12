---
title: "Especificación de API: Autenticación, Nonce y Sesión"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "API Specifications"
source_okf: "knowledge/api/endpoints/auth.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "bdc4ea1ffd433b4497dd86871111cd1b5d478a04415f71d0d9f3b395d845ee8b"
tags: [api, auth, siws, jwt, endpoints]
updated_at: "2026-09-12T02:07:49.378Z"
---

# Especificación de API: Autenticación, Nonce y Sesión

> [!NOTE]
> **Resumen Técnico:** Endpoints para generación de desafíos SIWS (Sign-In with Solana), intercambio de credenciales WorkOS y refresh de tokens.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Overview
Hybrid authentication: WorkOS AuthKit (account) + Phantom SIWS (wallet).

## Federated Entry (WorkOS)
| Endpoint | Method | Description |
| --- | --- | --- |
| `/sign-in` | GET | Start WorkOS AuthKit redirect |
| `/callback` | GET | Complete WorkOS callback, create/resume BRIDS account |
| `/sign-out` | GET | Clear WorkOS session |

## SIWS Wallet Auth
| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/auth/nonce` | GET | Issue nonce (5-min TTL) + signed `siws_nonce` cookie |
| `/api/auth/verify` | POST | Verify SIWS signature, set `siws_session`, clear nonce |
| `/api/auth/logout` | POST | Revoke `siws_session` |

## Session Introspection
| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/auth/me` | GET | Hybrid auth payload: account/wallet state, `authMethod`, `pubkey`, `role` |

## Wallet Linking (Federated → Wallet)
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/auth/link/wallet/nonce` | GET | WorkOS | Issue wallet-link nonce + server context |
| `/api/auth/link/wallet/verify` | POST | WorkOS | Verify SIWS against link context, link wallet |

## Federated Linking (Wallet → Federated)
| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/auth/link/federated/start` | GET | SIWS | Create pending federated-link context |
| `/auth/link/federated/complete` | GET | WorkOS | Complete federated link |

## Referral
| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/referrals/preview` | GET | Truncated referrer preview for invitee UX |

## Cookies
| Cookie | Purpose | TTL |
| --- | --- | --- |
| `workos_session` | WorkOS AuthKit session | AuthKit default |
| `siws_nonce` | SIWS replay protection | 5 min |
| `siws_session` | BRIDS wallet session | 24 hours |

## Role Resolution
`role` = `admin` if `pubkey` in `ADMIN_WALLETS`, else `user`.

## Protected Route Access
| Route | Required |
| --- | --- |
| `/protected` | WorkOS **or** SIWS |
| `/protected/stake`, `/protected/referrals` | SIWS only |
| `/admin/**` | SIWS + `admin` role |

## Related
- [Session Model](../architecture/session-model.md) — full session lifecycle
- [Auth Flow ADR](../architecture/auth-flow.md) — complete architecture

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/api/endpoints/auth.md |
