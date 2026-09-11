# Agent Instructions

## Package Manager
- Content-first workspace; no package manager required for normal work
- Upstream skill validation: `bash marketingskills/validate-skills.sh`

## File-Scoped Commands
| Task | Command |
|------|---------|
| Context-Aware Asset Generator | `bash MarketingAgentCore/scripts/generate-publication-assets.sh <nota|slug> [--input-image img]` |
| Sync Master Content Grid | `bash MarketingAgentCore/scripts/sync-content-grid.sh [audit|sync|update]` |
| Generate 4-Slide Carousel | `bash MarketingAgentCore/scripts/create-social-carousel.sh "<idea>" [img] [prenda] [ref]` |
| Generate Social Post from SOP | `bash MarketingAgentCore/scripts/create-social-post.sh <red> "<idea>" [tipo] [ref] [prenda]` |
| Verify Idempotency | `bash MarketingAgentCore/tests/test-idempotency.sh` |
| Anti-Drift Compliance Audit | `bash MarketingAgentCore/scripts/enforce-compliance.sh` |
| Manage Task Lifecycle | `bash MarketingAgentCore/scripts/task-manager.sh <init|add|show|update|list|close>` |
| Non-Destructive Refine | `bash MarketingAgentCore/scripts/refine-note.sh <inspect|backup|refine|branch|rollback>` |
| Read Markdown | `sed -n '1,160p' path/to/file.md` |
| List vault folders | `find "BRIDS Brain" -maxdepth 3 -type d | sort` |
| Validate imported skills | `bash marketingskills/validate-skills.sh` |
| Activate project skills | `bash MarketingAgentCore/scripts/enable-project-skills.sh` |
| Activate project skills (Windows) | `powershell -ExecutionPolicy Bypass -File .\MarketingAgentCore\scripts\enable-project-skills.ps1` |
| Rebuild Obsidian Agent Client | `cd obsidian-agent-client && npm install && npm run build` |

## Commit Attribution
- AI commits MUST include:
```text
Co-Authored-By: OpenAI Codex <noreply@openai.com>
```

## Non-Destructive Content Refinement Rule (CRITICAL)
- NEVER wipe or destructively overwrite existing document content unless explicitly requested by the user with unambiguous deletion keywords ('delete', 'remove', 'erase', 'elimina', 'borra').
- When asked to perform a task or update an existing note, the default behavior is **incremental refinement**: read the existing note, preserve established insights, and augment/refine the specific sections requested.
- Use `bash MarketingAgentCore/scripts/refine-note.sh refine <path> "<summary>"` to maintain safety snapshots, bump versioning, and update the document changelog.
- For major structural pivots or alternative campaign angles, create a new versioned file (e.g. `homepage-copy-v2-aug-2026.md`) rather than destroying previous drafts.

## Workspace Layout
- `MarketingAgentCore/`: source of truth for imported skills, adapted skills, docs, and brand context
- `BRIDS Brain/`: Obsidian vault, persistent knowledge base and final Markdown deliverables
- `marketingskills/`: upstream reference clone; do not use as the primary write target

## Content Workflow
- Read `MarketingAgentCore/context/product-marketing-context.md` before creating marketing deliverables
- Save final content as Markdown inside the matching folder in `BRIDS Brain/`
- Keep logic, experiments, and skill adaptation work in `MarketingAgentCore/`
- Follow `MarketingAgentCore/docs/document-organization.md` before creating folders or moving files

## Skills
- Upstream imported skills live in `MarketingAgentCore/imported-skills/`
- Local adaptations live in `MarketingAgentCore/skills/`
- Do not edit `imported-skills/` directly; promote a copy into `skills/` first
- Skill activation instructions live in `MarketingAgentCore/docs/skills-activation.md`
- For Windows, prefer `enable-project-skills.ps1` and `sync-brand-context.ps1`

## Anti-Drift Task Execution Protocol (5 Steps)
To prevent prompt/context drift and ensure consistent quality, every task must follow this sequence:
1. **Context Gate:** Always consult `MarketingAgentCore/context/product-marketing-context.md` before generating marketing content. Never invent ICPs, brand voice, or positioning in isolation.
2. **Task Decomposition:** Use `bash MarketingAgentCore/scripts/task-manager.sh` to track multi-step initiatives, defining atomic tasks (`TASK-001`, `TASK-002`) and explicit dependencies (`depends_on`).
3. **Skill Orchestration:** Load and adhere to the relevant `SKILL.md` from `MarketingAgentCore/skills/` (e.g. `mas-copywriting`, `mas-seo-audit`, `mas-email-sequence`).
4. **Structured Drafting & Safe Refinement:** Apply `MarketingAgentCore/templates/note-template.md` (YAML frontmatter with version, `> [!NOTE]` callouts, and wikilinks). When modifying existing files, use `bash MarketingAgentCore/scripts/refine-note.sh` to take safety snapshots and maintain the changelog.
5. **Measurement & Closure:** Register deliverables and mark tasks completed in the session JSON (`task-manager.sh update`), assigning tracking events and KPIs.

## Vault Conventions
- Use existing category folders under `BRIDS Brain/` (numbered 00 to 10)
- Prefer descriptive file names like `linkedin-post-ideas-apr-2026.md`
- Keep one note per deliverable or per coherent working artifact
- Create a new subfolder only when there are 3+ related deliverables that do not fit an existing subfolder cleanly
- Do not create top-level folders beyond the existing numbered taxonomy unless explicitly requested
- Prefer saving drafts in `00 Inbox` when the final destination is unclear
- Obsidian Agent Client chat exports belong in `BRIDS Brain/00 Inbox/Agent Client Chats/`

## Obsidian Integration
- The Obsidian vault is `BRIDS Brain/`
- Local REST API is active on HTTPS port `27124` with Bearer token authentication
- Sincroniza el contexto usando `bash MarketingAgentCore/scripts/sync-brand-context.sh`

