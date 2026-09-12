---
title: "Procedimiento Operativo: Ciclo de Vida de Autoridades Devnet"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Operations & Runbooks"
source_okf: "knowledge/operations/procedures/devnet-authority-lifecycle.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "9467250a166dc342fd3726042ba9ee9870bf228b3291f5ce787877237f710697"
tags: [operations, runbook, devnet, authority-lifecycle]
updated_at: "2026-09-12T02:07:49.383Z"
---

# Procedimiento Operativo: Ciclo de Vida de Autoridades Devnet

> [!NOTE]
> **Resumen Técnico:** Protocolo paso a paso para la inicialización, rotación y delegación de autoridades en entornos de prueba devnet.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Overview
Execute and verify on-chain authority rotation/revocation for `transfer_delegate` and `appdata_authority` roles using Squads multisig.

## Prerequisites
- Devnet SOL funded (>1 SOL)
- `SQUADS_TRANSFER_AUTHORITY`, `SQUADS_APPDATA_AUTHORITY` configured
- Squads multisig deployed with known `proposalId` flow
- Admin wallet in `ADMIN_WALLETS`

## Procedure

### 1. Prepare Rotation/Revocation

#### Request Prepare
```bash
POST /api/admin/core-candy-machine/authorities/prepare
{
  "collectionAddress": "<COLLECTION_PUBKEY>",
  "role": "appdata_authority",  # or "transfer_delegate"
  "operation": "rotate",         # or "revoke", "emergency_rotate"
  "newAuthority": "<NEW_PUBKEY>",  # required for rotate/emergency
  "multisig": {
    "proposalId": "unique-proposal-id",
    "proposer": "<PROPOSER_PUBKEY>",
    "executor": "<EXECUTOR_PUBKEY>",
    "approverSigners": ["<SIGNER1>", "<SIGNER2>"],
    "reason": "Authority rotation per governance"
  }
}
```

#### Response
```json
{
  "operationId": "uuid",
  "transactionBase64": "...",
  "authorityVersion": 2,
  "requiredThreshold": 2,
  "cooldownBypassed": false
}
```

### 2. Sign Transaction
- Decode `transactionBase64`
- Sign with appropriate wallet (executor or proposer)
- Use Phantom or CLI: `solana sign-transaction <file>`

### 3. Submit
```bash
POST /api/admin/core-candy-machine/authorities/submit
{
  "operationId": "uuid",
  "signedTransactionBase64": "..."
}
```

### 4. Verify On-Chain
```bash
# Check authority registry
solana account <COLLECTION_ADDRESS> --url devnet | grep -A5 "updateAuthority"

# Or via DAS
curl -X POST https://devnet.helius-rpc.com/?api-key=$HELIUS_API_KEY \
  -d '{"jsonrpc":"2.0","id":1,"method":"getAsset","params":{"id":"<COLLECTION>"}}'
```

### 4. Verify Audit Record
```sql
SELECT * FROM authority_audit_events 
WHERE collection_address = '<COLLECTION>' 
ORDER BY created_at DESC LIMIT 5;
```

Expected: `status = 'submitted'`, `signature` populated, `new_version = old_version + 1`

## Operations Reference

### Rotate (Standard)
- Requires: Regular threshold (default 2)
- Cooldown: 6 hours (configurable)
- New authority takes effect immediately

### Revoke
- Sets authority to sentinel: `11111111111111111111111111111111`
- Requires: Regular threshold
- Cooldown applies

### Emergency Rotate
- Bypasses cooldown
- Requires: Emergency threshold (default 3)
- Use for: Compromised authority, urgent governance

## Verification Checklist
- [ ] Prepare returns valid transaction
- [ ] Signature collected from correct wallet
- [ ] Submit returns `finalized` signature
- [ ] On-chain authority matches new authority
- [ ] `authority_version` incremented by 1
- [ ] Audit event created with `status = submitted`
- [ ] Explorer link works for signature

## Common Issues

| Issue | Resolution |
|-------|------------|
| `403 Authority mismatch` | Ensure signer = `executor` from multisig |
| `400 Cooldown active` | Wait or use `emergency_rotate` |
| `400 Threshold not met` | Need more approver signatures |
| `409 Buffer account` | Clear stale buffer: `solana program close` |
| Webhook not firing | Check `HELIUS_WEBHOOK_SECRET` config |

## Devnet Evidence (Required for Acceptance)
1. Collection address
2. All transaction signatures with explorer links
3. Pre/post authority state (DAS or RPC)
4. Audit event records
5. Multisig proposal IDs

## Related
- [Rotation Spec](../architecture/rotation-spec.md)
- [Authority Model](../architecture/authority-model.md)
- [Mint Orchestrator API](../api/endpoints/mint-orchestrator.md)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/operations/procedures/devnet-authority-lifecycle.md |
