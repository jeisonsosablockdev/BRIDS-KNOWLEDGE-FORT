---
title: "BRIDS.io — Executive One-Pager V3"
type: "pitch-deck"
status: "sdd-approved"
version: "3.0"
last_updated: "2026-09-22"
tags:
  - "sdd-approved"
  - "hitl-validated"
  - "pitch-deck"
  - "one-pager"
  - "yc-application"
  - "investor-facing"
  - "executive-summary"
---

# BRIDS.IO — EXECUTIVE ONE-PAGER V3

### Infraestructura SaaS en Solana para Sindicación Inmobiliaria Fraccionada (RWA)

---

> *"El Shopify de la sindicación inmobiliaria institucional en Solana."*

---

## ⚡ En Una Línea

BRIDS es una plataforma de software e infraestructura digital en Solana que permite a desarrolladores inmobiliarios sindicar propiedades en EE.UU. de forma fraccionada desde **$200 USD por fracción**, respaldadas legalmente por SPVs dedicados y protegidas contra la pérdida de llaves privadas mediante Stripe Identity y Metaplex Core.

---

## 📊 Métricas Clave

| | |
| :--- | :--- |
| 💰 **Revenue** | Pre-revenue (MVP funcional en devnet) |
| 📦 **Pipeline GMV** | **$2M listos** + 3 developers adicionales en negociaciones (**$4M–$6M** total) |
| 🔥 **Burn Rate** | **$14,400 USD/mes** (post-inversión) |
| 🛤️ **Runway** | **~20 meses** (asumiendo $0 revenue) |
| 📈 **Break-Even** | **Mes 7** (proyectado con pipeline actual) |
| 🏗️ **Stage** | Pre-Seed / Aplicando a Y Combinator |

---

## 💸 Modelo de Negocio (SaaS — Fees Fijos de Transacción)

BRIDS cobra exclusivamente tarifas fijas de procesamiento tecnológico. **Nunca cobra comisiones porcentuales** (blindaje contra clasificación Broker-Dealer de la SEC).

| Línea de Ingreso | Tarifa | Quién Paga |
| :--- | ---: | :--- |
| **Minting & Processing Fee** | **$4 USD** por fracción de $200 | Inversor (deducido del checkout) |
| **SaaS Setup & Listing Fee** | **$1,000 – $3,500 USD** por proyecto | Desarrollador / Sponsor |
| **Fee de Dispersión Tecnológica** | **$150 – $300 USD** por corrida batch | Desarrollador / Sponsor |
| **Fee de Recuperación (Lost Key)** | **$50 – $100 USD** por evento | Inversor |

---

## 📐 Unit Economics (Proyecto Tipo: $1M USD / 5,000 Fracciones)

| Concepto | Valor |
| :--- | ---: |
| Revenue Neto BRIDS por proyecto | **$22,300 USD** |
| COGS en Solana (mint + distribución) | **< $15 USD** |
| **Margen Bruto** | **> 95%** |
| Sponsor CAC (B2B) | ~$3,500 USD |
| Sponsor LTV (3 proyectos / 24 meses) | ~$66,900 USD |
| **LTV / CAC** | **> 15x** |

---

## 🏠 Modelos Inmobiliarios Soportados

| Modelo | Horizonte | Dispersión de Rendimientos |
| :--- | :--- | :--- |
| **Fix & Flip** | 6 – 12 meses | Pago único al cierre (bullet exit) |
| **Fix & Hold** | 3 – 5+ años | Rentas trimestrales recurrentes |
| **Desarrollo Integral** | 18 – 36 meses | Por fases de venta de unidades |

---

## 🔧 Stack Tecnológico & Ventaja Competitiva

| Componente | Tecnología | Ventaja |
| :--- | :--- | :--- |
| **Blockchain** | Solana (L1) | Tx < $0.001 USD, confirmación < 1 seg |
| **NFT Standard** | Metaplex Core | Freeze Plugin + Recovery Protocol |
| **Tesorería** | Squads Multi-Sig | Dispersión transparente sin custodia |
| **KYC/AML** | Stripe Identity | Verificación biométrica sin datos propios |
| **Auth** | WorkOS | SSO enterprise-grade |
| **Hosting** | Vercel + GitHub Actions | CI/CD automatizado |
| **Escrow** | North Capital / Fortress Trust | Segregación de fondos regulada |

**Protocolo de Recuperación de Wallet (Unfair Advantage):**
> *La pérdida de la llave privada NO extingue los derechos legales del inversor.* Flujo institucional: Re-verificación biométrica en Stripe Identity → Validación contra el Master Securityholder File del SPV → Quema y reemisión del NFT a la nueva wallet.

---

## 🏛️ Arquitectura Legal & Separación de Roles

```
┌─────────────────────────────────────────────────────────────┐
│  BRIDS.io (Delaware C-Corp)                                 │
│  → Software, UI/UX, Smart Contracts, Dashboards             │
│  → NO es broker-dealer, NO custodia, NO asesora             │
│  → Monetiza via fees fijos de procesamiento (SaaS)          │
├─────────────────────────────────────────────────────────────┤
│  SPV Dedicado (LLC por propiedad)                           │
│  → Titular jurídico del inmueble en EE.UU.                  │
│  → Emisor exclusivo de participaciones legales              │
│  → Master Securityholder File (libro de socios)             │
├─────────────────────────────────────────────────────────────┤
│  Blue Brick Capital (Partner Inmobiliario)                   │
│  → Originación, valuación, obra, administración de rentas   │
├─────────────────────────────────────────────────────────────┤
│  Proveedores Regulados Externos                             │
│  → Stripe Identity (KYC/AML) · Bridge / Stripe (Rampas Fiat)│
│  → Funding Portal FINRA (Reg CF) · Escrow Independiente    │
└─────────────────────────────────────────────────────────────┘
```

**Ventaja Fiscal Inversora (QSBS IRC § 1202):**
> *100% de Exclusión Fiscal Federal en Exit (hasta \$15M USD).* Al operar estrictamente como empresa de software SaaS e infraestructura técnica sin posesión directa de inmuebles (los activos residen en SPVs independientes), las acciones de BRIDS Inc. son **100% elegibles para QSBS**. Inversionistas ángeles y fondos VC acceden a una salida con **\$0 USD en impuestos federales sobre ganancias de capital**.

---

## 🗺️ Estrategia Regulatoria (Roadmap de Compliance)

| Fase | Exención SEC | Alcance | Timing |
| :--- | :--- | :--- | :--- |
| **Piloto** | Reg D 506(b) | Hasta 35 inversores no acreditados (sin marketing general) | Meses 1–6 |
| **Escala USA** | Reg CF (via Funding Portal FINRA) | Inversores retail no acreditados, hasta $5M/año | Meses 6–12 |
| **Escala Global** | Reg S | Inversores internacionales sin restricción de acreditación | Meses 9–18 |

---

## 👥 Equipo Fundador

| Rol | Perfil | Compensación |
| :--- | :--- | ---: |
| **Cofundador 1** — CEO / Producto | Ingeniero de Software Full-Stack | $3,000/mes |
| **Cofundador 2** — CTO / Blockchain | Ingeniero de Smart Contracts (Solana) | $3,000/mes |
| **Cofundador 3** — Real Estate | Desarrollador Inmobiliario activo en USA (Blue Brick Capital) | $0 (equity) |

---

## 💰 Use of Funds (YC $500,000 USD)

| Categoría | Monto | % |
| :--- | ---: | ---: |
| **Legal & Regulatorio** (C-Corp, SPVs, Reg D/CF, FINRA, escrow, 409A, marca) | $82,000 | 16.4% |
| **Seguridad** (Auditoría smart contracts + pentest web + AML/BSA) | $32,500 | 6.5% |
| **Infraestructura Financiera** (Funding Portal, Sphere, Cap Table) | $19,000 | 3.8% |
| **Seguros Corporativos** (D&O + E&O + Cyber) | $7,500 | 1.5% |
| **Equipo & Relocation** (Visas O-1 + Residencia SF 3 meses) | $42,000 | 8.4% |
| **Due Diligence B2B** (KYB setup) | $2,000 | 0.4% |
| **Contingencia** (5%) | $25,000 | 5.0% |
| **Operaciones (~20 meses)** ($14,400/mes × 20) | $290,000 | 58.0% |
| **TOTAL** | **$500,000** | **100%** |

---

## 🎯 Tracción & Pipeline Actual

- ✅ **MVP funcional** en Solana devnet con CI/CD automatizado (Vercel + GitHub Actions)
- ✅ **$2,000,000 USD** en inventario inmobiliario listo para sindicar (Cofundador RE)
- ✅ **3 desarrolladores adicionales** en negociaciones avanzadas ($4M–$6M pipeline total)
- ✅ **Integraciones operativas:** Stripe Identity, WorkOS, Metaplex Core, Squads Multi-Sig
- ✅ **$0 de deuda** — 100% bootstrapped, fundadores técnicos in-house

---

## 🏆 Por Qué Ahora

1. **Solana supera los 65,000 TPS** con costos de transacción < $0.001 USD — hace viable por primera vez el minteo masivo de fracciones de $200 (imposible en Ethereum a $15–$50/tx).
2. **Metaplex Core** introduce plugins de Freeze y Recovery nativos — resuelve el problema #1 de Web3 institucional: pérdida de llaves.
3. **La sindicación inmobiliaria en EE.UU. mueve $100B+/año** con procesos analógicos del siglo pasado. La infraestructura digital apenas comienza.
4. **Reg CF y Reg A+** han abierto el mercado de inversores retail no acreditados en EE.UU. Los primeros en construir la infraestructura SaaS ganan.

---

<p align="center">
<b>BRIDS.io</b> · Infraestructura Web3 segura, accesible y trazable para invertir en bienes raíces estructurados desde $200 USD
<br><br>
🌐 <a href="https://brids.io">brids.io</a> · 📧 Contacto: founders@brids.io
</p>
