# 13 Product & Engineering — Arquitectura Tecnológica y Smart Contracts

Este directorio constituye la **fuente canónica de especificaciones de ingeniería, arquitectura de smart contracts en Solana, modelos de datos, protocolos de seguridad y RFCs** de **BRIDS.io**.

> [!NOTE]
> **Tesis Tecnológica Fundamental:** *"Arquitectura de cuenta única de ultra-bajo coste con Metaplex Core en Solana, combinada con verificación biométrica en Stripe Identity, multisig institucional en Squads Protocol y pasarelas de pago híbridas crypto/fiat."*
> Toda la documentación en esta sección se sincroniza automáticamente desde el repositorio técnico oficial (`jeisonsosablockdev/brids`, rama `develop`) mediante `sync-technical-docs.sh`.
> 
> **Estado del Catálogo Técnico:**
> - 📌 **Último Commit Sincronizado:** `6a40b30` (2026-08-22)
> - 📦 **Total de Artefactos OKF en Repositorio:** 595 documentos (Arquitectura, RFCs, APIs, DB, Seguridad, Operaciones).
> - 🛡️ **Garantía Anti-Drift:** Versionado continuo con respaldos automáticos en `00 Inbox/Archive/` y validación estricta de bóveda.

---

## 🧭 Mapa Canónico de Ingeniería (Estructura de Dominios)

### 🗺️ 1. Roadmap y Madurez de Producto (`product-roadmap/`)
- [[13 Product & Engineering/product-roadmap/current-product-status-matrix.md|Matriz Viva de Estado y Madurez de Producto]]
- [[13 Product & Engineering/product-roadmap/app-technical-roadmap-investor-brief.md|Roadmap Técnico e Investor Brief de Producto]]
- [[13 Product & Engineering/product-roadmap/index.md|Sub-Índice de Roadmap de Producto]]

### 🌐 2. Arquitectura Solana & Auth Híbrido (`solana-architecture/`)
- [[13 Product & Engineering/solana-architecture/architecture-overview.md|Arquitectura General del Sistema y Stack Tecnológico]]
- [[13 Product & Engineering/solana-architecture/solana-stack-spec.md|Especificación Técnica de Infraestructura Solana]]
- [[13 Product & Engineering/solana-architecture/auth-flow-workos-siws.md|Flujo de Autenticación Híbrida WorkOS y SIWS]]
- [[13 Product & Engineering/solana-architecture/authority-model-and-multisig.md|Modelo de Autoridades On-Chain y Gobernanza Multi-Sig]]
- [[13 Product & Engineering/solana-architecture/purchase-tracing-infrastructure.md|Infraestructura de Trazabilidad y Reconciliación de Compras]]
- [[13 Product & Engineering/solana-architecture/key-rotation-and-emergency-spec.md|Protocolo de Rotación de Llaves y Procedimientos de Emergencia]]
- [[13 Product & Engineering/solana-architecture/session-model-and-persistence.md|Modelo de Sesión y Persistencia Stateless vs Stateful]]
- [[13 Product & Engineering/solana-architecture/devnet-proof-and-verifications.md|Evidencia Verificable y Despliegues en Devnet]]
- [[13 Product & Engineering/solana-architecture/stake-audit-and-traceability.md|Auditoría y Trazabilidad del Mecanismo de Staking de Rentas]]
- [[13 Product & Engineering/solana-architecture/third-party-integrations-registry.md|Registro de Integraciones y Servicios de Terceros]]
- [[13 Product & Engineering/solana-architecture/toolchain-maintenance-policy.md|Política de Mantenimiento y Estándares de Toolchain]]
- [[13 Product & Engineering/solana-architecture/rbac-permissions-model.md|Modelo de Control de Acceso Basado en Roles (RBAC)]]
- [[13 Product & Engineering/solana-architecture/index.md|Sub-Índice de Arquitectura Solana]]

### 🧩 3. Estándar Metaplex Core (`metaplex-core-specs/`)
- [[13 Product & Engineering/metaplex-core-specs/metaplex-core-nft-spec.md|Estándar Metaplex Core y Especificación de NFTs RWA]]
- [[13 Product & Engineering/metaplex-core-specs/freeze-and-recovery-plugins.md|Máquina de Estados de Tokens y Protocolo de Recuperación]]
- [[13 Product & Engineering/metaplex-core-specs/index.md|Sub-Índice de Metaplex Core]]

### 🛡️ 4. Seguridad, Modelos de Amenazas y Auditorías (`security-audits/`)
- [[13 Product & Engineering/security-audits/threat-model-and-quality-policy.md|Modelo de Amenazas y Política de Seguridad Técnica]]
- [[13 Product & Engineering/security-audits/smart-contract-security-guidelines.md|Guía y Políticas de Seguridad para Smart Contracts]]
- [[13 Product & Engineering/security-audits/data-handling-and-privacy-compliance.md|Políticas de Manejo de Datos y Privacidad (KYC/AML)]]
- [[13 Product & Engineering/security-audits/pci-compliance-and-fiat-ramps.md|Cumplimiento PCI y Seguridad de Pasarelas Fiat]]
- [[13 Product & Engineering/security-audits/marketplace-threat-model.md|Modelo de Amenazas del Marketplace Inmobiliario]]
- [[13 Product & Engineering/security-audits/mint-orchestrator-threat-model.md|Modelo de Amenazas del Orquestador de Minteo]]
- [[13 Product & Engineering/security-audits/marketplace-security-audit-plan.md|Plan de Auditoría de Seguridad del Marketplace (BRI-164)]]
- [[13 Product & Engineering/security-audits/index.md|Sub-Índice de Seguridad y Auditorías]]

### 🗄️ 5. Arquitectura de Datos y Schemas (`database-architecture/`)
- [[13 Product & Engineering/database-architecture/user-profile-schema.md|Modelo de Datos: Perfil de Usuario y Estado KYC]]
- [[13 Product & Engineering/database-architecture/marketplace-entry-schema.md|Modelo de Datos: Catálogo Inmobiliario y Metadatos de Activos]]
- [[13 Product & Engineering/database-architecture/mint-job-schema.md|Modelo de Datos: Cola de Trabajos de Minteo Asíncrono]]
- [[13 Product & Engineering/database-architecture/purchase-attempt-schema.md|Modelo de Datos: Intentos de Compra y Registro de Órdenes]]
- [[13 Product & Engineering/database-architecture/stake-action-schema.md|Modelo de Datos: Registro de Acciones de Staking y Rentas]]
- [[13 Product & Engineering/database-architecture/authority-registry-schema.md|Modelo de Datos: Registro de Autoridades y Permisos Off-Chain]]
- [[13 Product & Engineering/database-architecture/index.md|Sub-Índice de Base de Datos]]

### 🔌 6. Especificaciones de APIs & RPC (`api-specifications/`)
- [[13 Product & Engineering/api-specifications/marketplace-api.md|Especificación de API: Catálogo Público y Detalle de Inversión]]
- [[13 Product & Engineering/api-specifications/purchase-flow-api.md|Especificación de API: Flujo de Compra y Checkout Unificado]]
- [[13 Product & Engineering/api-specifications/auth-api.md|Especificación de API: Autenticación, Nonce y Sesión]]
- [[13 Product & Engineering/api-specifications/admin-assets-api.md|Especificación de API: Administración de Activos Inmobiliarios]]
- [[13 Product & Engineering/api-specifications/collections-api.md|Especificación de API: Gestión de Colecciones Metaplex Core]]
- [[13 Product & Engineering/api-specifications/mint-orchestrator-api.md|Especificación de API: Orquestador de Minteo y Emisión]]
- [[13 Product & Engineering/api-specifications/stake-distribution-api.md|Especificación de API: Staking y Distribución de Rendimientos]]
- [[13 Product & Engineering/api-specifications/webhooks-api.md|Especificación de API: Receptores de Webhooks Externos]]
- [[13 Product & Engineering/api-specifications/metaplex-core-rpc.md|Especificación de RPC: Métodos On-Chain de Metaplex Core]]
- [[13 Product & Engineering/api-specifications/solana-rpc-methods.md|Especificación de RPC: Métodos Nativos de Solana y Priorización]]
- [[13 Product & Engineering/api-specifications/index.md|Sub-Índice de APIs y RPC]]

### 📋 7. Catálogo Maestro de RFCs Técnicos (`technical-rfcs/`)
- [[13 Product & Engineering/technical-rfcs/index.md|Índice Consolidado del Catálogo de RFCs (14 Epics)]]
- [[13 Product & Engineering/technical-rfcs/epic-001-admin-asset-create-form.md|EPIC-001: Formulario Administrativo de Creación de Activos]]
- [[13 Product & Engineering/technical-rfcs/epic-002-core-candy-machine-mint-module.md|EPIC-002: Módulo de Minteo con Metaplex Core Candy Machine]]
- [[13 Product & Engineering/technical-rfcs/epic-003-nft-store-purchase-flow.md|EPIC-003: Flujo de Tienda y Compra de NFTs en USDC]]
- [[13 Product & Engineering/technical-rfcs/epic-004-user-profile-kyc-aml.md|EPIC-004: Perfil de Usuario y Cumplimiento KYC/AML Stripe Identity]]
- [[13 Product & Engineering/technical-rfcs/epic-005-migration-solana-kit.md|EPIC-005: Migración Completa de Solana Web3.js a Solana Kit]]
- [[13 Product & Engineering/technical-rfcs/epic-006-freeze-delegate-inheritance.md|EPIC-006: Despliegue de Delegación de Freeze y Gobernanza]]
- [[13 Product & Engineering/technical-rfcs/epic-007-offline-recovery-protocol.md|EPIC-007: Protocolo de Recuperación Institucional ante Pérdida de Llaves]]
- [[13 Product & Engineering/technical-rfcs/epic-008-recarga-recurrente-sphere-solana.md|EPIC-008: Recargas y On-Ramp Fiat Recurrente con Sphere y Littio]]
- [[13 Product & Engineering/technical-rfcs/epic-009-integracion-pasarela-pagos-web2.md|EPIC-009: Integración de Pasarela de Pagos Web2 y Tarjeta]]
- [[13 Product & Engineering/technical-rfcs/epic-010-ai-discovery-seo.md|EPIC-010: Infraestructura de Descubrimiento por IA y SEO Técnico]]
- [[13 Product & Engineering/technical-rfcs/epic-011-admin-collections-console.md|EPIC-011: Consola Administrativa de Colecciones y Proyectos]]
- [[13 Product & Engineering/technical-rfcs/epic-012-referral-marketing-system.md|EPIC-012: Sistema de Mercadeo de Referidos en Panel de Usuario]]
- [[13 Product & Engineering/technical-rfcs/epic-013-pwa-push-notifications.md|EPIC-013: Aplicación Progresiva (PWA) y Notificaciones Web Push]]
- [[13 Product & Engineering/technical-rfcs/epic-014-stake-distribution-traceability.md|EPIC-014: Trazabilidad y Motor de Distribución de Rentas de Staking]]

### 🛠️ 8. Operaciones, Procedimientos & Runbooks (`operations-and-runbooks/`)
- [[13 Product & Engineering/operations-and-runbooks/devnet-authority-lifecycle.md|Procedimiento Operativo: Ciclo de Vida de Autoridades Devnet]]
- [[13 Product & Engineering/operations-and-runbooks/candy-machine-deploy-validation.md|Procedimiento Operativo: Validación de Despliegues de Candy Machine]]
- [[13 Product & Engineering/operations-and-runbooks/health-checks-monitoring.md|Procedimiento Operativo: Monitoreo de Salud y Disponibilidad]]
- [[13 Product & Engineering/operations-and-runbooks/purchase-trace-verification.md|Procedimiento Operativo: Verificación de Trazabilidad de Compras]]
- [[13 Product & Engineering/operations-and-runbooks/backup-and-restore-procedures.md|Procedimiento Operativo: Respaldo y Restauración de Datos]]
- [[13 Product & Engineering/operations-and-runbooks/index.md|Sub-Índice de Operaciones y Runbooks]]

---

## 🎯 Custodios y Subagentes Asignados
- **Custodios Primarios:** Equipo de Ingeniería, `compliance-officer`, `pitch-deck-architect`, `business-consultant`.
- **Conceptos de Referencia:**
  - [[02 Strategy & Research/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Solana RWA Advantage]]
  - [[02 Strategy & Research/Business Concepts/concept-wallet-recovery-protocol.md|C2: Lost-Key Recovery Protocol]]
  - [[02 Strategy & Research/Business Concepts/concept-multisig-treasury-governance.md|C8: Squads Multi-Sig Governance]]
  - [[02 Strategy & Research/Business Concepts/concept-dual-entity-compliance.md|C4: Dual-Entity Compliance]]
