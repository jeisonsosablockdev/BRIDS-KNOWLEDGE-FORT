# 13 Product & Engineering — Arquitectura Tecnológica y Smart Contracts

Este directorio contiene las **especificaciones de ingeniería, arquitectura de smart contracts en Solana, integraciones de protocolos y reportes de seguridad** de **BRIDS.io**.

> [!NOTE]
> **Principio Tecnológico:** *"Arquitectura de cuenta única de bajo coste con Metaplex Core en Solana, combinada con verificación biométrica en Stripe Identity y multisig institucional en Squads."*
> Toda la documentación en esta sección se sincroniza automáticamente desde el repositorio técnico oficial (`jeisonsosablockdev/brids`, rama `develop`) mediante `sync-technical-docs.sh`.
> 
> **Estado del Catálogo Técnico:**
> - 📌 **Último Commit Sincronizado:** `6a40b30` (2026-08-22)
> - 📦 **Total de Artefactos OKF en Repositorio:** 595 documentos (Arquitectura, RFCs, APIs, DB, Seguridad).
> - 🛡️ **Garantía Anti-Drift:** Versionado continuo con respaldos automáticos en `00 Inbox/Archive/`.

---

## 📌 Documentos Clave de Ingeniería Sincronizados

### 🗺️ 1. Roadmap y Madurez de Producto (`product-roadmap/`)
- [[13 Product & Engineering/product-roadmap/current-product-status-matrix.md|Matriz Viva de Estado y Madurez de Producto]]
- [[13 Product & Engineering/product-roadmap/app-technical-roadmap-investor-brief.md|Roadmap Técnico e Investor Brief de Producto]]

### 🌐 2. Arquitectura Solana (`solana-architecture/`)
- [[13 Product & Engineering/solana-architecture/architecture-overview.md|Arquitectura General del Sistema y Stack Tecnológico]]
- [[13 Product & Engineering/solana-architecture/solana-stack-spec.md|Especificación Técnica de Infraestructura Solana]]

### 🧩 3. Estándar Metaplex Core (`metaplex-core-specs/`)
- [[13 Product & Engineering/metaplex-core-specs/metaplex-core-nft-spec.md|Estándar Metaplex Core y Especificación de NFTs RWA]]
- [[13 Product & Engineering/metaplex-core-specs/freeze-and-recovery-plugins.md|Máquina de Estados de Tokens y Protocolo de Recuperación]]

### 🛡️ 4. Seguridad y Auditorías (`security-audits/`)
- [[13 Product & Engineering/security-audits/threat-model-and-quality-policy.md|Modelo de Amenazas y Política de Seguridad Técnica]]

---

## 🎯 Custodios y Subagentes Asignados
- **Custodios Primarios:** Equipo de Ingeniería, `compliance-officer`, `pitch-deck-architect`.
- **Conceptos de Referencia:**
  - [[02 Strategy & Research/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Solana RWA Advantage]]
  - [[02 Strategy & Research/Business Concepts/concept-wallet-recovery-protocol.md|C2: Lost-Key Recovery Protocol]]
  - [[02 Strategy & Research/Business Concepts/concept-multisig-treasury-governance.md|C8: Squads Multi-Sig Governance]]
