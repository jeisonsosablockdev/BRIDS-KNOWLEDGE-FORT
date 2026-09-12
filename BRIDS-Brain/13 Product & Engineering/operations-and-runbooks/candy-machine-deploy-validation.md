---
title: "Procedimiento Operativo: Validación de Despliegues de Candy Machine"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Operations & Runbooks"
source_okf: "knowledge/operations/procedures/candy-machine-deploy-validation.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "2418e06ae98be5d64e1742101f7c396e48bbe9184f86156a44cb7187ff78c4a5"
tags: [operations, checklist, candy-machine, qa-validation]
updated_at: "2026-09-12T02:07:49.384Z"
---

# Procedimiento Operativo: Validación de Despliegues de Candy Machine

> [!NOTE]
> **Resumen Técnico:** Lista de verificación técnica y pruebas de sanidad antes de abrir minteo público en colecciones inmobiliarias.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[02 Strategy & Research/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[02 Strategy & Research/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[02 Strategy & Research/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[02 Strategy & Research/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Overview
Validate that a Core Candy Machine deployment is complete, correct, and ready for minting.

## Validation Steps

### 1. Collection Verification
```bash
# Check collection account
solana account <COLLECTION_ADDRESS> --url devnet

# Verify:
# - Owner: CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d
# - Data: name, URI, updateAuthority = admin wallet
# - Plugins: PermanentFreezeDelegate, PermanentTransferDelegate
```

### 2. Candy Machine Verification
```bash
# Check CM account
solana account <CM_ADDRESS> --url devnet

# Verify:
# - Owner: CMACYFENjoBMHzapRXyo1JZkVS6EtaDDzkjMrmQLvr4J
# - Config: startDate, tokenPayment, thirdPartySigner
# - Counters: itemsLoaded = expected quantity
```

### 3. Config Lines Verification
```bash
# Check config lines loaded
curl -X POST https://devnet.helius-rpc.com/?api-key=$HELIUS_API_KEY \
  -d '{"jsonrpc":"2.0","id":1,"method":"getCandyMachineConfig","params":["<CM_ADDRESS>"]}'

# Verify:
# - Total lines = quantity
# - Each line: name prefix + sequential number
# - URI pattern matches metadata
```

### 4. Guard Verification
```bash
# Verify active guards
curl -X POST https://devnet.helius-rpc.com/?api-key=$HELIUS_API_KEY \
  -d '{"jsonrpc":"2.0","id":1,"method":"getCandyMachineGuards","params":["<CM_ADDRESS>"]}'

# Expected active:
# - startDate (current or future)
# - tokenPayment (USDC mint, correct amount, destination ATA)
# - thirdPartySigner thirdPartySigner (matches PURCHASE_THIRD_PARTY_SIGNER)
```

### 5. Metadata Verification
```bash
# Sample minted asset
curl -X POST https://devnet.helius-rpc.com/?api-key=$HELIUS_API_KEY \
  -d '{"jsonrpc":"2.0","id":1,"method":"getAsset","params":{"id":"<ASSET_MINT>"}}'

# Verify:
# - Collection matches
# - Metadata URI accessible (Pinata/HTTPS)
# - Name follows prefix pattern
# - Attributes include project/economics if set
```

### 6. Mint Test (Optional)
```bash
# Prepare test mint
POST /api/purchase/quote { "quantity": 1 }
POST /api/purchase/challenge { "quantity": 1 }
POST /api/purchase/prepare { "quantity": 1, "challengeSignature": "..." }
# Sign with test wallet
POST /api/purchase/submit { "attemptId", "idempotencyKey", "signedTransactionBase64" }

# Verify:
# - Response: status = confirmed
# - Asset exists in collection
# - Owner = test wallet
# - FreezeDelegate authority = Owner
```

## Automated Validation Script
```bash
# Run full validation
npm run validate:candy-machine -- --collection <COLLECTION> --cm <CM_ADDRESS>

# Or specific iteration
tsx scripts/validate-candy-machine-deploy-iteration.ts \
  --collection <COLLECTION> \
  --cm <CM_ADDRESS> \
  --expected-qty <N>
```

## Acceptance Criteria Checklist

| Check | Required | Method |
|-------|----------|--------|
| Collection exists | ✅ | RPC `getAccountInfo` |
| Collection owner = Core | ✅ | RPC |
| CM exists | ✅ | RPC |
| CM owner = CM Program | ✅ | RPC |
| Config lines = quantity | ✅ | RPC/Helius |
| Guards active (3) | ✅ | RPC/Helius |
| Third-party signer matches | ✅ | RPC/Helius |
| Mint test successful | ✅ | API + RPC |
| FreezeDelegate = Owner | ✅ | DAS/RPC |
| Snapshot verifiable | ✅ | API + DAS |

## Devnet Proof Recording
Record for each deploy:
- Collection address + explorer link
- CM address + explorer link
- All transaction signatures + explorer links
- `itemsLoaded` / `itemsAvailable` counts
- Snapshot verification result

## Related
- [Devnet Proof](../architecture/devnet-proof.md)
- [Mint Orchestrator API](../api/endpoints/mint-orchestrator.md)
- [Admin Assets API](../api/endpoints/admin-assets.md)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/operations/procedures/candy-machine-deploy-validation.md |
