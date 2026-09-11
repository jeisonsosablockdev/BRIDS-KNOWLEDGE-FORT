# Agent Instructions

## Package Manager
- Content-first workspace; no package manager required for normal work
- Skill validation: `bash BRIDS-Engine/scripts/validate-skills.sh`

## File-Scoped Commands
| Task | Command |
|------|---------|
| Atomic Task Init & SDD Engine | `bash BRIDS-Engine/scripts/task-init.sh <slug> [titulo] [target-folder] [subagents] [icp] [goal]` |
| Spec-Driven Development (SDD) | `bash BRIDS-Engine/scripts/sdd-manager.sh <init|preview|approve|evaluate|status|list>` |
| Context-Aware Asset Generator | `bash BRIDS-Engine/scripts/generate-publication-assets.sh <nota|slug> [--input-image img]` |
| Sync Master Content Grid | `bash BRIDS-Engine/scripts/sync-content-grid.sh [audit|sync|update]` |
| Generate 4-Slide Carousel | `bash BRIDS-Engine/scripts/create-social-carousel.sh "<idea>" [img] [prenda] [ref]` |
| Generate Social Post from SOP | `bash BRIDS-Engine/scripts/create-social-post.sh <red> "<idea>" [tipo] [ref] [prenda]` |
| Verify Idempotency | `bash BRIDS-Engine/tests/test-idempotency.sh` |
| Anti-Drift Compliance Audit | `bash BRIDS-Engine/scripts/enforce-compliance.sh` |
| Manage Task Lifecycle | `bash BRIDS-Engine/scripts/task-manager.sh <init|add|show|update|list|close>` |
| Non-Destructive Refine | `bash BRIDS-Engine/scripts/refine-note.sh <inspect|backup|refine|branch|rollback>` |
| Read Markdown | `sed -n '1,160p' path/to/file.md` |
| List vault folders | `find "BRIDS-Brain" -maxdepth 3 -type d | sort` |
| Validate skills | `bash BRIDS-Engine/scripts/validate-skills.sh` |
| Activate project skills | `bash BRIDS-Engine/scripts/enable-project-skills.sh` |
| Activate project skills (Windows) | `powershell -ExecutionPolicy Bypass -File .\BRIDS-Engine\scripts\enable-project-skills.ps1` |
| Inspect Agent Squad | `bash BRIDS-Engine/scripts/inspect-squad.sh` |

## Commit Attribution
- AI commits MUST include:
```text
Co-Authored-By: OpenAI Codex <noreply@openai.com>
```

## Non-Destructive Content Refinement Rule (CRITICAL)
- NEVER wipe or destructively overwrite existing document content unless explicitly requested by the user with unambiguous deletion keywords ('delete', 'remove', 'erase', 'elimina', 'borra').
- When asked to perform a task or update an existing note, the default behavior is **incremental refinement**: read the existing note, preserve established insights, and augment/refine the specific sections requested.
- Use `bash BRIDS-Engine/scripts/refine-note.sh refine <path> "<summary>"` to maintain safety snapshots, bump versioning, and update the document changelog.
- For major structural pivots or alternative campaign angles, create a new versioned file (e.g. `homepage-copy-v2-aug-2026.md`) rather than destroying previous drafts.

## Workspace Layout
- `BRIDS-Engine/`: source of truth for skills, agents, automation scripts, docs, and brand context
- `BRIDS-Brain/`: Obsidian vault, persistent knowledge base and final Markdown deliverables

## Content Workflow
- Read `BRIDS-Engine/context/product-marketing-context.md` before creating marketing deliverables
- Save final content as Markdown inside the matching folder in `BRIDS-Brain/`
- Keep logic, experiments, and skill adaptation work in `BRIDS-Engine/`
- Follow `BRIDS-Engine/docs/document-organization.md` before creating folders or moving files

## Skills
- Local adaptations live in `BRIDS-Engine/skills/`
- Skill activation instructions live in `BRIDS-Engine/docs/skills-activation.md`
- For Windows, prefer `enable-project-skills.ps1` and `sync-brand-context.ps1`

## Anti-Drift Task Execution Protocol (5 Steps con Doble Guardrail HITL)
To prevent prompt/context drift and ensure consistent quality, every document or content generation task must follow this sequence:
1. **Solicitud de Usuario & Propuesta SDD:** El usuario expone el requerimiento o idea comercial. Se genera un artefacto de especificación formal previo usando `bash BRIDS-Engine/scripts/task-init.sh <slug> "<title>" "<target-folder>" "<subagents>" "[icp]" "[goal]"` (o `sdd-manager.sh init`). El spec queda en estado `spec_review` y declara obligatoriamente:
   - Destino canónico en `BRIDS-Brain/` (00 a 15) y nombre de archivo.
   - Sub-agentes asignados del squad (`business-consultant`, `market-research-analyst`, `pitch-deck-architect`, `compliance-officer`, `b2b-sponsor-lead`, `founder-ghostwriter`).
   - Anclas técnicas verificables (Solana, Metaplex Core Freeze/Recovery, Delaware SPV, Stripe Identity) y filtro anti-clichés de IA.
2. **Primer Guardrail HITL (Aprobación Humana del Spec):** Se presenta el objeto canónico del spec al usuario (`bash BRIDS-Engine/scripts/sdd-manager.sh preview <slug>`).
   - Si el usuario solicita ajustes: se corre el optimizador (`bash BRIDS-Engine/scripts/sdd-manager.sh refine-spec <slug> "<observaciones>"`).
   - **Bloqueo Mandatorio:** Ningún sub-agente comienza a redactar hasta que el usuario apruebe formalmente con `bash BRIDS-Engine/scripts/sdd-manager.sh approve-spec <slug>`.
3. **Bucle Evaluador-Optimizador Autónomo (Creador vs Revisor):** Redacción del borrador con los sub-agentes asignados respetando el spec aprobado.
   - **Agente Revisor (`sdd-reviewer`):** Audita en escala de 0 a 9 puntos en 4 dimensiones:
     - 1. Cumplimiento del Objetivo & ICP (2.5 pts)
     - 2. Veracidad Técnica & Fuentes (2.5 pts)
     - 3. Voz Fundadora vs Tono Robot (2.0 pts)
     - 4. Originalidad Léxica & Cero Clichés (2.0 pts)
   - **Condición de Calidad:** Debe superar una calificación $\ge 8.5 / 9.0$ (máximo 5 ciclos iterativos). Si no alcanza 8.5 en el ciclo 5, se congela para arbitraje (`frozen_for_arbitration`). Al superar 8.5, el texto pasa a estado `deliverable_review` (HITL-2).
4. **Segundo Guardrail HITL (Aprobación del Entregable & Integración en Vault):** Se presenta el texto pulido al usuario (`bash BRIDS-Engine/scripts/sdd-manager.sh review-deliverable <slug>`).
   - Si el usuario solicita cambios: se re-ejecuta el bucle (`bash BRIDS-Engine/scripts/sdd-manager.sh refine-deliverable <slug> "<observaciones>"`).
   - **Bloqueo Mandatorio:** El archivo **NO se escribe en la carpeta de producción de `BRIDS-Brain/`** hasta la confirmación formal del usuario con `bash BRIDS-Engine/scripts/sdd-manager.sh approve-deliverable <slug>`.
   - Al aprobarse, el motor promueve el entregable de forma atómica e idempotente con metadatos de calidad, tags `sdd-approved`, `hitl-validated` y changelog.
5. **Medición & Cierre:** Registro del entregable, asignación de eventos y KPIs, y cierre en `task-manager.sh update`.

## Vault Conventions
- Use existing category folders under `BRIDS-Brain/` (numbered 00 to 15: 00-10 Growth/Marketing, 11-15 Corporate/Admin)
- Prefer descriptive file names like `linkedin-post-ideas-apr-2026.md`
- Keep one note per deliverable or per coherent working artifact
- Create a new subfolder only when there are 3+ related deliverables that do not fit an existing subfolder cleanly
- Do not create top-level folders beyond the existing numbered taxonomy (00 to 15) unless explicitly requested
- Prefer saving drafts in `00 Inbox` when the final destination is unclear

## Obsidian Integration
- The Obsidian vault is `BRIDS-Brain/`
- Local REST API is active on HTTPS port `27124` with Bearer token authentication
- Sincroniza el contexto usando `bash BRIDS-Engine/scripts/sync-brand-context.sh`

## BRIDS Founder & YC Sub-Agent Squad
The workspace includes 6 specialized sub-agents defined in `BRIDS-Engine/agents/` and registered via `define_subagent` to build the business and prepare for Y Combinator:

| Agent Identifier | Role | Output Vault Path | Core Mission |
|---|---|---|---|
| `business-consultant` | Business Model & Unit Economics Architect | `12 Finance & Treasury/financial-models/`, `02 Strategy & Research/business-model/` | Fee architecture (SaaS, processing, recovery), CAC/LTV, 3-5y pro forma projections. |
| `market-research-analyst` | Market Research & TAM/SAM/SOM Analyst | `02 Strategy & Research/market-research/` | Quantitative market sizing, live web research, competitor benchmarks (Lofty, RealT, Blocksquare). |
| `pitch-deck-architect` | YC & Sequoia Pitch Deck Architect | `14 Investor Relations & YC/pitch-decks/` | 10-12 slide investor decks, native `.pptx` generation with `python-pptx`, slide scripts. |
| `compliance-officer` | Legal Structuring & RWA Compliance Officer | `11 Legal & Compliance/` | Dual-entity separation (Delaware C-Corp vs SPV LLCs), non-broker-dealer status, Stripe Identity KYC/AML, Metaplex Core Freeze/Recovery plugins, Data Room preparation. |
| `b2b-sponsor-lead` | Real Estate Sponsor Acquisition & RevOps | `10 RevOps & Sales/b2b-sponsors/` | Developer/GP value prop, institutional one-pagers, cold outbound sequences, pilot onboarding. |
| `founder-ghostwriter` | Founder Voice, Thought Leadership & YC Storyteller | `04 Social & Community/`, `14 Investor Relations & YC/` | YC application essays ("Why now?", "Unique insight"), X/Twitter threads on Solana RWA, LinkedIn articles, investor updates. |

- Definitions: Individual autonomous YAML files in `BRIDS-Engine/agents/*.yaml`
- Verification: `bash BRIDS-Engine/scripts/inspect-squad.sh`


