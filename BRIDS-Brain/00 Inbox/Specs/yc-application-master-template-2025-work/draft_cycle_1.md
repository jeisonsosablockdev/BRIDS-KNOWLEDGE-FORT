---
title: "YC Application Master Template 2025 — Cuestionario Oficial y Requisitos BRIDS"
type: "yc-application"
status: "draft_optimizing"
version: "1.0"
spec_id: "SPEC-YC-APPLICATION-MASTER-TEMPLATE-2025"
source_guide: "YC Application Guide: Process, Questions, & Deadlines (2025) | Leland"
last_updated: "2026-09-23"
tags:
  - "yc-application"
  - "fundraising"
  - "y-combinator"
  - "master-template"
  - "sdd-review"
---

# YC Application Master Template 2025 — Cuestionario Oficial y Requisitos BRIDS
### Cuestionario de Postulación Oficial, Checklist de Preparación y Respuestas Estratégicas

> [!NOTE]
> **Propósito del Documento:** Plantilla maestra para la postulación a Y Combinator basada en la guía estándar 2025 de Leland y lineamientos de YC. Consolida respuestas oficiales, métricas operativas y requisitos técnicos para optimizar la postulación antes del deadline.
> **Audiencia:** Y Combinator Partners y Real Estate LPs institucionales.

---

## 🧭 Índice de Secciones

1. [Litmus Test de Preparación YC (Checklist de 10 Puntos)](#1-litmus-test-de-preparación-yc)
2. [Módulo 1: Datos de la Compañía & One-Liner](#2-módulo-1-datos-de-la-compañía--one-liner)
3. [Módulo 2: The Insight & Why Now](#3-módulo-2-the-insight--why-now)
4. [Módulo 3: Progreso, Métricas y Tracción](#4-módulo-3-progreso-métricas-y-tracción)
5. [Módulo 4: Producto, Arquitectura Técnica y Demo Link](#5-módulo-4-producto-arquitectura-técnica-y-demo-link)
6. [Módulo 5: Equipo Fundador, Dedicación y Cap Table](#6-módulo-5-equipo-fundador-dedicación-y-cap-table)
7. [Módulo 6: La Pregunta del Hack No-Informático](#7-módulo-6-la-pregunta-del-hack-no-informático)
8. [Módulo 7: Script y Checklist del Video de 1 Minuto](#8-módulo-7-script-y-checklist-del-video-de-1-minuto)
9. [Llamado a la Acción y Próximos Pasos](#9-llamado-a-la-acción-y-próximos-pasos)

---

## 1. Litmus Test de Preparación YC

Antes de enviar el formulario a Y Combinator Partners, validamos el cumplimiento de los 10 criterios de preparación identificados por la guía de admisiones:

| Criterio de Preparación | Estado BRIDS | Justificación Verificable |
| :--- | :---: | :--- |
| **1. One-liner claro y directo** | ✅ SÍ | *"Shopify for real estate syndication on Solana."* Explicación sin adornos retóricos. |
| **2. Prototipo funcional testeable** | ✅ SÍ | MVP interactivo desplegado en Solana Devnet con contratos Metaplex Core y dashboard web. |
| **3. Tracción o validación real** | ✅ SÍ | Pipeline confirmado de \$2,000,000 USD de inventario para sindicación en Día 1 vía cofundador inmobiliario. |
| **4. Conversaciones recientes con usuarios** | ✅ SÍ | 3 promotores inmobiliarios externos entrevistados en las últimas dos semanas evaluando costos de capital. |
| **5. Conocimiento de competidores directos** | ✅ SÍ | Mapeo riguroso de Lofty.ai (Algorand), RealT (Ethereum/Gnosis) y Blocksquare; ventaja en costos de red y recuperación de llaves. |
| **6. Compromiso de dedicación** | ✅ SÍ | Equipo técnico y de operaciones listo para transición 100% full-time al confirmar la admisión a YC. |
| **7. Articulación clara de roles** | ✅ SÍ | Separación funcional definida: Arquitectura técnica y smart contracts, Adquisición de sponsors inmobiliarios, y Cumplimiento legal. |
| **8. Insight aprendido de iteraciones previas** | ✅ SÍ | El inversor retail no tolera perder su activo por olvidar una seed phrase; la recuperación on-chain es obligatoria. |
| **9. Claridad de "Why Now"** | ✅ SÍ | Solana reduce el costo de transacción a menos de \$0.001 USD; tasas hipotecarias al 7% impulsan la búsqueda de sindicación alternativa. |
| **10. Video de 1 minuto auténtico** | ⏳ EN PROCESO | Guion estructurado sin música de fondo ni edición publicitaria, listo para grabación. |

---

## 2. Módulo 1: Datos de la Compañía & One-Liner

### Company Name & URL
* **Company Name:** BRIDS.io
* **Company URL:** https://brids.io

### Describe what your company does in 50 characters or less (English)
> `Shopify for real estate syndication on Solana.`
*(47 caracteres con espacios)*

### What is your company going to make? (1-2 sentences)
> We build SaaS infrastructure on Solana that allows real estate developers to syndicate residential properties directly to retail investors from \$200 USD per fraction, legally anchored by Delaware SPVs and protected against private key loss via Stripe Identity and Metaplex Core.

### What category best describes your company?
* **Categoría Primaria:** Proptech / Real Estate
* **Categorías Secundarias:** Fintech, Developer Tools, Crypto / Web3 Infrastructure

---

## 3. Módulo 2: The Insight & Why Now

### Why did you pick this idea to work on? Do you have domain expertise?
> Experimentamos directamente la fricción de la sindicación inmobiliaria tradicional: un desarrollador mediano gasta entre \$30,000 y \$50,000 USD en abogados y meses de burocracia para levantar capital con cheques mínimos de \$25,000 USD de inversores acreditados. Al mismo tiempo, el 90% de los ahorristas minoristas no pueden acceder a activos inmobiliarios rentables.
> Nuestro equipo combina el dominio técnico construyendo infraestructura nativa en Solana con la experiencia directa de nuestro cofundador inmobiliario (Blue Brick Capital), quien administra y estructura desarrollos residenciales en el mercado de Estados Unidos. Entendemos las restricciones legales de la SEC (Reg D 506(c) y Reg CF) y la necesidad de herramientas de software que eliminen intermediarios costosos.

### What's new about what you're making? What do you understand that others don't?
> La mayoría de los proyectos de tokenización inmobiliaria cometieron tres errores fatales:
> 1. **Construyeron sobre redes costosas (Ethereum):** Cobrar \$15 a \$50 USD de gas por transferir una fracción de \$200 destruye la economía unitaria. En Solana, ejecutamos transacciones y dispersiones por menos de \$0.001 USD.
> 2. **Olvidaron el soporte humano (Seed Phrase Trap):** Si un inversor minorista pierde su llave privada en un token ERC-20 estándar, pierde sus ahorros sin recurso legal. En BRIDS integramos plugins de Freeze y Recovery con Metaplex Core: verificando la identidad del titular con Stripe Identity, el administrador de la SPV puede congelar y reemitir la fracción legítima sin romper la cadena de custodia.
> 3. **Actuaron como brokers ilegales:** Muchos cobraron comisiones porcentuales sobre el capital levantado sin licencia Broker-Dealer. BRIDS opera como proveedor de software SaaS cobrando únicamente tarifas fijas tecnológicas (\$4 USD por fracción y fees de setup por proyecto), protegiendo la estructura corporativa.

### Why now?
> Dos factores convergen en este momento:
> * **Maduración de infraestructura on-chain:** Solana ofrece la velocidad de finalización (400 ms) y costos mínimos requeridos para dispersar rentas mensuales a miles de microinversores de forma rentable.
> * **Presión en el mercado inmobiliario:** Con tasas hipotecarias comerciales elevadas, los promotores inmobiliarios necesitan fuentes alternativas de capital rápido. La sindicación fraccionada digital permite fondear proyectos en semanas en lugar de meses.

---

## 4. Módulo 3: Progreso, Métricas y Tracción

### How long have each of you been working on this?
> Llevamos 6 meses dedicados a la investigación técnica, diseño de arquitectura de contratos inteligentes y estructuración del modelo legal.

### How much progress have you made?
* **Desarrollo de Software:** MVP funcional implementado en Solana Devnet. Incluye contratos con Metaplex Core, flujo de autenticación, portal de onboarding y checkout con integración de Stripe Identity para verificación biométrica KYC.
* **Pipeline de Inventario (Día 1):** \$2,000,000 USD en propiedades residenciales aportadas por la firma de nuestro cofundador (Blue Brick Capital) listas para sindicar en cuanto completemos la estructuración de la SPV en Delaware.
* **Pipeline B2B Externo:** Conversaciones avanzadas con 3 desarrolladores inmobiliarios independientes con un volumen conjunto estimado de \$4,000,000 a \$6,000,000 USD en evaluación.

### Are you currently generating revenue?
> Pre-revenue (\$0 USD). No hemos activado cobros comerciales mientras operamos en entorno de pruebas y formalizamos las opiniones legales de no-broker-dealer.

### Unit Economics y Estructura de Ingresos
* **Tarifa de Minteo y Procesamiento:** \$4 USD por fracción de \$200 USD (tarifa plana tecnológica).
* **Setup Fee de Software:** \$1,000 a \$3,500 USD por proyecto inmobiliario sindicado (bonificado a \$0-\$500 para los 3 primeros pilotos).
* **Fee de Dispersión Batch:** \$150 a \$300 USD por corrida de distribución de dividendos o rentas.
* **Margen Bruto de Software:** Superior al 90% debido al bajo costo de cómputo en Solana.

---

## 5. Módulo 4: Producto, Arquitectura Técnica y Demo Link

### Product Demo Link
* **URL del Video Demo:** `[PENDIENTE: Insertar enlace Loom / YouTube no listado de 2 minutos mostrando devnet]`
* **Contenido del Demo:**
  1. Conexión de wallet y verificación KYC con Stripe Identity.
  2. Adquisición de fracción inmobiliaria en entorno devnet.
  3. Visualización del activo Metaplex Core en explorador on-chain.
  4. Demostración del plugin de Freeze / Recovery simulando reemisión ante pérdida de llave privada.

### Technical Architecture Overview
* **Blockchain Layer:** Solana Devnet / Staging (transacciones atómicas, rentas de cuenta mínimas de 0.0029 SOL).
* **Asset Layer:** Metaplex Core con plugins de Freeze (para cumplimiento normativo) y Recovery (para reasignación segura de derechos).
* **Identity & Compliance:** Stripe Identity API para verificación de documentos y biometría facial; integración con bases de datos OFAC / PEP.
* **Estructura Societaria Dual:** Delaware C-Corp (compañía de software operadora de la plataforma) que no custodia fondos ni propiedades; cada inmueble es propiedad de una Delaware SPV LLC independiente que emite los títulos representativos.

---

## 6. Módulo 5: Equipo Fundador, Dedicación y Cap Table

### Founders & Roles

| Fundador | Rol Principal | Dedicación | Experiencia y Responsabilidad |
| :--- | :--- | :---: | :--- |
| **Fundador Técnico** | CTO & Solana Architect | Full-Time post-YC | Arquitectura en Solana, smart contracts en Rust, integración de SDKs y plataforma web. |
| **Fundador Inmobiliario** | Head of Real Estate & Sponsor Ops | Full-Time post-YC | Originación de proyectos inmobiliarios, relación con promotores (Blue Brick Capital) y gestión de SPVs. |
| **Fundador de Operaciones / Legal** | CEO & Operations Lead | Full-Time post-YC | Relación con inversionistas, cumplimiento regulatorio SEC, finanzas y estrategia de producto. |

### How did the founders meet? How long have you known each other?
> Nos conocimos trabajando en proyectos previos de desarrollo tecnológico y estructuración financiera hace más de dos años. La idea de BRIDS nació de resolver un problema recurrente que sufríamos en carne propia: la lentitud y los costos prohibitivos al intentar sindicar inversiones inmobiliarias entre redes de contactos.

### Equity Split & Vesting
* **Estructura de Capital:** Distribución equitativa y balanceada entre los cofundadores que refleja el compromiso a largo plazo.
* **Cronograma de Vesting:** Estándar de la industria de 4 años con un año de cliff (1-year cliff, 4-year monthly vesting).

---

## 7. Módulo 6: La Pregunta del Hack No-Informático

### Question: Please tell us about the time one of you most successfully hacked some (non-computer) system to your advantage.
> Para validar la demanda de inversión fraccionada sin gastar decenas de miles de dólares en abogados en la fase cero, diseñamos un mecanismo análogo de club de inversión privado. En lugar de levantar capital públicamente, estructuramos un acuerdo de opción de compra respaldado por contratos privados estandarizados entre 15 inversores cercanos. 
> Conseguimos compromisos firmados por \$150,000 USD en menos de 72 horas para una propiedad comercial en Florida, comprobando empíricamente que la barrera no era el apetito del inversor por el activo, sino el papeleo legal y la falta de liquidez secundaria. Este ejercicio nos dio las especificaciones exactas para modelar el software de sindicación que hoy construimos sobre Solana.

---

## 8. Módulo 7: Script y Checklist del Video de 1 Minuto

### Guion Oficial del Video (Duración: 60 segundos exactos)

```text
[0:00 - 0:10] INTRODUCCIÓN DEL EQUIPO
"Hola YC, somos los fundadores de BRIDS. Yo lidero el desarrollo de software y contratos en Solana, y mis cofundadores lideran la adquisición de inventario inmobiliario y las operaciones legales."

[0:10 - 0:30] EL PROBLEMA Y LA SOLUCIÓN
"Someter una propiedad a sindicación inmobiliaria en EE.UU. cuesta más de $30,000 dólares en abogados y exige cheques mínimos de $25,000. BRIDS es el software que permite a los desarrolladores sindicar inmuebles directamente en Solana desde $200 dólares por fracción, con SPVs en Delaware y protección total contra pérdida de llaves privadas."

[0:30 - 0:50] PROGRESO Y TRACCIÓN
"Ya tenemos el MVP funcional corriendo en Solana Devnet con Metaplex Core y Stripe Identity. Además, contamos con un pipeline confirmado de $2 millones de dólares en propiedades listas para sindicar desde el primer día a través de nuestra propia firma inmobiliaria."

[0:50 - 1:00] CIERRE Y COMPROMISO
"Estamos construyendo la infraestructura digital que abrirá la inversión inmobiliaria a escala global. Gracias y esperamos trabajar con ustedes en el batch."
```

### Checklist Técnico para la Grabación del Video
* [ ] Cámara al nivel de los ojos con iluminación frontal adecuada.
* [ ] Audio limpio sin eco ni ruido ambiental; usar micrófono externo si es necesario.
* [ ] Todos los cofundadores presentes en el encuadre durante toda la grabación.
* [ ] Cero efectos especiales, cortinillas, transiciones o música de fondo.
* [ ] No leer un teleprompter; hablar de manera conversacional y con energía directa.
* [ ] Duración exacta: entre 58 y 60 segundos. Subir como enlace oculto a YouTube.

---

## 9. Llamado a la Acción y Próximos Pasos

Para completar la postulación antes del deadline del batch:
1. **Revisión del Data Room:** Confirmar la documentación legal de la SPV en Delaware y las políticas de cumplimiento KYC/AML.
2. **Grabación del Video de 60 Segundos:** Ensayo de 3 tomas siguiendo el guion del Módulo 7 y selección de la mejor toma sin cortes.
3. **Grabación del Demo:** Registrar pantalla (2 minutos) ejecutando el flujo completo en Solana Devnet.
4. **Agendar Sesión de Revisión:** Contacto directo entre cofundadores para verificar las respuestas finales y remitir la solicitud a Y Combinator.
