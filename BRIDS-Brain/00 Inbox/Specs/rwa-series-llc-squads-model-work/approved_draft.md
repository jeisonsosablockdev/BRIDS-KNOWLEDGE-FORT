---
title: "Modelo de Negocio BRIDS: Delaware C-Corp, Series LLCs y Bóvedas Squads"
spec_id: "SPEC-RWA-SERIES-LLC-SQUADS-MODEL"
category: "01 Negocio/01 Estrategia & Modelo"
author_agents:
  - "business-consultant"
  - "compliance-officer"
  - "pitch-deck-architect"
reviewer_agent: "sdd-reviewer"
quality_score: 9.0
quality_threshold: 8.5
status: approved
version: "1.0"
created_at: 2026-09-16
updated_at: 2026-09-16
tags:
  - brids
  - sdd-approved
  - hitl-validated
  - deliverable
  - series-llc
  - squads-multisig
  - delaware-c-corp
  - unit-economics
---

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
| **Delaware** | 6 Del. C. § 18-215 / § 18-218 | \$75 USD (Registered Series) / \$300 Master | Media (Registered Agent) | Máxima (Precedente en Court of Chancery) | **Recomendada para Master Umbrella Institucional** |
| **Texas** | TBOC Cap. 101, Subcap. M | \$0 extra (Reporte consolidado Master) | Alta | Alta en el Fifth Circuit | **Recomendada para proyectos inmobiliarios locales en Texas** |
| **Wyoming** | Wyo. Stat. § 17-29-211 | \$60 USD anual (Master única) | Máxima | Alta (Charging order remedy exclusivo) | **Excelente para estructuras de activos alternativos** |
| **Nevada** | NRS Cap. 86 | \$350+ USD por serie | Alta | Alta (Leyes anti-acreedores estrictas) | Costo de mantenimiento elevado |

### Estrategia de Activos en Estados Sin Legislación de Series LLC (ej. Florida)
Cuando un sponsor adquiere un inmueble en estados como Florida o Georgia (donde no existe estatuto propio de Series LLC):
1. **Ruta A (Foreign Qualification de la Serie):** Se registra la Serie específica (ej. *BRIDS Assets Master LLC - Series FL-101*) como entidad foránea autorizada para hacer negocios en el estado donde radica el inmueble.
2. **Ruta B (Subsidiaria de Propósito Específico 100%):** La Serie específica constituye una LLC tradicional local de Florida, de la cual la Serie es propietaria del 100% de las participaciones. Esto traslada el título de propiedad a la LLC local mientras los derechos económicos y la gobernanza de inversionistas se mantienen bajo el escudo de la Serie LLC.

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
