# 11 Legal & Compliance — Gobierno Jurídico y Blindaje Regulatorio

Este directorio constituye el repositorio institucional de **estructuración societaria, contratos de SPVs, políticas de cumplimiento y Data Room** de **BRIDS.io**.

> ⚖️ **Principio de Blindaje:** *"Desacoplamiento estricto entre BRIDS Inc. (Delaware C-Corp tecnológica) y las SPVs (LLCs independientes en la jurisdicción de cada inmueble) titulares de cada activo inmobiliario."*

---

## 📌 Estructura de Subdirectorios

- 📜 **`spvs/`**: Contratos constitutivos de las Sociedades de Propósito Especial en sus estados de origen (Florida, Texas, Delaware, etc.: Operating Agreements, PPMs, Subscription Agreements).
- 🏛️ **`delaware-corp/`**: Estatutos corporativos de BRIDS Inc. (Certificate of Incorporation, Bylaws, resoluciones de junta y libros de accionistas).
- 📂 **`data-room/`**: Repositorio estructurado para procesos de Due Diligence con fondos de Venture Capital, entidades bancarias y reguladores.
- 🛡️ **`kyc-aml/`**: Manuales de prevención de lavado de activos, políticas OFAC, procedimientos CIP y documentación de integración con Stripe Identity.
- 🤝 **`partner-agreements/`**: Acuerdos marco de originación y operación inmobiliaria (ej. contrato maestro con Blue Brick Capital, convenios con contratistas y escrow).

---

## 🎯 Custodio y Subagentes Asignados

- **Custodio Primario:** `compliance-officer` (Legal Structuring & RWA Compliance Officer).
- **Conceptos de Referencia:**
  - [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-dual-entity-compliance.md|C1: Dual-Entity Compliance]]
  - [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Lost-Key Recovery Protocol]]
  - [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Squads Multi-Sig Governance]]

---

## 🔗 Vinculación con Arquitectura Técnica e Ingeniería (OKF)

Los aspectos legales de recuperación de llaves, cumplimiento normativo y custodia se sustentan directamente en las especificaciones técnicas sincronizadas en:
- [[01 Negocio/02 Producto & Ingenieria/metaplex-core/freeze-and-recovery-plugins.md|Freeze & Recovery Plugins]]: Justificación on-chain de retención legal y recuperación de títulos para los SPVs en su estado de origen.
- [[01 Negocio/02 Producto & Ingenieria/seguridad/threat-model-and-quality-policy.md|Threat Model & Security Policy]]: Cumplimiento normativo y controles de ciberseguridad para Data Room institucional.
- [[01 Negocio/02 Producto & Ingenieria/current-product-status-matrix.md|Matriz de Estado del Producto]]: Verificación de estado real (live devnet vs mock) para representaciones legales en PPMs y contratos de suscripción.
