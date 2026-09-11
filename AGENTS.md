# Agent Instructions

## Package Manager
- Content-first workspace; no package manager required for normal work
- Skill validation: `bash BRIDS-Engine/scripts/validate-skills.sh`

## File-Scoped Commands
| Task | Command |
|------|---------|
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
To prevent prompt/context drift and ensure consistent quality, every task must follow this sequence:
1. **Context Gate:** Always consult `BRIDS-Engine/context/product-marketing-context.md` before generating marketing content. Never invent ICPs, brand voice, or positioning in isolation.
2. **Task Decomposition:** Use `bash BRIDS-Engine/scripts/task-manager.sh` to track multi-step initiatives, defining atomic tasks (`TASK-001`, `TASK-002`) and explicit dependencies (`depends_on`).
3. **Skill Orchestration:** Load and adhere to the relevant `SKILL.md` from `BRIDS-Engine/skills/` (e.g. `mas-copywriting`, `mas-seo-audit`, `mas-email-sequence`).
4. **Structured Drafting & Safe Refinement:** Apply `BRIDS-Engine/templates/note-template.md` (YAML frontmatter with version, `> [!NOTE]` callouts, and wikilinks). When modifying existing files, use `bash BRIDS-Engine/scripts/refine-note.sh` to take safety snapshots and maintain the changelog.
5. **Measurement & Closure:** Register deliverables and mark tasks completed in the session JSON (`task-manager.sh update`), assigning tracking events and KPIs.

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

- Manifest: `BRIDS-Engine/agents/agents.yaml`
- Verification: `bash BRIDS-Engine/scripts/inspect-squad.sh`


