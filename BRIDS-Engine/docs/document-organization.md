# Document Organization Rules

This file defines how the system should organize Markdown documents and when it may create new folders.

## Core Principle

- `BRIDS-Engine/` holds logic, skills, rules, and source context
- `BRIDS-Brain/` holds human-readable Markdown deliverables

## Default Save Rules

- If a document is final or reviewable, save it in `BRIDS-Brain/`
- If a document is a system note, rule, or implementation artifact, save it in `BRIDS-Engine/`
- If the destination is unclear, save it temporarily in `BRIDS-Brain/00 Inbox/`

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
- lead magnets
- copy editing

### `04 Email & Lifecycle`

Use for:
- cold email sequences
- email nurture flows
- onboarding email lifecycles
- outbound campaign drafts

### `05 SEO & Discoverability`

Use for:
- SEO audits
- AI SEO (GEO / Generative Engine Optimization)
- ASO (App Store Optimization)
- competitor alternatives
- programmatic SEO
- schema markup
- site architecture

### `06 CRO & Funnel`

Use for:
- page CRO
- signup flow improvements
- onboarding conversion
- forms & popups
- paywalls
- experiments and A/B test plans

### `07 Paid, Social & Community`

Use for:
- ad creative & paid campaigns
- social media posts (LinkedIn, X, Telegram)
- 4-slide carousels & publication assets
- editorial content grids (parrilla)
- community marketing assets

### `08 Analytics & Measurement`

Use for:
- event tracking plans (GA4, Mixpanel)
- measurement frameworks
- KPI scorecards and dashboards
- analytics instrumentation notes

### `09 Retention & Growth`

Use for:
- churn reduction & prevention
- referral programs
- free tool strategy
- retention ideas and growth loops

### `10 RevOps & Sales`

Use for:
- revops docs & pipeline management
- B2B sponsor acquisition collateral
- sales battlecards & one-pagers
- objection handling and sales enablement

### `11 Legal & Compliance`

Use for:
- Delaware C-Corp corporate governance
- SPV (Series LLC) structuring & asset segregation
- Data Room preparation & investor due diligence
- Stripe Identity KYC/AML compliance & non-broker-dealer safe harbor

### `12 Finance & Treasury`

Use for:
- quantitative 3-5 year financial models & unit economics
- Cap Table & equity dilution scenarios
- runway, cash burn & budget tracking
- Squads Protocol Multi-Sig treasury governance

### `13 Product & Engineering`

Use for:
- Solana blockchain infrastructure architecture
- Metaplex Core plugin specifications (Freeze & Authority/Recovery)
- smart contract security audits & PRDs
- technical product roadmaps

### `14 Investor Relations & YC`

Use for:
- Y Combinator application essays & interview preparation
- 10-12 slide investor pitch decks (Sequoia / Seed format)
- monthly investor updates & shareholder letters
- venture capital pipeline & CRM

### `15 Operations & Governance`

Use for:
- institutional standard operating procedures (SOPs)
- key talent hiring plans & scorecards
- advisor agreements & board resolutions
- vendor management & operational compliance

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
