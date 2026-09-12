---
title: "Matriz Viva de Estado y Madurez de Producto"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Product Roadmap"
source_okf: "knowledge/architecture/app-technical-roadmap-investor-brief.md"
tags: [product-status, roadmap, readiness, feature-matrix, solana, rwa]
updated_at: "2026-09-12T01:20:05.334Z"
---

# Matriz Viva de Estado y Madurez de Producto

> [!NOTE]
> **Resumen Ejecutivo:** Matriz de madurez técnica y estado operativo de la plataforma BRIDS.io.
> Refleja con precisión qué módulos están en producción/devnet, cuáles están parcialmente construidos y cuáles conforman las siguientes fases del roadmap.

---

## 🔗 Conexión con la Tesis de Negocio
- [[02 Strategy & Research/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[13 Product & Engineering/product-roadmap/app-technical-roadmap-investor-brief.md|Roadmap Técnico e Investor Brief Completo]]
- [[14 Investor Relations & YC/index.md|Materiales para Inversores y YC]]

---

## 📊 1. Matriz de Superficie de Producto

| Módulo / Capacidad | Estado de Implementación | Stack Técnico / Infraestructura | Nivel de Cobertura |
|---|---|---|---|
| **Sitio Público & Home** | 🟢 Implementado | Next.js App Router, Tailwind, Motion 12 | Tests E2E, SEO metadata activo |
| **Marketplace Inmobiliario** | 🟢 Implementado | Mapbox GL, filtros por yield/ubicación | Exploración interactiva y detalle |
| **Detalle de Propiedad** | 🟢 Implementado | Server Components, Financial breakdown | Render de métricas financieras |
| **Autenticación Wallet SIWS** | 🟢 Implementado | Solana Sign-In With Solana (SIWS) | Conexión Phantom, Solflare |
| **Autenticación Federada** | 🟢 Implementado | WorkOS (Email, Socials, SSO) | Vinculación híbrida con wallet |
| **Checkout Crypto (USDC)** | 🟢 Implementado | Metaplex Core Candy Machine, Umi | Liquidación sub-segundo en Solana |
| **Checkout Fiat (Tarjeta)** | 🟡 En Proceso | Sphere Onramp integration | Modelo de orden y orquestación |
| **Dashboard Inversionista** | 🟢 Implementado | Postgres repos, Protected routes | Holdings, rentas acumuladas, perfil |
| **Staking & Rent Distribution** | 🟢 Implementado | Metaplex Core Freeze plugin, cron/RPC | Freeze on-chain sin perder propiedad |
| **Módulo de Referidos** | 🟢 Implementado | Referral tracking SQL schemas | Atribución de incentivos |
| **Admin Operations Shell** | 🟢 Implementado | Protected admin layout | Gestión de assets, sales, collections |
| **Notificaciones Web Push** | 🟢 Implementado | Web Push API, Service Workers | Alertas de rentas y transacciones |
| **Blindaje de Gobernanza Multi-Sig** | 🟢 Implementado | Squads v4 en devnet | Custodia descentralizada de tesorería |

---

## 🎯 2. Fases de Ejecución y Roadmap Inmediato

### Fase 1: Hardening de Devnet y UX de Checkout (Actual)
- Consolidación del checkout dual (USDC directo + Tarjeta de crédito vía Sphere).
- Endurecimiento de la máquina de estados de órdenes de compra para prevenir double-spending.
- Cobertura total de pruebas automatizadas con Vitest, Playwright y Synpress.

### Fase 2: Pasarela Mainnet y Estructuración Legal
- Migración de programas y colecciones Candy Machine de devnet a Solana Mainnet-Beta.
- Activación de pasarela de verificación KYC/AML estricta con Stripe Identity.
- Configuración de las primeras 3 LLC SPVs en Delaware para activos piloto estabilizados.

### Fase 3: Mercado Secundario y Pools de Liquidez
- Habilitación de compra-venta peer-to-peer de participaciones tokenizadas con royalties programados.
- Oráculos de valoración periódica de inmuebles (AVMs) integrados on-chain.

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (OKF v0.1) | Generación inicial de la matriz viva de madurez técnica |
