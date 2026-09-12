# Catálogo Maestro de RFCs Técnicos de BRIDS (EPIC-001 al EPIC-014)

Este directorio contiene las especificaciones formales de arquitectura de software (**Request for Comments**) que definen cada uno de los grandes hitos de ingeniería y producto de **BRIDS.io**.

> [!NOTE]
> **Resumen del Catálogo:** Catálogo consolidado de los 14 Epics técnicos de la plataforma, sincronizados desde `develop/knowledge/rfcs/` (Commit: `6a40b30`).
> Define desde la captura administrativa de activos, pasando por Candy Machine en Metaplex Core y checkout en USDC, hasta el motor de staking y distribución de rentas.

---

## 📊 Matriz Consolidada de Epics Técnicos

| Epic ID | Título del Documento | Estado de Implementación | Alcance y Propósito Principal |
|---|---|---|---|
| `EPIC-001` | [[13 Product & Engineering/technical-rfcs/epic-001-admin-asset-create-form.md\|Formulario Administrativo de Creación de Activos]] | `Implemented` | Captura off-chain y almacenamiento en Google Cloud Storage con URLs firmadas y pipelines CSV. |
| `EPIC-002` | [[13 Product & Engineering/technical-rfcs/epic-002-core-candy-machine-mint-module.md\|Módulo de Minteo con Metaplex Core Candy Machine]] | `Implemented (Devnet)` | Lógica on-chain en Solana para despliegue de Candy Machines con activos Metaplex Core. |
| `EPIC-003` | [[13 Product & Engineering/technical-rfcs/epic-003-nft-store-purchase-flow.md\|Flujo de Tienda y Compra de NFTs en USDC]] | `Implemented` | Checkout de compra directa con USDC, validación de balance y orquestación de minteo. |
| `EPIC-004` | [[13 Product & Engineering/technical-rfcs/epic-004-user-profile-kyc-aml.md\|Perfil de Usuario y Cumplimiento KYC/AML Stripe Identity]] | `Foundation Built` | Verificación biométrica no custodia, persistencia de estatus y compliance gates. |
| `EPIC-005` | [[13 Product & Engineering/technical-rfcs/epic-005-migration-solana-kit.md\|Migración Completa de Solana Web3.js a Solana Kit]] | `Implemented` | Transición hacia la nueva suite modular de alto rendimiento @solana/kit. |
| `EPIC-006` | [[13 Product & Engineering/technical-rfcs/epic-006-freeze-delegate-inheritance.md\|Despliegue de Delegación de Freeze y Gobernanza]] | `Implemented` | Configuración de delegados para congelamiento preventivo y traspaso de derechos. |
| `EPIC-007` | [[13 Product & Engineering/technical-rfcs/epic-007-offline-recovery-protocol.md\|Protocolo de Recuperación Institucional ante Pérdida de Llaves]] | `Specification / Built` | Mecanismo legal y técnico para quemar y reemitir activos tras validación biométrica. |
| `EPIC-008` | [[13 Product & Engineering/technical-rfcs/epic-008-recarga-recurrente-sphere-solana.md\|Recargas y On-Ramp Fiat Recurrente con Sphere y Littio]] | `In Progress` | Integración de rampas fiat para canalización de ahorros recurrentes hacia inversiones RWA. |
| `EPIC-009` | [[13 Product & Engineering/technical-rfcs/epic-009-integracion-pasarela-pagos-web2.md\|Integración de Pasarela de Pagos Web2 y Tarjeta]] | `Partial` | Procesamiento de tarjetas de crédito/débito para compra de fracciones inmobiliarias. |
| `EPIC-010` | [[13 Product & Engineering/technical-rfcs/epic-010-ai-discovery-seo.md\|Infraestructura de Descubrimiento por IA y SEO Técnico]] | `Implemented` | Capa semántica JSON-LD, feeds para motores generativos (GEO) y arquitectura de contenidos. |
| `EPIC-011` | [[13 Product & Engineering/technical-rfcs/epic-011-admin-collections-console.md\|Consola Administrativa de Colecciones y Proyectos]] | `Implemented` | Panel administrativo con geolocalización Maps, editor de galería y revisión de salud. |
| `EPIC-012` | [[13 Product & Engineering/technical-rfcs/epic-012-referral-marketing-system.md\|Sistema de Mercadeo de Referidos en Panel de Usuario]] | `Implemented` | Generación de links de referidos, tracking de atribución y bonificaciones en billetera. |
| `EPIC-013` | [[13 Product & Engineering/technical-rfcs/epic-013-pwa-push-notifications.md\|Aplicación Progresiva (PWA) y Notificaciones Web Push]] | `Implemented` | Instalabilidad móvil tipo app nativa y entrega de notificaciones push transaccionales. |
| `EPIC-014` | [[13 Product & Engineering/technical-rfcs/epic-014-stake-distribution-traceability.md\|Trazabilidad y Motor de Distribución de Rentas de Staking]] | `Draft / Implemented Base` | Infraestructura de cálculo de rendimientos inmobiliarios, tesorería y reclamos trazables. |

---

## 🔗 Conexión con la Tesis de Negocio
- [[02 Strategy & Research/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[13 Product & Engineering/product-roadmap/current-product-status-matrix.md|Matriz Viva de Estado y Madurez de Producto]]
- [[13 Product & Engineering/index.md|Portal Principal de Ingeniería]]
