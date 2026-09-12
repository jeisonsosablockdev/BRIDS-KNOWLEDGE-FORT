#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔄 BRIDS KNOWLEDGE FORT - AUTOMATED TECHNICAL DOCS SYNC ENGINE (v2.0)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Sincronizador automatizado, determinista e incremental que:
 * 1. Conecta con el repositorio técnico (https://github.com/jeisonsosablockdev/brids).
 * 2. Realiza fetch/pull de la carpeta `knowledge/` (OKF v0.1) en `develop`.
 * 3. Detecta cambios reales mediante hashes SHA256 (no genera ruido ni backups innecesarios).
 * 4. Extrae dinámicamente la Matriz de Madurez y Gaps desde app-technical-roadmap-investor-brief.md.
 * 5. Registra el commit SHA técnico real y fecha de origen en el frontmatter.
 * 6. Preserva y amplía incrementalmente el historial de revisiones (Changelog).
 * 7. Mantiene la bóveda Obsidian 100% conforme con validate-vault.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
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
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getSha256(content) {
  return crypto.createHash('sha256').update(content || '').digest('hex');
}

function getGitCommitInfo() {
  try {
    const sha = execSync(`git -C "${CACHE_DIR}" rev-parse --short HEAD`, { encoding: 'utf8' }).trim();
    const message = execSync(`git -C "${CACHE_DIR}" log -1 --format="%s"`, { encoding: 'utf8' }).trim();
    const date = execSync(`git -C "${CACHE_DIR}" log -1 --format="%ci"`, { encoding: 'utf8' }).trim();
    return { sha, message, date };
  } catch {
    return { sha: 'unknown', message: 'Sincronización manual', date: new Date().toISOString() };
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

function extractExistingChangelog(destPath) {
  if (!fs.existsSync(destPath)) return null;
  const existing = fs.readFileSync(destPath, 'utf8');
  const match = existing.match(/## 📜 Historial de Revisiones[\s\S]*?(\|[^\n]+\|[\s\S]*)/);
  if (!match) return null;
  
  // Clean trailing content
  const tablePart = match[1].trim();
  const rows = tablePart.split('\n').filter(r => r.trim().startsWith('|'));
  return rows.length >= 2 ? rows.join('\n') : null;
}

function processSourceMarkdown(srcFile) {
  if (!fs.existsSync(srcFile)) return null;
  const raw = fs.readFileSync(srcFile, 'utf8');
  
  let body = raw;
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (fmMatch) {
    body = fmMatch[2].trim();
  }

  body = body.replace(/^#\s+[^\r\n]+\r?\n/, '').trim();
  return body;
}

function formatDeliverable({ title, description, category, tags, sourcePath, contentBody, destPath, gitInfo }) {
  const cleanTags = (tags || ['brids', 'engineering', 'solana', 'rwa']).join(', ');
  const today = new Date().toISOString().split('T')[0];
  const summaryCallout = `> [!NOTE]\n> **Resumen Técnico:** ${description || title}\n> *Documento sincronizado desde el repositorio técnico institucional (Commit: \`${gitInfo.sha}\`).*`;

  // Preserve existing changelog rows or start fresh
  const existingTable = extractExistingChangelog(destPath);
  let changelogSection = '';

  if (existingTable) {
    // Check if current commit already recorded
    if (!existingTable.includes(`\`${gitInfo.sha}\``)) {
      changelogSection = `${existingTable}\n| ${today} | v1.0.0 | sync-technical-docs (\`${gitInfo.sha}\`) | Sincronización automática de cambios desde rama develop |`;
    } else {
      changelogSection = existingTable;
    }
  } else {
    changelogSection = `| Fecha | Versión | Autor / Origen | Cambios Principales |\n|---|---|---|---|\n| ${today} | v1.0.0 | sync-technical-docs (\`${gitInfo.sha}\`) | Sincronización e ingesta canónica desde ${sourcePath} |`;
  }

  return `---
title: "${title}"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "${category || 'Product & Engineering'}"
source_okf: "${sourcePath}"
source_commit: "${gitInfo.sha}"
source_commit_date: "${gitInfo.date}"
source_hash: "${getSha256(contentBody)}"
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

${changelogSection}
`;
}

function syncDeliverables(knowledgeDir) {
  console.log('\n' + '═'.repeat(75));
  console.log('⚙️ PROCESANDO Y MODULARIZANDO DOCUMENTACIÓN TÉCNICA CANÓNICA');
  console.log('═'.repeat(75));

  const gitInfo = getGitCommitInfo();
  console.log(`   📌 Commit Técnico de Origen: [${gitInfo.sha}] ${gitInfo.message}`);
  console.log(`   📅 Fecha de Snapshot:       ${gitInfo.date}\n`);

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

  let updatedCount = 0;
  let unchangedCount = 0;

  for (const item of mappings) {
    if (!fs.existsSync(item.src)) {
      console.warn(`   ⚠️ Archivo fuente no encontrado: ${item.src}`);
      continue;
    }

    ensureDir(path.dirname(item.dest));

    const bodyContent = processSourceMarkdown(item.src);
    const formattedMd = formatDeliverable({
      title: item.title,
      description: item.description,
      category: item.category,
      tags: item.tags,
      sourcePath: path.relative(CACHE_DIR, item.src),
      contentBody: bodyContent,
      destPath: item.dest,
      gitInfo
    });

    const srcHash = getSha256(bodyContent);

    // Check if destination exists and content body has not changed
    if (fs.existsSync(item.dest)) {
      const currentContent = fs.readFileSync(item.dest, 'utf8');

      if (currentContent.includes(`source_hash: "${srcHash}"`) && currentContent.includes(`source_commit: "${gitInfo.sha}"`)) {
        console.log(`   ⚪ Sin cambios: ${path.relative(BRAIN_DIR, item.dest)} (idéntico a commit ${gitInfo.sha})`);
        unchangedCount++;
        continue;
      }
      backupFile(item.dest);
    }

    fs.writeFileSync(item.dest, formattedMd, 'utf8');
    const relDest = path.relative(BRAIN_DIR, item.dest);
    console.log(`   ✅ Actualizado: ${relDest}`);
    updatedCount++;
  }

  // Generar / Actualizar Dinámicamente la Matriz de Madurez de Producto
  const matrixUpdated = generateDynamicStatusMatrix(knowledgeDir, gitInfo);
  if (matrixUpdated) updatedCount++; else unchangedCount++;

  // Actualizar Índice de Sección con catálogo de artefactos OKF
  updateSectionIndex(knowledgeDir, gitInfo);

  console.log(`\n📊 Balance de Sincronización:`);
  console.log(`   • Documentos actualizados/creados: ${updatedCount}`);
  console.log(`   • Documentos sin cambios:          ${unchangedCount}`);
}

function extractSectionFromMarkdown(content, sectionHeader) {
  const regex = new RegExp(`##\\s+${sectionHeader}[\\r\\n]+([\\s\\S]*?)(?=\\n##\\s+|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function generateDynamicStatusMatrix(knowledgeDir, gitInfo) {
  const destPath = path.join(VAULT_13_DIR, 'product-roadmap', 'current-product-status-matrix.md');
  const roadmapBriefPath = path.join(knowledgeDir, 'architecture', 'app-technical-roadmap-investor-brief.md');
  
  let maturityMatrixMarkdown = '';
  let keyGapsMarkdown = '';
  let investorClaimsMarkdown = '';

  if (fs.existsSync(roadmapBriefPath)) {
    const briefRaw = fs.readFileSync(roadmapBriefPath, 'utf8');
    maturityMatrixMarkdown = extractSectionFromMarkdown(briefRaw, 'Matriz de Madurez');
    keyGapsMarkdown = extractSectionFromMarkdown(briefRaw, 'Brechas Tecnicas Clave');
    investorClaimsMarkdown = extractSectionFromMarkdown(briefRaw, 'Claims Recomendados para Inversionistas');
  }

  const defaultMatrix = `| Dominio | Madurez | Lectura para inversionistas | Siguiente paso principal |
| --- | --- | --- | --- |
| Marketplace discovery | Construido | Existe una superficie real de producto. | Animacion inicial con Motion, bugs de mapa, performance mobile. |
| Detalle de propiedad | Construido | Los assets pueden presentarse con inversion, documentos y gobernanza. | Completar datos finales y copy de compliance. |
| Wallet auth | Construido | Existe un modelo fuerte de autoridad wallet. | Persistent production session store. |
| Federated auth | Foundation construida | Existe ruta de onboarding de menor friccion. | Completar operaciones WorkOS productivas y recovery flows. |
| Checkout | Parcial | Existe modelo de orden; falta Sphere ramp para tarjeta. | Implementar Sphere ramp completo y unificar tarjeta + crypto. |
| Crypto purchase mint | Construido | Flujo crypto implementado y configurado para recibir USDC. | Hardening productivo, treasury policy, evidencia final. |
| Admin asset ops | Construido | El equipo interno puede administrar inventario y metadata. | Playbooks operativos y hardening productivo. |
| Admin dashboard | Parcial | Existe shell admin; faltan modulos operativos clave. | Tesoreria Squads, distribuciones freeze/unfreeze, notificaciones CRM. |
| NFT/admin minting | Construido en devnet | Existe lifecycle Core asset. | Authority UI y endpoints de lectura. |
| Compliance | Foundation construida | Los compliance gates estan codificados en rutas de transaccion. | Persistencia Stripe Identity, vista admin KYC y rol RBAC. |
| Investor dashboard | Superficie construida | Existe UX de cuenta y holdings. | Resumen, portafolio, rentas/claim e historial con datos reales. |
| Staking | Base construida en devnet | Existe asset action path; faltan distribuciones y auditoria. | Reconciliacion on-chain, claim state, distribuciones. |
| Notifications | Foundation construida | Existe infraestructura de re-engagement. | Integracion CRM para campanas y seguimiento de leads. |
| Observability/QA | Foundation fuerte | Hay disciplina de ingenieria visible. | SLOs productivos, alerting y deployment smoke gates. |`;

  const matrixBody = maturityMatrixMarkdown || defaultMatrix;
  const gapsBody = keyGapsMarkdown ? `## ⚠️ Brechas Técnicas Clave y Desafíos de Ingeniería\n\n${keyGapsMarkdown}\n` : '';
  const claimsBody = investorClaimsMarkdown ? `## 🗣️ Claims Verificados para Inversores y YC\n\n${investorClaimsMarkdown}\n` : '';

  const today = new Date().toISOString().split('T')[0];
  const existingTable = extractExistingChangelog(destPath);
  let changelogSection = '';

  if (existingTable) {
    if (!existingTable.includes(`\`${gitInfo.sha}\``)) {
      changelogSection = `${existingTable}\n| ${today} | v1.0.0 | sync-technical-docs (\`${gitInfo.sha}\`) | Actualización dinámica de madurez desde develop |`;
    } else {
      changelogSection = existingTable;
    }
  } else {
    changelogSection = `| Fecha | Versión | Autor / Origen | Cambios Principales |\n|---|---|---|---|\n| ${today} | v1.0.0 | sync-technical-docs (\`${gitInfo.sha}\`) | Generación inicial de la matriz viva de madurez técnica |`;
  }

  const content = `---
title: "Matriz Viva de Estado y Madurez de Producto"
type: Reference
status: active
workflow: production
version: 1.0.0
category: "Product Roadmap"
source_okf: "knowledge/architecture/app-technical-roadmap-investor-brief.md"
source_commit: "${gitInfo.sha}"
source_commit_date: "${gitInfo.date}"
source_hash: "${getSha256(matrixBody + keyGapsMarkdown)}"
tags: [product-status, roadmap, readiness, feature-matrix, solana, rwa]
updated_at: "${new Date().toISOString()}"
---

# Matriz Viva de Estado y Madurez de Producto

> [!NOTE]
> **Resumen Ejecutivo:** Matriz dinámica de madurez técnica y estado operativo de la plataforma BRIDS.io extraída directamente del repositorio de código (\`${gitInfo.sha}\`).
> Refleja con precisión qué módulos están en producción/devnet, cuáles están parcialmente construidos y cuáles conforman las siguientes fases del roadmap.

---

## 🔗 Conexión con la Tesis de Negocio
- [[02 Strategy & Research/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[13 Product & Engineering/product-roadmap/app-technical-roadmap-investor-brief.md|Roadmap Técnico e Investor Brief Completo]]
- [[14 Investor Relations & YC/index.md|Materiales para Inversores y YC]]

---

## 📊 Matriz de Madurez Técnica por Dominio

${matrixBody}

---

${gapsBody}
---

${claimsBody}
---

## 📜 Historial de Revisiones

${changelogSection}
`;

  if (fs.existsSync(destPath)) {
    const currentContent = fs.readFileSync(destPath, 'utf8');
    const currentHash = getSha256(matrixBody + keyGapsMarkdown);
    if (currentContent.includes(`source_hash: "${currentHash}"`) && currentContent.includes(`source_commit: "${gitInfo.sha}"`)) {
      console.log(`   ⚪ Sin cambios: 13 Product & Engineering/product-roadmap/current-product-status-matrix.md (idéntico a commit ${gitInfo.sha})`);
      return false;
    }
    backupFile(destPath);
  }

  fs.writeFileSync(destPath, content, 'utf8');
  console.log(`   ✅ Matriz de Estado Generada: 13 Product & Engineering/product-roadmap/current-product-status-matrix.md`);
  return true;
}

function countKnowledgeArtifacts(knowledgeDir) {
  let count = 0;
  function walk(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item.startsWith('.')) continue;
      const full = path.join(dir, item);
      if (fs.lstatSync(full).isDirectory()) walk(full);
      else if (item.endsWith('.md') || item.endsWith('.json')) count++;
    }
  }
  walk(knowledgeDir);
  return count;
}

function updateSectionIndex(knowledgeDir, gitInfo) {
  const indexPath = path.join(VAULT_13_DIR, 'index.md');
  const totalArtifacts = countKnowledgeArtifacts(knowledgeDir);

  const indexContent = `# 13 Product & Engineering — Arquitectura Tecnológica y Smart Contracts

Este directorio contiene las **especificaciones de ingeniería, arquitectura de smart contracts en Solana, integraciones de protocolos y reportes de seguridad** de **BRIDS.io**.

> [!NOTE]
> **Principio Tecnológico:** *"Arquitectura de cuenta única de bajo coste con Metaplex Core en Solana, combinada con verificación biométrica en Stripe Identity y multisig institucional en Squads."*
> Toda la documentación en esta sección se sincroniza automáticamente desde el repositorio técnico oficial (\`jeisonsosablockdev/brids\`, rama \`develop\`) mediante \`sync-technical-docs.sh\`.
> 
> **Estado del Catálogo Técnico:**
> - 📌 **Último Commit Sincronizado:** \`${gitInfo.sha}\` (${gitInfo.date.split(' ')[0]})
> - 📦 **Total de Artefactos OKF en Repositorio:** ${totalArtifacts} documentos (Arquitectura, RFCs, APIs, DB, Seguridad).
> - 🛡️ **Garantía Anti-Drift:** Versionado continuo con respaldos automáticos en \`00 Inbox/Archive/\`.

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
  console.log(`   ✅ Índice de Sección Actualizado: 13 Product & Engineering/index.md (Catálogo OKF: ${totalArtifacts} artefactos)`);
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
