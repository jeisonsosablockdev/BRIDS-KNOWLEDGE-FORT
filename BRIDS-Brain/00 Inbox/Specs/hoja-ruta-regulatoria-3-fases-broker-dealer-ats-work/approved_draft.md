---
title: "Hoja de Ruta Regulatoria y Comercial en 3 Fases: Reg S/D, Broker-Dealer Shell y ATS en Solana"
spec_id: "SPEC-HOJA-RUTA-REGULATORIA-3-FASES-BROKER-DEALER-ATS"
category: "01 Negocio/03 Legal & Cumplimiento"
author_agents:
  - "compliance-officer"
  - "business-consultant"
  - "pitch-deck-architect"
reviewer_agent: "sdd-reviewer"
quality_score: 9.0
quality_threshold: 8.5
status: approved
version: "1.0"
created_at: 2026-09-17
updated_at: 2026-09-17
tags:
  - brids
  - sdd-approved
  - hitl-validated
  - deliverable
  - sec-compliance
  - finra
  - broker-dealer-shell
  - ats
  - reg-s
  - reg-d
  - solana
---

# Hoja de Ruta Regulatoria y Comercial en 3 Fases: Reg S/D, Broker-Dealer Shell y ATS en Solana

> [!NOTE]
> **Manual Maestro de Cumplimiento, Go-to-Market y Licenciamiento Institucional (Validación SDD + HITL)**  
> **Subagentes Autores:** `compliance-officer`, `business-consultant`, `pitch-deck-architect` | **Revisión:** `sdd-reviewer`.  
> **Destinatarios:** Real Estate Sponsors, Institutional LPs, Inversionistas de Capital de Riesgo (YC), Red de Gestores LatAm.  
> **Alcance:** Establece la hoja de ruta de comercialización y licenciamiento en 3 fases: Fase 1 (Tracción rápida sin fricción bajo Regulation S para retail internacional y Regulation D 506(c) para inversores acreditados en EE.UU., respaldada por una red de gestores bajo el marco de Foreign Finders); Fase 2 (Adquisición de un Broker-Dealer Shell mediante FINRA Rule 1017 para habilitar Regulation Crowdfunding y venta masiva en EE.UU.); y Fase 3 (Despliegue de un Sistema Alternativo de Negociación - ATS secundario de liquidez sobre la red de Solana).

---

## 1. Tesis de Venta: "Web3 Invisible" y Preservación Patrimonial

La comercialización masiva de fracciones inmobiliarias exige eliminar la fricción técnica y el lenguaje críptico que aleja al inversor tradicional:

1. **Mensaje Comercial Directo:** De cara al cliente minorista en Colombia, Ecuador y la diáspora hispana, la propuesta de valor prescinde de términos como *blockchain, wallets o smart contracts*. El mensaje se enfoca estrictamente en finanzas tangibles: *"Dolariza tus ahorros e invierte en bienes raíces estructurados en Estados Unidos desde \$200 USD con rentas mensuales"*.
2. **Infraestructura Oculta:** La red de Solana, los contratos de Metaplex Core y las bóvedas Squads v4 operan tras bambalinas como el riel contable, de auditoría criptográfica y de liquidación instantánea.
3. **El Desafío SEC / FINRA:** Debido a que la adquisición de cuotas de una LLC inmobiliaria califica como un contrato de inversión bajo el Test de Howey (*SEC v. W.J. Howey Co.*), la venta requiere una estructuración legal que evite sanciones por intermediación no autorizada (Securities Exchange Act de 1934, Sección 15(a)(1)).

Para resolver esta ecuación entre velocidad de ventas y cumplimiento regulatorio, BRIDS ejecuta una estrategia en tres fases sucesivas.

---

## 2. Mapa Integral de la Estrategia en 3 Fases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 CRONOGRAMA DE EVOLUCIÓN REGULATORIA Y COMERCIAL             │
└─────────────────────────────────────────────────────────────────────────────┘

 [ FASE 1: Tracción y Flujo de Caja Inmediato ] ──► (Meses 1 a 12)
 ├─ Marco Legal: Reg S (Retail LatAm $200) + Reg D 506(c) (Acreditados EE.UU.).
 ├─ Fuerza Comercial: Red de gestores en Colombia y Ecuador (Foreign Finders).
 ├─ Riel de Pagos: Stripe Identity (KYC) + Sphere Labs (Pasarelas USD / USDC).
 └─ Licencias FINRA: Cero costos o demoras; operación como proveedor SaaS.

                                     │
                                     ▼ Ronda de Capital Seed / Serie A
 [ FASE 2: Adquisición de Broker-Dealer Shell ] ──► (Meses 12 a 18)
 ├─ Operación Corporativa: Compra de BD inactivo con membresía FINRA limpia.
 ├─ Trámite Regulatorio: FINRA Rule 1017 (Continuing Membership Application - CMA).
 ├─ Equipo Clave: Designación de CCO (Series 24) y FinOP (Series 27).
 └─ Desbloqueo Comercial: Reg CF (Retail no acreditado en EE.UU. hasta $5M/año).

                                     │
                                     ▼ Escala Continental
 [ FASE 3: Mercado Secundario ATS en Solana ] ──► (Meses 18 a 24+)
 ├─ Registro Regulatorio: Presentación de Form ATS ante la SEC.
 ├─ Riel Tecnológico: Libro mayor secundario instantáneo con Metaplex Core.
 ├─ Liquidez 24/7: Negociación peer-to-peer regulada entre inversionistas.
 └─ Foso Defensivo: Licencia institucional propia integrada a blockchain de alta velocidad.
```

---

## 3. FASE 1: Despliegue Inmediato, Red de Gestores y Cross-Border LatAm (Meses 1 - 12)

El objetivo de la Fase 1 es generar tracción comercial, validar el costo de adquisición de clientes (CAC) y acumular volumen transaccional sin incurrir en los tiempos de espera de FINRA:

### A. Régimen Dual de Exenciones de la SEC
- **Regulation S (Retail Global en Colombia y Ecuador):** Aplica a ofertas y ventas de participaciones realizadas exclusivamente a personas ubicadas fuera de Estados Unidos. La SEC carece de jurisdicción sobre estas colocaciones, permitiendo tickets de entrada democráticos de **\$200 USD** sin exigencia de patrimonio neto mínimo.
- **Regulation D (Regla 506(c) para Estados Unidos):** En territorio estadounidense, la colocación se dirige exclusivamente a *Inversionistas Acreditados* (ingresos individuales superiores a \$200,000 USD anuales o patrimonio neto mayor a \$1,000,000 USD excluyendo vivienda principal), verificado formalmente mediante Stripe Identity. Permite la difusión pública (*general solicitation*) de los proyectos.

### B. Blindaje Local en Colombia y Ecuador (Prevención de Captación Masiva)
1. **Derecho Individual de Inversión Foránea:** Los ciudadanos colombianos y ecuatorianos poseen el derecho constitucional y cambiario de adquirir activos en el extranjero.
2. **Cero Establecimiento Bancario Local:** BRIDS no opera como entidad financiera captadora ni abre cuentas bancarias corporativas en Bogotá o Quito. El contrato de suscripción (*Operating Agreement*) se perfecciona bajo leyes de EE.UU. (Delaware, Texas o Florida), y los fondos viajan directamente hacia la cuenta o bóveda de la Serie LLC en EE.UU.
3. **Erradicación del Delito de Captación Ilegal:** En Colombia (Decreto 4334 de 2008 y Art. 316 del Código Penal), la captación masiva sanciona recibir fondos prometiendo devoluciones con interés fijo sin entrega de activos. En BRIDS, el inversor recibe la propiedad fraccionada real sobre una LLC titular de una escritura pública de inmueble (*deed*), con rendimientos variables atados a la explotación del alquiler.
4. **Venta en Ecuador:** Al ser una economía dolarizada, elimina el riesgo cambiario. Los pagos se procesan con tarjeta internacional o transferencias en dólares directas a los rieles del SPV.

### C. Estructura Legal de la Red de Gestores Comerciales (Foreign Finders)
Para incentivar a promotores inmobiliarios y gestores de patrimonio en LatAm sin violar la prohibición de comisiones de intermediación de valores de la SEC:
- **Figura de Foreign Finders:** La jurisprudencia de la SEC reconoce que personas no residentes en EE.UU. que canalizan inversores foráneos bajo Reg S no requieren licencia de broker-dealer estadounidense.
- **Formato Contractual:** Los contratos de la red de gestores se suscriben con la entidad de software bajo la modalidad de **Contratos de Servicios de Marketing y Generación de Clientes Calificados (Lead Generation)**. Se remunera por cliente onboardeado y verificado, eliminando la figura de corretaje bursátil.

---

## 4. FASE 2: Institucionalización y Adquisición de Broker-Dealer Shell (Meses 12 - 18)

Una vez alcanzada una masa crítica de transacciones y con el respaldo de capital institucional de una ronda Seed o Serie A, BRIDS da el salto a la propiedad de su infraestructura de distribución:

### A. Tesis de Adquisición de Shell vs Solicitud desde Cero
- **El Problema del Trámite Tradicional (NMA - Rule 1013):** Registrar un Broker-Dealer nuevo ante FINRA toma de 14 a 24 meses y supera los \$250,000 USD en gastos legales y auditorías.
- **La Solución del Broker-Dealer Shell:** Se adquiere una entidad corporativa inactiva que ya ostenta membresía activa en FINRA y registro ante la SEC. Costo de compra en el mercado secundario: **\$75,000 a \$150,000 USD**.
- **Trámite FINRA Rule 1017 (Continuing Membership Application - CMA):** Se notifica el cambio de propiedad y control sustancial de la firma. FINRA evalúa a los nuevos accionistas y el plan tecnológico de BRIDS. Tiempo estimado de aprobación: **90 a 180 días**.

### B. Personal Clave y Licencias Regulatorias Obligatorias
Para cumplir las exigencias de supervisión de FINRA, la filial Broker-Dealer de BRIDS incorpora profesionales certificados:
1. **Chief Compliance Officer (CCO) con Licencia Serie 24 (General Securities Principal):** Supervisa el cumplimiento de las normas de conducta, prevención de lavado de activos y archivo de comunicaciones.
2. **Financial and Operations Principal (FinOP) con Licencia Serie 27:** Responsable de los reportes financieros mensuales (FOCUS Reports) y el monitoreo de solvencia.
3. **Representantes Comerciales con Serie 7 o Serie 82 (Private Securities Offerings):** Habilitados para asesorar y comercializar valores formalmente.
4. **Requisito de Capital Neto (SEC Rule 15c3-1):** Al operar bajo un modelo no custodial donde los fondos se depositan en cuentas de escrow bancarias o bóvedas Squads independientes, el capital mínimo regulatorio requerido se mantiene en el rango bajo de **\$5,000 a \$50,000 USD**.

### C. Desbloqueo Comercial en EE.UU. (Regulation Crowdfunding - Reg CF)
Con la licencia de Broker-Dealer propia:
- BRIDS comercializa directamente a **inversionistas minoristas de Estados Unidos (no acreditados)** con tickets desde **\$200 USD**.
- Levanta hasta **\$5,000,000 USD anuales por cada inmueble** sin necesidad de estados financieros auditados complejos de la SEC.
- Captura el 100% de las comisiones de colocación que antes absorbían intermediarios externos.

---

## 5. FASE 3: El Mercado Secundario ATS en Solana (Meses 18 - 24+)

La cúspide de la estrategia regulatoria y tecnológica consiste en convertir a BRIDS en un centro de negociación de liquidez secundaria:

### A. Registro de Form ATS ante la División de Mercados de la SEC
- Al poseer el Broker-Dealer, BRIDS presenta la notificación del **Formulario ATS (Alternative Trading System)** conforme al Reglamento ATS (*Regulation ATS*, 17 CFR § 242.300).
- La aprobación autoriza a BRIDS a operar una plataforma electrónica multilateral que empareja órdenes de compra y venta de participaciones inmobiliarias entre usuarios.

### B. Arquitectura Tecnológica en Solana
- **Liquidación Atómica On-Chain:** El emparejamiento de órdenes ocurre en el libro digital de la plataforma, mientras que la transferencia de la participación societaria y la liquidación en USDC se ejecutan en milisegundos mediante contratos de Metaplex Core en Solana.
- **Control de Transferencia (Freeze Plugin):** El smart contract impide que un NFT sea transferido a una billetera que no haya superado el KYC con Stripe Identity o que pertenezca a una jurisdicción bloqueada, garantizando el cumplimiento continuo del Master Securityholder File.
- **Foso Defensivo (Moat):** Crea una barrera de entrada infranqueable. Ninguna plataforma web3 sin licencias puede ofrecer liquidez legal, y ninguna corredora tradicional web2 puede liquidar transacciones fraccionadas en tiempo real a costos de microcentavos.

---

## 6. Narrativa de Presentación ante Fondos de Venture Capital (YC Memo)

Esta estructura responde de forma contundente a las objeciones habituales de los comités de inversión de Venture Capital:

> *"Nuestra estrategia de comercialización se divide en tres horizontes calculados. En la Fase 1 eliminamos el riesgo regulatorio inicial: usamos Regulation S para capitalizar el enorme apetito de retail en América Latina (comenzando con Colombia y Ecuador) que busca refugio en dólares, y Regulation D para capital institucional en EE.UU., generando ingresos inmediatos con un margen bruto de software superior al 90%. En la Fase 2, utilizamos el capital levantado para adquirir un Broker-Dealer shell bajo la Regla 1017 de FINRA, lo que nos permite abrir la colocación de Regulation Crowdfunding para el público minorista masivo de EE.UU. Finalmente, en la Fase 3 activamos nuestra licencia de ATS sobre Solana, resolviendo la falta de liquidez histórica de los bienes raíces mediante un mercado secundario regulado 24/7."*

---

## 7. Próximos Pasos y Llamado a la Acción

La ejecución de la Fase 1 requiere disciplina contractual y foco en la adquisición de clientes calificados:
- **Red de Gestores y Afiliados:** Agenda una sesión de estructuración comercial para formalizar los contratos de Foreign Finders y definir las tablas de retribución por lead calificado en Colombia y Ecuador.
- **Sponsors Inmobiliarios:** Inicia el despliegue técnico del primer proyecto sindicado bajo la Master Series LLC y automatiza la dispersión de rentas en la bóveda Squads v4.
