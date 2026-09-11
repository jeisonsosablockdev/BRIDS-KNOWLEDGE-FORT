# Agent Instructions

## Package Manager
- Content-first workspace; no package manager required for normal work
- Skill validation: `bash BRIDS-Engine/scripts/validate-skills.sh`

## File-Scoped Commands
| Task | Command |
|------|---------|
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

## Anti-Drift Task Execution Protocol (5 Steps)
To prevent prompt/context drift and ensure consistent quality, every document or content generation task must follow this sequence:
1. **SDD Spec & Context Gate (Mandatory Artifact):** Before drafting any deliverable, generate an explicit specification artifact using `bash BRIDS-Engine/scripts/sdd-manager.sh init <slug> "<title>" "<target-folder>" "<subagents>" "[icp]" "[goal]"`. The spec MUST declare:
   - Canonical vault destination in `BRIDS-Brain/` (00 to 10).
   - Sub-agents assigned from the squad (`business-consultant`, `market-research-analyst`, `pitch-deck-architect`, `compliance-officer`, `b2b-sponsor-lead`, `founder-ghostwriter`).
   - Core commercial intent, ICP, and zero-hallucination technical anchors (Solana, Metaplex Core Freeze/Recovery, Delaware SPV, Stripe Identity).
   - Anti-robot banned clichés filter (strict ban on *"en resumen"*, *"es importante destacar"*, *"un papel crucial"*, etc.).
2. **Spec Review & Approval:** Inspect the specification (`bash BRIDS-Engine/scripts/sdd-manager.sh preview <slug>`) and approve it (`bash BRIDS-Engine/scripts/sdd-manager.sh approve <slug>`). Never start writing blindly without an approved spec artifact.
3. **Two-Agent Evaluator-Optimizer Loop (Creator vs Reviewer):**
   - **Creator/Editor Sub-Agent:** Writes the initial draft and remediates critique feedback.
   - **Reviewer Agent (`sdd-reviewer`):** Audits draft on a 0 to 9 scale across 4 dimensions:
     - 1. Cumplimiento del Objetivo & ICP (2.5 pts)
     - 2. Veracidad Técnica & Fuentes (2.5 pts)
     - 3. Voz Fundadora vs Tono Robot (2.0 pts)
     - 4. Originalidad Léxica & Cero Clichés (2.0 pts)
   - **Passing Threshold:** Calificación mínima requerida $\ge 8.5 / 9.0$.
   - **Safety Cap:** Máximo 5 ciclos iterativos. Si no alcanza 8.5 en el ciclo 5, el entregable se congela para arbitraje humano (`frozen_for_arbitration`).
4. **Idempotent Promotion & Safe Refinement:** Once $\ge 8.5$ is achieved, the engine promotes the deliverable into its canonical folder in `BRIDS-Brain/` with quality metadata, frontmatter, and changelog. Subsequent edits must use `bash BRIDS-Engine/scripts/refine-note.sh`.
5. **Measurement & Closure:** Register deliverables, track events and KPIs, and close the session in `task-manager.sh update`.

## Vault Conventions
- Use existing category folders under `BRIDS-Brain/` (numbered 00 to 10)
- Prefer descriptive file names like `linkedin-post-ideas-apr-2026.md`
- Keep one note per deliverable or per coherent working artifact
- Create a new subfolder only when there are 3+ related deliverables that do not fit an existing subfolder cleanly
- Do not create top-level folders beyond the existing numbered taxonomy unless explicitly requested
- Prefer saving drafts in `00 Inbox` when the final destination is unclear

## Obsidian Integration
- The Obsidian vault is `BRIDS-Brain/`
- Local REST API is active on HTTPS port `27124` with Bearer token authentication
- Sincroniza el contexto usando `bash BRIDS-Engine/scripts/sync-brand-context.sh`

## BRIDS Founder & YC Sub-Agent Squad
The workspace includes 6 specialized sub-agents defined in `BRIDS-Engine/agents/` and registered via `define_subagent` to build the business and prepare for Y Combinator:

| Agent Identifier | Role | Output Vault Path | Core Mission |
|---|---|---|---|
| `business-consultant` | Business Model & Unit Economics Architect | `02 Strategy & Research/business-model/` | Fee architecture (SaaS, processing, recovery), CAC/LTV, 3-5y pro forma projections. |
| `market-research-analyst` | Market Research & TAM/SAM/SOM Analyst | `02 Strategy & Research/market-research/` | Quantitative market sizing, live web research, competitor benchmarks (Lofty, RealT, Blocksquare). |
| `pitch-deck-architect` | YC & Sequoia Pitch Deck Architect | `02 Strategy & Research/pitch-decks/` | 10-12 slide investor decks, native `.pptx` generation with `python-pptx`, slide scripts. |
| `compliance-officer` | Legal Structuring & RWA Compliance Officer | `01 Brand Context/compliance/` | Dual-entity separation (Delaware C-Corp vs SPV LLCs), non-broker-dealer status, Stripe Identity KYC/AML, Metaplex Core Freeze/Recovery plugins, Data Room preparation. |
| `b2b-sponsor-lead` | Real Estate Sponsor Acquisition & RevOps | `10 RevOps & Sales/b2b-sponsors/` | Developer/GP value prop, institutional one-pagers, cold outbound sequences, pilot onboarding. |
| `founder-ghostwriter` | Founder Voice, Thought Leadership & YC Storyteller | `04 Social & Community/`, `07 Newsletters/` | YC application essays ("Why now?", "Unique insight"), X/Twitter threads on Solana RWA, LinkedIn articles, investor updates. |

- Definitions: Individual autonomous YAML files in `BRIDS-Engine/agents/*.yaml`
- Verification: `bash BRIDS-Engine/scripts/inspect-squad.sh`


