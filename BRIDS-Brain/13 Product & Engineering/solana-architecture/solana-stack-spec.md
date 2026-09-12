---
title: "Especificación Técnica de Infraestructura Solana"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Solana Architecture"
source_okf: "knowledge/architecture/solana-stack.md"
tags: [solana, smart-contracts, umi, solana-kit, tps]
updated_at: "2026-09-12T01:20:05.330Z"
---

# Especificación Técnica de Infraestructura Solana

> [!NOTE]
> **Resumen Técnico:** Detalle de integración con devnet/mainnet, Umi, Solana Kit, priorización de fees y manejo de transacciones.
> *Documento sincronizado automáticamente desde el repositorio técnico institucional (OKF v0.1).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[02 Strategy & Research/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[02 Strategy & Research/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[02 Strategy & Research/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[02 Strategy & Research/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

Use this guide when evaluating RFCs involving infrastructure, DeFi, security, or NFTs.

## @helius (Infrastructure & Indexing)
- **DAS API**: Prefer `getAsset` / `searchAssets` over standard RPC calls for NFT data.
- **Webhooks**: Use for tracking sales, mints, or transfers. Avoid cron jobs polling the chain.
- **Jito**: Mention Jito bundles if transaction landing speed is critical (MEV protection).

## @jupiter (DeFi & Pricing)
- **Swap API**: Use for any in-app token exchange.
- **Price API**: Source of truth for USD conversion rates.
- **Payments**: If accepting payments in arbitrary tokens, route through Jupiter.

## @squads (Security & Governance)
- **Multisig**: ALL Program Authorities and Treasuries on Mainnet MUST be Squads v4.
- **Proposal Workflow**: Code updates should be proposed via Squads transaction builder.
- **Emergency Brake**: Designate a Squads multisig as the freeze authority.

## @metaplex (NFTs & Assets)
- **Core**: Default for new collections (cheaper, plugin system).
- **Token Metadata**: Legacy standard, use only if backward compatibility is needed.
- **Bubblegum**: Mandatory for high-volume, low-cost assets (cNFTs).
- **Umi**: Use Umi library over web3.js for Metaplex interactions.

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (OKF v0.1) | Sincronización e ingesta canónica desde knowledge/architecture/solana-stack.md |
