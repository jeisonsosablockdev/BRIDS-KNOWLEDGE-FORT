# Skills Activation (Google Antigravity Native)

This project keeps the source of truth for all 58 specialized skills inside `BRIDS-Engine/skills/`.

## Native Antigravity Discovery (`.agents/skills.json`)

Google Antigravity discovers workspace skills natively via `.agents/skills.json`:

```json
{
  "entries": [
    { "path": "BRIDS-Engine/skills" }
  ]
}
```

## Sync & Validation Commands

To verify or regenerate `.agents/skills.json` and sync the brand context symlink into `BRIDS-Brain/`:

```bash
node BRIDS-Engine/scripts/ingest/sync-workspace-context.ts all
```

Or individually:

```bash
# Verify / regenerate .agents/skills.json (58 skills)
node BRIDS-Engine/scripts/ingest/sync-workspace-context.ts skills

# Sync brand context symlink into BRIDS-Brain/02 Marketing/01 Contexto de Marca/
node BRIDS-Engine/scripts/ingest/sync-workspace-context.ts brand

# Audit all 58 skills for SKILL.md frontmatter compliance
node BRIDS-Engine/scripts/audit/audit-runner.ts skills
```

