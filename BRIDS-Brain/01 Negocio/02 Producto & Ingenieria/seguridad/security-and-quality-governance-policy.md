---
title: "Política Institucional de Seguridad y Calidad de Software"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Security & Audits"
source_okf: "knowledge/governance/security-quality-policy.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "4c9e0511de4a7a12674b7562d086218f6aa4439906c6b9bcf907890f3dd1502f"
tags: [security-policy, quality-assurance, governance, compliance]
updated_at: "2026-10-06T02:46:34.434Z"
---

# Política Institucional de Seguridad y Calidad de Software

> [!NOTE]
> **Resumen Técnico:** Estándares obligatorios de revisión de código, pruebas automatizadas, controles criptográficos y gates de despliegue.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

🔴 SECURITY + QUALITY POLICY

⸻

🔴 SECURITY PACK (MANDATORY BEFORE DEPLOY)

Run ALL:
	•	security-audit
	•	security-auditor
	•	threat-modeling-expert
	•	threat-mitigation-mapping
	•	security-scanning-security-sast
	•	security-scanning-security-hardening
	•	security-scanning-security-dependencies
	•	top-web-vulnerabilities
	•	production-code-audit

⸻

🧪 STORY-LEVEL UNIT TEST GATES (MANDATORY)

For every story:
	•	Start with unit tests first (TDD RED) before implementation code.
	•	Keep unit tests updated as acceptance criteria evolve.
	•	Before marking the story complete, run and pass unit tests.
	•	Before commit/PR, run full quality gate (`npm test` + `npm run validate`, or equivalent stack commands).

If tests are missing or failing → story is incomplete.

⸻

🗃 DATABASE SCHEMA CHANGE GATE (MANDATORY)

Applies when changes affect:
	•	`/db/migrations`
	•	`/lib/db`
	•	DB-backed repositories, persistence adapters, or SQL assumptions

Rules:
	•	Tracked SQL migrations must exist before DB-backed schema changes are considered complete.
	•	Local development must not depend on remembering manual migration runs; the canonical dev flow must apply tracked migrations automatically when `DATABASE_URL` is configured.
	•	`npm run validate` must include DB migration validation.
	•	PR CI must exercise migration application against a clean Postgres instance.
	•	If tracked migrations are pending on the target database, task completion is blocked until `npm run db:migrate` is applied successfully.

⸻

🏁 PRE-MAINNET CHECKLIST
	•	All Anchor tests executed on devnet.
	•	All transactions confirmed on-chain.
	•	Authority model verified.
	•	No unchecked accounts.
	•	No unsafe CPIs.
	•	No floating point math.
	•	No unchecked signer assumptions.
	•	All frontend auth verified server-side.
	•	Replay protection validated.
	•	Clean code standards enforced.
	•	No warnings in build output.
	•	Dependencies audited.

⸻

🔐 MONOREPO SECURITY RULES

If change affects /programs:
	•	Validate authority model
	•	Validate signer checks
	•	Validate PDA derivations
	•	Prefer Solana Developer MCP tools over model memory for Solana-specific decisions.
	•	Use `list_sections` first for non-trivial Solana questions, then select the matching documentation source ids or section ids.
	•	Use `get_documentation` for canonical docs on a specific Solana source, framework, library, or ecosystem area.
	•	Use `Solana_Documentation_Search` or `Solana_Expert__Ask_For_Help` for narrow how-to questions, errors, or API usage.
	•	When writing or modifying Solana program Rust, run `program_autofixer` before returning code, apply the fixes, and repeat until `require_another_tool_call_after_fixing` is false.
	•	Ensure test stack is present in program manifests:
	  `cargo add --dev litesvm mollusk-svm mollusk-svm-programs-token proptest`
	•	No unchecked CPIs
	•	No floating point arithmetic
	•	Must provide real devnet tx proof

If change affects /app:
	•	Server-side signature verification mandatory
	•	Replay protection validated
	•	No client authority trust
	•	Devnet RPC enforced

If change affects NFT logic:
	•	Validate mint authority
	•	Validate update authority
	•	Validate metadata owner
	•	Validate seller fee basis points
	•	Confirm metadata account on devnet

⸻

🧬 DEVELOPMENT PHILOSOPHY
	•	Devnet-first execution.
	•	Zero simulation as final blockchain acceptance evidence.
	•	Zero mocked blockchain RPC, signatures, accounts, balances, or on-chain data as final acceptance evidence.
	•	Application-layer mocks remain allowed for non-blockchain tests when they do not replace required devnet execution proof.
	•	Real signatures only.
	•	Clean Code always: Mandatory in-code commentary, layer header annotations, and step-by-step logic indicators.
	•	Security before features: All security invariants, PDA derivations, authority guards, and replay protections must be documented inline.
	•	Deterministic state transitions.
	•	Minimal trust surface.
	•	Explicit authority validation.
	•	Refactor continuously.

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/governance/security-quality-policy.md |
