# Document Organization Rules

This file defines how the system should organize Markdown documents and when it may create new folders.

## Core Principle

- `MarketingAgentCore/` holds logic, skills, rules, and source context
- `MarketingAgentStudio/` holds human-readable Markdown deliverables

## Default Save Rules

- If a document is final or reviewable, save it in `MarketingAgentStudio/`
- If a document is a system note, rule, or implementation artifact, save it in `MarketingAgentCore/`
- If the destination is unclear, save it temporarily in `MarketingAgentStudio/00 Inbox/`

## Folder Taxonomy

### `00 Inbox`

Use for:
- rough notes
- raw captures
- unclear drafts
- temporary holding files

### `01 Brand Context`

Use for:
- product context
- brand voice
- ICP
- positioning
- proof points
- brand glossary

### `02 Strategy & Research`

Use for:
- content strategy
- customer research
- launch planning
- marketing ideas
- pricing strategy
- psychology and messaging frameworks

### `03 Website & Copy`

Use for:
- homepage copy
- landing page copy
- website rewrites
- email drafts
- cold outreach
- lead magnets

### `04 SEO & Discoverability`

Use for:
- SEO audits
- AI SEO
- ASO
- competitor alternatives
- programmatic SEO
- schema
- site architecture

### `05 CRO & Funnel`

Use for:
- page CRO
- signup flow improvements
- onboarding improvements
- forms
- popups
- paywalls
- experiments and A/B test plans

### `06 Paid, Social & Community`

Use for:
- ad creative
- paid campaign plans
- social posts
- social calendars
- community marketing assets

### `07 Analytics & Measurement`

Use for:
- event tracking plans
- measurement docs
- KPI notes
- analytics instrumentation artifacts

### `08 Retention & Growth`

Use for:
- churn reduction
- referral programs
- free tool strategy
- retention ideas and loops

### `09 RevOps & Sales`

Use for:
- revops docs
- sales one-pagers
- objection handling
- enablement collateral

## When to Create a New Folder

Create a new subfolder only if all are true:

1. There is no good existing subfolder
2. The topic is likely to produce at least 3 related documents
3. The folder name improves retrieval more than it adds complexity

## When Not to Create a New Folder

Do not create a new folder when:

- the file fits an existing folder with a clear name
- the document is a one-off artifact
- the difference is only format, not subject
- the category is temporary or ambiguous

## Naming Rules

- Use Title Case for folder names already established in the vault
- Use lowercase kebab-case for Markdown file names
- Recommended file pattern:
  - `topic-purpose-month-year.md`
  - `channel-asset-campaign-name.md`
  - `audit-scope-date.md`

Examples:

- `homepage-copy-v1-apr-2026.md`
- `linkedin-post-ideas-apr-2026.md`
- `seo-audit-main-site-2026-04-20.md`

## Index Notes

If a folder starts accumulating many files, create an `index.md` note in that folder summarizing:

- what the folder contains
- the key active documents
- status or next steps if helpful

## Movement Rules

- Prefer moving files from `00 Inbox` into a destination folder once the purpose is clear
- Do not duplicate the same deliverable in multiple folders
- If a document changes category, move it rather than copying it
