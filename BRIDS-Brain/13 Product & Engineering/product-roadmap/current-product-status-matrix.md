---
title: "Matriz Viva de Estado y Madurez de Producto"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Product Roadmap"
source_okf: "knowledge/architecture/app-technical-roadmap-investor-brief.md"
source_commit: "6a40b30"
source_commit_date: "2026-08-22 12:42:13 -0500"
source_hash: "a8fe73ef8364828314e9f1cdc0c2537072fe8d1f919785676fa36a363cb951ea"
tags: [product-status, roadmap, readiness, feature-matrix, solana, rwa]
updated_at: "2026-09-12T01:27:12.024Z"
---

# Matriz Viva de Estado y Madurez de Producto

> [!NOTE]
> **Resumen Ejecutivo:** Matriz dinámica de madurez técnica y estado operativo de la plataforma BRIDS.io extraída directamente del repositorio de código (`6a40b30`).
> Refleja con precisión qué módulos están en producción/devnet, cuáles están parcialmente construidos y cuáles conforman las siguientes fases del roadmap.

---

## 🔗 Conexión con la Tesis de Negocio
- [[02 Strategy & Research/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[13 Product & Engineering/product-roadmap/app-technical-roadmap-investor-brief.md|Roadmap Técnico e Investor Brief Completo]]
- [[14 Investor Relations & YC/index.md|Materiales para Inversores y YC]]

---

## 📊 Matriz de Madurez Técnica por Dominio

| Dominio | Madurez | Lectura para inversionistas | Siguiente paso principal |
| --- | --- | --- | --- |
| Marketplace discovery | Construido | Existe una superficie real de producto. | Animacion inicial con Motion, bugs de mapa, performance mobile y lazy Mapbox boundary. |
| Detalle de propiedad | Construido | Los assets pueden presentarse con inversion, documentos y gobernanza. | Completar datos finales y copy de compliance. |
| Wallet auth | Construido | Existe un modelo fuerte de autoridad wallet. | Persistent production session store. |
| Federated auth | Foundation construida | Existe ruta de onboarding de menor friccion. | Completar operaciones WorkOS productivas y recovery flows. |
| Checkout | Parcial | Existe modelo de orden; falta Sphere ramp para tarjeta. | Implementar Sphere ramp completo y unificar tarjeta + crypto. |
| Crypto purchase mint | Construido | Flujo crypto implementado y configurado para recibir USDC. | Hardening productivo, treasury policy, evidencia final y Jupiter opcional. |
| Admin asset ops | Construido | El equipo interno puede administrar inventario y metadata. | Playbooks operativos y hardening productivo. |
| Admin dashboard | Parcial | Existe shell admin; faltan modulos operativos clave. | Tesoreria Squads, distribuciones freeze/unfreeze, notificaciones CRM y KPIs accionables. |
| NFT/admin minting | Construido en devnet | Existe lifecycle Core asset. | Authority UI y endpoints de lectura. |
| Compliance | Foundation construida | Los compliance gates estan codificados en rutas de transaccion. | Persistencia Stripe Identity, vista admin KYC y rol RBAC de compliance. |
| Investor dashboard | Superficie construida | Existe UX de cuenta y holdings. | Resumen, portafolio, rentas/claim e historial con datos reales. |
| Staking | Base construida en devnet | Existe asset action path; faltan distribuciones y auditoria. | Reconciliacion on-chain, claim state, distribuciones y trazabilidad. |
| Notifications | Foundation construida | Existe infraestructura de re-engagement. | Integracion CRM para campanas y seguimiento de leads. |
| Observability/QA | Foundation fuerte | Hay disciplina de ingenieria visible. | SLOs productivos, alerting y deployment smoke gates. |

---

## ⚠️ Brechas Técnicas Clave y Desafíos de Ingeniería

1. Persistent session storage

Mover auth/session state desde memoria local del proceso hacia un store productivo compartido. Esto es requerido para deployments multi-instancia, restarts y comportamiento de auth predecible.

2. Checkout y payment hardening

Implementar de punta a punta las compras con tarjeta credito/debito mediante Sphere ramp, definir contrato final de webhook/settlement y unificar el flujo de tarjeta con el purchase crypto ya implementado.

3. Treasury y politica de pago productiva

Validar USDC settlement productivo, definir payment destinations, treasury ownership, configuracion por ambiente y evidencia de auditoria antes de mover valor live. Jupiter queda como extension para broader crypto input.

4. Compliance operations

Implementar persistencia propia de datos recuperados desde Stripe Identity, vista admin de datos KYC por cliente, rol RBAC especializado para compliance reviewer/compliance agent, manual review workflow, data retention, support escalation y comportamiento para usuarios restringidos.

5. Authority lifecycle operations

Construir UI admin para rotate/revoke/emergency rotate, implementar endpoints de registry/audit, backfill de legacy collections y fortalecer validacion Squads/on-chain evidence.

6. Dashboard admin, tesoreria, distribuciones y CRM

Implementar tesoreria con Squads, distribuciones integradas con freeze/unfreeze, notificaciones conectadas a CRM para campanas/seguimiento de leads, y un resumen admin con KPIs accionables para operacion diaria.

7. Animacion inicial, performance y bugs del mapa

Implementar la animacion inicial con Motion 12, corregir bugs conocidos del mapa y diferir/lazy-load Mapbox en mobile preservando list-first usability, accesibilidad y calidad visual investor-grade.

8. User dashboard con datos reales y reporting para inversionistas

Conectar resumen, mi portafolio, rentas/claim, historial, downloadable statements y seguimiento de transferencias al ledger productivo final, reconciliacion de wallet/transacciones y fuentes persistentes de la base de datos.

9. Staking distributions and audit trail

Implementar el stack pendiente de staking/distribuciones: reconciliacion canonica de eventos stake/unstake, pipeline por periodo, elegibilidad KYC, lectura de tesoreria/Squads, distribution runs, claim lifecycle, APIs UI/backoffice y audit logs.

10. Production observability

Definir SLOs, deployment smoke checks, alerting ownership, incident response, backup/restore drills y release promotion evidence.

---

## 🗣️ Claims Verificados para Inversores y YC

Usar estos claims porque estan soportados por el repositorio:

- BRIDS tiene una app fullstack funcional con marketplace, admin, auth, checkout, compliance, NFT, staking, notifications y observability.
- El roadmap de pagos esta enfocado en implementar Sphere ramp completo para tarjeta y unificarlo con el purchase crypto ya configurado para USDC.
- La plataforma tiene implementacion Solana/Metaplex Core con evidencia devnet.
- El roadmap de compliance incluye persistencia propia de Stripe Identity, vista admin KYC y rol RBAC especializado para revisores.
- El roadmap operativo incluye tesoreria Squads, distribuciones integradas con freeze/unfreeze, CRM para notificaciones/campanas y dashboards alimentados por datos reales.
- El proceso de ingenieria incluye automated validation, docs governance, unit tests, route tests, Playwright y Synpress.
- El trabajo pendiente se enfoca en production hardening, compliance/payment readiness, controles operativos y escala.

Evitar estos claims hasta completar los items correspondientes:

- No afirmar mainnet production readiness.
- No afirmar operaciones reguladas live completamente habilitadas.
- No afirmar paridad completa tarjeta/crypto checkout hasta implementar Sphere ramp y la integracion unificada.
- No afirmar sesiones production-grade hasta implementar shared session backend.
- No afirmar operaciones completas de compliance hasta implementar persistencia Stripe Identity, vista admin KYC y rol RBAC especializado.
- No afirmar lifecycle completo de staking/distribuciones hasta implementar reconciliacion canonica, pipeline por periodo, servicio de distribucion, claim lifecycle y trazabilidad/auditoria.
- No afirmar dashboards operativos completos hasta conectar admin/user dashboards a tesoreria Squads, distribuciones, claims, CRM, reconciliacion y datos persistentes reales.
- No afirmar treasury, distributions, tax o investor statement infrastructure finalizados hasta completar ledger/reporting source of truth.

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-09-12 | v1.0.0 | sync-technical-docs (OKF v0.1) | Generación inicial de la matriz viva de madurez técnica |
| 2026-09-12 | v1.0.0 | sync-technical-docs (`6a40b30`) | Actualización dinámica de madurez desde develop |
