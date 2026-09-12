---
title: "Modelo de Datos: Perfil de Usuario y Estado KYC"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Database Architecture"
source_okf: "knowledge/database/models/user-profile.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "79d3be47f3fdf91a15b1e605d96a028461131d2993330b4a6aa40927da2f4a59"
tags: [database, prisma, user-profile, kyc, postgres]
updated_at: "2026-09-12T02:07:49.374Z"
---

# Modelo de Datos: Perfil de Usuario y Estado KYC

> [!NOTE]
> **Resumen Técnico:** Esquema relacional de usuarios, vinculación con wallet principal, estado de verificación de identidad y preferencias.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[02 Strategy & Research/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[02 Strategy & Research/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[02 Strategy & Research/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[02 Strategy & Research/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Database Tables (Migrations 012, 015, 016, 024, 025)
- `user_profiles`
- `compliance_notes`
- `compliance_audit_events`
- `onboarding_rewards`

## Core Profile Fields
```typescript
type UserProfile = {
  wallet_public_key: string;       // PK, from SIWS
  account_id: string | null;       // FK to WorkOS account (hybrid)
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  country: string | null;
  bio: string | null;
  avatar_url: string | null;
  username: string | null;
  compliance_status: ComplianceStatus;
  compliance_status_updated_at: Date;
  is_suspended: boolean;
  created_at: Date;
  updated_at: Date;
};
```

## Compliance Status
```typescript
type ComplianceStatus = 
  | "unverified" 
  | "pending_kyc" 
  | "pending_review" 
  | "verified" 
  | "restricted_aml" 
  | "suspended";
```

## KYC Fields (Migration 012, 013, 014)
```typescript
type KYCFields = {
  kyc_provider: "stripe" | null;
  kyc_session_id: string | null;
  kyc_report_id: string | null;
  kyc_status: "unverified" | "pending" | "verified" | "rejected";
  kyc_submitted_at: Date | null;
  kyc_verified_at: Date | null;
  aml_screened_at: Date | null;
  aml_status: "clear" | "flagged" | "not_screened";
};
```

## Onboarding Reward (Migration 024)
```typescript
type OnboardingReward = {
  id: string;
  wallet_public_key: string;
  status: RewardStatus;
  amount_usd: number;              // 10 USD (1000 cents)
  amount_usdc_atomic: number;      // USDC atomic units
  initial_registration_at: Date;
  qualification_deadline_at: Date; // +7 days
  kyc_submitted_at: Date | null;
  kyc_review_grace_deadline_at: Date | null; // +72h after KYC verified
  kyc_verified_at: Date | null;
  earned_at: Date | null;
  reserved_at: Date | null;
  consumed_at: Date | null;
  expired_at: Date | null;
};

type RewardStatus = 
  | "pending_profile" 
  | "pending_kyc" 
  | "pending_review" 
  | "earned" 
  | "reserved" 
  | "consumed" 
  | "expired";
```

## Reward Lifecycle
```
pending_profile → pending_kyc → pending_review → earned → reserved → consumed
                            ↘ expired (deadline missed)
                            ↘ pending_review → rejected → expired
```

## Qualification Rules
1. Complete profile (`first_name`, `country`, `email`) within 7 days
2. Submit KYC via Stripe Identity
3. KYC verified → 72h grace for admin review
4. Admin KYC decision → `earned` or `rejected`
5. At checkout: `reserved` → order confirmed → `consumed`

## Hybrid Auth (Migration 025)
- `account_id` links to WorkOS `workos_user_id`
- Federated-only sessions: `wallet_public_key` = null
- Wallet-linked: both `account_id` and `wallet_public_key` present
- Conflicting accounts → fail closed on introspection

## Related
- [Auth API](../api/endpoints/auth.md)
- [Auth Flow](../architecture/auth-flow.md)
- [Onboarding Reward Service](../lib/onboarding-reward-service.ts)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/database/models/user-profile.md |
