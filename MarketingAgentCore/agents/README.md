# BRIDS Founder & YC Sub-Agent Squad

This directory houses the code-level definitions, system prompts, capability configurations, and skill assignments for the **BRIDS.io Founder & YC Sub-Agent Squad**.

These sub-agents are engineered to cover every critical business front—financial modeling, market research, slide deck generation, regulatory compliance, sponsor sales, and founder storytelling—specifically calibrated for preparing BRIDS.io for **Y Combinator (YC)** application and Tier-1 venture fundraising.

---

## The 6 Sub-Agents

| Agent Identifier | Role | Core Focus | Output Destinations |
|---|---|---|---|
| [`business-consultant`](business-consultant.md) | Business Model & Unit Economics Architect | Monetization tiers, fee architecture (SaaS, processing, recovery), unit economics (CAC/LTV), 3-5y pro forma projections. | `BRIDS Brain/02 Strategy & Research/business-model/`, `BRIDS Brain/10 RevOps & Sales/pricing/` |
| [`market-research-analyst`](market-research-analyst.md) | Market Research & TAM/SAM/SOM Analyst | Top-down & bottom-up TAM/SAM/SOM sizing, real-time web research, competitive benchmarks (Lofty, RealT, HoneyBricks, Blocksquare). | `BRIDS Brain/02 Strategy & Research/market-research/`, `BRIDS Brain/02 Strategy & Research/competitor-analysis/` |
| [`pitch-deck-architect`](pitch-deck-architect.md) | YC & Sequoia Pitch Deck Architect | 10-12 slide YC/Sequoia narrative decks, automated native `.pptx` generation via `python-pptx`, slide scripts. | `BRIDS Brain/02 Strategy & Research/pitch-decks/`, `MarketingAgentCore/outputs/decks/` |
| [`compliance-officer`](compliance-officer.md) | Legal Structuring & RWA Compliance Officer | Dual-entity separation (Delaware C-Corp vs Sponsor SPV LLCs), non-broker-dealer status, Stripe Identity KYC/AML, Metaplex Core Freeze/Recovery plugins, Data Room preparation. | `BRIDS Brain/01 Brand Context/compliance/`, `BRIDS Brain/02 Strategy & Research/due-diligence/` |
| [`b2b-sponsor-lead`](b2b-sponsor-lead.md) | Real Estate Sponsor Acquisition & RevOps | B2B developer value proposition, institutional one-pagers, cold outbound email sequences, pilot onboarding pipeline. | `BRIDS Brain/10 RevOps & Sales/b2b-sponsors/`, `BRIDS Brain/03 Campaigns/sponsor-acquisition/` |
| [`founder-ghostwriter`](founder-ghostwriter.md) | Founder Voice, Thought Leadership & YC Storyteller | Founder essays for YC application ("Why now?", "Unique insight"), X/Twitter threads on Solana RWA, LinkedIn articles, monthly investor updates. | `BRIDS Brain/04 Social & Community/`, `BRIDS Brain/07 Newsletters/`, `BRIDS Brain/02 Strategy & Research/yc-application/` |

---

## Canonical Manifest
All sub-agents are registered in machine-readable format in [`agents-manifest.json`](agents-manifest.json).

## Integration Protocol
1. **Live Runtime Registration:** Sub-agents are registered into the Antigravity agent execution environment via `define_subagent`.
2. **Persistence & Version Control:** All system prompts, skill bindings, and guidelines live here under version control (`git`).
3. **Execution Delivery:** When invoked, each sub-agent writes structured markdown notes directly into `BRIDS Brain/` following the vault schema and `AGENTS.md` guidelines.
