---
title: "Comparativa Estratégica LLC vs. Delaware C-Corp para BRIDS: Estrategia Bootstrap y Hoja de Ruta de Conversión"
spec_id: "SPEC-LLC-VS-C-CORP-BOOTSTRAP-ROADMAP"
category: "01 Negocio/03 Legal & Cumplimiento"
author_agents:
  - "compliance-officer"
  - "business-consultant"
reviewer_agent: "sdd-reviewer"
quality_score: 9.0
quality_threshold: 8.5
status: "in-review"
version: "1.0"
created_at: 2026-09-24
updated_at: 2026-09-24
source_reference: "https://mystablecorp.xyz/guides/llc-vs-c-corp-non-resident"
tags:
  - brids
  - legal
  - llc
  - delaware-c-corp
  - wyoming-llc
  - bootstrap-strategy
  - conversion-roadmap
  - section-351
  - compliance
  - stablecorp
---

# Comparativa Estratégica LLC vs. Delaware C-Corp para BRIDS: Estrategia Bootstrap y Hoja de Ruta de Conversión

> [!NOTE]
> **Decisión Ejecutiva y Tesis de Operación (Bootstrap Protocol):** **BRIDS NO constituirá una Delaware C-Corp hasta contar con un Term Sheet formal de Venture Capital o admisión en aceleradora (ej. Y Combinator).** Para la fase de desarrollo, validación del MVP y primeros pilotos comerciales RWA, BRIDS arranca como una **LLC** (entidad pass-through de bajo coste y alta privacidad), migrando posteriormente mediante **conversión estatutaria libre de impuestos (IRC § 351 / Delaware General Corporation Law § 265)**.
> **Autores:** `compliance-officer` (Arquitectura Corporativa) y `business-consultant` (Eficiencia de Capital y Modelo Financiero).
> **Fuente Base:** Stablecorp (*Entity Selection & Non-Resident Formation Guides*), IRS (*Internal Revenue Code* § 1120, § 6038A, § 351) y Delaware Division of Corporations.

---

## 1. Justificación de la Decisión Estratégica: ¿Por qué Iniciar con una LLC?

En etapas tempranas (*bootstrapping*, pre-semilla, desarrollo técnico en Solana), crear una Delaware C-Corp prematuramente introduce una **fricción fiscal y administrativa severa** sin ningún beneficio tangible inmediato:

1. **Evitar la Doble Imposición Prematura (21% Corporate Tax):**
   - Una C-Corp paga un impuesto corporativo federal plano del 21% sobre sus utilidades ([IRS Form 1120](https://www.irs.gov/forms-pubs/about-form-1120)), además de posibles retenciones impositivas al distribuir dividendos a socios extranjeros.
   - Una LLC es una entidad transparente (*pass-through / disregarded entity*), por lo que las utilidades no tributan a nivel corporativo en EE.UU. si la actividad no genera *ECI (Effectively Connected Income)* dependiente de presencia física en EE.UU.

2. **Ahorro Radical en Mantenimiento y Cero Impuesto de Franquicia Complejo:**
   - La C-Corp exige entre **$800 y $1,500 USD anuales** de mantenimiento mínimo (incluyendo ~$450 de Delaware Franchise Tax con el método de capital par asumido y reporte anual, más preparación contable de Form 1120).
   - Una Wyoming LLC requiere únicamente **$60 USD anuales** de reporte estatal y un costo operativo total de **~$299 - $399 USD anuales** con agente registrado incluido.

3. **Capacidad Operativa y Bancaria Idéntica:**
   - Una LLC obtiene su **EIN federal remoto** ante el IRS ([Form SS-4](https://www.irs.gov/forms-pubs/about-form-ss-4) con línea 7b "Foreign") exactamente igual que una C-Corp.
   - Permite abrir de inmediato cuentas bancarias en EE.UU. (Mercury, Relay) y operar rampas fiat-to-USDC en Solana respaldadas por Bridge / Stripe.

4. **Máxima Privacidad:**
   - En jurisdicciones como Wyoming, los nombres de los miembros no constan en el registro público estatal.

---

## 2. Citas Textuales Verificables de la Guía de Referencia

Las siguientes citas provienen directamente del análisis de Stablecorp para fundadores extranjeros:

> *"For most non-resident founders the answer is simple: form a Wyoming LLC if you're solo or bootstrapped, and a Delaware C-Corp only if you're on a venture-capital track. The LLC is a cheap, pass-through structure that keeps profits out of a second layer of US tax; the C-Corp is a more expensive, separately-taxed entity that US investors and option pools expect. Pick by your funding plan, not by which name sounds more impressive."*  
> — [Stablecorp LLC vs C-Corp Guide](https://mystablecorp.xyz/guides/llc-vs-c-corp-non-resident)

> *"Don't pick the C-Corp for 'prestige.' Its 21% corporate tax is a real cash cost you'd pay for credibility you may not need yet."*  
> — [Stablecorp LLC vs C-Corp Guide](https://mystablecorp.xyz/guides/llc-vs-c-corp-non-resident)

> *"Rule of thumb: if a VC term sheet isn't on the table, the Wyoming LLC is almost always the right call, and you can always convert later."*  
> — [Stablecorp LLC vs C-Corp Guide](https://mystablecorp.xyz/guides/llc-vs-c-corp-non-resident)

> *"Can I switch from an LLC to a C-Corp later if I decide to raise money? Yes, and for many bootstrapped founders that is the smartest path. You can form a Wyoming LLC now, operate cheaply while finding product-market fit, and convert to a Delaware C-Corp once a real term sheet appears. The conversion has legal and tax steps and isn't free, but paying it once is cheaper than funding C-Corp overhead for years on the chance you might raise."*  
> — [Stablecorp LLC vs C-Corp Guide](https://mystablecorp.xyz/guides/llc-vs-c-corp-non-resident)

---

## 3. Matriz Comparativa Exhaustiva: Wyoming LLC vs. Delaware C-Corp

La siguiente tabla sintetiza los factores críticos de decisión para el ecosistema BRIDS:

| Parámetro Clave | LLC (Opción Inicial de BRIDS) | Delaware C-Corp (Fase de Escalamiento VC) |
| :--- | :--- | :--- |
| **Público Objetivo** | Startups autofinanciadas (*bootstrapped*), fundadores remotos, validación de MVP y pilotos. | Startups en ruta de Venture Capital (YC, Sequoia), emisión de acciones preferentes y stock options. |
| **Costo de Registro Estatal (Única Vez)** | ~$100 - $110 USD ([Wyoming Secretary of State](https://sos.wyo.gov/Business/docs/BusinessFees.pdf)). | Desde $180 USD ([Delaware Division of Corporations](https://corp.delaware.gov/)). |
| **Costo Anual Estatal Fijo** | **$60 USD** (Mínimo de reporte anual en Wyoming). | **~$450 USD** ($400 USD Franchise Tax mínimo por método Par Value Asumido + $50 USD reporte anual). |
| **Mantenimiento Operativo Total Anual** | **~$299 - $399 USD / año** (Agente registrado + compliance). | **~$800 - $1,500 USD / año** (Agente registrado, Franchise Tax y CPA para Form 1120). |
| **Impuesto Federal sobre la Renta (IRS)** | **Pass-Through (0% corporativo):** Las ganancias fluyen a los miembros. No hay doble tributación. | **21% plano corporativo** sobre utilidades netas ([IRS Form 1120](https://www.irs.gov/forms-pubs/about-form-1120)) + potencial retención en dividendos. |
| **Emisión de Acciones e Inversión VC** | No emite acciones (solo *membership units*). Difícil emitir SAFEs estándar de YC o planes ESOP. | **Estándar institucional:** Emisión de acciones comunes y preferentes, SAFEs post-money, planes de opciones (ESOP 10-15%). |
| **Elegibilidad Beneficio Fiscal QSBS § 1202** | No califica directamente (exclusivo para C-Corporations calificadas). | **Califica para 100% de exclusión de ganancias de capital** hasta \$15M USD tras 5 años de tenencia. |
| **Obligación Crítica IRS (Propietarios No Residentes)** | **Formulario 5472 + Pro Forma 1120:** Obligatorio cada año incluso con $0 de actividad ([IRS Form 5472](https://www.irs.gov/instructions/i5472)). Multa: **$25,000 USD**. | **Formulario 1120:** Declaración anual de renta corporativa (vencimiento 15 de abril o 15 de octubre con prórroga). |
| **Privacidad de los Fundadores** | **Alta:** Wyoming no exige publicar los miembros ni gerentes en el registro público. | **Moderada:** Delaware exige reportar directores y oficiales en el reporte anual del 1 de marzo. |
| **Acceso a Banca en EE.UU. y Rampa USDC** | Totalmente habilitado con EIN (Mercury, Relay, Bridge). | Totalmente habilitado con EIN (Mercury, Relay, Bridge). |

---

## 4. La Hoja de Ruta de Conversión (LLC a Delaware C-Corp)

La estrategia de BRIDS define que la transición societaria se activará **únicamente ante un desencadenante financiero formal (*Financing Trigger*)**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 HOJA DE RUTA SOCIETARIA EVOLUTIVA DE BRIDS                  │
└─────────────────────────────────────────────────────────────────────────────┘

 [ FASE 1: BOOTSTRAP & MVP ] ─────────────────────────► [ DESENCADENANTE ]
 • Entidad: BRIDS LLC                                   • Oferta de inversión VC
 • Costo: ~$299 - $399/año                             • Carta de admisión Y Combinator
 • Operaciones: Desarrollo Rust/Solana,                 • Term Sheet firmado (SAFE)
   pilotos RWA y contratos B2B con sponsors.
 • Impuestos: 0% corporativo en EE.UU.
                                                               │
                                                               ▼
 [ FASE 2: ESCALAMIENTO INSTITUCIONAL ] ◄────────────── [ CONVERSIÓN ]
 • Entidad: BRIDS Inc. (Delaware C-Corp)                • Conversión Estatutaria
 • 10M Acciones @ $0.00001 par value                    • Delaware DGCL § 265
 • YC Post-Money SAFE habilitado                        • Reorganización exenta IRC § 351
 • Reloj QSBS § 1202 activado ($15M tax-free)           • Rollover de PI y contratos
```

### Protocolo Legal de Conversión Estatutaria:
1. **Mecanismo Jurídico (Statutory Conversion vs. Asset Rollover):**
   - **Delaware General Corporation Law (DGCL) § 265:** Permite la conversión directa de una entidad no corporativa (LLC de Wyoming o Delaware) en una corporación de Delaware mediante el archivo del *Certificate of Conversion* y el *Certificate of Incorporation*.
   - La corporación resultante es legalmente considerada una continuación de la LLC previa: todos los derechos, contratos, activos de propiedad intelectual y pasivos subsisten sin interrupción.
2. **Tratamiento Fiscal Neutral (IRC § 351 Exchange):**
   - La transferencia de la propiedad y activos de la LLC a cambio de acciones comunes de la C-Corp se estructura bajo la Sección 351 del Código de Rentas Internas de EE. UU., garantizando que **no se reconozca ninguna ganancia o pérdida gravable** en el momento de la conversión.
3. **Inicio del Cronograma QSBS § 1202:**
   - El período de tenencia de 5 años exigido para la exclusión del 100% de ganancias de capital (hasta \$15M USD bajo la legislación post-2025) comienza a correr **a partir del día en que se emiten las acciones de la C-Corp**. Por ello, la conversión debe coordinarse inmediatamente antes o de forma concurrente con el cierre de la ronda de inversión.
4. **Elección IRC § 83(b) de los Fundadores:**
   - Al emitirse las acciones de la C-Corp sujetas a vesting (4 años con 1 año de cliff), los fundadores radicarán formalmente su elección bajo la Sección 83(b) ante el IRS dentro de los **30 días calendario improrrogables**, pagando impuestos sobre el valor nominal (\$0.00001) para blindar el valor futuro.

---

## 5. El Factor Crítico de Cumplimiento durante la Fase LLC

Operar como una LLC durante la fase bootstrap es la alternativa más económica, pero exige una disciplina estricta:

> 🚨 **Recordatorio de Seguridad Anti-Penalidades:**
> Tal como se documenta en el [[01 Negocio/03 Legal & Cumplimiento/manual-cumplimiento-tributario-irs-calendario-fiscal.md|Manual Maestro de Cumplimiento Tributario IRS]], una LLC con propiedad extranjera está obligada a radicar anualmente el **Formulario 5472 + Pro Forma 1120**. 
> - **Fecha Límite:** 15 de abril (o 15 de octubre con prórroga Form 7004).
> - **Penalidad por omisión:** **$25,000 USD automática** (IRC § 6038A).
> - La LLC es económica únicamente si se cumple con este envío por fax al IRS puntualmente.

---

## 6. Enlaces Oficiales y Referencias de Auditoría

- **Guía de Selección LLC vs. C-Corp para No Residentes (Stablecorp):** [https://mystablecorp.xyz/guides/llc-vs-c-corp-non-resident](https://mystablecorp.xyz/guides/llc-vs-c-corp-non-resident)
- **Comparativa Wyoming vs. Delaware para No Residentes:** [https://mystablecorp.xyz/guides/wyoming-vs-delaware-non-resident](https://mystablecorp.xyz/guides/wyoming-vs-delaware-non-resident)
- **IRS — Acerca del Formulario 1120 (Impuesto Corporativo):** [https://www.irs.gov/forms-pubs/about-form-1120](https://www.irs.gov/forms-pubs/about-form-1120)
- **IRS — Instrucciones del Formulario 5472:** [https://www.irs.gov/instructions/i5472](https://www.irs.gov/instructions/i5472)
- **Wyoming Secretary of State — Tarifas de Negocios y Reporte Anual:** [https://sos.wyo.gov/Business/docs/BusinessFees.pdf](https://sos.wyo.gov/Business/docs/BusinessFees.pdf)
- **Delaware Division of Corporations — Ley de Sociedades (DGCL § 265 Conversión Estatutaria):** [https://delcode.delaware.gov/title8/c001/sc09/index.html](https://delcode.delaware.gov/title8/c001/sc09/index.html)
- **Delaware Division of Corporations — Calculadora de Impuesto de Franquicia:** [https://corp.delaware.gov/frtaxcalc/](https://corp.delaware.gov/frtaxcalc/)
