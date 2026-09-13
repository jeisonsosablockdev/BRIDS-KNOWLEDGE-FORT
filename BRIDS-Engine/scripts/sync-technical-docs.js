#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔄 BRIDS KNOWLEDGE FORT - AUTOMATED TECHNICAL DOCS SYNC ENGINE (v3.0)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Sincronizador automatizado, determinista e incremental que:
 * 1. Conecta con el repositorio técnico (https://github.com/jeisonsosablockdev/brids).
 * 2. Realiza fetch/pull de la carpeta `knowledge/` (OKF v0.1) en `develop`.
 * 3. Ingesta y modulariza todas las especificaciones canónicas en BRIDS-Brain/01 Negocio/02 Producto & Ingenieria:
 *    - Arquitectura Solana & Auth Híbrido (WorkOS + SIWS, Sesiones, Trazabilidad, Rotación).
 *    - Metaplex Core (NFT Spec, Freeze & Recovery Plugins).
 *    - Seguridad, Compliance & Threat Models (Smart contracts, privacidad, PCI, auditorías).
 *    - Arquitectura de Base de Datos (Modelos Prisma/Postgres).
 *    - Especificaciones de APIs, Webhooks y RPCs.
 *    - Operaciones, Procedimientos & Runbooks.
 *    - Catálogo Maestro Dinámico de RFCs (EPIC-001 al EPIC-014).
 *    - Matriz Viva de Estado y Madurez de Producto.
 * 4. Detecta cambios reales mediante hashes SHA256 (idempotente).
 * 5. Mantiene respaldos automáticos en 00 Inbox/Archive/ ante cambios.
 * 6. Genera Frontmatter estricto, Callouts ejecutivos, Backlinks a negocio y Changelog.
 * 7. Garantiza 100% de cumplimiento con validate-vault.js.
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
const VAULT_13_DIR = path.join(BRAIN_DIR, '01 Negocio', '02 Producto & Ingenieria');
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
    console.log('   🚀 Clonando repositorio técnico (sparse-checkout en knowledge/ y apps/web/public/brand/)...');
    execSync(`git clone --depth 1 --filter=blob:none --sparse -b ${TARGET_BRANCH} ${REPO_URL} "${CACHE_DIR}"`, {
      stdio: 'inherit'
    });
    execSync(`git -C "${CACHE_DIR}" sparse-checkout set knowledge apps/web/public/brand`, { stdio: 'inherit' });
    console.log('   ✅ Paquete OKF y assets de marca clonados con éxito en caché local.');
  } else {
    console.log('   🔄 Actualizando paquete OKF y assets de marca desde origin/develop...');
    try {
      execSync(`git -C "${CACHE_DIR}" fetch --depth 1 origin ${TARGET_BRANCH}`, { stdio: 'inherit' });
      execSync(`git -C "${CACHE_DIR}" reset --hard origin/${TARGET_BRANCH}`, { stdio: 'inherit' });
      execSync(`git -C "${CACHE_DIR}" sparse-checkout set knowledge apps/web/public/brand`, { stdio: 'inherit' });
      console.log('   ✅ Paquete OKF y assets de marca actualizados correctamente.');
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

function formatDeliverable({ title, description, category, tags, sourcePath, contentBody, destPath, gitInfo, businessLinks }) {
  const cleanTags = (tags || ['brids', 'engineering', 'solana', 'rwa']).join(', ');
  const today = new Date().toISOString().split('T')[0];
  const summaryCallout = `> [!NOTE]\n> **Resumen Técnico:** ${description || title}\n> *Documento sincronizado desde el repositorio técnico institucional (Commit: \`${gitInfo.sha}\`).*`;

  const existingTable = extractExistingChangelog(destPath);
  let changelogSection = '';

  if (existingTable) {
    if (!existingTable.includes(`\`${gitInfo.sha}\``)) {
      changelogSection = `${existingTable}\n| ${today} | v1.0.0 | sync-technical-docs (\`${gitInfo.sha}\`) | Sincronización automática de cambios desde rama develop |`;
    } else {
      changelogSection = existingTable;
    }
  } else {
    changelogSection = `| Fecha | Versión | Autor / Origen | Cambios Principales |\n|---|---|---|---|\n| ${today} | v1.0.0 | sync-technical-docs (\`${gitInfo.sha}\`) | Sincronización e ingesta canónica desde ${sourcePath} |`;
  }

  const linksBlock = businessLinks && businessLinks.length > 0
    ? businessLinks.map(l => `- ${l}`).join('\n')
    : `- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]\n- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Ventaja de Infraestructura Solana RWA]]\n- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Protocolo de Recuperación Institucional]]\n- [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Gobernanza de Tesorería Multi-Sig Squads]]`;

  return `---
title: "${title.replace(/"/g, '\\"')}"
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
${linksBlock}

---

${contentBody}

---

## 📜 Historial de Revisiones

${changelogSection}
`;
}

function getCanonicalMappings(knowledgeDir) {
  return [
    // 🗺️ 1. Roadmap y Madurez de Producto
    {
      src: path.join(knowledgeDir, 'architecture', 'app-technical-roadmap-investor-brief.md'),
      dest: path.join(VAULT_13_DIR, 'app-technical-roadmap-investor-brief.md'),
      title: 'Roadmap Técnico e Investor Brief de Producto',
      description: 'Resumen ejecutivo de madurez técnica, stack activo, gaps y fases de producto para inversores y equipo.',
      tags: ['roadmap', 'investor-brief', 'product-maturity', 'solana', 'architecture'],
      category: 'Product Roadmap'
    },

    // 🌐 2. Arquitectura Solana & Auth Híbrido
    {
      src: path.join(knowledgeDir, 'architecture', 'architecture-overview.md'),
      dest: path.join(VAULT_13_DIR, 'arquitectura', 'architecture-overview.md'),
      title: 'Arquitectura General del Sistema y Stack Tecnológico',
      description: 'Especificación de alto nivel de componentes frontend, backend, RPCs, contratos Solana y modelos de datos.',
      tags: ['architecture', 'fullstack', 'solana', 'nextjs', 'postgres'],
      category: 'Solana Architecture'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'solana-stack.md'),
      dest: path.join(VAULT_13_DIR, 'arquitectura', 'solana-stack-spec.md'),
      title: 'Especificación Técnica de Infraestructura Solana',
      description: 'Detalle de integración con devnet/mainnet, Umi, Solana Kit, priorización de fees y manejo de transacciones.',
      tags: ['solana', 'smart-contracts', 'umi', 'solana-kit', 'tps'],
      category: 'Solana Architecture'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'auth-flow.md'),
      dest: path.join(VAULT_13_DIR, 'arquitectura', 'auth-flow-workos-siws.md'),
      title: 'Flujo de Autenticación Híbrida WorkOS y SIWS',
      description: 'Especificación del modelo de autenticación dual: Web2 social via WorkOS y Web3 nativo via Sign-In with Solana.',
      tags: ['auth', 'siws', 'workos', 'security', 'session'],
      category: 'Solana Architecture'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'authority-model.md'),
      dest: path.join(VAULT_13_DIR, 'arquitectura', 'authority-model-and-multisig.md'),
      title: 'Modelo de Autoridades On-Chain y Gobernanza Multi-Sig',
      description: 'Definición de roles on-chain, jerarquía de autoridades de colección, delegates y multisig institucional en Squads.',
      tags: ['authority', 'squads', 'multisig', 'governance', 'solana'],
      category: 'Solana Architecture'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'rotation-spec.md'),
      dest: path.join(VAULT_13_DIR, 'arquitectura', 'key-rotation-and-emergency-spec.md'),
      title: 'Protocolo de Rotación de Llaves y Procedimientos de Emergencia',
      description: 'Procedimiento de rotación programada de llaves maestras, congelamiento preventivo y traspaso ante contingencias.',
      tags: ['key-rotation', 'emergency', 'freeze', 'security', 'operations'],
      category: 'Solana Architecture'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'session-model.md'),
      dest: path.join(VAULT_13_DIR, 'arquitectura', 'session-model-and-persistence.md'),
      title: 'Modelo de Sesión y Persistencia Stateless vs Stateful',
      description: 'Arquitectura de manejo de tokens JWT, almacenamiento seguro de cookies de sesión, expiración y revocación.',
      tags: ['session', 'jwt', 'security', 'persistence', 'workos'],
      category: 'Solana Architecture'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'purchase-tracing.md'),
      dest: path.join(VAULT_13_DIR, 'arquitectura', 'purchase-tracing-infrastructure.md'),
      title: 'Infraestructura de Trazabilidad y Reconciliación de Compras',
      description: 'Pipeline de seguimiento end-to-end de órdenes de compra, pagos en USDC, emisión de NFTs y reconciliación off-chain.',
      tags: ['purchase-tracing', 'usdc', 'reconciliation', 'checkout', 'solana'],
      category: 'Solana Architecture'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'devnet-proof.md'),
      dest: path.join(VAULT_13_DIR, 'arquitectura', 'devnet-proof-and-verifications.md'),
      title: 'Evidencia Verificable y Despliegues en Devnet',
      description: 'Registro de direcciones on-chain, transacciones de prueba de concepto, Candy Machines desplegadas y firmas verificables.',
      tags: ['devnet', 'proof', 'candy-machine', 'verification', 'solana'],
      category: 'Solana Architecture'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'stake-audit.md'),
      dest: path.join(VAULT_13_DIR, 'arquitectura', 'stake-audit-and-traceability.md'),
      title: 'Auditoría y Trazabilidad del Mecanismo de Staking de Rentas',
      description: 'Especificación del ciclo de vida del staking, cálculo de rendimiento proporcional y auditoría de eventos de distribución.',
      tags: ['staking', 'yield', 'audit', 'tokenomics', 'traceability'],
      category: 'Solana Architecture'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'third-party-integrations.md'),
      dest: path.join(VAULT_13_DIR, 'arquitectura', 'third-party-integrations-registry.md'),
      title: 'Registro de Integraciones y Servicios de Terceros',
      description: 'Catálogo de APIs y servicios externos: Stripe Identity, Sphere Ramp, Littio, Mapbox, Supabase, QuickNode y Helius.',
      tags: ['integrations', 'stripe', 'sphere', 'mapbox', 'infrastructure'],
      category: 'Solana Architecture'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'toolchain-policy.md'),
      dest: path.join(VAULT_13_DIR, 'arquitectura', 'toolchain-maintenance-policy.md'),
      title: 'Política de Mantenimiento y Estándares de Toolchain',
      description: 'Reglas de actualización de dependencias, bloqueo de versiones de Solana Kit/Umi y políticas de calidad de código.',
      tags: ['toolchain', 'ci-cd', 'dependencies', 'standards', 'engineering'],
      category: 'Solana Architecture'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'rbac.md'),
      dest: path.join(VAULT_13_DIR, 'arquitectura', 'rbac-permissions-model.md'),
      title: 'Modelo de Control de Acceso Basado en Roles (RBAC)',
      description: 'Matriz de permisos para administradores, operadores, sponsors inmobiliarios, compliance officers e inversores.',
      tags: ['rbac', 'permissions', 'roles', 'security', 'compliance'],
      category: 'Solana Architecture'
    },

    // 🧩 3. Metaplex Core
    {
      src: path.join(knowledgeDir, 'architecture', 'nft-spec.md'),
      dest: path.join(VAULT_13_DIR, 'metaplex-core', 'metaplex-core-nft-spec.md'),
      title: 'Estándar Metaplex Core y Especificación de NFTs RWA',
      description: 'Ciclo de vida de tokens de participación inmobiliaria, Core Candy Machine, plugins de Freeze y metadata on-chain.',
      tags: ['metaplex-core', 'rwa-nft', 'candy-machine', 'freeze-plugin', 'solana'],
      category: 'Metaplex Core'
    },
    {
      src: path.join(knowledgeDir, 'architecture', 'state-machine.md'),
      dest: path.join(VAULT_13_DIR, 'metaplex-core', 'freeze-and-recovery-plugins.md'),
      title: 'Máquina de Estados de Tokens y Protocolo de Recuperación',
      description: 'Definición formal de estados on-chain/off-chain, rotación de autoridad, lock-ups por staking y protocolo de freeze/recovery.',
      tags: ['state-machine', 'freeze-plugin', 'recovery-protocol', 'lost-key', 'compliance'],
      category: 'Metaplex Core'
    },

    // 🛡️ 4. Seguridad, Compliance & Auditorías
    {
      src: path.join(knowledgeDir, 'architecture', 'threat-model.md'),
      dest: path.join(VAULT_13_DIR, 'seguridad', 'threat-model-and-quality-policy.md'),
      title: 'Modelo de Amenazas y Política de Seguridad Técnica',
      description: 'Auditoría de vectores de ataque en smart contracts, seguridad de llaves privadas, validación de endpoints y devnet proof.',
      tags: ['security', 'threat-model', 'audit', 'compliance', 'solana-safety'],
      category: 'Security & Audits'
    },
    {
      src: path.join(knowledgeDir, 'security', 'compliance', 'smart-contract-security.md'),
      dest: path.join(VAULT_13_DIR, 'seguridad', 'smart-contract-security-guidelines.md'),
      title: 'Guía y Políticas de Seguridad para Smart Contracts',
      description: 'Requisitos de validación de cuentas Solana, prevención de reentrancy, checks de autoridad y lineamientos para auditorías externas.',
      tags: ['security', 'smart-contracts', 'audits', 'solana-security'],
      category: 'Security & Audits'
    },
    {
      src: path.join(knowledgeDir, 'security', 'compliance', 'data-handling-privacy.md'),
      dest: path.join(VAULT_13_DIR, 'seguridad', 'data-handling-and-privacy-compliance.md'),
      title: 'Políticas de Manejo de Datos y Privacidad (KYC/AML)',
      description: 'Políticas de almacenamiento segregado de PII, integración no custodiar con Stripe Identity y cumplimiento de privacidad.',
      tags: ['privacy', 'kyc-aml', 'gdpr', 'pii', 'compliance'],
      category: 'Security & Audits'
    },
    {
      src: path.join(knowledgeDir, 'security', 'compliance', 'pci-compliance.md'),
      dest: path.join(VAULT_13_DIR, 'seguridad', 'pci-compliance-and-fiat-ramps.md'),
      title: 'Cumplimiento PCI y Seguridad de Pasarelas Fiat',
      description: 'Blindaje y delimitación de alcance PCI para procesadores de tarjetas de crédito y rampas fiat hacia USDC.',
      tags: ['pci-compliance', 'fiat-ramp', 'payments', 'security'],
      category: 'Security & Audits'
    },
    {
      src: path.join(knowledgeDir, 'security', 'threat-models', 'marketplace.md'),
      dest: path.join(VAULT_13_DIR, 'seguridad', 'marketplace-threat-model.md'),
      title: 'Modelo de Amenazas del Marketplace Inmobiliario',
      description: 'Análisis de vectores de ataque, manipulación de precios, denegación de servicio y mitigaciones en el catálogo público.',
      tags: ['threat-model', 'marketplace', 'security-audit', 'risk'],
      category: 'Security & Audits'
    },
    {
      src: path.join(knowledgeDir, 'security', 'threat-models', 'mint-orchestrator.md'),
      dest: path.join(VAULT_13_DIR, 'seguridad', 'mint-orchestrator-threat-model.md'),
      title: 'Modelo de Amenazas del Orquestador de Minteo',
      description: 'Evaluación de seguridad en la tubería de minteo asíncrono, protección contra doble gasto y control de rate limits.',
      tags: ['threat-model', 'minting', 'concurrency', 'security'],
      category: 'Security & Audits'
    },
    {
      src: path.join(knowledgeDir, 'security', 'audits', 'bri-164-marketplace-security-audit-plan.md'),
      dest: path.join(VAULT_13_DIR, 'seguridad', 'marketplace-security-audit-plan.md'),
      title: 'Plan de Auditoría de Seguridad del Marketplace (BRI-164)',
      description: 'Metodología, matrices de prueba de penetración y verificación de seguridad para vistas 3D, mapas y detalle de activos.',
      tags: ['audit-plan', 'pentest', 'marketplace', 'hardening'],
      category: 'Security & Audits'
    },

    // 🗄️ 5. Base de Datos & Arquitectura de Datos
    {
      src: path.join(knowledgeDir, 'database', 'models', 'user-profile.md'),
      dest: path.join(VAULT_13_DIR, 'api-y-database', 'user-profile-schema.md'),
      title: 'Modelo de Datos: Perfil de Usuario y Estado KYC',
      description: 'Esquema relacional de usuarios, vinculación con wallet principal, estado de verificación de identidad y preferencias.',
      tags: ['database', 'prisma', 'user-profile', 'kyc', 'postgres'],
      category: 'Database Architecture'
    },
    {
      src: path.join(knowledgeDir, 'database', 'models', 'marketplace-entry.md'),
      dest: path.join(VAULT_13_DIR, 'api-y-database', 'marketplace-entry-schema.md'),
      title: 'Modelo de Datos: Catálogo Inmobiliario y Metadatos de Activos',
      description: 'Esquema de propiedades listadas, proyecciones financieras, rentabilidades estimadas, estados de fondeo y galerías.',
      tags: ['database', 'marketplace', 'assets', 'rwa', 'postgres'],
      category: 'Database Architecture'
    },
    {
      src: path.join(knowledgeDir, 'database', 'models', 'mint-job.md'),
      dest: path.join(VAULT_13_DIR, 'api-y-database', 'mint-job-schema.md'),
      title: 'Modelo de Datos: Cola de Trabajos de Minteo Asíncrono',
      description: 'Esquema de orquestación de minteo, intentos, reintentos exponenciales, idempotencia y hashes de transacciones.',
      tags: ['database', 'mint-job', 'queue', 'idempotency', 'postgres'],
      category: 'Database Architecture'
    },
    {
      src: path.join(knowledgeDir, 'database', 'models', 'purchase-attempt.md'),
      dest: path.join(VAULT_13_DIR, 'api-y-database', 'purchase-attempt-schema.md'),
      title: 'Modelo de Datos: Intentos de Compra y Registro de Órdenes',
      description: 'Esquema de seguimiento de órdenes de compra, locking de inventario, tiempos de expiración y estado de pago.',
      tags: ['database', 'purchase-attempt', 'checkout', 'inventory', 'postgres'],
      category: 'Database Architecture'
    },
    {
      src: path.join(knowledgeDir, 'database', 'models', 'stake-action.md'),
      dest: path.join(VAULT_13_DIR, 'api-y-database', 'stake-action-schema.md'),
      title: 'Modelo de Datos: Registro de Acciones de Staking y Rentas',
      description: 'Esquema de transacciones de staking, bloqueo de NFTs, cálculo de periodos y reclamos de rendimientos acumulados.',
      tags: ['database', 'staking', 'yield-distribution', 'postgres'],
      category: 'Database Architecture'
    },
    {
      src: path.join(knowledgeDir, 'database', 'models', 'authority-registry.md'),
      dest: path.join(VAULT_13_DIR, 'api-y-database', 'authority-registry-schema.md'),
      title: 'Modelo de Datos: Registro de Autoridades y Permisos Off-Chain',
      description: 'Esquema para auditoría y persistencia de autoridades de colección, llaves de freeze delegadas y bitácora de rotación.',
      tags: ['database', 'authority-registry', 'audit-trail', 'security', 'postgres'],
      category: 'Database Architecture'
    },

    // 🔌 6. Especificaciones de APIs & RPC
    {
      src: path.join(knowledgeDir, 'api', 'endpoints', 'admin-assets.md'),
      dest: path.join(VAULT_13_DIR, 'api-y-database', 'admin-assets-api.md'),
      title: 'Especificación de API: Administración de Activos Inmobiliarios',
      description: 'Endpoints REST para creación, edición, carga de documentación y publicación de propiedades en el marketplace.',
      tags: ['api', 'admin', 'assets', 'rest', 'endpoints'],
      category: 'API Specifications'
    },
    {
      src: path.join(knowledgeDir, 'api', 'endpoints', 'auth.md'),
      dest: path.join(VAULT_13_DIR, 'api-y-database', 'auth-api.md'),
      title: 'Especificación de API: Autenticación, Nonce y Sesión',
      description: 'Endpoints para generación de desafíos SIWS (Sign-In with Solana), intercambio de credenciales WorkOS y refresh de tokens.',
      tags: ['api', 'auth', 'siws', 'jwt', 'endpoints'],
      category: 'API Specifications'
    },
    {
      src: path.join(knowledgeDir, 'api', 'endpoints', 'collections.md'),
      dest: path.join(VAULT_13_DIR, 'api-y-database', 'collections-api.md'),
      title: 'Especificación de API: Gestión de Colecciones Metaplex Core',
      description: 'Endpoints para consulta y sincronización de colecciones on-chain, atributos de proyectos y metadatos maestros.',
      tags: ['api', 'collections', 'metaplex-core', 'endpoints'],
      category: 'API Specifications'
    },
    {
      src: path.join(knowledgeDir, 'api', 'endpoints', 'marketplace.md'),
      dest: path.join(VAULT_13_DIR, 'api-y-database', 'marketplace-api.md'),
      title: 'Especificación de API: Catálogo Público y Detalle de Inversión',
      description: 'Endpoints públicos para alimentar el explorador de inmuebles, cálculo de retornos y estado de disponibilidad en tiempo real.',
      tags: ['api', 'marketplace', 'public', 'investor', 'endpoints'],
      category: 'API Specifications'
    },
    {
      src: path.join(knowledgeDir, 'api', 'endpoints', 'mint-orchestrator.md'),
      dest: path.join(VAULT_13_DIR, 'api-y-database', 'mint-orchestrator-api.md'),
      title: 'Especificación de API: Orquestador de Minteo y Emisión',
      description: 'Endpoints internos y de webhook para coordinar la emisión on-chain tras confirmación de fondos en custodia.',
      tags: ['api', 'minting', 'orchestration', 'endpoints'],
      category: 'API Specifications'
    },
    {
      src: path.join(knowledgeDir, 'api', 'endpoints', 'purchase-flow.md'),
      dest: path.join(VAULT_13_DIR, 'api-y-database', 'purchase-flow-api.md'),
      title: 'Especificación de API: Flujo de Compra y Checkout Unificado',
      description: 'Endpoints para inicio de orden, verificación de balance en USDC, cotización de comisiones y confirmación de pago.',
      tags: ['api', 'checkout', 'purchase', 'usdc', 'endpoints'],
      category: 'API Specifications'
    },
    {
      src: path.join(knowledgeDir, 'api', 'endpoints', 'stake-distribution.md'),
      dest: path.join(VAULT_13_DIR, 'api-y-database', 'stake-distribution-api.md'),
      title: 'Especificación de API: Staking y Distribución de Rendimientos',
      description: 'Endpoints para consultar rentas devengadas, solicitar retiros de dividendos acumulados y verificar estado de claim.',
      tags: ['api', 'staking', 'yields', 'claims', 'endpoints'],
      category: 'API Specifications'
    },
    {
      src: path.join(knowledgeDir, 'api', 'endpoints', 'webhooks.md'),
      dest: path.join(VAULT_13_DIR, 'api-y-database', 'webhooks-api.md'),
      title: 'Especificación de API: Receptores de Webhooks Externos',
      description: 'Manejadores de eventos asíncronos provenientes de Stripe Identity, pasarelas de pago y monitoreo de blockchain.',
      tags: ['api', 'webhooks', 'stripe', 'helius', 'async'],
      category: 'API Specifications'
    },
    {
      src: path.join(knowledgeDir, 'api', 'rpc', 'metaplex-core.md'),
      dest: path.join(VAULT_13_DIR, 'api-y-database', 'metaplex-core-rpc.md'),
      title: 'Especificación de RPC: Métodos On-Chain de Metaplex Core',
      description: 'Detalle de llamadas RPC para lectura directa de assets, plugins, atributos y registros de autoridad en Solana.',
      tags: ['rpc', 'metaplex-core', 'solana', 'read-methods'],
      category: 'API Specifications'
    },
    {
      src: path.join(knowledgeDir, 'api', 'rpc', 'solana-methods.md'),
      dest: path.join(VAULT_13_DIR, 'api-y-database', 'solana-rpc-methods.md'),
      title: 'Especificación de RPC: Métodos Nativos de Solana y Priorización',
      description: 'Llamadas RPC esenciales para simulación de transacciones, cálculo de priority fees y confirmación con compromiso finalized.',
      tags: ['rpc', 'solana', 'priority-fees', 'helius'],
      category: 'API Specifications'
    },

    // 🛠️ 7. Operaciones, Procedimientos & Runbooks
    {
      src: path.join(knowledgeDir, 'operations', 'procedures', 'devnet-authority-lifecycle.md'),
      dest: path.join(VAULT_13_DIR, 'rfcs-tecnicos', 'devnet-authority-lifecycle.md'),
      title: 'Procedimiento Operativo: Ciclo de Vida de Autoridades Devnet',
      description: 'Protocolo paso a paso para la inicialización, rotación y delegación de autoridades en entornos de prueba devnet.',
      tags: ['operations', 'runbook', 'devnet', 'authority-lifecycle'],
      category: 'Operations & Runbooks'
    },
    {
      src: path.join(knowledgeDir, 'operations', 'procedures', 'candy-machine-deploy-validation.md'),
      dest: path.join(VAULT_13_DIR, 'rfcs-tecnicos', 'candy-machine-deploy-validation.md'),
      title: 'Procedimiento Operativo: Validación de Despliegues de Candy Machine',
      description: 'Lista de verificación técnica y pruebas de sanidad antes de abrir minteo público en colecciones inmobiliarias.',
      tags: ['operations', 'checklist', 'candy-machine', 'qa-validation'],
      category: 'Operations & Runbooks'
    },
    {
      src: path.join(knowledgeDir, 'operations', 'procedures', 'health-checks-monitoring.md'),
      dest: path.join(VAULT_13_DIR, 'rfcs-tecnicos', 'health-checks-monitoring.md'),
      title: 'Procedimiento Operativo: Monitoreo de Salud y Disponibilidad',
      description: 'Métricas de disponibilidad del nodo RPC, estado de conexiones a bases de datos y endpoints de health check.',
      tags: ['operations', 'monitoring', 'health-check', 'reliability'],
      category: 'Operations & Runbooks'
    },
    {
      src: path.join(knowledgeDir, 'operations', 'procedures', 'purchase-trace-verification.md'),
      dest: path.join(VAULT_13_DIR, 'rfcs-tecnicos', 'purchase-trace-verification.md'),
      title: 'Procedimiento Operativo: Verificación de Trazabilidad de Compras',
      description: 'Guía operativa para auditar órdenes atascadas, reconciliación manual y resolución de discrepancias en pagos.',
      tags: ['operations', 'support', 'purchase-tracing', 'reconciliation'],
      category: 'Operations & Runbooks'
    },
    {
      src: path.join(knowledgeDir, 'operations', 'procedures', 'backup-restore.md'),
      dest: path.join(VAULT_13_DIR, 'rfcs-tecnicos', 'backup-and-restore-procedures.md'),
      title: 'Procedimiento Operativo: Respaldo y Restauración de Datos',
      description: 'Políticas de respaldos continuos de Postgres, retención de snapshots y plan de recuperación ante desastres (DRP).',
      tags: ['operations', 'backup', 'drp', 'postgres', 'recovery'],
      category: 'Operations & Runbooks'
    }
  ];
}

function extractSectionFromMarkdown(content, sectionHeader) {
  const regex = new RegExp(`##\\s+${sectionHeader}[\\r\\n]+([\\s\\S]*?)(?=\\n##\\s+|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function generateDynamicStatusMatrix(knowledgeDir, gitInfo) {
  const destPath = path.join(VAULT_13_DIR, 'current-product-status-matrix.md');
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
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/02 Producto & Ingenieria/app-technical-roadmap-investor-brief.md|Roadmap Técnico e Investor Brief Completo]]
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
      console.log(`   ⚪ Sin cambios: 01 Negocio/02 Producto & Ingenieria/current-product-status-matrix.md (idéntico a commit ${gitInfo.sha})`);
      return false;
    }
    backupFile(destPath);
  }

  fs.writeFileSync(destPath, content, 'utf8');
  console.log(`   ✅ Matriz de Estado Generada: 01 Negocio/02 Producto & Ingenieria/current-product-status-matrix.md`);
  return true;
}

const RFC_METADATA_CONFIG = [
  {
    folder: 'EPIC-001-admin-asset-create-form',
    fileName: 'epic-001-admin-asset-create-form.md',
    id: 'EPIC-001',
    title: 'RFC EPIC-001: Formulario Administrativo de Creación de Activos',
    scope: 'Captura off-chain y almacenamiento en Google Cloud Storage con URLs firmadas y pipelines CSV.',
    status: 'Implemented'
  },
  {
    folder: 'EPIC-002-core-candy-machine-mint-module',
    fileName: 'epic-002-core-candy-machine-mint-module.md',
    id: 'EPIC-002',
    title: 'RFC EPIC-002: Módulo de Minteo con Metaplex Core Candy Machine',
    scope: 'Lógica on-chain en Solana para despliegue de Candy Machines con activos Metaplex Core.',
    status: 'Implemented (Devnet)'
  },
  {
    folder: 'EPIC-003-nft-store-purchase-flow',
    fileName: 'epic-003-nft-store-purchase-flow.md',
    id: 'EPIC-003',
    title: 'RFC EPIC-003: Flujo de Tienda y Compra de NFTs en USDC',
    scope: 'Checkout de compra directa con USDC, validación de balance y orquestación de minteo.',
    status: 'Implemented'
  },
  {
    folder: 'EPIC-004-user-profile-kyc-aml',
    fileName: 'epic-004-user-profile-kyc-aml.md',
    id: 'EPIC-004',
    title: 'RFC EPIC-004: Perfil de Usuario y Cumplimiento KYC/AML Stripe Identity',
    scope: 'Verificación biométrica no custodia, persistencia de estatus y compliance gates.',
    status: 'Foundation Built'
  },
  {
    folder: 'EPIC-005-full-migration-from-solana-web3-js-to-solana-kit',
    fileName: 'epic-005-migration-solana-kit.md',
    id: 'EPIC-005',
    title: 'RFC EPIC-005: Migración Completa de Solana Web3.js a Solana Kit',
    scope: 'Transición hacia la nueva suite modular de alto rendimiento @solana/kit.',
    status: 'Implemented'
  },
  {
    folder: 'EPIC-006-deploy-freeze-delegate-inheritance',
    fileName: 'epic-006-freeze-delegate-inheritance.md',
    id: 'EPIC-006',
    title: 'RFC EPIC-006: Despliegue de Delegación de Freeze y Gobernanza',
    scope: 'Configuración de delegados para congelamiento preventivo y traspaso de derechos.',
    status: 'Implemented'
  },
  {
    folder: 'EPIC-007-offline-recovery-protocol',
    fileName: 'epic-007-offline-recovery-protocol.md',
    id: 'EPIC-007',
    title: 'RFC EPIC-007: Protocolo de Recuperación Institucional ante Pérdida de Llaves',
    scope: 'Mecanismo legal y técnico para quemar y reemitir activos tras validación biométrica.',
    status: 'Specification / Built'
  },
  {
    folder: 'EPIC-008-recarga-recurrente-co-littio-sphere-solana',
    fileName: 'epic-008-recarga-recurrente-sphere-solana.md',
    id: 'EPIC-008',
    title: 'RFC EPIC-008: Recargas y On-Ramp Fiat Recurrente con Sphere y Littio',
    scope: 'Integración de rampas fiat para canalización de ahorros recurrentes hacia inversiones RWA.',
    status: 'In Progress'
  },
  {
    folder: 'EPIC-009-integracion-pasarela-de-pagos-web-2',
    fileName: 'epic-009-integracion-pasarela-pagos-web2.md',
    id: 'EPIC-009',
    title: 'RFC EPIC-009: Integración de Pasarela de Pagos Web2 y Tarjeta',
    scope: 'Procesamiento de tarjetas de crédito/débito para compra de fracciones inmobiliarias.',
    status: 'Partial'
  },
  {
    folder: 'EPIC-010-ai-discovery-infrastructure-and-seo-for-brids',
    fileName: 'epic-010-ai-discovery-seo.md',
    id: 'EPIC-010',
    title: 'RFC EPIC-010: Infraestructura de Descubrimiento por IA y SEO Técnico',
    scope: 'Capa semántica JSON-LD, feeds para motores generativos (GEO) y arquitectura de contenidos.',
    status: 'Implemented'
  },
  {
    folder: 'EPIC-011-admin-collections-console',
    fileName: 'epic-011-admin-collections-console.md',
    id: 'EPIC-011',
    title: 'RFC EPIC-011: Consola Administrativa de Colecciones y Proyectos',
    scope: 'Panel administrativo con geolocalización Maps, editor de galería y revisión de salud.',
    status: 'Implemented'
  },
  {
    folder: 'EPIC-012-referral-marketing-system-in-user-dashboard',
    fileName: 'epic-012-referral-marketing-system.md',
    id: 'EPIC-012',
    title: 'RFC EPIC-012: Sistema de Mercadeo de Referidos en Panel de Usuario',
    scope: 'Generación de links de referidos, tracking de atribución y bonificaciones en billetera.',
    status: 'Implemented'
  },
  {
    folder: 'EPIC-013-pwa-installability-and-web-push-notifications',
    fileName: 'epic-013-pwa-push-notifications.md',
    id: 'EPIC-013',
    title: 'RFC EPIC-013: Aplicación Progresiva (PWA) y Notificaciones Web Push',
    scope: 'Instalabilidad móvil tipo app nativa y entrega de notificaciones push transaccionales.',
    status: 'Implemented'
  },
  {
    folder: 'EPIC-014-stake-distribution-traceability',
    fileName: 'epic-014-stake-distribution-traceability.md',
    id: 'EPIC-014',
    title: 'RFC EPIC-014: Trazabilidad y Motor de Distribución de Rentas de Staking',
    scope: 'Infraestructura de cálculo de rendimientos inmobiliarios, tesorería y reclamos trazables.',
    status: 'Draft / Implemented Base'
  }
];

function syncRfcsCatalog(knowledgeDir, gitInfo) {
  const rfcsTargetDir = path.join(VAULT_13_DIR, 'rfcs-tecnicos');
  ensureDir(rfcsTargetDir);

  const rfcsSourceDir = path.join(knowledgeDir, 'rfcs');
  let generatedCount = 0;
  let unchangedCount = 0;

  const catalogRows = [];

  for (const item of RFC_METADATA_CONFIG) {
    const epicDir = path.join(rfcsSourceDir, item.folder);
    let srcFile = path.join(epicDir, 'README.md');
    if (!fs.existsSync(srcFile)) {
      srcFile = path.join(epicDir, 'index.md');
    }

    let bodyContent = '';
    if (fs.existsSync(srcFile)) {
      bodyContent = processSourceMarkdown(srcFile);
    } else {
      bodyContent = `## Resumen del Epic\n\n- **Identificador:** \`${item.id}\`\n- **Estado:** ${item.status}\n- **Alcance General:** ${item.scope}\n\n*Nota: El archivo de especificación detallada está registrado en el repositorio técnico institucional.*`;
    }

    const destPath = path.join(rfcsTargetDir, item.fileName);
    const formattedMd = formatDeliverable({
      title: item.title,
      description: item.scope,
      category: 'Technical RFCs',
      tags: ['rfc', 'epic', item.id.toLowerCase(), 'solana', 'architecture'],
      sourcePath: path.relative(CACHE_DIR, srcFile),
      contentBody: bodyContent,
      destPath,
      gitInfo,
      businessLinks: [
        `[[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]`,
        `[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/index.md|Catálogo Maestro de RFCs]]`,
        `[[01 Negocio/02 Producto & Ingenieria/current-product-status-matrix.md|Matriz Viva de Estado de Producto]]`
      ]
    });

    const srcHash = getSha256(bodyContent);

    if (fs.existsSync(destPath)) {
      const currentContent = fs.readFileSync(destPath, 'utf8');
      if (currentContent.includes(`source_hash: "${srcHash}"`) && currentContent.includes(`source_commit: "${gitInfo.sha}"`)) {
        unchangedCount++;
      } else {
        backupFile(destPath);
        fs.writeFileSync(destPath, formattedMd, 'utf8');
        console.log(`   ✅ RFC Actualizado: 01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/${item.fileName}`);
        generatedCount++;
      }
    } else {
      fs.writeFileSync(destPath, formattedMd, 'utf8');
      console.log(`   ✅ RFC Creado: 01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/${item.fileName}`);
      generatedCount++;
    }

    catalogRows.push(`| \`${item.id}\` | [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/${item.fileName}\\|${item.title.replace(/^RFC\s+[A-Z0-9-]+:\s*/, '')}]] | \`${item.status}\` | ${item.scope} |`);
  }

  // Generar el índice maestro de RFCs
  const indexDest = path.join(rfcsTargetDir, 'index.md');
  const indexContent = `# Catálogo Maestro de RFCs Técnicos de BRIDS (EPIC-001 al EPIC-014)

Este directorio contiene las especificaciones formales de arquitectura de software (**Request for Comments**) que definen cada uno de los grandes hitos de ingeniería y producto de **BRIDS.io**.

> [!NOTE]
> **Resumen del Catálogo:** Catálogo consolidado de los 14 Epics técnicos de la plataforma, sincronizados desde \`develop/knowledge/rfcs/\` (Commit: \`${gitInfo.sha}\`).
> Define desde la captura administrativa de activos, pasando por Candy Machine en Metaplex Core y checkout en USDC, hasta el motor de staking y distribución de rentas.

---

## 📊 Matriz Consolidada de Epics Técnicos

| Epic ID | Título del Documento | Estado de Implementación | Alcance y Propósito Principal |
|---|---|---|---|
${catalogRows.join('\n')}

---

## 🔗 Conexión con la Tesis de Negocio
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
- [[01 Negocio/02 Producto & Ingenieria/current-product-status-matrix.md|Matriz Viva de Estado y Madurez de Producto]]
- [[01 Negocio/02 Producto & Ingenieria/index.md|Portal Principal de Ingeniería]]
`;

  fs.writeFileSync(indexDest, indexContent, 'utf8');
  console.log(`   ✅ Índice de RFCs Generado: 01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/index.md`);

  return { generatedCount, unchangedCount };
}

function generateSubfolderIndices(gitInfo) {
  const subfolders = [
    {
      dir: path.join(VAULT_13_DIR, "arquitectura"),
      title: "Arquitectura Solana & Infraestructura Web3",
      description: "Especificaciones técnicas de alto nivel, autenticación dual SIWS/WorkOS, trazabilidad de transacciones on-chain y gobernanza de autoridades.",
      notes: [
        "[[01 Negocio/02 Producto & Ingenieria/arquitectura/architecture-overview.md|Arquitectura General del Sistema y Stack Tecnológico]]",
        "[[01 Negocio/02 Producto & Ingenieria/arquitectura/solana-stack-spec.md|Especificación Técnica de Infraestructura Solana]]",
        "[[01 Negocio/02 Producto & Ingenieria/arquitectura/auth-flow-workos-siws.md|Flujo de Autenticación Híbrida WorkOS y SIWS]]",
        "[[01 Negocio/02 Producto & Ingenieria/arquitectura/authority-model-and-multisig.md|Modelo de Autoridades On-Chain y Gobernanza Multi-Sig]]",
        "[[01 Negocio/02 Producto & Ingenieria/arquitectura/purchase-tracing-infrastructure.md|Infraestructura de Trazabilidad y Reconciliación de Compras]]",
        "[[01 Negocio/02 Producto & Ingenieria/arquitectura/key-rotation-and-emergency-spec.md|Protocolo de Rotación de Llaves y Procedimientos de Emergencia]]",
        "[[01 Negocio/02 Producto & Ingenieria/arquitectura/session-model-and-persistence.md|Modelo de Sesión y Persistencia Stateless vs Stateful]]",
        "[[01 Negocio/02 Producto & Ingenieria/arquitectura/devnet-proof-and-verifications.md|Evidencia Verificable y Despliegues en Devnet]]",
        "[[01 Negocio/02 Producto & Ingenieria/arquitectura/stake-audit-and-traceability.md|Auditoría y Trazabilidad del Mecanismo de Staking de Rentas]]",
        "[[01 Negocio/02 Producto & Ingenieria/arquitectura/third-party-integrations-registry.md|Registro de Integraciones y Servicios de Terceros]]",
        "[[01 Negocio/02 Producto & Ingenieria/arquitectura/toolchain-maintenance-policy.md|Política de Mantenimiento y Estándares de Toolchain]]",
        "[[01 Negocio/02 Producto & Ingenieria/arquitectura/rbac-permissions-model.md|Modelo de Control de Acceso Basado en Roles (RBAC)]]"
      ]
    },
    {
      dir: path.join(VAULT_13_DIR, "metaplex-core"),
      title: "Estándar Metaplex Core y Plugins RWA",
      description: "Especificaciones del estándar de NFTs de cuenta única de Metaplex Core en Solana, control de plugins de Freeze y protocolo de recuperación.",
      notes: [
        "[[01 Negocio/02 Producto & Ingenieria/metaplex-core/metaplex-core-nft-spec.md|Estándar Metaplex Core y Especificación de NFTs RWA]]",
        "[[01 Negocio/02 Producto & Ingenieria/metaplex-core/freeze-and-recovery-plugins.md|Máquina de Estados de Tokens y Protocolo de Recuperación]]"
      ]
    },
    {
      dir: path.join(VAULT_13_DIR, "seguridad"),
      title: "Seguridad, Modelos de Amenazas y Cumplimiento",
      description: "Modelos de amenazas de minteo y marketplace, guías de auditoría de smart contracts, políticas de manejo de datos privados y blindaje PCI.",
      notes: [
        "[[01 Negocio/02 Producto & Ingenieria/seguridad/threat-model-and-quality-policy.md|Modelo de Amenazas y Política de Seguridad Técnica]]",
        "[[01 Negocio/02 Producto & Ingenieria/seguridad/smart-contract-security-guidelines.md|Guía y Políticas de Seguridad para Smart Contracts]]",
        "[[01 Negocio/02 Producto & Ingenieria/seguridad/data-handling-and-privacy-compliance.md|Políticas de Manejo de Datos y Privacidad (KYC/AML)]]",
        "[[01 Negocio/02 Producto & Ingenieria/seguridad/pci-compliance-and-fiat-ramps.md|Cumplimiento PCI y Seguridad de Pasarelas Fiat]]",
        "[[01 Negocio/02 Producto & Ingenieria/seguridad/marketplace-threat-model.md|Modelo de Amenazas del Marketplace Inmobiliario]]",
        "[[01 Negocio/02 Producto & Ingenieria/seguridad/mint-orchestrator-threat-model.md|Modelo de Amenazas del Orquestador de Minteo]]",
        "[[01 Negocio/02 Producto & Ingenieria/seguridad/marketplace-security-audit-plan.md|Plan de Auditoría de Seguridad del Marketplace (BRI-164)]]"
      ]
    },
    {
      dir: path.join(VAULT_13_DIR, "api-y-database"),
      title: "APIs, Base de Datos y Modelos Prisma/Postgres",
      description: "Contratos de endpoints REST, manejadores de webhooks externos, llamadas RPC y esquemas de datos relacionales.",
      notes: [
        "[[01 Negocio/02 Producto & Ingenieria/api-y-database/marketplace-api.md|Especificación de API: Catálogo Público y Detalle de Inversión]]",
        "[[01 Negocio/02 Producto & Ingenieria/api-y-database/purchase-flow-api.md|Especificación de API: Flujo de Compra y Checkout Unificado]]",
        "[[01 Negocio/02 Producto & Ingenieria/api-y-database/auth-api.md|Especificación de API: Autenticación, Nonce y Sesión]]",
        "[[01 Negocio/02 Producto & Ingenieria/api-y-database/admin-assets-api.md|Especificación de API: Administración de Activos Inmobiliarios]]",
        "[[01 Negocio/02 Producto & Ingenieria/api-y-database/collections-api.md|Especificación de API: Gestión de Colecciones Metaplex Core]]",
        "[[01 Negocio/02 Producto & Ingenieria/api-y-database/mint-orchestrator-api.md|Especificación de API: Orquestador de Minteo y Emisión]]",
        "[[01 Negocio/02 Producto & Ingenieria/api-y-database/stake-distribution-api.md|Especificación de API: Staking y Distribución de Rendimientos]]",
        "[[01 Negocio/02 Producto & Ingenieria/api-y-database/webhooks-api.md|Especificación de API: Receptores de Webhooks Externos]]",
        "[[01 Negocio/02 Producto & Ingenieria/api-y-database/metaplex-core-rpc.md|Especificación de RPC: Métodos On-Chain de Metaplex Core]]",
        "[[01 Negocio/02 Producto & Ingenieria/api-y-database/solana-rpc-methods.md|Especificación de RPC: Métodos Nativos de Solana y Priorización]]",
        "[[01 Negocio/02 Producto & Ingenieria/api-y-database/user-profile-schema.md|Modelo de Datos: Perfil de Usuario y Estado KYC]]",
        "[[01 Negocio/02 Producto & Ingenieria/api-y-database/marketplace-entry-schema.md|Modelo de Datos: Catálogo Inmobiliario y Metadatos de Activos]]",
        "[[01 Negocio/02 Producto & Ingenieria/api-y-database/mint-job-schema.md|Modelo de Datos: Cola de Trabajos de Minteo Asíncrono]]",
        "[[01 Negocio/02 Producto & Ingenieria/api-y-database/purchase-attempt-schema.md|Modelo de Datos: Intentos de Compra y Registro de Órdenes]]",
        "[[01 Negocio/02 Producto & Ingenieria/api-y-database/stake-action-schema.md|Modelo de Datos: Registro de Acciones de Staking y Rentas]]",
        "[[01 Negocio/02 Producto & Ingenieria/api-y-database/authority-registry-schema.md|Modelo de Datos: Registro de Autoridades y Permisos Off-Chain]]"
      ]
    },
    {
      dir: path.join(VAULT_13_DIR, "rfcs-tecnicos"),
      title: "Catálogo de RFCs y Runbooks de Ingeniería",
      description: "Especificaciones formales de epics técnicos, procedimientos operativos estándar y runbooks de despliegue.",
      notes: [
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-001-admin-asset-create-form.md|EPIC-001: Formulario Administrativo de Creación de Activos]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-002-core-candy-machine-mint-module.md|EPIC-002: Módulo de Minteo con Metaplex Core Candy Machine]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-003-nft-store-purchase-flow.md|EPIC-003: Flujo de Tienda y Compra de NFTs en USDC]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-004-user-profile-kyc-aml.md|EPIC-004: Perfil de Usuario y Cumplimiento KYC/AML Stripe Identity]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-005-migration-solana-kit.md|EPIC-005: Migración Completa de Solana Web3.js a Solana Kit]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-006-freeze-delegate-inheritance.md|EPIC-006: Despliegue de Delegación de Freeze y Gobernanza]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-007-offline-recovery-protocol.md|EPIC-007: Protocolo de Recuperación Institucional ante Pérdida de Llaves]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-008-recarga-recurrente-sphere-solana.md|EPIC-008: Recargas y On-Ramp Fiat Recurrente con Sphere y Littio]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-009-integracion-pasarela-pagos-web2.md|EPIC-009: Integración de Pasarela de Pagos Web2 y Tarjeta]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-010-ai-discovery-seo.md|EPIC-010: Infraestructura de Descubrimiento por IA y SEO Técnico]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-011-admin-collections-console.md|EPIC-011: Consola Administrativa de Colecciones y Proyectos]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-012-referral-marketing-system.md|EPIC-012: Sistema de Mercadeo de Referidos en Panel de Usuario]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-013-pwa-push-notifications.md|EPIC-013: Aplicación Progresiva (PWA) y Notificaciones Web Push]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-014-stake-distribution-traceability.md|EPIC-014: Trazabilidad y Motor de Distribución de Rentas de Staking]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/devnet-authority-lifecycle.md|Procedimiento Operativo: Ciclo de Vida de Autoridades Devnet]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/candy-machine-deploy-validation.md|Procedimiento Operativo: Validación de Despliegues de Candy Machine]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/health-checks-monitoring.md|Procedimiento Operativo: Monitoreo de Salud y Disponibilidad]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/purchase-trace-verification.md|Procedimiento Operativo: Verificación de Trazabilidad de Compras]]",
        "[[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/backup-and-restore-procedures.md|Procedimiento Operativo: Respaldo y Restauración de Datos]]"
      ]
    }
  ];

  for (const sub of subfolders) {
    ensureDir(sub.dir);
    const indexPath = path.join(sub.dir, "index.md");
    const content = `# ${sub.title}

${sub.description}

> [!NOTE]
> **Sub-Índice de Dominio:** Sincronizado automáticamente desde el repositorio técnico oficial (\`jeisonsosablockdev/brids\`, commit: \`${gitInfo.sha}\`).

---

## 📌 Documentos Clave de este Dominio

${sub.notes.map(n => `- ${n}`).join("\n")}

---

## 🔗 Navegación Principal
- [[01 Negocio/02 Producto & Ingenieria/index.md|Volver al Portal de Producto & Ingeniería]]
- [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md|Conceptos Maestros de Negocio]]
`;
    fs.writeFileSync(indexPath, content, "utf8");
  }
}

function syncDeliverables(knowledgeDir) {
  console.log('\n' + '═'.repeat(75));
  console.log('⚙️ PROCESANDO Y MODULARIZANDO DOCUMENTACIÓN TÉCNICA CANÓNICA');
  console.log('═'.repeat(75));

  const gitInfo = getGitCommitInfo();
  console.log(`   📌 Commit Técnico de Origen: [${gitInfo.sha}] ${gitInfo.message}`);
  console.log(`   📅 Fecha de Snapshot:       ${gitInfo.date}\n`);

  const mappings = getCanonicalMappings(knowledgeDir);

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

    if (fs.existsSync(item.dest)) {
      const currentContent = fs.readFileSync(item.dest, 'utf8');

      if (currentContent.includes(`source_hash: "${srcHash}"`) && currentContent.includes(`source_commit: "${gitInfo.sha}"`)) {
        console.log(`   ⚪ Sin cambios: ${path.relative(BRAIN_DIR, item.dest)}`);
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

  // 1. Matriz de Madurez Viva
  const matrixUpdated = generateDynamicStatusMatrix(knowledgeDir, gitInfo);
  if (matrixUpdated) updatedCount++; else unchangedCount++;

  // 2. Catálogo Maestro de RFCs (14 Epics)
  const rfcResult = syncRfcsCatalog(knowledgeDir, gitInfo);
  updatedCount += rfcResult.generatedCount;
  unchangedCount += rfcResult.unchangedCount;

  // 3. Sub-índices de carpetas
  generateSubfolderIndices(gitInfo);

  // 4. Índice Maestro de la Sección 13
  updateSectionIndex(knowledgeDir, gitInfo);

  console.log(`\n📊 Balance de Sincronización Canónica:`);
  console.log(`   • Documentos actualizados/creados: ${updatedCount}`);
  console.log(`   • Documentos sin cambios:          ${unchangedCount}`);
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

  const indexContent = `# 01 Negocio/02 Producto & Ingenieria — Arquitectura Tecnológica y Smart Contracts

Este directorio constituye la **fuente canónica de especificaciones de ingeniería, arquitectura de smart contracts en Solana, modelos de datos, protocolos de seguridad y RFCs** de **BRIDS.io**.

> [!NOTE]
> **Tesis Tecnológica Fundamental:** *"Arquitectura de cuenta única de ultra-bajo coste con Metaplex Core en Solana, combinada con verificación biométrica en Stripe Identity, multisig institucional en Squads Protocol y pasarelas de pago híbridas crypto/fiat."*
> Toda la documentación en esta sección se sincroniza automáticamente desde el repositorio técnico oficial (\`jeisonsosablockdev/brids\`, rama \`develop\`) mediante \`sync-technical-docs.sh\`.
> 
> **Estado del Catálogo Técnico:**
> - 📌 **Último Commit Sincronizado:** \`${gitInfo.sha}\` (${gitInfo.date.split(' ')[0]})
> - 📦 **Total de Artefactos OKF en Repositorio:** ${totalArtifacts} documentos (Arquitectura, RFCs, APIs, DB, Seguridad, Operaciones).
> - 🛡️ **Garantía Anti-Drift:** Versionado continuo con respaldos automáticos en \`00 Inbox/Archive/\` y validación estricta de bóveda.

---

## 🧭 Mapa Canónico de Ingeniería (Estructura de Dominios)

### 🗺️ 1. Roadmap y Madurez de Producto (\`product-roadmap/\`)
- [[01 Negocio/02 Producto & Ingenieria/current-product-status-matrix.md|Matriz Viva de Estado y Madurez de Producto]]
- [[01 Negocio/02 Producto & Ingenieria/app-technical-roadmap-investor-brief.md|Roadmap Técnico e Investor Brief de Producto]]
- [[01 Negocio/02 Producto & Ingenieria/product-roadmap/index.md|Sub-Índice de Roadmap de Producto]]

### 🌐 2. Arquitectura Solana & Auth Híbrido (\`solana-architecture/\`)
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/architecture-overview.md|Arquitectura General del Sistema y Stack Tecnológico]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/solana-stack-spec.md|Especificación Técnica de Infraestructura Solana]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/auth-flow-workos-siws.md|Flujo de Autenticación Híbrida WorkOS y SIWS]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/authority-model-and-multisig.md|Modelo de Autoridades On-Chain y Gobernanza Multi-Sig]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/purchase-tracing-infrastructure.md|Infraestructura de Trazabilidad y Reconciliación de Compras]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/key-rotation-and-emergency-spec.md|Protocolo de Rotación de Llaves y Procedimientos de Emergencia]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/session-model-and-persistence.md|Modelo de Sesión y Persistencia Stateless vs Stateful]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/devnet-proof-and-verifications.md|Evidencia Verificable y Despliegues en Devnet]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/stake-audit-and-traceability.md|Auditoría y Trazabilidad del Mecanismo de Staking de Rentas]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/third-party-integrations-registry.md|Registro de Integraciones y Servicios de Terceros]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/toolchain-maintenance-policy.md|Política de Mantenimiento y Estándares de Toolchain]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/rbac-permissions-model.md|Modelo de Control de Acceso Basado en Roles (RBAC)]]
- [[01 Negocio/02 Producto & Ingenieria/arquitectura/index.md|Sub-Índice de Arquitectura Solana]]

### 🧩 3. Estándar Metaplex Core (\`metaplex-core-specs/\`)
- [[01 Negocio/02 Producto & Ingenieria/metaplex-core/metaplex-core-nft-spec.md|Estándar Metaplex Core y Especificación de NFTs RWA]]
- [[01 Negocio/02 Producto & Ingenieria/metaplex-core/freeze-and-recovery-plugins.md|Máquina de Estados de Tokens y Protocolo de Recuperación]]
- [[01 Negocio/02 Producto & Ingenieria/metaplex-core/index.md|Sub-Índice de Metaplex Core]]

### 🛡️ 4. Seguridad, Modelos de Amenazas y Auditorías (\`security-audits/\`)
- [[01 Negocio/02 Producto & Ingenieria/seguridad/threat-model-and-quality-policy.md|Modelo de Amenazas y Política de Seguridad Técnica]]
- [[01 Negocio/02 Producto & Ingenieria/seguridad/smart-contract-security-guidelines.md|Guía y Políticas de Seguridad para Smart Contracts]]
- [[01 Negocio/02 Producto & Ingenieria/seguridad/data-handling-and-privacy-compliance.md|Políticas de Manejo de Datos y Privacidad (KYC/AML)]]
- [[01 Negocio/02 Producto & Ingenieria/seguridad/pci-compliance-and-fiat-ramps.md|Cumplimiento PCI y Seguridad de Pasarelas Fiat]]
- [[01 Negocio/02 Producto & Ingenieria/seguridad/marketplace-threat-model.md|Modelo de Amenazas del Marketplace Inmobiliario]]
- [[01 Negocio/02 Producto & Ingenieria/seguridad/mint-orchestrator-threat-model.md|Modelo de Amenazas del Orquestador de Minteo]]
- [[01 Negocio/02 Producto & Ingenieria/seguridad/marketplace-security-audit-plan.md|Plan de Auditoría de Seguridad del Marketplace (BRI-164)]]
- [[01 Negocio/02 Producto & Ingenieria/seguridad/index.md|Sub-Índice de Seguridad y Auditorías]]

### 🗄️ 5. Arquitectura de Datos y Schemas (\`database-architecture/\`)
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/user-profile-schema.md|Modelo de Datos: Perfil de Usuario y Estado KYC]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/marketplace-entry-schema.md|Modelo de Datos: Catálogo Inmobiliario y Metadatos de Activos]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/mint-job-schema.md|Modelo de Datos: Cola de Trabajos de Minteo Asíncrono]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/purchase-attempt-schema.md|Modelo de Datos: Intentos de Compra y Registro de Órdenes]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/stake-action-schema.md|Modelo de Datos: Registro de Acciones de Staking y Rentas]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/authority-registry-schema.md|Modelo de Datos: Registro de Autoridades y Permisos Off-Chain]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/index.md|Sub-Índice de Base de Datos]]

### 🔌 6. Especificaciones de APIs & RPC (\`api-specifications/\`)
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/marketplace-api.md|Especificación de API: Catálogo Público y Detalle de Inversión]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/purchase-flow-api.md|Especificación de API: Flujo de Compra y Checkout Unificado]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/auth-api.md|Especificación de API: Autenticación, Nonce y Sesión]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/admin-assets-api.md|Especificación de API: Administración de Activos Inmobiliarios]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/collections-api.md|Especificación de API: Gestión de Colecciones Metaplex Core]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/mint-orchestrator-api.md|Especificación de API: Orquestador de Minteo y Emisión]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/stake-distribution-api.md|Especificación de API: Staking y Distribución de Rendimientos]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/webhooks-api.md|Especificación de API: Receptores de Webhooks Externos]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/metaplex-core-rpc.md|Especificación de RPC: Métodos On-Chain de Metaplex Core]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/solana-rpc-methods.md|Especificación de RPC: Métodos Nativos de Solana y Priorización]]
- [[01 Negocio/02 Producto & Ingenieria/api-y-database/index.md|Sub-Índice de APIs y RPC]]

### 📋 7. Catálogo Maestro de RFCs Técnicos (\`technical-rfcs/\`)
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/index.md|Índice Consolidado del Catálogo de RFCs (14 Epics)]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-001-admin-asset-create-form.md|EPIC-001: Formulario Administrativo de Creación de Activos]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-002-core-candy-machine-mint-module.md|EPIC-002: Módulo de Minteo con Metaplex Core Candy Machine]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-003-nft-store-purchase-flow.md|EPIC-003: Flujo de Tienda y Compra de NFTs en USDC]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-004-user-profile-kyc-aml.md|EPIC-004: Perfil de Usuario y Cumplimiento KYC/AML Stripe Identity]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-005-migration-solana-kit.md|EPIC-005: Migración Completa de Solana Web3.js a Solana Kit]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-006-freeze-delegate-inheritance.md|EPIC-006: Despliegue de Delegación de Freeze y Gobernanza]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-007-offline-recovery-protocol.md|EPIC-007: Protocolo de Recuperación Institucional ante Pérdida de Llaves]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-008-recarga-recurrente-sphere-solana.md|EPIC-008: Recargas y On-Ramp Fiat Recurrente con Sphere y Littio]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-009-integracion-pasarela-pagos-web2.md|EPIC-009: Integración de Pasarela de Pagos Web2 y Tarjeta]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-010-ai-discovery-seo.md|EPIC-010: Infraestructura de Descubrimiento por IA y SEO Técnico]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-011-admin-collections-console.md|EPIC-011: Consola Administrativa de Colecciones y Proyectos]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-012-referral-marketing-system.md|EPIC-012: Sistema de Mercadeo de Referidos en Panel de Usuario]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-013-pwa-push-notifications.md|EPIC-013: Aplicación Progresiva (PWA) y Notificaciones Web Push]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/epic-014-stake-distribution-traceability.md|EPIC-014: Trazabilidad y Motor de Distribución de Rentas de Staking]]

### 🛠️ 8. Operaciones, Procedimientos & Runbooks (\`operations-and-runbooks/\`)
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/devnet-authority-lifecycle.md|Procedimiento Operativo: Ciclo de Vida de Autoridades Devnet]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/candy-machine-deploy-validation.md|Procedimiento Operativo: Validación de Despliegues de Candy Machine]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/health-checks-monitoring.md|Procedimiento Operativo: Monitoreo de Salud y Disponibilidad]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/purchase-trace-verification.md|Procedimiento Operativo: Verificación de Trazabilidad de Compras]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/backup-and-restore-procedures.md|Procedimiento Operativo: Respaldo y Restauración de Datos]]
- [[01 Negocio/02 Producto & Ingenieria/rfcs-tecnicos/index.md|Sub-Índice de Operaciones y Runbooks]]

---

## 🎯 Custodios y Subagentes Asignados
- **Custodios Primarios:** Equipo de Ingeniería, \`compliance-officer\`, \`pitch-deck-architect\`, \`business-consultant\`.
- **Conceptos de Referencia:**
  - [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-solana-rwa-infrastructure.md|C3: Solana RWA Advantage]]
  - [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-wallet-recovery-protocol.md|C2: Lost-Key Recovery Protocol]]
  - [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-multisig-treasury-governance.md|C8: Squads Multi-Sig Governance]]
  - [[01 Negocio/01 Estrategia & Modelo/Business Concepts/concept-dual-entity-compliance.md|C4: Dual-Entity Compliance]]
`;

  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log(`   ✅ Índice Maestro de Sección Actualizado: 01 Negocio/02 Producto & Ingenieria/index.md (Catálogo OKF: ${totalArtifacts} artefactos)`);
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
    if (err.stdout) console.log(err.stdout);
    process.exit(1);
  }
}

function syncBrandAssets() {
  console.log('\n' + '═'.repeat(75));
  console.log('🎨 SINCRONIZANDO ASSETS OFICIALES DE BRANDING (apps/web/public/brand)');
  console.log('═'.repeat(75));

  const brandSrcDir = path.join(CACHE_DIR, 'apps', 'web', 'public', 'brand');
  const brandEngineDir = path.join(ENGINE_DIR, 'brand');
  const brandVaultDir = path.join(BRAIN_DIR, '02 Marketing', '01 Contexto de Marca', 'Assets');

  if (!fs.existsSync(brandSrcDir)) {
    console.warn('   ⚠️ No se encontró la carpeta apps/web/public/brand en el repositorio técnico.');
    return;
  }

  ensureDir(brandEngineDir);
  ensureDir(brandVaultDir);

  const files = fs.readdirSync(brandSrcDir).filter(f => f.endsWith('.svg'));
  for (const file of files) {
    const srcPath = path.join(brandSrcDir, file);
    const destPath = path.join(brandEngineDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`   📦 Asset copiado: ${file}`);
  }

  // Generar variante dark de brids-logo para fondos claros/papel LaTeX
  const logoSvgPath = path.join(brandEngineDir, 'brids-logo.svg');
  const logoDarkSvgPath = path.join(brandEngineDir, 'brids-logo-dark.svg');
  if (fs.existsSync(logoSvgPath)) {
    const svgContent = fs.readFileSync(logoSvgPath, 'utf8');
    const darkSvg = svgContent.replace(/fill:\s*#fff;/g, 'fill: #0B192C;');
    fs.writeFileSync(logoDarkSvgPath, darkSvg, 'utf8');
    console.log('   🌓 Variante creada: brids-logo-dark.svg (Texto Azul Institucional #0B192C)');
  }

  // Convertir a PDF vectorial y PNG de alta resolución si rsvg-convert está disponible
  let hasRsvg = false;
  try {
    execSync('rsvg-convert --version', { stdio: 'ignore' });
    hasRsvg = true;
  } catch {}

  if (hasRsvg) {
    console.log('   ⚙️ Generando artefactos vectoriales (PDF) y raster (PNG) con rsvg-convert...');
    const svgFiles = fs.readdirSync(brandEngineDir).filter(f => f.endsWith('.svg'));
    for (const svgFile of svgFiles) {
      const base = path.basename(svgFile, '.svg');
      const svgPath = path.join(brandEngineDir, svgFile);
      const pdfPath = path.join(brandEngineDir, `${base}.pdf`);
      const pngPath = path.join(brandEngineDir, `${base}.png`);
      const width = base.includes('logo') ? 1024 : 512;

      try {
        execSync(`rsvg-convert -f pdf -o "${pdfPath}" "${svgPath}"`);
        execSync(`rsvg-convert -f png -w ${width} -o "${pngPath}" "${svgPath}"`);
      } catch (err) {
        console.warn(`   ⚠️ Error convirtiendo ${svgFile}:`, err.message);
      }
    }
  }

  // Copiar todo al vault en 02 Marketing/01 Contexto de Marca/Assets
  const engineFiles = fs.readdirSync(brandEngineDir);
  for (const ef of engineFiles) {
    fs.copyFileSync(path.join(brandEngineDir, ef), path.join(brandVaultDir, ef));
  }
  console.log(`   ✅ Sincronizados ${engineFiles.length} assets de branding en BRIDS-Engine/brand y Vault.`);
}

function main() {
  const args = process.argv.slice(2);
  const forceClone = args.includes('--force') || args.includes('-f');
  
  try {
    const knowledgeDir = fetchTechnicalRepo(forceClone);
    syncBrandAssets();
    syncDeliverables(knowledgeDir);
    runAudit();
    console.log('✨ Ingesta y sincronización técnica completada con éxito y 100% en conformidad con la bóveda.');
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
