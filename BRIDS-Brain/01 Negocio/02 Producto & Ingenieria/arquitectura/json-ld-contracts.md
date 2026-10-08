---
title: "Contratos Semánticos JSON-LD para Activos Inmobiliarios"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Solana Architecture"
source_okf: "knowledge/guides/json-ld-contracts.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "83e1ce7fa2eae47e5a13c692fa2c3514d6c05d6ff77e16665a8d2a9e831240d6"
tags: [json-ld, seo, schema, geo, marketplace]
updated_at: "2026-10-06T02:46:34.431Z"
---

# Contratos Semánticos JSON-LD para Activos Inmobiliarios

> [!NOTE]
> **Resumen Técnico:** Esquemas de datos estructurados Schema.org y JSON-LD para indexación semántica del catálogo RWA.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Goal
Definir contratos estables para emitir JSON-LD consistente por tipo de pagina, evitando payloads ad-hoc y drift semantico.

## Supported Schema Types
- `Organization`
- `WebSite`
- `WebPage`
- `Article`
- `TechArticle`
- `FAQPage`
- `DefinedTerm`
- `BreadcrumbList`

## Canonical Usage
1. Construir payloads via `lib/schema/emitters.ts` o `lib/schema/template-emitters.ts`.
2. Validar payload antes de render (`validateJsonLdPayloads` / `assertValidJsonLdSchema`).
3. Inyectar scripts con `components/seo/json-ld-script.tsx`.
4. No escribir JSON-LD inline manual en paginas nuevas.

## Required Fields (Minimum)
- `@context`: siempre `https://schema.org`
- `@type`: uno de los tipos soportados
- URLs: absolutas y validas (`https://...`)
- Campos de texto obligatorios no vacios (`name`, `headline`, `description`, etc.)
- `FAQPage.mainEntity`: minimo 1 `Question`
- `BreadcrumbList.itemListElement`: minimo 1 `ListItem`

## Template Mapping
- Institutional templates -> `WebPage` + `BreadcrumbList`
- Knowledge hub templates -> `WebPage` + `BreadcrumbList`
- Article templates -> `TechArticle` (o `Article`) + `BreadcrumbList`
- FAQ templates -> `FAQPage` + `BreadcrumbList`
- Definition templates -> `DefinedTerm` + `BreadcrumbList`
- Resource templates -> `Article` + `BreadcrumbList`

## Authoring Notes
- Si cambia `title`, `summary` o breadcrumbs de una pagina, revisar que el payload schema conserve coherencia.
- Los campos requeridos por contrato no deben ser vacios ni placeholders en estados `published`.
- Nuevos template types deben agregar:
  - emitter dedicado
  - test unitario
  - cobertura de snapshot/integracion

## CI Validation Gate
`npm run validate:schema` ejecuta:
- `tests/lib/schema-emitters.test.ts`
- `tests/lib/schema-template-emitters.test.ts`

Si falla este gate, no se considera completada la historia.

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/guides/json-ld-contracts.md |
