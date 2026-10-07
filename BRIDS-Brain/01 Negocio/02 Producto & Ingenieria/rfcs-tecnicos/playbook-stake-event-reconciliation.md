---
title: "Playbook Operativo: Reconciliación de Eventos de Staking"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Operations & Runbooks"
source_okf: "knowledge/operations/playbooks/stake-event-reconciliation.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "9b41283fc5d6cbc868365e0759647b0ccbfa2d83f70bfc89490e55c201aef40b"
tags: [operations, playbook, staking, reconciliation]
updated_at: "2026-10-06T02:49:08.644Z"
---

# Playbook Operativo: Reconciliación de Eventos de Staking

> [!NOTE]
> **Resumen Técnico:** Protocolo operativo para verificar consistencia entre eventos de staking on-chain y registros contables.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Overview
Reconcile stake/unstake actions from Helius webhooks with canonical RPC verification before updating user profile history.

## Normal Flow (Automated)

### 1. Webhook Received
- Endpoint: `POST /api/webhooks/helius/stake`
- Validates: Optional `HELIUS_WEBHOOK_SECRET`
- Parses: `freezeAsset` / `thawAsset` instructions

### 2. Deduplication
- Key: `(provider, eventId)` and `(provider, eventFingerprint)`
- In-memory store prevents duplicate processing

### 3. Canonical Verification
```typescript
// For each candidate event:
const tx = await connection.getParsedTransaction(signature, { commitment: 'confirmed' });
assert(tx.meta.err === null);
assert(tx.slot > lastKnownSlot);
```

### 4. Profile Update
- Update `stake_profile_events` with `validated` status
- Update `user_profiles` derived stake state
- Emit metrics

## Manual Reconciliation (When Automated Fails)

### Trigger
- Webhook delivery failed (Helius retry exhausted)
- Webhook signature validation failed
- RPC verification timeout
- Manual audit discrepancy

### Procedure

#### 1. Identify Missing Events
```sql
-- Find stake attempts without webhook confirmation
SELECT * FROM stake_action_attempts 
WHERE status IN ('submitted', 'reconcile_pending') 
AND submitted_at < NOW() - INTERVAL '1 hour';
```

#### 2. Fetch Signatures from Helius API
```bash
# Use Helius enhanced API
curl "https://devnet.helius-rpc.com/?api-key=$HELIUS_API_KEY" \
  -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getSignaturesForAsset","params":["<ASSET_MINT>"]}'
```

#### 3. Verify Each Signature
```typescript
for (const sig of signatures) {
  const tx = await connection.getParsedTransaction(sig, { commitment: 'finalized' });
  if (tx.meta.err === null && isStakeInstruction(tx)) {
    await reconcileStakeEvent(sig, tx);
  }
}
```

#### 4. Update Records
- Set `stake_action_attempts.status = 'validated'`
- Insert into `stake_profile_events` with `source: 'manual'`
- Update `user_profiles` stake counts

## Blockhash Expiry Recovery

### User-Facing
1. User sees "Blockhash expired" error
2. UI prompts: "Sign fresh transaction"
3. New attempt created, old marked `failed`

### Backend
- Old attempt: `status = 'failed'`, `error_code = 'BLOCKHASH_EXPIRED'`
- New attempt: `status = 'prepared'` → user signs → `submitted`

## Monitoring & Alerts
- Alert if `reconcile_pending` > 10 for >15 min
- Alert if webhook failure rate > 5%
- Daily reconciliation report: `npm run stake:reconcile:report`

## Related
- [Stake Distribution API](../api/endpoints/stake-distribution.md)
- [Stake Action Model](../database/models/stake-action.md)
- [Helius Webhook](../api/endpoints/webhooks.md)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/operations/playbooks/stake-event-reconciliation.md |
