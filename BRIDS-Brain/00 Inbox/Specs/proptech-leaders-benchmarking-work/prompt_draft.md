# Teamwork Project Prompt — Draft

> Status: Launched — delegated to teamwork_preview
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: [none — teamwork routes from the description to Full Team]

Benchmark Estratégico de Plataformas PropTech Líderes (Gigantes Residenciales e Inversión Fraccional) vs Arquitectura RWA de BRIDS. Investigar modelos de negocio, balances, economía unitaria y dinámicas de producto de Opendoor, Redfin, Compass, Fundrise y Lofty.ai para extraer patrones clave a adoptar y trampas de capital a descartar frente a la emisión de activos RWA sobre Solana.

Working directory: /Users/jaymusicmachine/Library/CloudStorage/GoogleDrive-goodacrematas498@gmail.com/My Drive/01 Primal Code Lab/BRIDS/Business/BRIDS KNOWLEDGE FORT
Integrity mode: development

### Reference Skills (HITL-0 Approved)
- `BRIDS-Engine/skills/competitor-tracker/SKILL.md`
- `BRIDS-Engine/skills/market-intel-brief/SKILL.md`
- `BRIDS-Engine/skills/social-intelligence/SKILL.md`

## Requirements

### R1. Descomposición Competitiva de Gigantes Residenciales de EE.UU.
- **Opendoor:** Anatomía del iBuying puro a escala, dependencia de deuda barata/líneas de crédito rotativas (revolving credit facilities), costos de tenencia (*holding costs*), desvalorización de inventario con subidas de tasas de interés y su intento de pivotar a marketplace de terceros (Opendoor Exclusives).
- **Redfin:** Modelo híbrido de corretaje con comisión reducida (1%-1.5%), agregador de tráfico SEO, integración vertical con hipotecas (Bay Equity) y títulos, y la autopsia del cierre definitivo de **RedfinNow** (noviembre 2022) tras pérdidas masivas.
- **Compass:** Plataforma tecnológica para brokers tradicionales (*Agent Cloud*), estrategia de crecimiento vía subsidios agresivos y M&A de agencias, análisis de su estructura pesada de gastos operativos (SG&A) y barreras para alcanzar flujo de caja positivo sostenible.

### R2. Descomposición de Plataformas de Inversión Fraccional & Tokenización
- **Fundrise:** Modelo de eREITs no cotizados para inversores minoristas (Reg A+ / Reg D), estructura de comisiones (1% AUM), iliquidez de los fondos y ventanas de reembolso trimestrales limitadas.
- **Lofty.ai:** Tokenización residencial fraccional de alquileres (origen en Algorand, migración multi-chain), gobernanza DAO de inquilinos, dispersión de liquidez y problemas de administración física de las propiedades descentralizadas.

### R3. Matriz Estratégica Transversal: "Qué Adoptar vs Qué Descartar para BRIDS"
- **Qué Adoptar:**
  - Interfaces fluidas de onboarding para inversores y calculadoras de rentabilidad neta inspiradas en Fundrise y Redfin.
  - Sindicación rápida y distribución fraccionada de tickets para democratizar el acceso.
  - Cap table y propiedad transparente con liquidación atómica.
  - **Custodia Fiduciaria por Hitos (*Milestone Escrow*):** Retención del 100% de fondos levantados en bóvedas multisig (Squads v4 2-de-3 en Solana) y liberaciones progresivas contra certificaciones de avance físico (AIA G702/G703) y retención estatutaria del 10% (Texas Chapter 53). Jamás entregar capital íntegro por adelantado.
  - **Mecanismo de Administrador de Respaldo (*Backup Servicer*) a Coste \$0 en Fase 1:** Cláusula de remoción y sustitución (*Removal of Manager for Cause*, 6 Del. C. § 18-402) en el Operating Agreement de la SPV, sufragado por los fondos en plica del proyecto (\$0 para BRIDS Inc.), y en Fase 2 como gasto de emisión (*Offering Expense*) institucional.
- **Qué Descartar Categóricamente:**
  - **Cero riesgo de balance:** No comprar inventario residencial ni actuar como contraparte financiera (la trampa mortal de Zillow Offers y RedfinNow).
  - **Cero subsidio de comisiones de intermediarios:** No competir en una guerra de precios de corretaje tradicional (Compass).
  - **Cero valoración exclusivamente algorítmica:** Mantenimiento obligatorio de peritajes y tasaciones físicas in-situ (ASTM E2018-15) antes de tokenizar.
  - **Cero micro-gobernanza DAO de operaciones físicas:** Descartar votaciones descentralizadas sobre reparaciones y averías (la trampa de Lofty.ai), delegando la ejecución en el desarrollador idóneo ex-ante.
  - **Cero promesas de retornos garantizados:** Transparencia honesta de factores de riesgo (*Risk Factors*) en el PPM, reconociendo que todo negocio inmobiliario conlleva riesgo de mercado y ejecución.

### R4. Entrega Modular Interconectada en Vault
Generar los documentos individuales detallados por plataforma:
- `BRIDS-Brain/01 Negocio/01 Estrategia & Modelo/market-research/opendoor-benchmarking.md`
- `BRIDS-Brain/01 Negocio/01 Estrategia & Modelo/market-research/redfin-benchmarking.md`
- `BRIDS-Brain/01 Negocio/01 Estrategia & Modelo/market-research/compass-benchmarking.md`
- `BRIDS-Brain/01 Negocio/01 Estrategia & Modelo/market-research/fundrise-benchmarking.md`
- `BRIDS-Brain/01 Negocio/01 Estrategia & Modelo/market-research/lofty-benchmarking.md`
Junto con el borrador de integración y matriz comparativa general en `BRIDS-Brain/00 Inbox/Specs/proptech-leaders-benchmarking-work/draft_cycle_1.md`.

### R5. Infraestructura y Guardrail SDD
Redactar inicialmente en el espacio de trabajo controlado: `BRIDS-Brain/00 Inbox/Specs/proptech-leaders-benchmarking-work/draft_cycle_1.md`. No escribir directamente en la carpeta de producción del vault antes de la aprobación humana formal (HITL-2).

## Verification Resources

- **Programmatic Forcing Function (Mandatory Oracle):**
  `node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts evaluate proptech-leaders-benchmarking "BRIDS-Brain/00 Inbox/Specs/proptech-leaders-benchmarking-work/draft_cycle_1.md"`
- El comando evalúa la Rúbrica 4D (Objetivo/ICP, Veracidad Técnica, Voz Fundadora, Cero Clichés) + Clef System One y debe salir con código `0` (calificación $\ge 8.5 / 9.0$).

## Acceptance Criteria

### Content & Analytical Rigor
- [ ] Análisis minucioso de las 5 plataformas (Opendoor, Redfin, Compass, Fundrise, Lofty.ai) con datos de reportes 10-K, cartas a accionistas y métricas de unidad.
- [ ] Matriz clara de contraste de cada plataforma contra el modelo de BRIDS (Asset-Light, SPVs Delaware, emisión en Metaplex Core en Solana).
- [ ] Enlaces directos verificables y citas factuales para todas las afirmaciones financieras y desinversiones.
- [ ] Cero frases prohibidas o clichés de IA ("delve", "testament", "tapestry", "unravel", "revolutionize").
- [ ] Aprobación del oráculo de calidad: `node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts evaluate proptech-leaders-benchmarking "BRIDS-Brain/00 Inbox/Specs/proptech-leaders-benchmarking-work/draft_cycle_1.md"` con nota $\ge 8.5 / 9.0$.
