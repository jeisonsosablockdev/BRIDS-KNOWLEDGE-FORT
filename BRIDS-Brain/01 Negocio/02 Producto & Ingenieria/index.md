# 01 Negocio/02 Producto & Ingenieria — Arquitectura Tecnológica y Smart Contracts

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

### 🗺️ 1. Roadmap y Madurez de Producto
- [[01 Negocio/02 Producto & Ingenieria/current-product-status-matrix.md|Matriz Viva de Estado y Madurez de Producto]]
- [[01 Negocio/02 Producto & Ingenieria/app-technical-roadmap-investor-brief.md|Roadmap Técnico e Investor Brief de Producto]]

### 🌐 2. Arquitectura Solana & Auth Híbrido (`arquitectura/`)
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/architecture-overview.md|Arquitectura General del Sistema y Stack Tecnológico]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/solana-stack-spec.md|Especificación Técnica de Infraestructura Solana]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/auth-flow-workos-siws.md|Flujo de Autenticación Híbrida WorkOS y SIWS]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/authority-model-and-multisig.md|Modelo de Autoridades On-Chain y Gobernanza Multi-Sig]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/purchase-tracing-infrastructure.md|Infraestructura de Trazabilidad y Reconciliación de Compras]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/key-rotation-and-emergency-spec.md|Protocolo de Rotación de Llaves y Procedimientos de Emergencia]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/session-model-and-persistence.md|Modelo de Sesión y Persistencia Stateless vs Stateful]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/devnet-proof-and-verifications.md|Evidencia Verificable y Despliegues en Devnet]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/stake-audit-and-traceability.md|Auditoría y Trazabilidad del Mecanismo de Staking de Rentas]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/third-party-integrations-registry.md|Registro de Integraciones y Servicios de Terceros]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/toolchain-maintenance-policy.md|Política de Mantenimiento y Estándares de Toolchain]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/rbac-permissions-model.md|Modelo de Control de Acceso Basado en Roles (RBAC)]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/index.md|Sub-Índice de Arquitectura Solana]]

### 🧩 3. Estándar Metaplex Core (`metaplex-core/`)
- [[01 Negocio/02 Producto & Ingenieria/metaplex-core/metaplex-core-nft-spec.md|Estándar Metaplex Core y Especificación de NFTs RWA]]
- [[01 Negocio/02 Producto & Ingenieria/metaplex-core/freeze-and-recovery-plugins.md|Máquina de Estados de Tokens y Protocolo de Recuperación]]
- [[01 Negocio/02 Producto & Ingenieria/metaplex-core/index.md|Sub-Índice de Metaplex Core]]

### 🛡️ 4. Seguridad, Modelos de Amenazas y Auditorías (`seguridad/`)
- [[01 Negocio/02 Producto & Ingenieria/seguridad/threat-model-and-quality-policy.md|Modelo de Amenazas y Política de Seguridad Técnica]]
- [[01 Negocio/02 Producto & Ingenieria/seguridad/smart-contract-security-guidelines.md|Guía y Políticas de Seguridad para Smart Contracts]]
- [[01 Negocio/02 Producto & Ingenieria/seguridad/data-handling-and-privacy-compliance.md|Políticas de Manejo de Datos y Privacidad (KYC/AML)]]
- [[01 Negocio/02 Producto & Ingenieria/seguridad/pci-compliance-and-fiat-ramps.md|Cumplimiento PCI y Seguridad de Pasarelas Fiat]]
- [[01 Negocio/02 Producto & Ingenieria/seguridad/marketplace-threat-model.md|Modelo de Amenazas del Marketplace Inmobiliario]]
- [[01 Negocio/02 Producto & Ingenieria/seguridad/mint-orchestrator-threat-model.md|Modelo de Amenazas del Orquestador de Minteo]]
- [[01 Negocio/02 Producto & Ingenieria/seguridad/marketplace-security-audit-plan.md|Plan de Auditoría de Seguridad del Marketplace (BRI-164)]]
- [[01 Negocio/02 Producto & Ingenieria/seguridad/index.md|Sub-Índice de Seguridad y Auditorías]]

### 🗄️ 5. Arquitectura de Datos y Schemas (`api-y-database/`)
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/user-profile-schema.md|Modelo de Datos: Perfil de Usuario y Estado KYC]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/marketplace-entry-schema.md|Modelo de Datos: Catálogo Inmobiliario y Metadatos de Activos]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/mint-job-schema.md|Modelo de Datos: Cola de Trabajos de Minteo Asíncrono]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/purchase-attempt-schema.md|Modelo de Datos: Intentos de Compra y Registro de Órdenes]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/stake-action-schema.md|Modelo de Datos: Registro de Acciones de Staking y Rentas]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/authority-registry-schema.md|Modelo de Datos: Registro de Autoridades y Permisos Off-Chain]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/index.md|Sub-Índice de Base de Datos]]

### 🔌 6. Especificaciones de APIs & RPC (`api-y-database/`)
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/marketplace-api.md|Especificación de API: Catálogo Público y Detalle de Inversión]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/purchase-flow-api.md|Especificación de API: Flujo de Compra y Checkout Unificado]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/auth-api.md|Especificación de API: Autenticación, Nonce y Sesión]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/admin-assets-api.md|Especificación de API: Administración de Activos Inmobiliarios]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/collections-api.md|Especificación de API: Gestión de Colecciones Metaplex Core]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/mint-orchestrator-api.md|Especificación de API: Orquestador de Minteo y Emisión]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/stake-distribution-api.md|Especificación de API: Staking y Distribución de Rendimientos]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/webhooks-api.md|Especificación de API: Receptores de Webhooks Externos]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/metaplex-core-rpc.md|Especificación de RPC: Métodos On-Chain de Metaplex Core]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/solana-rpc-methods.md|Especificación de RPC: Métodos Nativos de Solana y Priorización]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/index.md|Sub-Índice de APIs y RPC]]

### 📋 7. Catálogo Maestro de RFCs Técnicos (`rfcs-tecnicos/`)
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/index.md|Índice Consolidado del Catálogo de RFCs (14 Epics)]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-001-admin-asset-create-form.md|EPIC-001: Formulario Administrativo de Creación de Activos]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-002-core-candy-machine-mint-module.md|EPIC-002: Módulo de Minteo con Metaplex Core Candy Machine]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-003-nft-store-purchase-flow.md|EPIC-003: Flujo de Tienda y Compra de NFTs en USDC]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-004-user-profile-kyc-aml.md|EPIC-004: Perfil de Usuario y Cumplimiento KYC/AML Stripe Identity]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-005-migration-solana-kit.md|EPIC-005: Migración Completa de Solana Web3.js a Solana Kit]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-006-freeze-delegate-inheritance.md|EPIC-006: Despliegue de Delegación de Freeze y Gobernanza]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-007-offline-recovery-protocol.md|EPIC-007: Protocolo de Recuperación Institucional ante Pérdida de Llaves]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-008-recarga-recurrente-sphere-solana.md|EPIC-008: Recargas y On-Ramp Fiat Recurrente con Sphere y Littio]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-009-integracion-pasarela-pagos-web2.md|EPIC-009: Integración de Pasarela de Pagos Web2 y Tarjeta]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-010-ai-discovery-seo.md|EPIC-010: Infraestructura de Descubrimiento por IA y SEO Técnico]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-011-admin-collections-console.md|EPIC-011: Consola Administrativa de Colecciones y Proyectos]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-012-referral-marketing-system.md|EPIC-012: Sistema de Mercadeo de Referidos en Panel de Usuario]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-013-pwa-push-notifications.md|EPIC-013: Aplicación Progresiva (PWA) y Notificaciones Web Push]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-014-stake-distribution-traceability.md|EPIC-014: Trazabilidad y Motor de Distribución de Rentas de Staking]]

### 🛠️ 8. Operaciones, Procedimientos & Runbooks (`rfcs-tecnicos/`)
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/devnet-authority-lifecycle.md|Procedimiento Operativo: Ciclo de Vida de Autoridades Devnet]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/candy-machine-deploy-validation.md|Procedimiento Operativo: Validación de Despliegues de Candy Machine]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/health-checks-monitoring.md|Procedimiento Operativo: Monitoreo de Salud y Disponibilidad]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/purchase-trace-verification.md|Procedimiento Operativo: Verificación de Trazabilidad de Compras]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/backup-and-restore-procedures.md|Procedimiento Operativo: Respaldo y Restauración de Datos]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/index.md|Sub-Índice de Operaciones y Runbooks]]

---

## 🎯 Custodios y Subagentes Asignados
- **Custodios Primarios:** Equipo de Ingeniería, `compliance-officer`, `pitch-deck-architect`, `business-consultant`.
- **Conceptos de Referencia:**
  - [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Solana RWA Advantage]]
  - [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Lost-Key Recovery Protocol]]
  - [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Squads Multi-Sig Governance]]
  - [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-dual-entity-compliance.md|C4: Dual-Entity Compliance]]
