# BRIDS Founder & YC Sub-Agent Squad

This directory houses the autonomous YAML definitions, system prompts, capability configurations, and skill assignments for the **BRIDS.io Founder & YC Sub-Agent Squad**.

Each sub-agent lives as an individual, self-contained YAML file containing metadata, permissions, assigned skills, output destinations, and its full directive system prompt.

---

## The 6 Sub-Agents

| Agent Identifier | YAML Definition | Role | Core Focus |
|---|---|---|---|
| `business-consultant` | [`business-consultant.yaml`](business-consultant.yaml) | Business Model & Unit Economics Architect | Monetization tiers, fee architecture (SaaS, processing, recovery), unit economics (CAC/LTV), 3-5y pro forma projections. |
| `market-research-analyst` | [`market-research-analyst.yaml`](market-research-analyst.yaml) | Market Research & TAM/SAM/SOM Analyst | Top-down & bottom-up TAM/SAM/SOM sizing, real-time web research, competitive benchmarks (Lofty, RealT, HoneyBricks, Blocksquare). |
| `pitch-deck-architect` | [`pitch-deck-architect.yaml`](pitch-deck-architect.yaml) | YC & Sequoia Pitch Deck Architect | 10-12 slide YC/Sequoia narrative decks, automated native `.pptx` generation via `python-pptx`, slide scripts. |
| `compliance-officer` | [`compliance-officer.yaml`](compliance-officer.yaml) | Legal Structuring & RWA Compliance Officer | Dual-entity separation (Delaware C-Corp vs Sponsor SPV LLCs), non-broker-dealer status, Stripe Identity KYC/AML, Metaplex Core Freeze/Recovery plugins, Data Room preparation. |
| `b2b-sponsor-lead` | [`b2b-sponsor-lead.yaml`](b2b-sponsor-lead.yaml) | Real Estate Sponsor Acquisition & RevOps | B2B developer value proposition, institutional one-pagers, cold outbound email sequences, pilot onboarding pipeline. |
| `founder-ghostwriter` | [`founder-ghostwriter.yaml`](founder-ghostwriter.yaml) | Founder Voice, Thought Leadership & YC Storyteller | Founder essays for YC application ("Why now?", "Unique insight"), X/Twitter threads on Solana RWA, LinkedIn articles, monthly investor updates. |

---

## Verification
To inspect and validate all configured sub-agents:
```bash
bash BRIDS-Engine/scripts/inspect-squad.sh
```
