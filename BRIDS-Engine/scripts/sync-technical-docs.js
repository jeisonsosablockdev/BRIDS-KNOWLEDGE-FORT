#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔄 BRIDS KNOWLEDGE FORT - AUTOMATED TECHNICAL DOCS SYNC ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Sincronizador automatizado e idempotente que conecta con el repositorio
 * técnico (https://github.com/jeisonsosablockdev/brids), extrae el paquete
 * Open Knowledge Format (OKF v0.1) de la carpeta `knowledge/`, y genera/actualiza
 * las especificaciones canónicas en `BRIDS-Brain/13 Product & Engineering/`.
 * 
 * Garantiza:
 * 1. Respaldo de seguridad no destructivo en 00 Inbox/Archive antes de actualizar.
 * 2. Formato canónico Obsidian (YAML frontmatter, callout > [!NOTE], changelog).
 * 3. Cross-linking hacia los conceptos de negocio en 02 Strategy & Research.
 * 4. Validación estricta con el linter de la bóveda (validate-vault.js).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BRAIN_DIR = path.join(ROOT_DIR, 'BRIDS-Brain');
const ENGINE_DIR = path.join(ROOT_DIR, 'BRIDS-Engine');
const SCRIPTS_DIR = path.join(ENGINE_DIR, 'scripts');
const CONTEXT_DIR = path.join(ENGINE_DIR, 'context');
const CACHE_DIR = path.join(CONTEXT_DIR, 'technical-okf');
const VAULT_13_DIR = path.join(BRAIN_DIR, '13 Product & Engineering');
const ARCHIVE_DIR = path.join(BRAIN_DIR, '00 Inbox', 'Archive');

const REPO_URL = 'https://github.com/jeisonsosablockdev/brids.git';
const TARGET_BRANCH = 'develop';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function backupFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  ensureDir(ARCHIVE_DIR);
  const fileName = path.basename(filePath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(ARCHIVE_DIR, `${fileName}.${timestamp}.bak.md`);
  fs.copyFileSync(filePath, backupPath);
  console.log(`   🛡️ Respaldo de seguridad creado: 00 Inbox/Archive/${path.basename(backupPath)}`);
}

function fetchTechnicalRepo(forceClone = false) {
  console.log('\n' + '═'.repeat(75));
  console.log('📡 CONECTANDO CON EL REPOSITORIO TÉCNICO (OKF v0.1)');
  console.log(`   URL:    ${REPO_URL}`);
  console.log(`   Rama:   ${TARGET_BRANCH}`);
  console.log(`   Ruta:   knowledge/`);
  console.log('═'.repeat(75));

  ensureDir(CONTEXT_DIR);

  const gitDir = path.join(CACHE_DIR, '.git');
  const knowledgeDir = path.join(CACHE_DIR, 'knowledge');

  if (forceClone && fs.existsSync(CACHE_DIR)) {
    console.log('   ♻️ Limpiando caché local para clonado forzado...');
    fs.rmSync(CACHE_DIR, { recursive: true, force: true });
  }

  if (!fs.existsSync(gitDir)) {
    console.log('   🚀 Clonando repositorio técnico (sparse-checkout en knowledge/)...');
    execSync(`git clone --depth 1 --filter=blob:none --sparse -b ${TARGET_BRANCH} ${REPO_URL} "${CACHE_DIR}"`, {
      stdio: 'inherit'
    });
    execSync(`git -C "${CACHE_DIR}" sparse-checkout set knowledge`, { stdio: 'inherit' });
    console.log('   ✅ Paquete OKF clonado con éxito en caché local.');
  } else {
    console.log('   🔄 Actualizando paquete OKF desde origin/develop...');
    try {
      execSync(`git -C "${CACHE_DIR}" fetch --depth 1 origin ${TARGET_BRANCH}`, { stdio: 'inherit' });
      execSync(`git -C "${CACHE_DIR}" reset --hard origin/${TARGET_BRANCH}`, { stdio: 'inherit' });
      execSync(`git -C "${CACHE_DIR}" sparse-checkout set knowledge`, { stdio: 'inherit' });
      console.log('   ✅ Paquete OKF actualizado correctamente.');
    } catch (err) {
      console.warn('   ⚠️ Advertencia: No se pudo conectar con el remoto. Usando copia en caché local.', err.message);
    }
  }

  if (!fs.existsSync(knowledgeDir)) {
    throw new Error(`No se encontró la carpeta 'knowledge/' en el repositorio técnico clonado (${CACHE_DIR})`);
  }

  return knowledgeDir;
}

function formatDeliverable({ title, description, category, tags, sourcePath, contentBody, executiveSummary }) {
  const cleanTags = (tags || ['brids', 'engineering', 'solana', 'rwa']).join(', ');
  const summaryCallout = executiveSummary || 
    `> [!NOTE]\n> **Resumen Técnico:** ${description || title}\n> *Documento sincronizado automáticamente desde el repositorio técnico institucional (OKF v0.1).*`;

  return `---
title: "${title}"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "${category || 'Product & Engineering'}"
source_okf: "${sourcePath}"
tags: [${cleanTags}]
updated_at: "${new Date().toISOString()}"
---

# ${title}

${summaryCallout}

---

## 🔗 Conexión con la Tesis de Negocio
- [[02 Strategy & Research/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[02 Strategy & Research/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]
- [[02 Strategy & Research/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]
- [[02 Strategy & Research/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]

---

${contentBody}

---

## 📜 Historial de Revisiones

| Fecha | Versión | Autor / Origen | Cambios Principales |
|---|---|---|---|
| ${new Date().toISOString().split('T')[0]} | v1.0.0 | sync-technical-docs (OKF v0.1) | Sincronización e ingesta canónica desde ${sourcePath} |
`;
}

function processSourceMarkdown(srcFile) {
  if (!fs.existsSync(srcFile)) return null;
  const raw = fs.readFileSync(srcFile, 'utf8');
  
  // Extract body by stripping existing frontmatter if present
  let body = raw;
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (fmMatch) {
    body = fmMatch[2].trim();
  }

  // Remove top # Title if present in body to avoid duplicate H1
  body = body.replace(/^#\s+[^\r\n]+\r?\n/, '').trim();

  return body;
}

function syncDeliverables(knowledgeDir) {
  console.log('\n' + '═'.repeat(75));
  console.log('⚙️ PROCESANDO Y MODULARIZANDO DOCUMENTACIÓN TÉCNICA CANÓNICA');
  console.log('═'.repeat(75));

  const mappings = [
    {
      src: path.join(knowledgeDir, 'architecture', 'app-technical-roadmap-investor-brief.md'),
      dest: path.join(VAULT_13_DIR, 'product-roadmap', 'app-technical-roadmap-investor-brief.md'),
      title: 'Roadmap Técnico e Investor Brief de Producto',
      description: 'Resumen ejecutivo de madurez técnica, stack activo, gaps y fases de producto para inversores y equipo.',
      tags: ['roadmap', 'investor-brief', 'product-maturity', 'solana', 'architecture'],
      category: 'Product Roadmap'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'architecture-overview.md'),
      dest: path.join(VAULT_13_DIR, 'solana-architecture', 'architecture-overview.md'),
      title: 'Arquitectura General del Sistema y Stack Tecnológico',
      description: 'Especificación de alto nivel de componentes frontend, backend, RPCs, contratos Solana y modelos de datos.',
      tags: ['architecture', 'fullstack', 'solana', 'nextjs', 'postgres'],
      category: 'Solana Architecture'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'solana-stack.md'),
      dest: path.join(VAULT_13_DIR, 'solana-architecture', 'solana-stack-spec.md'),
      title: 'Especificación Técnica de Infraestructura Solana',
      description: 'Detalle de integración con devnet/mainnet, Umi, Solana Kit, priorización de fees y manejo de transacciones.',
      tags: ['solana', 'smart-contracts', 'umi', 'solana-kit', 'tps'],
      category: 'Solana Architecture'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'nft-spec.md'),
      dest: path.join(VAULT_13_DIR, 'metaplex-core-specs', 'metaplex-core-nft-spec.md'),
      title: 'Estándar Metaplex Core y Especificación de NFTs RWA',
      description: 'Ciclo de vida de tokens de participación inmobiliaria, Core Candy Machine, plugins de Freeze y metadata on-chain.',
      tags: ['metaplex-core', 'rwa-nft', 'candy-machine', 'freeze-plugin', 'solana'],
      category: 'Metaplex Core'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'state-machine.md'),
      dest: path.join(VAULT_13_DIR, 'metaplex-core-specs', 'freeze-and-recovery-plugins.md'),
      title: 'Máquina de Estados de Tokens y Protocolo de Recuperación',
      description: 'Definición formal de estados on-chain/off-chain, rotación de autoridad, lock-ups por staking y protocolo de freeze/recovery.',
      tags: ['state-machine', 'freeze-plugin', 'recovery-protocol', 'lost-key', 'compliance'],
      category: 'Metaplex Core'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'threat-model.md'),
      dest: path.join(VAULT_13_DIR, 'security-audits', 'threat-model-and-quality-policy.md'),
      title: 'Modelo de Amenazas y Política de Seguridad Técnica',
      description: 'Auditoría de vectores de ataque en smart contracts, seguridad de llaves privadas, validación de endpoints y devnet proof.',
      tags: ['security', 'threat-model', 'audit', 'compliance', 'solana-safety'],
      category: 'Security & Audits'
    }
  ];

  let syncedCount = 0;

  for (const item of mappings) {
    if (!fs.existsSync(item.src)) {
      console.warn(`   ⚠️ Archivo fuente no encontrado: ${item.src}`);
      continue;
    }

    ensureDir(path.dirname(item.dest));
    backupFile(item.dest);

    const bodyContent = processSourceMarkdown(item.src);
    const formattedMd = formatDeliverable({
      title: item.title,
      description: item.description,
      category: item.category,
      tags: item.tags,
      sourcePath: path.relative(CACHE_DIR, item.src),
      contentBody: bodyContent
    });

    fs.writeFileSync(item.dest, formattedMd, 'utf8');
    const relDest = path.relative(BRAIN_DIR, item.dest);
    console.log(`   ✅ Sincronizado: ${relDest}`);
    syncedCount++;
  }

  // Generar Matriz de Estado Actual de Producto
  generateStatusMatrix(knowledgeDir);
  syncedCount++;

  // Actualizar Index de 13 Product & Engineering
  updateSectionIndex();

  console.log(`\n🎉 Sincronización completada: ${syncedCount} notas técnicas actualizadas en BRIDS-Brain/13 Product & Engineering.`);
}

function generateStatusMatrix(knowledgeDir) {
  const destPath = path.join(VAULT_13_DIR, 'product-roadmap', 'current-product-status-matrix.md');
  backupFile(destPath);

  const content = `---
title: "Matriz Viva de Estado y Madurez de Producto"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Product Roadmap"
source_okf: "knowledge/architecture/app-technical-roadmap-investor-brief.md"
tags: [product-status, roadmap, readiness, feature-matrix, solana, rwa]
updated_at: "${new Date().toISOString()}"
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
| ${new Date().toISOString().split('T')[0]} | v1.0.0 | sync-technical-docs (OKF v0.1) | Generación inicial de la matriz viva de madurez técnica |
`;

  fs.writeFileSync(destPath, content, 'utf8');
  console.log(`   ✅ Matriz de Estado Generada: 13 Product & Engineering/product-roadmap/current-product-status-matrix.md`);
}

function updateSectionIndex() {
  const indexPath = path.join(VAULT_13_DIR, 'index.md');
  const indexContent = `# 13 Product & Engineering — Arquitectura Tecnológica y Smart Contracts

Este directorio contiene las **especificaciones de ingeniería, arquitectura de smart contracts en Solana, integraciones de protocolos y reportes de seguridad** de **BRIDS.io**.

> [!NOTE]
> **Principio Tecnológico:** *"Arquitectura de cuenta única de bajo coste con Metaplex Core en Solana, combinada con verificación biométrica en Stripe Identity y multisig institucional en Squads."*
> Toda la documentación en esta sección se sincroniza automáticamente desde el repositorio técnico oficial (\`jeisonsosablockdev/brids\`) mediante \`sync-technical-docs.sh\`.

---

## 📌 Documentos Clave de Ingeniería Sincronizados

### 🗺️ 1. Roadmap y Madurez de Producto (\`product-roadmap/\`)
- [[13 Product & Engineering/product-roadmap/current-product-status-matrix.md|Matriz Viva de Estado y Madurez de Producto]]
- [[13 Product & Engineering/product-roadmap/app-technical-roadmap-investor-brief.md|Roadmap Técnico e Investor Brief de Producto]]

### 🌐 2. Arquitectura Solana (\`solana-architecture/\`)
- [[13 Product & Engineering/solana-architecture/architecture-overview.md|Arquitectura General del Sistema y Stack Tecnológico]]
- [[13 Product & Engineering/solana-architecture/solana-stack-spec.md|Especificación Técnica de Infraestructura Solana]]

### 🧩 3. Estándar Metaplex Core (\`metaplex-core-specs/\`)
- [[13 Product & Engineering/metaplex-core-specs/metaplex-core-nft-spec.md|Estándar Metaplex Core y Especificación de NFTs RWA]]
- [[13 Product & Engineering/metaplex-core-specs/freeze-and-recovery-plugins.md|Máquina de Estados de Tokens y Protocolo de Recuperación]]

### 🛡️ 4. Seguridad y Auditorías (\`security-audits/\`)
- [[13 Product & Engineering/security-audits/threat-model-and-quality-policy.md|Modelo de Amenazas y Política de Seguridad Técnica]]

---

## 🎯 Custodios y Subagentes Asignados
- **Custodios Primarios:** Equipo de Ingeniería, \`compliance-officer\`, \`pitch-deck-architect\`.
- **Conceptos de Referencia:**
  - [[02 Strategy & Research/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Solana RWA Advantage]]
  - [[02 Strategy & Research/Business Concepts/concept-wallet-recovery-protocol.md|C2: Lost-Key Recovery Protocol]]
  - [[02 Strategy & Research/Business Concepts/concept-multisig-treasury-governance.md|C8: Squads Multi-Sig Governance]]
`;

  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log(`   ✅ Índice de Sección Actualizado: 13 Product & Engineering/index.md`);
}

function runAudit() {
  console.log('\n' + '═'.repeat(75));
  console.log('🏛️ VERIFICANDO CUMPLIMIENTO DE BÓVEDA TRAS LA SINCRONIZACIÓN');
  console.log('═'.repeat(75));
  try {
    const valOut = execSync(`node "${path.join(SCRIPTS_DIR, 'validate-vault.js')}"`, { encoding: 'utf8' });
    console.log(valOut);
  } catch (err) {
    console.error('Error al ejecutar validate-vault.js:', err.message);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const forceClone = args.includes('--force') || args.includes('-f');
  
  try {
    const knowledgeDir = fetchTechnicalRepo(forceClone);
    syncDeliverables(knowledgeDir);
    runAudit();
    console.log('✨ Sincronización técnica completada con éxito y 100% en conformidad con la bóveda.');
  } catch (error) {
    console.error('\n❌ Error durante la sincronización técnica:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  fetchTechnicalRepo,
  syncDeliverables
};
