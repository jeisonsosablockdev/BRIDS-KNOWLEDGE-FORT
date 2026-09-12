---
title: "Cumplimiento PCI y Seguridad de Pasarelas Fiat"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Security & Audits"
source_okf: "knowledge/security/compliance/pci-compliance.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "5b0649305ed7a820f92c67e2fe091ceda66cdcb2d3dbc55573ff3786397814ca"
tags: [pci-compliance, fiat-ramp, payments, security]
updated_at: "2026-09-12T02:07:49.370Z"
---

# Cumplimiento PCI y Seguridad de Pasarelas Fiat

> [!NOTE]
> **Resumen Técnico:** Blindaje y delimitación de alcance PCI para procesadores de tarjetas de crédito y rampas fiat hacia USDC.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Scope
BRIDS handles payment processing through:
- **Crypto payments** (primary): USDC on Solana devnet via Candy Guard `tokenPayment`
- **Airwallex** (suspended): Card payments via Airwallex PaymentIntents
- **Stripe Identity**: KYC verification (not payment processing)

## Current Status: SAQ A-EP (Partial)

Since crypto payments are processed on-chain (buyer signs transaction, backend co-signs as third-party signer), BRIDS **never handles raw cardholder data**. This significantly reduces PCI scope.

### What BRIDS Does NOT Handle
- ❌ Card numbers (PAN)
- ❌ CVV/CVC
- ❌ Expiration dates
- ❌ Track data
- ❌ PIN/password

### What BRIDS Does Handle (Indirect)
- ✅ Payment intent creation (Airwallex server-to-server)
- ✅ Webhook signature validation (Airwallex, Stripe)
- ✅ Order/payment status reconciliation
- ✅ Onboarding reward discount application

## Crypto Payments (Primary)
- **Method**: USDC on Solana devnet
- **Flow**: Candy Guard `tokenPayment` → buyer signs → backend co-signs as `thirdPartySigner`
- **PCI Impact**: Zero cardholder data touches BRIDS infrastructure
- **Validation**: On-chain guard revalidation in `/api/purchase/prepare`

## Airwallex (Suspended)
- **Method**: Server-to-server PaymentIntents
- **Flow**: Backend creates PaymentIntent → frontend receives `clientSecret` → Airwallex hosted fields → webhook reconciliation
- **PCI Impact**: BRIDS never sees card data; Airwallex is PCI Level 1
- **Status**: `PAYMENT_METHOD_DISABLED` returned for card checkout

## Stripe Identity (KYC Only)
- **Purpose**: Identity verification for compliance
- **Data**: BRIDS stores only `session_id`, `report_id`, status
- **PCI Impact**: No payment data processed

## Compliance Controls Implemented

### Network Security
- All API communication over TLS 1.2+
- HSTS, CSP, HSTS headers configured
- No mixed content

### Access Control
- Admin routes: SIWS + `ADMIN_WALLETS` allowlist
- Purchase APIs: SIWS wallet session required
- Webhooks: HMAC signature validation (Airwallex, Stripe)
- Internal routes: `COMPLIANCE_INTERNAL_TOKEN` or admin SIWS

### Data Protection
- No cardholder data stored
- Secrets in Vercel Encrypted Environment Variables
- Database: Parameterized queries, no raw SQL
- Secrets rotation documented

### Monitoring
- Webhook signature validation failures logged
- Failed payment attempts tracked in `purchase_attempts`
- Health checks for payment endpoints

## Gaps / Future Work
| Gap | Mitigation |
| --- | --- |
| No formal PCI SAQ completed | Document scope reduction via crypto-only |
| Airwallex webhook secret rotation | Add rotation schedule |
| Formal incident response for payment | Document in runbooks |
| Third-party vendor review | Annual review of Airwallex/Stripe compliance |

## Related
- [Payment Integration](../api/endpoints/payment.md)
- [Checkout Flow](../architecture/auth-flow.md#bri-42-checkout-dual-crypto-airwallex-session-notes)
- [Webhooks](../api/endpoints/webhooks.md)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/security/compliance/pci-compliance.md |
