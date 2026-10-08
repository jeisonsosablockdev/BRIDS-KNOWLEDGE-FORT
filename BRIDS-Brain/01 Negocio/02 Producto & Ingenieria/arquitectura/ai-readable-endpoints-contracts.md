---
title: "Contratos de Endpoints Legibles por IA y Descubrimiento GEO"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Solana Architecture"
source_okf: "knowledge/guides/ai-readable-endpoints-contracts.md"
source_commit: "b818558"
source_commit_date: "2026-09-24 23:00:27 -0500"
source_hash: "506b3aaf93af872ebc87403c1f8f42c4ea188634a2b14a5296ead3d552ca6509"
tags: [geo, ai-discovery, seo, endpoints, architecture]
updated_at: "2026-10-06T02:46:34.430Z"
---

# Contratos de Endpoints Legibles por IA y Descubrimiento GEO

> [!NOTE]
> **Resumen Técnico:** Especificación de rutas estructuradas para agentes de IA, LLMs y motores de búsqueda generativa.
> *Documento sincronizado desde el repositorio técnico institucional (Commit: `b818558`).*

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

## Objetivo
Definir el contrato tecnico estable para consumo por agentes y LLM systems.

## Endpoints y archivos
- `GET /api/knowledge`
- `GET /api/entities`
- `GET /api/definitions`
- `GET /knowledge.json`
- `GET /llms.txt`
- `GET /ai.txt` (opcional por `ENABLE_AI_TXT=true`)

## Reglas de publicacion
- Politica estricta `published-only`.
- Solo se exponen campos publicos y sanitizados.
- Se excluyen campos internos (`body`, `sourcePath`, estructuras privadas).

## Contrato base (JSON)
Todos los payloads JSON usan:
- `schemaVersion` (string versionado, actual `1.0.0`)
- `generatedAt` (ISO timestamp)
- `items` (array de objetos tipados por endpoint)

## Contrato `/api/knowledge` y `/knowledge.json`
Cada item incluye:
- `id`
- `slug`
- `title`
- `summary`
- `layer`
- `type`
- `canonicalPath`
- `updatedAt`
- `tags[]`

## Contrato `/api/definitions`
Cada item incluye:
- `id`
- `slug`
- `term`
- `summary`
- `canonicalPath`
- `updatedAt`
- `layer`
- `tags[]`

## Contrato `/api/entities`
Cada item incluye:
- `id`
- `slug`
- `name`
- `summary`
- `sourceType` (`tag` | `glossary-term`)
- `relatedDocumentSlugs[]`

## `llms.txt`
Documento de descubrimiento con referencias canonicas a endpoints publicos.

## `ai.txt`
- Controlado por feature flag `ENABLE_AI_TXT`.
- Si esta deshabilitado, responde `404 Not Found`.

## Validacion
- Unit/contract tests: `tests/lib/ai-readable-contracts.test.ts`
- Endpoint tests: `tests/api/ai-readable-endpoints.test.ts`
- Gate CI: `npm run validate:ai`

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| 2026-10-06 | v1.0.0 | sync-technical-docs (`b818558`) | Sincronización e ingesta canónica desde knowledge/guides/ai-readable-endpoints-contracts.md |
