---
spec_id: "SPEC-modulo-desarrollador-spv-engine"
title: "Módulo del Desarrollador Inmobiliario y SPV Engine"
target_vault_folder: "BRIDS-Brain/01 Negocio/02 Producto & Ingenieria/"
target_file: "BRIDS-Brain/01 Negocio/02 Producto & Ingenieria/modulo-desarrollador-spv-engine.md"
subagents_involved:
  - "business-consultant"
  - "b2b-sponsor-lead"
status: completed # spec_review | spec_approved | draft_optimizing | deliverable_review | completed | frozen_for_arbitration
created_at: "2026-09-18"
updated_at: "2026-09-18"
hitl_checkpoints:
  hitl_1_spec_approval:
    status: pending # pending | refining | approved
    approved_at: null
    user_feedback: []
  hitl_2_deliverable_approval:
    status: pending # pending | refining | approved
    approved_at: null
    user_feedback: []
evaluation:
  target_score: 8.5
  scale_max: 9.0
  max_cycles: 5
  current_cycle: 0
  final_score: 9
  criticism_history: []
---

# Spec: Módulo del Desarrollador Inmobiliario y SPV Engine

> [!NOTE]
> **Resumen Ejecutivo:** Especificar la arquitectura funcional y técnica del portal del desarrollador: onboarding KYB concierge administrado por Customer Success, ingesta de proyectos sincronizada al marketplace (tickets de \$200 USD), creación de sub-series bajo Master Series LLC y gobernanza on-chain con Squads v4 multisig gate.
> Este artefacto define de manera formal e inmutable los requisitos, el destino canónico en `BRIDS-Brain/`, los subagentes responsables y las restricciones de calidad para el entregable antes de iniciar cualquier redacción o desarrollo.
> Cuenta con dos puntos de parada humana obligatorios: **HITL-1 (Aprobación del Spec)** y **HITL-2 (Aprobación del Entregable)**.

---

## 1. Destino Canónico en el Vault
- **Carpeta de Destino:** `BRIDS-Brain/01 Negocio/02 Producto & Ingenieria/`
- **Archivo de Salida:** `BRIDS-Brain/01 Negocio/02 Producto & Ingenieria/modulo-desarrollador-spv-engine.md`
- **Taxonomía:** Cumple con la estructura numerada estándar de `BRIDS-Brain/` (00 a 10).
- **Regla de Promoción:** El documento final solo se escribirá en esta ruta cuando el Agente Revisor otorgue una calificación $\ge 8.5 / 9.0$ **Y** el usuario otorgue su confirmación formal en el guardrail **HITL-2** (`approve-deliverable`).

---

## 2. Sub-Agentes Asignados y Roles
| Sub-Agente | Rol Asignado | Responsabilidad Principal |
| :--- | :--- | :--- |
| `business-consultant` | Creador / Editor Líder | Arquitectura funcional del portal, modelado de unit economics y desglose de módulos. |
| `compliance-officer` | Co-Autor Legal & Regulatorio | Estructuración societaria de Master Series LLC, Operating Agreements y blindaje non-broker-dealer. |
| `b2b-sponsor-lead` | Co-Autor RevOps & CS | Playbook de Customer Success, onboarding de wallets y experiencia de usuario del developer. |
| `sdd-reviewer` | Revisor / Auditor Crítico | Evaluación rigurosa en 4 dimensiones, detección de muletillas de IA y emisión del reporte de remediación. |

---

## 3. Propósito Comercial y Audiencia (ICP)
- **Objetivo de Negocio:** Especificar la arquitectura funcional y técnica del portal del desarrollador: onboarding KYB concierge administrado por Customer Success, ingesta de proyectos sincronizada al marketplace (tickets de \$200 USD), creación de sub-series bajo Master Series LLC y gobernanza on-chain con Squads v4 multisig gate.
- **Público Objetivo (ICP):** Real Estate Sponsors, GPs, Developers Inmobiliarios, Operadores B2B
- **Acción Deseada (CTA):** Habilitar la implementación del módulo en el frontend y contratos inteligentes en Solana.
- **KPI Primario de Éxito:** Reducción del tiempo de estructuración de 90 días a < 14 días y cero fricción Web3 para el sponsor.

---

## 4. Anclas Técnicas y Veracidad de Fuentes (Zero-Hallucination)
Toda afirmación técnica, legal o financiera debe estar anclada a hechos verificables del ecosistema BRIDS:
- **Estructura Societaria:** Master Series LLC (Florida UPSA CS/SB 316, Texas TBOC Cap. 101, Delaware 6 Del. C. § 18-215). Creación de sub-series celulares independientes por inmueble con blindaje de responsabilidad horizontal.
- **Gobernanza On-Chain (Squads v4):** 1 SPV = 1 Bóveda Squads Protocol v4 desplegada en Día 1 (desde la creación del borrador del proyecto). Sub-cuentas dedicadas (Construcción/Escrow, Retención estatutaria 10%, Dispersión de rentas).
- **Guardrail Multisig de Minting:** La autoridad de acuñación en Metaplex Core reside en la Bóveda Squads. El paso a `publicado` exige co-firma multifirma obligatoria (Sponsor + BRIDS Compliance).
- **Onboarding KYB Desacoplado (Customer Success):** La verificación de empresa (EIN, Sunbiz, Operating Agreement, ID del manager) es administrada por Customer Success. El developer no llena la Sección 5 en el formulario de obra.
- **Trazabilidad Ingesta ➔ Marketplace:** Basado en `BRIDS_DASHBOARD_MARKET_PLACE.docx`. 5 pasos en el wizard de obra alimentan 1:1 la Card del Grid, la Ficha Técnica (Resumen) y los 3 Tabs (Desarrollador, Propiedad, Documentación).
- **Modelo RBAC & Control de Acceso:** Nuevo rol `re_developer` (o `sponsor`) implementado en la arquitectura RBAC de BRIDS. Variables de estado / flags de sesión (`is_developer_verified`, `role == 're_developer'`) administradas por Customer Success tras la verificación KYB. Rutas protegidas (`/developer/**`, `/api/developer/**`) con defense-in-depth (proxy gate + handler check).
- **Fuentes / Documentos de Referencia:**
  - Contexto de Marca: `[[01 Brand Context/product-marketing-context.md]]`
  - Modelo RBAC: `[[01 Negocio/02 Producto & Ingenieria/arquitectura/rbac-permissions-model.md]]`
  - Whitepaper de Tokenización Metaplex Core
  - Estructura Legal Delaware C-Corp vs SPV LLC

---

### 📝 Ajustes Solicitados por el Usuario (2026-09-18)
- Incorporar control de acceso RBAC con variables de estado y nuevo rol para desarrolladores inmobiliarios (`re_developer` / `sponsor`). Las rutas del portal del desarrollador (`/developer/**` y `/api/developer/**`) quedan protegidas bajo este rol asignado por Customer Success tras la verificación KYB.

## 5. Desglose Estructural (Outline)
Estructura obligatoria del documento final:
1. **Resumen Ejecutivo & Visión de Producto:** La tesis "Stripe + Carta + AngelList" de sindicación inmobiliaria para desarrolladores.
2. **Módulo 1: Onboarding KYB Concierge & Arquitectura RBAC (Customer Success & Admin):**
   - Recolección y validación legal de la entidad promotora (EIN, Sunbiz, Operating Agreement, ID del manager).
   - Playbook de Customer Success para configuración y vinculación de wallet institucional.
   - Alta en base de datos (`developers`) y sellos de verificación pública.
   - **Nuevo Rol RBAC (`re_developer`):** Variables de estado en sesión, allowlists, protección de rutas `/developer/**` y endpoints `/api/developer/**`.
3. **Módulo 2: Portal del Desarrollador e Ingesta de Proyectos (Wizard de 5 Pasos):**
   - Paso 1: Datos de Propiedad y Modelo de Negocio (Ex-Secciones 1 y 2 del `.docx`).
   - Paso 2: Galería de Obra: Fotos Antes (deterioro/lote) vs. Renders Después (Ex-Sección 3).
   - Paso 3: Parámetros Financieros y Fórmulas Automáticas: Compra + Rehab + ROI + Plazo (Ex-Sección 4, ticket constante de \$200 USD y activación del 30%).
   - Paso 4: Respaldo Legal de la Propiedad: Título (*Warranty Deed*), Contrato de Compraventa y *Title Certificate* (Ex-Sección 6).
   - Paso 5: Términos de Inversión y Constitución SPV: Generación de Sub-Serie bajo Master Series LLC (Ex-Sección 7).
   - Ficha de Empresa inyectada automáticamente desde perfil verificado (Ex-Sección 5 desincorporada del flujo manual).
4. **Módulo 3: La Máquina de SPVs y Gobernanza On-Chain (Solana & Squads v4):**
   - Aprovisionamiento de Bóveda Squads v4 en Día 1 (vinculada desde estado `borrador`).
   - Colección Metaplex Core con plugins de Freeze y Recovery.
   - Guardrail Multisig de Co-Firma: Transición a `publicado` y minting condicionado a la firma conjunta de BRIDS Compliance + Sponsor.
5. **Módulo 4: Trazabilidad y Reglas de Visibilidad en el Marketplace:**
   - Card del Grid y Ficha Técnica Resumen.
   - Tabs de Respaldo: Tab Desarrollador (Badges verificados sin datos sensibles), Tab Propiedad (Sellos de título) y Tab Documentos de Inversión (Desbloqueo post-KYC/post-inversión).
6. **Módulo 5: Operación Diaria Post-Fondeo:**
   - Solicitudes de desembolso por hitos de obra (*Draw Requests* con AIA G702).
   - Dispersión de dividendos/rentas en 1 clic en USDC.
   - Cap Table en tiempo real y exportación K-1.
7. **Modelo de Datos Técnico y Máquina de Estados:**
   - Esquemas relacionales (`developers`, `projects`, `project_images`, `project_documents`, `tickets`, `investments`).
   - Ciclo de vida: `borrador` -> `en_revision` -> `publicado` -> `fondeado` -> `en_ejecucion` -> `cerrado`.
- **Rango de Extensión Estimada:** 1,200 - 2,500 palabras (especificación técnica exhaustiva).

---

## 6. Filtro Anti-Robot y Clichés Prohibidos (Banned Patterns)
> [!CAUTION]
> **Tolerancia Cero con Muletillas de IA:** La presencia de cualquiera de las siguientes frases restará automáticamente puntaje en la dimensión *Originalidad Léxica & Cero Clichés* e impedirá la aprobación del entregable:
- ❌ *"en resumen"* / *"en conclusión"* / *"para concluir"* / *"en definitiva"*
- ❌ *"es importante destacar"* / *"es importante mencionar"* / *"cabe destacar"* / *"cabe resaltar"* / *"es crucial destacar"*
- ❌ *"en el vertiginoso mundo"* / *"en el cambiante mundo"* / *"en un mundo cada vez más"*
- ❌ *"un papel crucial"* / *"juega un papel fundamental"* / *"un rol crucial"*
- ❌ *"a la vanguardia"* / *"revolucionario"* / *"cambio de paradigma"*
- ❌ *"sumergirse en"* / *"adentrémonos en"* / *"en este artículo"* / *"a lo largo de este"*
- ❌ *"sin duda alguna"* / *"no cabe duda"* / *"como hemos visto"*

---

## 7. Pasos Atómicos de Ejecución (Checklist con Doble HITL)
- [x] **STEP-01 (HITL-1 Spec Review & Approval):** Inspección humana del spec (`sdd-manager.sh preview modulo-desarrollador-spv-engine`), refinamiento opcional con `refine-spec` y aprobación formal mediante `bash BRIDS-Engine/scripts/sdd-manager.sh approve-spec modulo-desarrollador-spv-engine`.
- [x] **STEP-02 (Initial Draft Generation):** Redacción inicial del borrador por `business-consultant` respetando el outline y las anclas técnicas.
- [x] **STEP-03 (Evaluator-Optimizer Autonomous Loop):** Bucle Creador vs Revisor hasta calificar con nota $\ge 8.5 / 9.0$ y cero clichés (máximo 5 ciclos).
- [x] **STEP-04 (HITL-2 Deliverable Review & Approval):** Inspección humana del texto pulido (`sdd-manager.sh review-deliverable modulo-desarrollador-spv-engine`), ajustes con `refine-deliverable` y aprobación formal mediante `bash BRIDS-Engine/scripts/sdd-manager.sh approve-deliverable modulo-desarrollador-spv-engine`.
- [x] **STEP-05 (Vault Integration):** Promoción atómica e idempotente del documento aceptado a `BRIDS-Brain/01 Negocio/02 Producto & Ingenieria/modulo-desarrollador-spv-engine.md`.

---

## 8. Rúbrica de Calificación del Revisor (Escala 0 a 9)
| Dimensión | Puntos Máx | Criterio de Pase |
| :--- | :---: | :--- |
| **1. Cumplimiento del Objetivo & ICP** | 2.5 pts | Alineación directa con el problema del lector objetivo y CTA contundente. |
| **2. Veracidad Técnica & Fuentes** | 2.5 pts | Exactitud en Solana, Metaplex Core y estructura legal Delaware SPV. Cero alucinaciones. |
| **3. Voz Fundadora vs Tono Robot** | 2.0 pts | Convicción auténtica de founder Web3/PropTech; ausencia de prosa corporativa hueca. |
| **4. Originalidad Léxica & Cero Clichés** | 2.0 pts | Cero frases prohibidas de IA y riqueza expresiva. Penalización severa por muletilla detectada. |
| **TOTAL MÁXIMO** | **9.0 pts** | **Nota mínima requerida para pasar a HITL-2: $\ge 8.5 / 9.0$** |
