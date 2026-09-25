# 11 Legal & Compliance — Gobierno Jurídico y Blindaje Regulatorio

Este directorio constituye el repositorio institucional de **estructuración societaria, contratos de SPVs, políticas de cumplimiento y Data Room** de **BRIDS.io**.

> ⚖️ **Principio de Blindaje:** *"Desacoplamiento estricto entre BRIDS Inc. (Delaware C-Corp tecnológica) y las SPVs (LLCs independientes en la jurisdicción de cada inmueble) titulares de cada activo inmobiliario."*

---

## 📌 Estructura de Subdirectorios

- 📜 **`spvs/`**: Contratos constitutivos de las Sociedades de Propósito Especial en sus estados de origen (Florida, Texas, Delaware, etc.: Operating Agreements, PPMs, Subscription Agreements).
- 🏛️ **`delaware-corp/` y Estrategia Societaria:**
  - [[01 Negocio/03 Legal & Cumplimiento/comparativa-llc-vs-c-corp-estrategia-bootstrap.md|Comparativa Estratégica LLC vs. Delaware C-Corp y Hoja de Ruta de Conversión]]: Decisión ejecutiva bootstrap (arrancar con LLC, retrasar C-Corp hasta Term Sheet de VC), comparativa Wyoming vs. Delaware, y protocolo de conversión estatutaria (DGCL § 265 / IRC § 351).
  - [[01 Negocio/03 Legal & Cumplimiento/delaware-corp/delaware-c-corp-incorporation-and-banking-architecture.md|Arquitectura Corporativa Delaware C-Corp y Rieles Financieros Solana]]: Formación remota, acciones (10M @ $0.00001), Assumed Par Value, EIN sin SSN, y rieles Bridge/Stripe.
- 📑 **Cumplimiento Fiscal & Regulatorio (IRS / FinCEN / Delaware):**
  - [[01 Negocio/03 Legal & Cumplimiento/manual-cumplimiento-tributario-irs-calendario-fiscal.md|Manual de Cumplimiento Tributario IRS, Blindaje Form 5472 y Calendario Fiscal Maestro]]: Guía definitiva anti-sanciones ($25k penalty shield Form 5472 / Pro Forma 1120), Form 1120 C-Corp, FinCEN BOI, créditos I+D (IRC § 41) y cronograma anual unificado de vencimientos.
- 🏢 **Plataforma Go-To de Incorporación & Banca:**
  - [[01 Negocio/03 Legal & Cumplimiento/proveedor-oficial-incorporacion-banca-stablecorp.md|Ficha Institucional y Plataforma Go-To: Stablecorp]]: Designación oficial de Stablecorp (*Xelio Technologies Inc. / Colosseum*) como plataforma preferente para formación de LLC inicial, obtención remota de EIN sin SSN, banca US y rampa USDC en Solana (Bridge/Stripe), compliance anual Form 5472 y conversión estatutaria a C-Corp.
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
