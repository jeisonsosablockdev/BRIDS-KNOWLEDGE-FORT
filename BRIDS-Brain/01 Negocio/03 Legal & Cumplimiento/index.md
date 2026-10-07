# 11 Legal & Compliance — Gobierno Jurídico y Blindaje Regulatorio

Este directorio constituye el repositorio institucional de **estructuración societaria, contratos de SPVs, políticas de cumplimiento y Data Room** de **BRIDS.io**.

> ⚖️ **Principio de Blindaje:** *"Desacoplamiento estricto entre BRIDS Inc. (Delaware C-Corp tecnológica) y las SPVs (LLCs independientes en la jurisdicción de cada inmueble) titulares de cada activo inmobiliario."*

---

## 📌 Documentos Canónicos de Legal & Cumplimiento

- 🏛️ **Estrategia Societaria & Delaware C-Corp:**
  - [[01 Negocio/03 Legal & Cumplimiento/comparativa-llc-vs-c-corp-estrategia-bootstrap.md|Comparativa Estratégica LLC vs. Delaware C-Corp y Hoja de Ruta de Conversión]]: Decisión ejecutiva bootstrap (arrancar con LLC, retrasar C-Corp hasta Term Sheet de VC), comparativa Wyoming vs. Delaware, y protocolo de conversión estatutaria (DGCL § 265 / IRC § 351).
  - [[01 Negocio/03 Legal & Cumplimiento/delaware-c-corp-incorporation-and-banking-architecture.md|Arquitectura Corporativa Delaware C-Corp y Rieles Financieros Solana]]: Formación remota, acciones (10M @ $0.00001), Assumed Par Value, EIN sin SSN, y rieles Bridge/Stripe.
  - [[01 Negocio/03 Legal & Cumplimiento/hoja-ruta-regulatoria-3-fases-broker-dealer-ats.md|Hoja de Ruta Regulatoria en 3 Fases: Reg S/D, Broker-Dealer Shell y ATS en Solana]]: Escalamiento regulatorio internacional y doméstico.
- 📑 **Cumplimiento Fiscal & Regulatorio (IRS / FinCEN / Delaware):**
  - [[01 Negocio/03 Legal & Cumplimiento/flujo-onboarding-fiscal-inversores-internacionales-w8ben-1042s.md|Flujo de Onboarding Fiscal para Inversionistas Internacionales: Formulario W-8BEN y Formulario IRS 1042-S]]: Guía operativa de tributación de no residentes, por qué no usan K-1, y automatización API de 1042-S para compras de 1 a 500+ fracciones.
  - [[01 Negocio/03 Legal & Cumplimiento/manual-cumplimiento-tributario-irs-calendario-fiscal.md|Manual de Cumplimiento Tributario IRS, Blindaje Form 5472 y Calendario Fiscal Maestro]]: Guía definitiva anti-sanciones ($25k penalty shield Form 5472 / Pro Forma 1120), Form 1120 C-Corp, FinCEN BOI, créditos I+D (IRC § 41) y cronograma anual unificado de vencimientos.
- 🏢 **Plataforma Go-To de Incorporación & Banca:**
  - [[01 Negocio/03 Legal & Cumplimiento/proveedor-oficial-incorporacion-banca-stablecorp.md|Ficha Institucional y Plataforma Go-To: Stablecorp]]: Designación oficial de Stablecorp (*Xelio Technologies Inc. / Colosseum*) como plataforma preferente para formación de LLC inicial, obtención remota de EIN sin SSN, banca US y rampa USDC en Solana (Bridge/Stripe), compliance anual Form 5472 y conversión estatutaria a C-Corp.

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
- [[01 Negocio/02 Producto & Ingenieria/metaplex-core/freeze-and-recovery-plugins.md|Freeze & Recovery Plugins]]: Justificación on-chain de retención legal y recuperación de títulos para los Delaware SPVs.
- [[01 Negocio/02 Producto & Ingenieria/seguridad/threat-model-and-quality-policy.md|Threat Model & Security Policy]]: Cumplimiento normativo y controles de ciberseguridad para Data Room institucional.
- [[01 Negocio/02 Producto & Ingenieria/current-product-status-matrix.md|Matriz de Estado del Producto]]: Verificación de estado real (live devnet vs mock) para representaciones legales en PPMs y contratos de suscripción.
