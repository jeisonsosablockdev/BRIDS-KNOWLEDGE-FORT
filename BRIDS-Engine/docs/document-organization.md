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

The vault is structured into two primary operational macro-domains plus an inbox:
1. `00 Inbox/`: Raw captures, draft ideas, and formal SDD specifications under review.
2. `01 Negocio/`: Corporate, legal, technical architecture (synced from OKF), unit economics, B2B sales, and governance.
3. `02 Marketing/`: Brand context, strategic content grid, social media assets, copy, lifecycle email, SEO, and growth analytics.

---

### `00 Inbox`
Use for:
- rough notes and quick captures
- temporary holding files
- `Specs/`: formal SDD specifications and active review workspaces (`*.spec.md`, `*.spec.json`)
- `Archive/`: safety backups created automatically by `refine-note.sh`

---

### `01 Negocio` (Business & Infrastructure)

#### `01 Estrategia & Modelo/`
- Master business concepts (`master-business-concepts.md`)
- Detailed unit business concept notes (`Business Concepts/`)
- Market research and TAM/SAM/SOM sizing (`market-research/`)
- Business model, pricing, and monetization frameworks (`business-model/`)

#### `02 Producto & Ingenieria/` (OKF Technical Source of Truth)
- Product status matrix (`current-product-status-matrix.md`) and investor roadmap briefs
- Architecture and platform design (`arquitectura/`)
- Metaplex Core and Solana smart contract specifications (`metaplex-core/`)
- Security audits, threat modeling, and PCI compliance (`seguridad/`)
- Database schemas and API integrations (`api-y-database/`)
- Technical RFCs and implementation runbooks (`rfcs-tecnicos/`)

#### `03 Legal & Cumplimiento/`
- Delaware C-Corp corporate governance and SPV (Series LLC) structuring
- Stripe Identity biometric KYC/AML compliance policies
- Non-broker-dealer safe harbor legal memos
- Terms & Conditions and investor data room preparation (`terminos-condiciones/`)

#### `04 Finanzas & YC Investors/`
- 3-5 year financial models, pro forma projections, and unit economics (`financial-models/`)
- Investor pitch decks (Sequoia/Seed format) and one-pagers (`pitch-decks/`)
- Squads Protocol Multi-Sig treasury governance and USDC yield models (`tesoreria-multisig/`)
- Y Combinator application drafts and investor updates

#### `05 Sponsors B2B & Ventas/`
- B2B Sponsor acquisition collateral and developer pitch decks (`b2b-sponsors/`)
- Sales battlecards, objection handling, and cold outbound sequences
- Real Estate Sponsor onboarding pipelines and pilot agreements

#### `06 Operaciones & Gobernanza/`
- Institutional standard operating procedures (SOPs)
- Key talent hiring scorecards and advisor agreements
- Vendor management and operational compliance

---

### `02 Marketing` (Growth & Communications)

#### `01 Contexto de Marca/`
- Single source of truth for brand voice, positioning, and ICP (`product-marketing-context.md`)
- Positioning matrices and brand glossaries

#### `02 Estrategia & Parrilla/`
- 15-day master editorial content grid (`parrilla-publicaciones-redes-sociales.md`)
- Cross-channel promotional roadmaps and launch strategies

#### `03 Redes Sociales & Contenido/`
- Multi-platform publications: Instagram, LinkedIn, X/Twitter, Telegram, TikTok/Reels
- 4-slide carousels and production manifests (`Assets/`)
- Thought leadership essays and founder voice threads

#### `04 Copywriting & Web/`
- Homepage and landing page copy
- Website rewrites, value proposition testing, and lead magnets
- Conversion rate optimization (CRO) frameworks and experiments

#### `05 Email Marketing/`
- Cold outbound email sequences for investors and sponsors
- Automated onboarding and lifecycle nurture sequences

#### `06 SEO & Descubrimiento/`
- Search engine optimization audits and keyword matrices
- AI Search / Generative Engine Optimization (GEO) strategies
- Competitor alternative comparisons and programmatic landing pages

#### `07 Analitica & Crecimiento/`
- Event tracking taxonomies (GA4, Mixpanel) and conversion funnels
- Growth loops, referral programs, and KPI scorecards

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
