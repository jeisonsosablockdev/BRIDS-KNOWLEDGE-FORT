---
title: "Modelo de Negocio: Delaware C-Corp, Series LLCs y Bóvedas Squads"
spec_id: "SPEC-RWA-SERIES-LLC-SQUADS-MODEL"
category: "01 Negocio/01 Estrategia & Modelo"
author_agents:
  - "business-consultant"
  - "compliance-officer"
  - "pitch-deck-architect"
reviewer_agent: "sdd-reviewer"
quality_score: 9
quality_threshold: 8.5
hitl_1_approved_at: "2026-09-16T03:57:08.891Z"
hitl_2_approved_at: "2026-09-16T03:57:56.284Z"
status: approved
version: "1.0"
created_at: 2026-09-16
updated_at: 2026-09-16
tags:
  - brids
  - sdd-approved
  - hitl-validated
  - deliverable
---

# Modelo de Negocio: Delaware C-Corp, Series LLCs y Bóvedas Squads

> [!NOTE]
> **Aprobación Integral SDD + HITL:** Validado por el motor Evaluador-Optimizador (**9/9.0**) y con doble aprobación humana (**HITL-1 Spec** y **HITL-2 Deliverable**).
> **Sub-Agentes Autores:** `business-consultant`, `compliance-officer`, `pitch-deck-architect` | **Revisor:** `sdd-reviewer`

# Modelo de Negocio BRIDS: Delaware C-Corp, Series LLCs y Bóvedas Squads

> [!NOTE]
> **Arquitectura Institucional de Negocio e Infraestructura Legal-Financiera (Validación SDD + HITL)**  
> **Subagentes Autores:** `business-consultant`, `compliance-officer`, `pitch-deck-architect` | **Revisión:** `sdd-reviewer`.  
> **Destinatarios:** Real Estate Sponsors, Institutional LPs, Inversores de Capital de Riesgo (YC).  
> **Alcance:** Modela la separación corporativa entre la empresa tecnológica de software (Delaware C-Corp) y los vehículos inmobiliarios celulares (Series LLCs), la gobernanza de tesorería descentralizada en Solana con Squads Protocol v4 (1 SPV = 1 Bóveda), el flujo de fondos fiduciarios/criptográficos y la arquitectura de monetización SaaS sin intermediación de broker-dealer.

---

## 1. Problema Estructural de la Sindicación Tradicional y la Trampa Cripto

La sindicación inmobiliaria en Estados Unidos enfrenta dos fallas estructurales que limitan su liquidez y escalabilidad:

1. **Altos Costos de Estructuración Tradicional:** Constituir y mantener una Sociedad de Responsabilidad Limitada (LLC) independiente para cada propiedad cuesta entre \$7,000 y \$25,000 USD en honorarios legales, registros estatales y apertura de cuentas bancarias comerciales. Cuando un promotor gestiona múltiples adquisiciones o remodelaciones (Fix & Flip / Fix & Hold), la fricción burocrática fragmenta la contabilidad y devora el margen de los inversionistas.
2. **Opacidad Fiduciaria de "Caja Negra":** Una vez que los socios transfieren su capital a la cuenta bancaria del operador general (Sponsor), pierden control sobre el uso del dinero. Con frecuencia los fondos se mezclan (*commingling*) entre distintas obras, generando riesgo de consolidación sustancial ante litigios de contratistas o reclamos laborales.
3. **La Trampa de los Protocolos Cripto Sin Anclaje Legal:** Los intentos previos de tokenización web3 fallaron al emitir tokens en DAOs desreguladas que violan las leyes federales de valores (Securities Act de 1933) o al asumir custodia centralizada no autorizada.

En BRIDS resolvemos esta fricción mediante una arquitectura dual: software de infraestructura de sindicación sin custodia montado sobre Solana, acoplado a una estructura societaria celular de **Series LLCs** y tesorerías descentralizadas gobernadas por **Squads Protocol**.

---

## 2. Arquitectura Corporativa Dual y Blindaje Non-Broker-Dealer

La plataforma opera bajo una separación institucional de responsabilidades legales, patrimoniales y funcionales:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               ARQUITECTURA CORPORATIVA Y SEGREGACIÓN PATRIMONIAL            │
└─────────────────────────────────────────────────────────────────────────────┘

       [ BRIDS Inc. ] (Delaware C-Corp)
       ├─ Propiedad Intelectual, Software SaaS y APIs
       ├─ Levantamiento de Capital de Riesgo (SAFE / Equity)
       └─ Sin Custodia de Fondos ni Intermediación de Valores (Non-Broker-Dealer)
                             │
                             │ Contrato B2B de Licenciamiento SaaS
                             ▼
       [ BRIDS Assets Master LLC ] (Series LLC sombrilla en Estado Friendly)
       ├─ Master Operating Agreement y Protocolo de Emisión
       ├─ Administración de Libros Societarios (Master Securityholder File)
       │
       ├───► [ Series A - 104 Oak St, Austin ] (Célula / Sub-SPV Independiente)
       │     ├─ Título de Propiedad del Inmueble
       │     ├─ Activos, Deudas y Socios Segregados (Bankruptcy-Remote)
       │     └─ Bóveda Squads v4 Dedicada en Solana (Umbral 2-de-3)
       │
       └───► [ Series B - 220 Pine Ave, Dallas ] (Célula / Sub-SPV Independiente)
             ├─ Título de Propiedad del Inmueble
             ├─ Activos, Deudas y Socios Segregados (Bankruptcy-Remote)
             └─ Bóveda Squads v4 Dedicada en Solana (Umbral 2-de-3)
```

### A. BRIDS Inc. (Delaware C-Corp) — Capa Tecnológica
- **Objeto Social:** Desarrollo y licenciamiento de software, interfaces web, indexadores de datos on-chain y smart contracts.
- **Vehículo de Inversión Tecnológica:** Es la corporación que recibe capital institucional de fondos de Venture Capital mediante acuerdos SAFE o rondas de capital social.
- **Blindaje Regulatorio Estricto:**
  - **Non-Broker-Dealer Status (Securities Exchange Act de 1934, Sección 15(a)(1)):** BRIDS no percibe comisiones por éxito (*transaction-based compensation*) asociadas a la venta o colocación de participaciones. Sus ingresos derivan exclusivamente de tarifas fijas de software SaaS y procesamiento tecnológico.
  - **No Custodia Fiduciaria (FinCEN / 31 CFR 1023.220):** BRIDS no administra llaves privadas de los inversionistas ni deposita fondos en cuentas bancarias corporativas propias.
  - **No Asesor de Inversión (Investment Advisers Act de 1940):** La plataforma no formula recomendaciones financieras ni emite juicios de idoneidad patrimonial.

### B. Master Series LLC y Sub-SPVs — Capa de Activos Inmobiliarios
- Cada propiedad inmobiliaria adquirida o construida se aloja en una **Serie individual** (Sub-SPV) creada bajo una **Master Series LLC**.
- **Aislamiento Patrimonial Estatutario (*Internal Shield*):** Las deudas, litigios o gravámenes derivados de la Serie A recaen exclusivamente sobre los activos de la Serie A. Los activos de la Serie B y de la Master LLC quedan legalmente blindados frente a cualquier acción judicial de acreedores.
- **Registro de Titularidad (Master Securityholder File):** Conforme al marco de la SEC sobre valores tokenizados, la propiedad legal emana del contrato de operación de la serie (*Series Operating Agreement*) y del registro oficial de socios verificado mediante Stripe Identity. El NFT en Metaplex Core actúa como la representación digital programable y la credencial de acceso a los derechos económicos.

---

## 3. Benchmark de Estados Friendly con Series LLCs y Estrategia Interestatal

Para optimizar costos de registro, protección de pasivos y reconocimiento judicial, evaluamos las jurisdicciones de Estados Unidos con legislación madura en Series LLCs:

| Jurisdicción | Base Estatutaria | Costo Anual por Serie | Privacidad de Socios | Fortaleza del Escudo Judicial | Idoneidad para BRIDS |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Texas** | TBOC Cap. 101, Subcap. M | \$0 extra (Reporte consolidado Master) | Alta | Alta en el Fifth Circuit | **Recomendada para proyectos inmobiliarios locales en Texas** |
| **Florida** | Fla. Stat. §§ 605.2101–.2802 (CS/SB 316) | Tarifa estándar de registro anual Sunbiz | Alta | Alta (Uniform Protected Series Act - UPSA) | **Clave para el mercado inmobiliario de Florida (Vigente desde 1-Jul-2026)** |
| **Delaware** | 6 Del. C. § 18-215 / § 18-218 | \$75 USD (Registered Series) / \$300 Master | Media (Registered Agent) | Máxima (Precedente en Court of Chancery) | **Recomendada para Master Umbrella Institucional** |
| **Wyoming** | Wyo. Stat. § 17-29-211 | \$60 USD anual (Master única) | Máxima | Alta (Charging order remedy exclusivo) | **Excelente para estructuras de activos alternativos** |
| **Nevada** | NRS Cap. 86 | \$350+ USD por serie | Alta | Alta (Leyes anti-acreedores estrictas) | Costo de mantenimiento elevado |

### Florida: Incorporación Histórica del Uniform Protected Series Act (UPSA)
Con la promulgación de **CS/SB 316** (Capítulo 2025-162, Leyes de Florida), que entró en vigor el **1 de julio de 2026**, Florida modificó la Ley Revisada de Sociedades de Responsabilidad Limitada (Capítulo 605 de los Estatutos de Florida, §§ 605.2101 a 605.2802) adoptando formalmente el marco de **Protected Series LLCs**:
1. **Series Protegidas Domésticas:** Permite que una LLC matriz de Florida cree series protegidas independientes, cada una con titularidad directa de inmuebles, miembros, gerentes y blindaje horizontal de pasivos.
2. **Reconocimiento y Registro de Series Foráneas:** Autoriza expresamente el registro de Series LLCs constituidas en otros estados (Delaware, Texas, Wyoming) para operar legalmente en Florida con pleno reconocimiento estatutario de la separación patrimonial.
3. **Impacto para BRIDS:** Elimina la necesidad de constituir LLCs subsidiarias tradicionales para proyectos en Miami, Tampa u Orlando. Los sponsors pueden desplegar sub-SPVs celulares directamente en Florida o calificar series de la Master LLC de Delaware/Texas en la División de Corporaciones (Sunbiz).

### Catálogo Completo de Jurisdicciones con Leyes de Series LLC (Accesos Directos a Leyes Oficiales)

La siguiente tabla compila las 22 jurisdicciones en territorio estadounidense que cuentan con estatutos vigentes para la formación o designación de Series LLCs / Protected Series, con enlaces directos a sus portales legislativos oficiales:

| # | Jurisdicción | Estatuto / Base Legal | Enlace Oficial a la Ley | Modelo Estatutario | Viabilidad para BRIDS |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Texas** | Tex. Bus. Orgs. Code § 101.601 | 🔗 [Texas Subchapter M](https://statutes.capitol.texas.gov/Docs/BO/htm/BO.101.htm#101.601) | TBOC Series | **Tier 1 (Máxima prioridad)** |
| **2** | **Florida** | Fla. Stat. §§ 605.2101–.2802 | 🔗 [Florida Chapter 605 (CS/SB 316)](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0605/0605.html) | UPSA (Vigente Jul-2026) | **Tier 1 (Máxima prioridad)** |
| **3** | **Delaware** | 6 Del. C. § 18-215 / § 18-218 | 🔗 [Delaware Code Title 6](https://delcode.delaware.gov/title6/c018/sc02/index.html#18-215) | Registered & Protected | **Tier 1 (Master Umbrella)** |
| **4** | **Wyoming** | Wyo. Stat. Ann. § 17-29-211 | 🔗 [Wyoming Code § 17-29-211](https://law.justia.com/codes/wyoming/title-17/chapter-29/article-2/section-17-29-211/) | Wyo Series / DAO Friendly | **Tier 1 (Master / Tesorería)** |
| **5** | **Ohio** | Ohio Rev. Code § 1706.761 | 🔗 [Ohio Revised Code Cap. 1706](https://codes.ohio.gov/ohio-revised-code/chapter-1706) | Revised LLC Act (2022) | **Tier 2 (Midwest Hub)** |
| **6** | **Tennessee** | Tenn. Code Ann. § 48-249-309 | 🔗 [Tennessee Code § 48-249-309](https://law.justia.com/codes/tennessee/title-48/chapter-249/part-3/section-48-249-309/) | TN Series LLC | **Tier 2 (Southeast Hub)** |
| **7** | **Indiana** | Ind. Code § 23-18.1 | 🔗 [Indiana Code Article 18.1](https://iga.in.gov/laws/current/ic/title/23/article/18.1/) | UPSA Uniform | **Tier 2 (Bajo costo)** |
| **8** | **Iowa** | Iowa Code § 489.14101 | 🔗 [Iowa Code Article 14](https://www.legis.iowa.gov/docs/code/489.14101.pdf) | UPSA Uniform | **Tier 2 (Agrícola/Industrial)** |
| **9** | **Kansas** | Kan. Stat. Ann. § 17-76,143 | 🔗 [Kansas Statutes § 17-76,143](https://www.ksrevisor.org/statutes/chapters/ch17/017_076_0143.html) | UPSA Uniform | **Tier 2** |
| **10** | **Arkansas** | Ark. Code Ann. § 4-38-1201 | 🔗 [Arkansas Subchapter 12](https://law.justia.com/codes/arkansas/title-4/subtitle-3/chapter-38/subchapter-12/) | UPSA Uniform | **Tier 2** |
| **11** | **Nebraska** | Neb. Rev. Stat. § 21-501 | 🔗 [Nebraska Statutes § 21-501](https://nebraskalegislature.gov/laws/statutes.php?statute=21-501) | UPSA Uniform | **Tier 2** |
| **12** | **Utah** | Utah Code Ann. § 48-3a-1201 | 🔗 [Utah Code Part 12](https://le.utah.gov/xcode/Title48/Chapter3A/48-3a-P12.html) | Utah Series | **Tier 2 (Tech/Real Estate)** |
| **13** | **Virginia** | Va. Code Ann. § 13.1-1038.1 | 🔗 [Code of Virginia § 13.1-1038.1](https://law.lis.virginia.gov/vacode/title13.1/chapter12/section13.1-1038.1/) | Virginia Protected Series | **Tier 2 (Mid-Atlantic)** |
| **14** | **Missouri** | Mo. Rev. Stat. § 347.186 | 🔗 [Missouri Revisor § 347.186](https://revisor.mo.gov/main/OneSection.aspx?section=347.186) | MO Series LLC | **Tier 2** |
| **15** | **Alabama** | Ala. Code § 10A-5A-11.01 | 🔗 [Alabama Code Article 11](https://casetext.com/statute/code-of-alabama/title-10a-alabama-business-and-nonprofit-entities-code/chapter-5a-limited-liability-companies/article-11-series-of-assets) | AL Series LLC | **Tier 2** |
| **16** | **Oklahoma** | 18 O.S. § 2054.4 | 🔗 [Oklahoma Statutes § 2054.4](https://www.oscn.net/applications/oscn/DeliverDocument.asp?CiteID=440536) | OK Series LLC | **Tier 2** |
| **17** | **Montana** | Mont. Code Ann. § 35-8-304 | 🔗 [Montana MCA § 35-8-304](https://leg.mt.gov/bills/mca/title_0350/chapter_0080/part_0030/section_0040/0350-0080-0030-0040.html) | MT Series LLC | **Tier 2** |
| **18** | **North Dakota** | N.D. Cent. Code § 10-32.1-91 | 🔗 [North Dakota Code § 10-32.1](https://ndlegis.gov/cencode/t10c32-1.pdf) | ND Series LLC | **Tier 2** |
| **19** | **District of Columbia** | D.C. Code § 29-802.06 | 🔗 [D.C. Official Code § 29-802.06](https://code.dccouncil.gov/us/dc/council/code/sections/29-802.06) | D.C. Series LLC | **Tier 2 (Institucional D.C.)** |
| **20** | **Puerto Rico** | 14 L.P.R.A. § 3962 | 🔗 [Ley General de Corp. Art. 19.17](https://bvirtualogp.pr.gov/ogp/Bvirtual/leyesreferencia/PDF/2009/0164-2009.pdf) | PR Series LLC (Ley 164) | **Tier 2 (Incentivos Act 60)** |
| **21** | **Illinois** | 805 ILCS 180/37-40 | 🔗 [Illinois ILCS 180/37-40](https://www.ilga.gov/legislation/ilcs/documents/080501800K37-40.htm) | IL Series LLC | **Tier 3 (Costoso: \$100/serie)** |
| **22** | **Nevada** | Nev. Rev. Stat. § 86.296 | 🔗 [Nevada NRS Chapter 86](https://www.leg.state.nv.us/nrs/nrs-086.html#NRS086Sec296) | NV Series LLC | **Tier 3 (Costoso: \$350+/serie)** |

---

## 4. Gobernanza On-Chain: 1 SPV = 1 Bóveda Squads Protocol v4

Para erradicar la opacidad en la administración de fondos, cada Serie LLC cuenta con su propia instancia de bóveda multifirma en **Squads Protocol v4** en la red de Solana:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 BÓVEDA SQUADS PROTOCOL V4 (1 SPV DEDICADO)                  │
└─────────────────────────────────────────────────────────────────────────────┘

       Comité de Firmantes Multisig (Umbral 2-de-3)
       ├─ Firma 1: Sponsor / Desarrollador Inmobiliario
       ├─ Firma 2: Inspector Técnico de Obra Independiente (AIA Document G702)
       └─ Firma 3: Gobernanza de Plataforma BRIDS (Supervisión de Cumplimiento)
                             │
                             ▼
       [ Cuenta Squads v4 en Solana ] (Costo marginal de despliegue ~0.02 SOL)
       │
       ├───► [ Sub-Bóveda 0: Construcción y Adquisición ]
       │     └─ 90% de fondos liberados contra hito certificado y lien waiver
       │
       ├───► [ Sub-Bóveda 1: Statutory Retainage ]
       │     └─ 10% de retención estatutaria obligatoria (Texas Chapter 53)
       │
       └───► [ Sub-Bóveda 2: Dispersión de Rentas Netas ]
             └─ Distribución simultánea en USDC a billeteras acreditadas (Metaplex Core)
```

### Ventajas Operativas de la Gobernanza Descentralizada
- **Aislamiento Total de Tesorerías:** Ningún firmante ni evento financiero de la Serie A tiene acceso o influencia sobre la Serie B.
- **Costo Marginal Despreciable:** El despliegue de una cuenta multifirma en Solana cuesta aproximadamente \$4 USD de pago único por renta de almacenamiento (*rent exemption*), frente a cientos de dólares anuales en comisiones bancarias tradicionales.
- **Auditoría Pública en Tiempo Real:** Cualquier socio puede comprobar el saldo de la bóveda, el historial de transferencias y los comprobantes de hitos en exploradores públicos como Solscan o en el panel de control de BRIDS.

---

## 5. Arquitectura de Monetización y Unit Economics (SaaS B2B)

El modelo financiero de BRIDS Inc. monetiza la infraestructura tecnológica sin intermediación de corretaje:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     MATRIZ DE INGRESOS BRIDS INC.                           │
└─────────────────────────────────────────────────────────────────────────────┘

1. Setup & Deployment Fee ($3,000 - $7,500 USD por Serie/SPV)
   └─ Parametrización técnica, despliegue de smart contracts Metaplex Core y Squads.

2. Recurring AUM Tech Fee (0.50% - 1.00% anual sobre activos sindicados)
   └─ Mantenimiento de dashboards, orquestador de dispersión y generación de K-1.

3. Processing & Disbursement Fee (0.25% - 0.50% sobre flujos liquidados)
   └─ Cobro técnico por transacciones procesadas a través de rieles Sphere / Solana.

4. Administrative Recovery Fee ($25 - $50 USD por evento)
   └─ Re-validación de identidad (Stripe Identity) y reemisión de credenciales.
```

### Economía Unitaria por Proyecto Inmobiliario Estándar (\$2,000,000 USD)
- **Ingreso Inicial por Despliegue (Setup Fee):** \$5,000 USD.
- **Ingreso Anual por Software (0.75% AUM Tech Fee):** \$15,000 USD/año.
- **Tarifas de Procesamiento de Rentas y Desembolsos:** \$2,500 USD/año.
- **Valor de Vida del Cliente por Proyecto a 3 Años (LTV):** \$57,500 USD.
- **Costo Marginal de Despliegue en Solana y Servidores:** Menor a \$150 USD por SPV.
- **Margen Bruto de Software:** Superior al 90%.

### Ahorro Cuantificable para el Sponsor Inmobiliario
Un sponsor que sindica 5 propiedades al año gasta tradicionalmente más de \$100,000 USD en estructuración legal y gestión administrativa. Con la arquitectura de Series LLCs y bóvedas Squads de BRIDS, reduce sus costos de estructuración a menos de \$35,000 USD totales, acelerando el cierre de rondas de 90 días a menos de 14 días.

---

## 6. Flujo de Fondos, Marco de Emisión y Régimen Fiscal

```
[ Inversor Acreditado ] 
       │ 1. KYC/AML biométrico con Stripe Identity
       ▼
[ Billetera Verificada en Whitelist ]
       │ 2. Aporte en USD (ACH/Wire) o USDC vía Sphere Labs
       ▼
[ Bóveda Squads de la Serie Específica ]
       │ 3. Acuñación automática de NFT Metaplex Core con Freeze/Recovery
       ▼
[ Desembolsos por Hitos (2-de-3) ] ───► [ Contratista General en USD ]
       │
       │ 4. Operación del Inmueble y Cobro de Alquileres
       ▼
[ Dispersión Directa de Rentas en USDC ] ───► [ Billeteras de los Inversionistas ]
```

### Marco Regulatorio y Régimen Tributario
1. **Exenciones de Valores de la SEC:**
   - **Regulation D (Regla 506(c)):** Para inversionistas acreditados en Estados Unidos, con verificación rigurosa de ingresos o patrimonio neto. Permite la difusión pública de la oportunidad sindicada.
   - **Regulation S:** Para inversionistas internacionales fuera de territorio estadounidense, sin requerimiento de estatus de acreditado en EE.UU.
2. **Tratamiento Fiscal Pass-Through:**
   - Cada Serie LLC tributa bajo el régimen de sociedad transparente (*partnership*) a efectos fiscales federales del IRS.
   - La serie emite anualmente el **Formulario IRS 1065 / Schedule K-1** a cada inversionista por sus ganancias o pérdidas inmobiliarias netas.
   - BRIDS Inc. (Delaware C-Corp) no tributa sobre los flujos del inmueble, sino únicamente sobre sus ingresos por licenciamiento de software SaaS.

---

## 7. Próximos Pasos y Llamado a la Acción

La integración de Delaware C-Corp, Series LLCs y Squads Protocol posiciona a BRIDS como el estándar de software para sindicación inmobiliaria institucional en Solana.

Invitamos a sponsors inmobiliarios, desarrolladores y fondos de capital a iniciar su proceso de estructuración tecnológica:
- **Sponsors Inmobiliarios:** Agenda una sesión de estructuración técnica para evaluar el despliegue de tu primer sub-SPV y automatizar tu tesorería de obra.
- **Inversionistas Institucionales y VCs:** Solicita acceso a nuestra Data Room técnica para revisar los modelos contractuales de Series LLC, los esquemas de smart contracts y la gobernanza multifirma.


## 🔄 Historial de Revisiones SDD (Changelog)
- **v1.0 (2026-09-16):** Aprobado por el usuario e integrado en el vault tras 1 ciclos de optimización con nota de 9/9.0.

## 🔗 Trazabilidad
- Artefacto de Especificación: [[00 Inbox/Specs/rwa-series-llc-squads-model.spec.md]]
- Contexto de Marca: [[01 Brand Context/product-marketing-context.md]]
