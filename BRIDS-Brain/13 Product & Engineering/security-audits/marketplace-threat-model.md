---
title: "Modelo de Amenazas del Marketplace Inmobiliario"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Security & Audits"
source_okf: "knowledge/security/threat-models/marketplace.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "53847b9a666e273be2f0a5749ba3d68cf39a41f97c0aefb6dc6ae26511c54eb6"
tags: [threat-model, marketplace, security-audit, risk]
updated_at: "2026-09-12T02:07:49.372Z"
---

# Modelo de Amenazas del Marketplace Inmobiliario

> [!NOTE]
> **Resumen Técnico:** Análisis de vectores de ataque, manipulación de precios, denegación de servicio y mitigaciones en el catálogo público.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[02 Strategy & Research/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[02 Strategy & Research/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[02 Strategy & Research/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[02 Strategy & Research/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Scope
Audited surfaces:
- Public marketplace: `/marketplace`, `/marketplace/[id]`, `/properties`, `/properties/[id]`
- Admin marketplace entry creation: `/api/admin/marketplace/entries`
- Purchase flow: `/api/purchase/quote`, `/api/purchase/challenge`, `/api/purchase/prepare`, `/api/purchase/submit`
- Checkout: `/api/checkout/cart`, `/api/checkout/order`
- Mapbox client shell, markers, fallback behavior
- Google Maps card, document and blockchain links
- Security headers, Next.js config, package dependencies

## Primary Assets
- Authenticated wallet session and SIWS cookie
- Admin-only marketplace creation path
- Property inventory and detail data
- Public marketplace availability
- On-chain purchase preparation and submit integrity
- Third-party API keys and public map tokens
- Solana RPC capacity
- Buyer identity, compliance state, and transaction attempt records

## Primary Attacker Profiles
- Unauthenticated public visitor causing availability pressure
- Authenticated wallet user trying replay, mismatched wallet, quantity, or idempotency abuse
- Compromised or malicious admin payload creating unsafe marketplace content
- Dependency-level attacker exploiting vulnerable framework or parser packages
- Third-party map/provider visibility over route and location usage

## Trust Boundaries
- Browser to public marketplace APIs
- Browser to authenticated purchase APIs
- Admin browser to admin marketplace create API
- Server to Postgres
- Server to Solana RPC
- Server/client to Mapbox and Google Maps
- Persisted marketplace content to React rendering and external links

## Positive Controls Verified
- Admin create requires authenticated admin role and pubkey before payload processing
- Admin create 500 path returns generic message for internal persistence failures
- Public marketplace map falls back to list-only when Mapbox token or pins unavailable
- Map pin projection filters to USA listings and validates coordinate ranges
- Google Maps embed URL generated through query encoding for embed mode
- Purchase challenge requires authenticated wallet
- Purchase prepare requires: authenticated wallet, compliance access, fresh guard snapshot, rate limit, challenge signature, challenge consumption, price-change checks
- Purchase submit requires: authenticated wallet, payer matching, prepared transaction message matching, idempotency lookup, ownership check
- Purchase anti-bot persists rate-limit events and challenges
- SQL read/write paths use parameterized queries
- Security headers configured: `X-Frame-Options`, `frame-ancestors`, `nosniff`, `Permissions-Policy`, COOP, CORP, referrer policy

## Findings Summary

### P1 - Critical Dependency Advisories
| ID | Finding | Component | Impact |
| --- | --- | --- | --- |
| P1-01 | Next.js high advisories (DoS, SSRF, cache poisoning) | `next` ^16.2.4 | Public routes inherit framework exposure |
| P1-02 | `xlsx` high advisories (prototype pollution, ReDoS) | `xlsx` ^0.18.5 | Admin import preview parser exposure |

### P2 - Application Security Gaps
| ID | Finding | Component | Impact |
| --- | --- | --- | --- |
| P2-01 | Public property detail exposes raw 500 messages | `app/properties/[id]/route.ts` | Information disclosure |
| P2-02 | Purchase API unexpected errors expose raw messages | `app/api/purchase/*` | Internal detail leakage |
| P2-03 | Persisted marketplace document URLs rendered without URL policy | Admin route + detail renderer | Unsafe navigation, custom protocol invocation risk |
| P2-04 | Google Maps persisted URL trusted as public link | Location bootstrap + detail card | Unsafe link exposure |
| P2-05 | CSP too permissive for financial marketplace | `lib/security/headers.ts` | Weaker containment |
| P2-06 | Public quote/detail fan out to Solana RPC without rate limits | `quote`, `detail` endpoints | Availability pressure |
| P2-07 | Detail page hard-fails on RPC sync failure | `getMarketplacePropertyDetailOrThrowRpc` | Availability risk |
| P2-08 | Admin marketplace payload lacks strict size/schema limits | Admin create route | Excessive payloads |
| P2-09 | Submit holds DB lock while sending network transaction | `submitPurchase` in `lib/purchase-service.ts` | Lock contention |

### P3 - Hardening & Hygiene
| ID | Finding | Component | Impact |
| --- | --- | --- | --- |
| P3-01 | Health endpoint degraded when `SITE_URL` unset | `/api/health` | Operational readiness |
| P3-02 | Rate-limit event table has no retention policy | `purchase_rate_limit_events` | Privacy/operational hygiene |
| P3-03 | Google Maps iframe referrer policy loose | Detail iframe | Privacy |
| P3-04 | Public marketplace reads all records before filtering | `listMarketplaceProperties` | Scalability risk |
| P3-05 | Mapbox public token correct, private tokens must remain secret | `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Secret management |

## OWASP Top 10 Mapping
| Category | Marketplace Status |
| --- | --- |
| A01 Broken Access Control | Purchase and admin controls good; public URL policy and detail degradation need hardening |
| A02 Cryptographic Failures | No direct crypto bug; SIWS/session and challenge signature flow server-side |
| A03 Injection | No SQL injection in repositories; persisted unsafe URL injection concern |
| A04 Insecure Design | Public RPC fan-out and detail RPC hard-fail are design-level availability risks |
| A05 Security Misconfiguration | CSP broadness and dependency advisories main findings |
| A06 Vulnerable Components | P1 dependency findings in Next.js and `xlsx` |
| A07 Identification/Auth Failures | No direct marketplace auth bypass found |
| A08 Software/Data Integrity | Persisted marketplace payloads need stricter schema and URL integrity policy |
| A09 Logging/Monitoring Failures | Raw public errors should become sanitized logs + generic responses |
| A10 SSRF | Framework-level Next advisory + broad external provider surface |

## API Security Mapping
| Control | Status |
| --- | --- |
| Authentication | Admin create, checkout, challenge, prepare, submit guarded server-side |
| Authorization | Admin create requires `role === "admin"`; purchase binds authenticated wallet |
| Replay Protection | Challenge consumption and idempotency checks exist |
| Rate Limiting | Present for challenge and prepare; missing for quote and public detail sync |
| Input Validation | Present for numeric fields and coordinates; missing strict string length and external URL policy |
| Error Handling | Admin create safe for internal 500; public detail and purchase unexpected errors need generic responses |
| Logging | Purchase flow event logging exists; public detail should add sanitized operability logging |

## Remediation Plan (S44-S60)
Each remediation in dedicated branch, TDD first:
- S45: Patch Next.js security advisories
- S46: Resolve `xlsx` parser risk (replace or isolate)
- S47: Public property detail safe error contract
- S48: Purchase API unexpected error contract
- S49: Shared marketplace external URL policy
- S50: Admin marketplace document URL validation
- S51: Detail document safe renderer
- S52: Google Maps URL and payload hardening
- S53: CSP report-only tightening
- S54: Public quote/detail rate-limit budget
- S55: Detail RPC degradation instead of hard failure
- S56: Admin marketplace payload size schema
- S57: Submit idempotency lock narrowing
- S58: Marketplace read pagination and filter caps
- S59: Rate-limit event retention
- S60: Marketplace security verification pass

## Release Criteria
- P1-01, P1-02 resolved or explicitly waived
- P2-01 through P2-08 resolved before broad public traffic
- P2-09 scheduled before high-volume purchase rollout
- P3 items accepted short-term with explicit owner and date

## Security Acceptance Criteria
- No high/critical production dependency audit findings remain
- Public unauthenticated APIs never return unexpected internal error messages
- Persisted public links allowlisted by scheme and host
- Detail page degrades on Solana RPC issues instead of breaking
- Quote and detail RPC sync paths have explicit public abuse budgets
- CSP staged toward least-privilege provider allowlists
- Purchase replay, payer ownership, prepared message matching, compliance gating, idempotency tests green
- `npm run validate` passes after all remediation

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/security/threat-models/marketplace.md |
