---
spec_id: "SPEC-{{SLUG}}"
title: "{{TITLE}}"
target_vault_folder: "BRIDS-Brain/{{CATEGORY_FOLDER}}/"
target_file: "BRIDS-Brain/{{CATEGORY_FOLDER}}/{{FILENAME}}.md"
subagents_involved:
  - "{{PRIMARY_AGENT}}"
  - "{{SECONDARY_AGENT}}"
status: proposed # proposed | approved | in_progress | completed | rejected
created_at: "{{DATE}}"
updated_at: "{{DATE}}"
evaluation:
  target_score: 8.5
  scale_max: 9.0
  max_cycles: 5
  current_cycle: 0
  final_score: null
  criticism_history: []
---

# Spec: {{TITLE}}

> [!NOTE]
> **Resumen Ejecutivo:** {{EXECUTIVE_SUMMARY}}
> Este artefacto define de manera formal e inmutable los requisitos, el destino canónico en `BRIDS-Brain/`, los subagentes responsables y las restricciones de calidad para el entregable antes de iniciar cualquier redacción o desarrollo.

---

## 1. Destino Canónico en el Vault
- **Carpeta de Destino:** `BRIDS-Brain/{{CATEGORY_FOLDER}}/`
- **Archivo de Salida:** `BRIDS-Brain/{{CATEGORY_FOLDER}}/{{FILENAME}}.md`
- **Taxonomía:** Cumple con la estructura numerada estándar de `BRIDS-Brain/` (00 a 10).
- **Regla de Promoción:** El documento final solo se escribirá en esta ruta cuando el Agente Revisor otorgue una calificación $\ge 8.5 / 9.0$.

---

## 2. Sub-Agentes Asignados y Roles
| Sub-Agente | Rol Asignado | Responsabilidad Principal |
| :--- | :--- | :--- |
| `{{PRIMARY_AGENT}}` | Creador / Editor Líder | Redacción inicial del borrador técnico/estratégico y subsanación activa de observaciones. |
| `{{SECONDARY_AGENT}}` | Validador de Dominio / Co-Autor | Aportación de datos especializados (legal, métricas financieras o narrativa fundadora). |
| `sdd-reviewer` | Revisor / Auditor Crítico | Evaluación rigurosa en 4 dimensiones, detección de muletillas de IA y emisión del reporte de remediación. |

---

## 3. Propósito Comercial y Audiencia (ICP)
- **Objetivo de Negocio:** {{BUSINESS_GOAL}}
- **Público Objetivo (ICP):** {{TARGET_ICP}}
- **Acción Deseada (CTA):** {{PRIMARY_CTA}}
- **KPI Primario de Éxito:** {{PRIMARY_KPI}}

---

## 4. Anclas Técnicas y Veracidad de Fuentes (Zero-Hallucination)
Toda afirmación técnica, legal o financiera debe estar anclada a hechos verificables del ecosistema BRIDS:
- **Infraestructura Blockchain:** Solana Mainnet / Devnet, RPC de baja latencia, transacciones atómicas.
- **Estándar de Tokenización:** Metaplex Core con plugins de Freeze (congelamiento por cumplimiento regulatorio) y Recovery (recuperación de activos respaldada por validación de identidad).
- **Estructura Legal y Regulatoria:** Separación dual estricta — Delaware C-Corp (proveedor tecnológico de software SaaS sin custodia) vs. SPV LLC independiente por inmueble (emisora y titular legal del activo inmobiliario). KYC/AML vía Stripe Identity.
- **Modelo Financiero y Unit Economics:** Fee de estructuración SaaS, fee por transacción secundaria (si aplica) y recuperación sin comisiones especulativas no sostenibles.
- **Fuentes / Documentos de Referencia:**
  - Contexto de Marca: `[[01 Brand Context/product-marketing-context.md]]`
  - {{REFERENCE_DOC_1}}
  - {{REFERENCE_DOC_2}}

---

## 5. Desglose Estructural (Outline)
Estructura obligatoria del documento final:
1. **Título & Frontmatter Estándar:** Con metadatos versionados (v1.0), tags y callout `> [!NOTE]`.
2. **Contexto & Problema de Mercado:** Dolor cuantificado del sponsor/inversor sin introducciones genéricas.
3. **Propuesta de Valor & Mecánica de Solución:** Explicación técnica y comercial de la solución BRIDS.
4. **Métricas & Casos de Uso Concretos:** Datos financieros o arquitecturas verificables.
5. **Llamado a la Acción (CTA) & Próximos Pasos:** Contacto o interacción definida.
- **Rango de Extensión Estimada:** {{WORD_COUNT_RANGE}} palabras.

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

## 7. Pasos Atómicos de Ejecución (Checklist)
- [ ] **STEP-01 (Spec Approval):** Aprobación del presente spec mediante `bash BRIDS-Engine/scripts/sdd-manager.sh approve {{SLUG}}`.
- [ ] **STEP-02 (Initial Draft):** Generación del borrador inicial por `{{PRIMARY_AGENT}}` guardado en ciclo 1.
- [ ] **STEP-03 (Review & Criticism Loop):** Evaluación de `sdd-reviewer` contra la rúbrica de 0 a 9.
- [ ] **STEP-04 (Remediation & Refinement):** Subsanación iterativa de observaciones hasta alcanzar puntaje $\ge 8.5 / 9.0$ (máximo 5 ciclos).
- [ ] **STEP-05 (Vault Promotion):** Promoción idempotente del texto final a `BRIDS-Brain/{{CATEGORY_FOLDER}}/{{FILENAME}}.md`.

---

## 8. Rúbrica de Calificación del Revisor (Escala 0 a 9)
| Dimensión | Puntos Máx | Criterio de Pase |
| :--- | :---: | :--- |
| **1. Cumplimiento del Objetivo & ICP** | 2.5 pts | Alineación directa con el problema del lector objetivo y CTA contundente. |
| **2. Veracidad Técnica & Fuentes** | 2.5 pts | Exactitud en Solana, Metaplex Core y estructura legal Delaware SPV. Cero alucinaciones. |
| **3. Voz Fundadora vs Tono Robot** | 2.0 pts | Convicción auténtica de founder Web3/PropTech; ausencia de prosa corporativa hueca. |
| **4. Originalidad Léxica & Cero Clichés** | 2.0 pts | Cero frases prohibidas de IA y riqueza expresiva. Penalización severa por muletilla detectada. |
| **TOTAL MÁXIMO** | **9.0 pts** | **Nota mínima requerida para publicación: $\ge 8.5 / 9.0$** |
