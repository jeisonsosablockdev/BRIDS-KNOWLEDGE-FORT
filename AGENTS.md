# Agent Instructions

## Package Manager
- Content-first workspace; TypeScript runs natively in Node.js (`node <file>.ts`) without wrappers
- Skill validation: `node BRIDS-Engine/scripts/audit/audit-runner.ts skills`

## File-Scoped Commands (TypeScript Domain Architecture)
| Domain | Task | Command |
|--------|------|---------|
| `bin/` | Unified Engine CLI & Lifecycle | `node BRIDS-Engine/bin/engine.ts <sdd\|promote\|ingest\|vault\|audit\|social\|test\|help>` |
| `sdd/` | Spec-Driven Development & Sessions | `node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts <init\|preview\|approve-spec\|evaluate\|loop-task\|review-deliverable\|approve-deliverable\|branch\|merge\|promote\|list\|session>` |
| `sdd/` | 4-Tier Git Promotion (`feat` -> `develop` -> `main`) | `node BRIDS-Engine/bin/engine.ts promote <feature [feat/name]\|main> [--push]` |
| `ingest/` | Sync Technical Docs & Brand (OKF) | `node BRIDS-Engine/scripts/ingest/sync-technical-docs.ts [--force]` |
| `ingest/` | Sync Narrative Radar & Briefs | `node BRIDS-Engine/scripts/ingest/sync-narrative-intelligence.ts [slug\|--rumor-scan\|--extract-url]` |
| `ingest/` | Sync Workspace Brand & Skills | `node BRIDS-Engine/scripts/ingest/sync-workspace-context.ts [all\|brand\|skills]` |
| `vault/` | Non-Destructive Note Refinement | `node BRIDS-Engine/scripts/vault/refine-note.ts <inspect\|backup\|refine\|branch\|rollback>` |
| `vault/` | In-Memory Vault Search | `node BRIDS-Engine/scripts/vault/vault-search.ts "<query>" [--limit 5]` |
| `vault/` | Export LaTeX / Markdown to PDF | `node BRIDS-Engine/scripts/vault/export-pdf.ts <file.md\|file.tex> [out.pdf] [--raw] [--staging]` |
| `audit/` | Unified Governance & Compliance | `node BRIDS-Engine/scripts/audit/audit-runner.ts [compliance\|vault\|context\|skills\|squad\|narrative]` |
| `social/` | Social Posts, Carousels, Grid & Assets | `node BRIDS-Engine/scripts/social/social-generator.ts <grid\|post\|carousel\|assets> [args]` |
| `tests/` | Full TypeScript Test Suite | `node BRIDS-Engine/bin/engine.ts test all` |

## Commit Attribution & 4-Tier Git Branching (`spec/*` -> `feat/*` -> `develop` -> `main`)
- **Active Trunk is `develop`:** Never edit files or commit directly on `main`. `PreToolUse` (`workflow-gate-hook.ts`) physically blocks direct file edits and direct `git commit`/`git merge`/`git push` on `main`.
- **Hierarchy:**
  1. `spec/<feature>/<slug>`: Child branch per SDD Spec (`sdd-orchestrator.ts branch <slug>`). Merges (`--no-ff`) into `feat/<feature>` via `sdd-orchestrator.ts merge <slug>` after HITL-2 (`completed`).
  2. `feat/<feature>`: Feature integration branch. Promotes (`--no-ff`) into `develop` via `node BRIDS-Engine/bin/engine.ts promote feature [feat/<feature>] [--push]`.
  3. `develop`: Default working trunk. Promotes (`--no-ff`) into `main` via `node BRIDS-Engine/bin/engine.ts promote main [--push]` (runs clean tree check + full test suite + compliance audit, merges to `main`, and automatically returns HEAD to `develop`).
- AI commits MUST include:
```text
Co-Authored-By: Google Gemini <gemini@google.com>
```

## Non-Destructive Content Refinement Rule (CRITICAL)
- NEVER wipe or destructively overwrite existing document content unless explicitly requested by the user with unambiguous deletion keywords ('delete', 'remove', 'erase', 'elimina', 'borra').
- When asked to perform a task or update an existing note, the default behavior is **incremental refinement**: read the existing note, preserve established insights, and augment/refine the specific sections requested.
- Use `node BRIDS-Engine/scripts/vault/refine-note.ts refine <path> "<summary>"` to maintain safety snapshots, bump versioning, and update the document changelog.
- For major structural pivots or alternative campaign angles, create a new versioned file (e.g. `homepage-copy-v2-aug-2026.md`) rather than destroying previous drafts.

## Workspace Layout
- `BRIDS-Engine/`: source of truth for skills, agents, automation scripts (`sdd/`, `ingest/`, `vault/`, `audit/`, `social/`), docs, and brand context
- `BRIDS-Brain/`: Obsidian vault, persistent knowledge base and final Markdown deliverables

## Content Workflow
- Read `BRIDS-Engine/context/product-marketing-context.md` before creating marketing deliverables
- Save final content as Markdown inside the matching folder in `BRIDS-Brain/`
- Keep logic, experiments, and skill adaptation work in `BRIDS-Engine/`
- Follow `BRIDS-Engine/docs/document-organization.md` before creating folders or moving files

## Skills
- Local adaptations live in `BRIDS-Engine/skills/`
- Skill activation instructions live in `BRIDS-Engine/docs/skills-activation.md`
- Activate and sync skills via `node BRIDS-Engine/scripts/ingest/sync-workspace-context.ts skills`

## Anti-Drift Task Execution Protocol (5 Steps con Doble Guardrail HITL)
To prevent prompt/context drift and ensure consistent quality, every document or content generation task must follow this sequence:
1. **Solicitud de Usuario & Propuesta SDD:** El usuario expone el requerimiento o idea comercial. Se genera un artefacto de especificación formal previo usando `node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts init <slug> "<title>" "<target-folder>" "<subagents>" "[icp]" "[goal]"`. El spec queda en estado `spec_review` y declara obligatoriamente:
   - Destino canónico en `BRIDS-Brain/` (`01 Negocio` o `02 Marketing`) y nombre de archivo.
   - Sub-agentes asignados del squad (`business-consultant`, `market-research-analyst`, `pitch-deck-architect`, `compliance-officer`, `b2b-sponsor-lead`, `founder-ghostwriter`).
   - Anclas técnicas verificables (Solana, Metaplex Core Freeze/Recovery, Delaware SPV, Stripe Identity) y filtro anti-clichés de IA.
2. **Primer Guardrail HITL (Aprobación Humana del Spec):** Se presenta el objeto canónico del spec al usuario (`node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts preview <slug>`).
   - Si el usuario solicita ajustes: se corre el optimizador (`node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts refine-spec <slug> "<observaciones>"`).
   - **Bloqueo Mandatorio:** Ningún sub-agente comienza a redactar hasta que el usuario apruebe formalmente con `node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts approve-spec <slug>`.
3. **Bucle Evaluador-Optimizador Autónomo (Creador vs Revisor):** Redacción del borrador con los sub-agentes asignados respetando el spec aprobado.
   - **Agente Revisor (`sdd-reviewer`):** Audita en escala de 0 a 9 puntos en 4 dimensiones:
     - 1. Cumplimiento del Objetivo & ICP (2.5 pts)
     - 2. Veracidad Técnica & Fuentes (2.5 pts)
     - 3. Voz Fundadora vs Tono Robot (2.0 pts)
     - 4. Originalidad Léxica & Cero Clichés (2.0 pts)
   - **Condición de Calidad:** Debe superar una calificación $\ge 8.5 / 9.0$ (máximo 5 ciclos iterativos). Si no alcanza 8.5 en el ciclo 5, se congela para arbitraje (`frozen_for_arbitration`). Al superar 8.5, el texto pasa a estado `deliverable_review` (HITL-2).
4. **Segundo Guardrail HITL (Aprobación del Entregable & Integración en Vault):** Se presenta el texto pulido al usuario (`node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts review-deliverable <slug>`).
   - Si el usuario solicita cambios: se re-ejecuta el bucle (`node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts refine-deliverable <slug> "<observaciones>"`).
   - **Bloqueo Mandatorio:** El archivo **NO se escribe en la carpeta de producción de `BRIDS-Brain/`** hasta la confirmación formal del usuario con `node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts approve-deliverable <slug>`.
   - Al aprobarse, el motor promueve el entregable de forma atómica e idempotente con metadatos de calidad, tags `sdd-approved`, `hitl-validated` y changelog.
5. **Medición & Cierre:** Registro del entregable, asignación de eventos y KPIs, y cierre en `node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts session update`.

## Vault Conventions
- The vault is structured into two core macro-domains under `BRIDS-Brain/`:
  - `01 Negocio/`: Estrategia & Modelo, Producto & Ingeniería (OKF sync), Legal & Cumplimiento, Finanzas & YC Investors, Sponsors B2B & Ventas, Operaciones & Gobernanza.
  - `02 Marketing/`: Contexto de Marca, Estrategia & Parrilla, Redes Sociales & Contenido, Copywriting & Web, Email Marketing, SEO & Descubrimiento, Analítica & Crecimiento.
  - `00 Inbox/`: Raw captures, drafts, and SDD specs under review.
- Prefer descriptive file names like `linkedin-post-ideas-apr-2026.md`
- Keep one note per deliverable or per coherent working artifact
- Create a new subfolder only when there are 3+ related deliverables that do not fit an existing subfolder cleanly
- Do not create top-level folders beyond `00 Inbox`, `01 Negocio`, and `02 Marketing`
- Prefer saving drafts in `00 Inbox` when the final destination is unclear

## Obsidian Integration
- The Obsidian vault is `BRIDS-Brain/`
- Sincroniza el contexto usando `node BRIDS-Engine/scripts/ingest/sync-workspace-context.ts brand`

## BRIDS Founder & YC Sub-Agent Squad
The workspace includes 7 specialized sub-agents defined in `BRIDS-Engine/agents/` and registered via `define_subagent` to build the business and prepare for Y Combinator:

| Agent Identifier | Role | Output Vault Path | Core Mission |
|---|---|---|---|
| `business-consultant` | Business Model & Unit Economics Architect | `01 Negocio/04 Finanzas & YC Investors/`, `01 Negocio/01 Estrategia & Modelo/` | Fee architecture (SaaS, processing, recovery), CAC/LTV, 3-5y pro forma projections. |
| `market-research-analyst` | Market Research & TAM/SAM/SOM Analyst | `01 Negocio/01 Estrategia & Modelo/market-research/` | Quantitative market sizing, live web research, competitor benchmarks (Lofty, RealT, Blocksquare). |
| `pitch-deck-architect` | YC & Sequoia Pitch Deck Architect | `01 Negocio/04 Finanzas & YC Investors/pitch-decks/` | 10-12 slide investor decks, native `.pptx` generation with `python-pptx`, slide scripts. |
| `compliance-officer` | Legal Structuring & RWA Compliance Officer | `01 Negocio/03 Legal & Cumplimiento/` | Dual-entity separation (Delaware C-Corp vs SPV LLCs), non-broker-dealer status, Stripe Identity KYC/AML, Metaplex Core Freeze/Recovery plugins, Data Room preparation. |
| `b2b-sponsor-lead` | Real Estate Sponsor Acquisition & RevOps | `01 Negocio/05 Sponsors B2B & Ventas/` | Developer/GP value prop, institutional one-pagers, cold outbound sequences, pilot onboarding. |
| `founder-ghostwriter` | Founder Voice, Thought Leadership & YC Storyteller | `02 Marketing/03 Redes Sociales & Contenido/`, `01 Negocio/04 Finanzas & YC Investors/` | YC application essays ("Why now?", "Unique insight"), X/Twitter threads on Solana RWA, LinkedIn articles, investor updates. |
| `narrative-intelligence-analyst` | Emerging Narrative & Market Psychology Analyst | `01 Negocio/01 Estrategia & Modelo/narrative-intelligence/` | Early whisper radar, viral meme deconstruction, market psychology audits, narrative threat/opportunity briefs. **Protocol Rules:** 1) Mandatory direct clickable URLs for all citations. 2) Immutable raw data archival in `raw/*.json`. 3) Strict zero-judgments policy: hypotheses must be inductive and evidence-driven, never forcing a priori business assumptions. |

- Definitions: Individual autonomous YAML files in `BRIDS-Engine/agents/*.yaml`
- Verification: `node BRIDS-Engine/scripts/audit/audit-runner.ts squad`

## Solana Developer MCP Integration (mcp.solana.com)
The workspace integrates the canonical **Solana Developer MCP** (`https://mcp.solana.com/mcp`):
- **Active Server Identifiers:** `solana-mcp-server` (HTTP) and `solana-mcp-sse` (SSE).
- **Core MCP Tools:** `list_sections`, `get_documentation`, `Solana_Documentation_Search`, `Solana_Expert__Ask_For_Help`, `program_autofixer`.
- **Enforcement Rule:** All sub-agents (`compliance-officer`, `pitch-deck-architect`, `business-consultant`) must prioritize live Solana MCP queries over outdated model training weights when reasoning about Metaplex Core, Solana Kit, Anchor, and on-chain governance.
- **Reference Guide:** `BRIDS-Engine/docs/solana-mcp-integration.md`



