---
title: "SOP-OPS-001: Procedimiento Operativo Estándar para Incorporación y Gestión Societaria con Stablecorp"
spec_id: "SPEC-SOP-OPS-001-STABLECORP"
category: "01 Negocio/06 Operaciones & Gobernanza/sops"
author_agents:
  - "compliance-officer"
  - "business-consultant"
reviewer_agent: "sdd-reviewer"
quality_score: 9.0
quality_threshold: 8.5
status: "approved"
version: "1.0"
created_at: 2026-09-24
updated_at: 2026-09-24
tags:
  - brids
  - sop
  - operations
  - stablecorp
  - incorporation
  - ein
  - banking
---

# SOP-OPS-001: Procedimiento Operativo Estándar para Incorporación y Gestión Societaria con Stablecorp

> [!NOTE]
> **Propósito del SOP:** Establecer el protocolo paso a paso para que el equipo fundador de **BRIDS** ejecute la constitución de la entidad corporativa inicial, la obtención de identificación fiscal (EIN) ante el IRS sin SSN, la apertura de banca digital y la conexión de rieles USDC en Solana utilizando **Stablecorp** como plataforma administrativa Go-To.
> **Custodios:** Equipo Fundador de BRIDS y `compliance-officer`.

---

## 1. Alcance y Plataforma Proveedora

- **Plataforma Oficial Asignada:** **Stablecorp** (*Xelio Technologies Inc.* / [https://mystablecorp.xyz](https://mystablecorp.xyz)).
- **Dossier Institucional de Referencia:** [[01 Negocio/03 Legal & Cumplimiento/proveedor-oficial-incorporacion-banca-stablecorp.md|Ficha Institucional y Plataforma Go-To: Stablecorp]].
- **Estrategia Societaria:** [[01 Negocio/03 Legal & Cumplimiento/comparativa-llc-vs-c-corp-estrategia-bootstrap.md|Tesis LLC-First (Fase Bootstrap) ➔ Conversión a Delaware C-Corp (Fase VC)]].

---

## 2. Documentación y Requisitos Previos

Antes de iniciar la solicitud en el portal de Stablecorp, el responsable de operaciones debe reunir:
1. **Pasaportes Vigentes:** Copia digital escaneada de alta resolución de todos los socios fundadores (propietarios con $\ge 25\%$).
2. **Comprobante de Domicilio:** Factura de servicios públicos o extracto bancario reciente (< 3 meses) que certifique la residencia en el país de origen.
3. **Nombre Corporativo Propuesto:** `BRIDS LLC` (y alternativas como `BRIDS Labs LLC` o `BRIDS Technologies LLC`).
4. **Objeto Social Sintético:** *Desarrollo de software de infraestructura y tecnología para tokenización y administración de activos del mundo real (RWA).*

---

## 3. Flujo Operativo Paso a Paso

### Fase 1: Creación de la Entidad Inicial (Wyoming LLC)
1. **Acceso y Registro:**
   - Ingresar a [mystablecorp.xyz](https://mystablecorp.xyz) y seleccionar **Wyoming LLC** (Plan Bootstrap).
2. **Configuración de Datos:**
   - Asignar la titularidad entre los fundadores según el acuerdo de fundadores pactado.
   - Designar a Stablecorp para que provea el **Agente Registrado** y la **dirección comercial en EE.UU.**
3. **Firma y Emisión:**
   - Stablecorp radica los *Articles of Organization* ante la Secretaría de Estado de Wyoming.
   - Tiempo estimado: 2 a 5 días hábiles. Se recibe el *Certificate of Organization* y el *Operating Agreement*.

### Fase 2: Tramitación del EIN Remoto ante el IRS
1. **Formulario SS-4:**
   - Stablecorp prepara el Formulario SS-4 del IRS.
   - Se marca en la línea 7b el valor **"Foreign"** (dado que el solicitante no residente no posee SSN ni ITIN).
2. **Envío por Fax Internacional:**
   - Stablecorp radica el formulario por fax ante la unidad de contribuyentes internacionales del IRS.
3. **Emisión y Recepción:**
   - El IRS asigna el EIN y emite la carta formal **CP 575** (o 147C).
   - Tiempo estimado: 2 a 4 semanas (según tiempos de respuesta de la oficina internacional del IRS).

### Fase 3: Apertura de Cuentas Bancarias y Conexión de Rampa USDC
1. **Apertura de Cuenta Digital en EE.UU.:**
   - Con el certificado de organización y el EIN emitido, Stablecorp habilita la solicitud de apertura de cuenta comercial en **Mercury** o **Relay**.
2. **Integración con Infraestructura Bridge (Stripe):**
   - Configuración de la cuenta virtual para recepción y envío de dólares (USD) y stablecoins (USDC) sobre la red **Solana**.
   - Beneficio de tarifa preferencial de cliente Stablecorp: **1.5% on-ramp y 0.5% off-ramp** (frente al ~5% del mercado general).

### Fase 4: Calendario de Mantenimiento Anual
- **Marzo:** Revisión de libros y aportes de capital del año previo.
- **Antes del 15 de Abril:** Stablecorp prepara y radica ante el IRS el **Formulario 5472 + Pro Forma 1120** (evitando la multa de \$25,000 USD).
- **Mes de Aniversario de la LLC:** Stablecorp radica el **Reporte Anual de Wyoming** (\$60 USD de tasa estatal).
- **Continuo:** Notificar a FinCEN cualquier cambio en los beneficiarios finales dentro de los 30 días posteriores al cambio (BOI Report).

### Fase 5: Protocolo de Conversión a Delaware C-Corp (Hito VC)
1. **Disparador:** Firma de Term Sheet con un fondo de Venture Capital o admisión en aceleradora institucional (Y Combinator).
2. **Instrucción a Stablecorp:** Solicitar la ejecución de la **conversión estatutaria** bajo la Sección 265 de la Ley de Sociedades de Delaware (DGCL § 265) y reorganización libre de impuestos bajo IRC § 351.
3. **Parámetros C-Corp:** 10,000,000 de acciones autorizadas a \$0.00001 de valor nominal, pool ESOP del 10-15%, y radicación inmediata de las elecciones 83(b) de los fundadores dentro de los 30 días posteriores a la emisión.

---

## 4. Control de Cambios y Auditoría

- **Documento Fuente:** [[01 Negocio/03 Legal & Cumplimiento/proveedor-oficial-incorporacion-banca-stablecorp.md|Dossier Stablecorp]].
- **Aprobado por:** Junta Fundadora de BRIDS.
