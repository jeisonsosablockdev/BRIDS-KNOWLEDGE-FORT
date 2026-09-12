---
title: "Política de Mantenimiento y Estándares de Toolchain"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Solana Architecture"
source_okf: "knowledge/architecture/toolchain-policy.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "5a6cfe873c41919ef9630bb8fa7bc2b86d427ff3013964ddbf96fdfbd81322f5"
tags: [toolchain, ci-cd, dependencies, standards, engineering]
updated_at: "2026-09-12T02:07:49.365Z"
---

# Política de Mantenimiento y Estándares de Toolchain

> [!NOTE]
> **Resumen Técnico:** Reglas de actualización de dependencias, bloqueo de versiones de Solana Kit/Umi y políticas de calidad de código.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `6a40b30`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[02 Strategy & Research/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[02 Strategy & Research/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[02 Strategy & Research/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[02 Strategy & Research/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Purpose
Establish a predictable and auditable maintenance policy for development tooling in this repository.

## Scope
This policy covers pinned versions and maintenance cadence for:
- Nix dev environment (`flake.nix`, `flake.lock`)
- Node.js and npm toolchain
- Solana CLI and Anchor-related workflow dependencies
- Rust toolchain used by Solana development tasks
- Browser testing toolchain (Playwright and Synpress)

## Source of truth
- Runtime/tooling definitions: `flake.nix`
- Exact resolved versions: `flake.lock`
- Application dependencies: `package.json` + `package-lock.json`

## Rules
1. Tooling versions are pinned and reviewed, not updated ad hoc.
2. No direct toolchain updates on `main` or `develop`.
3. Every toolchain update must be isolated in a dedicated branch and PR.
4. Every toolchain update PR must include rollback instructions.

## Review cadence
- Monthly lightweight review:
  - check critical CVEs
  - check broken CI signals
  - verify that devShell still builds cleanly
- Quarterly deep review:
  - assess planned upgrades
  - run full validation suite
  - re-evaluate compatibility constraints (Solana/Node/Rust)

## Mandatory update triggers
A toolchain update becomes mandatory if any of the following occurs:
1. Critical/high security advisory impacting current pinned tooling.
2. Current pin blocks required project workflows (build, lint, tests, or devnet operations).
3. Upstream Solana ecosystem changes introduce incompatibilities for active roadmap work.

## Controlled update workflow
1. Create branch: `chore/toolchain-<yyyy-mm>`.
2. Update only toolchain files (and related docs).
3. Validate locally:
   - `npm ci`
   - `npm run validate`
   - run E2E suites when update touches browser/test stack
4. Open PR with:
   - motivation
   - impact/risk analysis
   - rollback plan
   - validation evidence

## Rollback policy
If a toolchain update degrades core workflows, revert `flake.lock` and associated toolchain changes immediately, then open a follow-up issue with root-cause analysis.

## Ownership
- Primary owner: Platform/Infra maintainer assigned in PR.
- Secondary owner: one backup reviewer for continuity.

## Minimal acceptance checklist for toolchain PRs
- [ ] Limited scope (toolchain + docs only)
- [ ] `npm run validate` passes
- [ ] Impact notes added to PR
- [ ] Rollback instructions included
- [ ] Reviewer approval from designated owner

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Sincronización e ingesta canónica desde knowledge/architecture/toolchain-policy.md |
