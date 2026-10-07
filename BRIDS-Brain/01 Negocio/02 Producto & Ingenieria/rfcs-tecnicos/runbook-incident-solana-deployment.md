---
title: "Runbook de Incidentes: Fallos de Despliegue y Transacciones en Solana"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Operations & Runbooks"
source_okf: "knowledge/operations/runbooks/incident-solana-deployment.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "d3368cc066c34d2ddd5777070d1e5018f99521a0ca3151ce020e223db40892e5"
tags: [operations, runbook, incident-response, solana]
updated_at: "2026-10-06T02:49:08.645Z"
---

# Runbook de Incidentes: Fallos de Despliegue y Transacciones en Solana

> [!NOTE]
> **Resumen Técnico:** Diagnóstico y remediación ante congestión de red, expiración de blockhash o errores de autoridad en Solana.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Trigger
- CI/CD pipeline fails on `anchor deploy`
- Program deployment succeeds but verification fails
- On-chain program behaves unexpectedly after deploy

## Triage Steps

### 1. Check Deployment Logs
```bash
# View recent deploy logs
anchor deploy --provider.cluster devnet --verbose
```

### 2. Verify Program State
```bash
# Check program account
solana program show <PROGRAM_ID> --url devnet

# Check buffer account (if upgrade)
solana account <BUFFER_ACCOUNT> --url devnet
```

### 3. Common Failure Modes
| Error | Cause | Resolution |
|-------|-------|------------|
| `Insufficient funds` | Deploy wallet lacks SOL | Fund wallet (`solana airdrop 2`) |
| `Account in use` | Buffer not cleared | `solana program close <BUFFER> --url devnet` |
| `Program compile failed` | Rust/Anchor version mismatch | Pin toolchain in `flake.nix` |
| `Upgrade authority mismatch` | Wrong upgrade authority | Verify `upgrade_authority` keypair |

### 4. Verification Checklist
- [ ] Program ID matches expected
- [ ] `solana program show` shows correct upgrade authority
- [ ] Test instruction works: `anchor test --skip-local-validator --provider.cluster devnet`
- [ ] Devnet proof recorded (signature + explorer link)

## Resolution

### Failed Deploy
1. Fix compilation/test errors
2. Ensure devnet wallet funded (>2 SOL)
3. Clear any stale buffer accounts
4. Re-run deploy

### Verification Failed
1. Run integration tests against deployed program
2. Check instruction discriminators match
3. Verify PDA derivations correct
4. Confirm account sizes sufficient

## Rollback
If critical bug in deployed program:
```bash
# Deploy previous known-good version
git checkout <last-good-tag>
anchor deploy --provider.cluster devnet
```

## Escalation
- **10 min**: Deploy fails → Page on-call
- **30 min**: Verification fails → Engage Solana engineer
- **60 min**: Production-blocking → Team lead + stakeholders

## Related
- [Devnet Proof](../architecture/devnet-proof.md)
- [Anchor Toolchain Policy](../architecture/toolchain-policy.md)
- [Solana RPC Methods](../api/rpc/solana-methods.md)

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/operations/runbooks/incident-solana-deployment.md |
