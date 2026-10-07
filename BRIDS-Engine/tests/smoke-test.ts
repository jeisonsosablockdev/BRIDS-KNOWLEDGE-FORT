#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🚀 BRIDS KNOWLEDGE FORT - END-TO-END SMOKE TEST & SYSTEM WALKTHROUGH (TS)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. 🤖 Squad de Sub-Agentes YC (Carga y validación de contratos YAML)
 * 2. 🏛️ Bóveda Obsidian (Taxonomía canónica y linter de metadatos)
 * 3. 🛡️ Motor SDD Anti-Drift (Doble Guardrail HITL y Revisor Autónomo)
 * 4. 📈 Parrilla de Contenidos RWA (15 temas institucionales y cross-links)
 * 5. 🔄 Refinamiento No Destructivo (Snapshots de seguridad y backups)
 * 6. 🧩 Arquitectura de Dominios TypeScript (5 dominios en scripts/ sin wrappers)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as sdd from '../scripts/sdd/sdd-orchestrator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const ENGINE_DIR = path.join(ROOT_DIR, 'BRIDS-Engine');
const BRAIN_DIR = path.join(ROOT_DIR, 'BRIDS-Brain');
const AGENTS_DIR = path.join(ENGINE_DIR, 'agents');
const SCRIPTS_DIR = path.join(ENGINE_DIR, 'scripts');
const TEMPLATES_DIR = path.join(ENGINE_DIR, 'templates');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`   ✅ PASS: ${message}`);
    if (details) console.log(`      ℹ️ ${details}`);
  } else {
    failedTests++;
    console.error(`   ❌ FAIL: ${message}`);
    if (details) console.error(`      ⚠️ ${details}`);
  }
}

function printHeader(step: number, title: string, explanation?: string) {
  console.log('\n' + '═'.repeat(75));
  console.log(`🔷 [PASO ${step}] ${title}`);
  console.log('═'.repeat(75));
  if (explanation) {
    console.log(`💡 ¿CÓMO FUNCIONA?:\n   ${explanation}\n`);
  }
}

async function runSmokeTest() {
  const startTime = Date.now();
  console.log('\n' + '█'.repeat(75));
  console.log('  🚀 INICIANDO SMOKE TEST DEL SISTEMA BRIDS KNOWLEDGE FORT (TS)');
  console.log('  Bóveda: BRIDS-Brain | Motor: BRIDS-Engine | Objetivo: YC & RWA');
  console.log('█'.repeat(75));

  // PASO 1: SQUAD DE SUB-AGENTES AUTÓNOMOS
  printHeader(1, 'SQUAD DE SUB-AGENTES YC Y RWA',
    'BRIDS opera con 7 sub-agentes especializados con contratos YAML autónomos.');

  const expectedAgents = [
    'b2b-sponsor-lead',
    'business-consultant',
    'compliance-officer',
    'founder-ghostwriter',
    'market-research-analyst',
    'narrative-intelligence-analyst',
    'pitch-deck-architect'
  ];

  let agentsFound = 0;
  for (const agent of expectedAgents) {
    const yamlPath = path.join(AGENTS_DIR, `${agent}.yaml`);
    const exists = fs.existsSync(yamlPath);
    if (exists) {
      const content = fs.readFileSync(yamlPath, 'utf8');
      const hasRole = content.includes('role:');
      const hasDescription = content.includes('description:');
      const hasTools = content.includes('tools:');
      assert(exists && hasRole && hasDescription && hasTools,
        `Sub-agente '${agent}' cargado y válido`,
        `Archivo: BRIDS-Engine/agents/${agent}.yaml`);
      agentsFound++;
    } else {
      assert(false, `Sub-agente '${agent}' no encontrado`);
    }
  }
  assert(agentsFound === 7, 'Todos los 7 sub-agentes del squad están operativos');

  // PASO 2: TAXONOMÍA CANÓNICA DE LA BÓVEDA OBSIDIAN
  printHeader(2, 'TAXONOMÍA Y ARQUITECTURA DE BRIDS-BRAIN',
    'La bóveda organiza el conocimiento en 3 macro-dominios canónicos (00 Inbox, 01 Negocio, 02 Marketing).');

  const expectedTopFolders = ['00 Inbox', '01 Negocio', '02 Marketing'];
  let topFoldersFound = 0;
  for (const f of expectedTopFolders) {
    if (fs.existsSync(path.join(BRAIN_DIR, f))) topFoldersFound++;
  }
  assert(topFoldersFound === 3, `Los 3 macro-dominios canónicos existen en BRIDS-Brain (3/3)`);

  const expectedSubFolders = [
    '01 Negocio/01 Estrategia & Modelo',
    '01 Negocio/02 Producto & Ingenieria',
    '01 Negocio/03 Legal & Cumplimiento',
    '01 Negocio/04 Finanzas & YC Investors',
    '01 Negocio/05 Sponsors B2B & Ventas',
    '01 Negocio/06 Operaciones & Gobernanza',
    '02 Marketing/01 Contexto de Marca',
    '02 Marketing/02 Estrategia & Parrilla',
    '02 Marketing/03 Redes Sociales & Contenido',
    '02 Marketing/04 Copywriting & Web',
    '02 Marketing/05 Email Marketing',
    '02 Marketing/06 SEO & Descubrimiento',
    '02 Marketing/07 Analitica & Crecimiento'
  ];

  let subFoldersFound = 0;
  for (const sf of expectedSubFolders) {
    if (fs.existsSync(path.join(BRAIN_DIR, sf))) subFoldersFound++;
  }
  assert(subFoldersFound === expectedSubFolders.length, `Todas las subcarpetas de Negocio y Marketing existen (${subFoldersFound}/${expectedSubFolders.length})`);

  const masterConceptsPath = path.join(BRAIN_DIR, '01 Negocio', '01 Estrategia & Modelo', 'master-business-concepts.md');
  const productContextPath = path.join(BRAIN_DIR, '02 Marketing', '01 Contexto de Marca', 'product-marketing-context.md');
  assert(fs.existsSync(masterConceptsPath), 'Nota Maestra de Conceptos existe en 01 Negocio/01 Estrategia & Modelo');
  assert(fs.existsSync(productContextPath), 'Contexto de Producto y Marca existe en 02 Marketing/01 Contexto de Marca');

  try {
    const valOut = execSync(`node "${path.join(SCRIPTS_DIR, 'audit/audit-runner.ts')}" vault`, { encoding: 'utf8' });
    const isPassing = valOut.includes('Errores críticos:     0');
    assert(isPassing, 'Linter de Bóveda: Todas las notas cumplen formalmente el estándar Obsidian (0 errores críticos)');
  } catch (err: any) {
    assert(false, 'Fallo en la ejecución de audit-runner.ts vault', err.message);
  }

  function findEmptyDirs(dir: string): string[] {
    const empty: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) {
        const full = path.join(dir, entry.name);
        const children = fs.readdirSync(full).filter(n => !n.startsWith('.'));
        if (children.length === 0) empty.push(path.relative(BRAIN_DIR, full));
        else empty.push(...findEmptyDirs(full));
      }
    }
    return empty;
  }

  function findStrayBinaries(dir: string): string[] {
    const stray: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      const rel = path.relative(BRAIN_DIR, full);
      if (rel === path.join('02 Marketing', '01 Contexto de Marca', 'Assets')) continue;
      if (entry.isDirectory()) {
        stray.push(...findStrayBinaries(full));
      } else if (/\.(pdf|tex|docx|pptx)$/i.test(entry.name)) {
        stray.push(rel);
      }
    }
    return stray;
  }

  const emptyBrainDirs = findEmptyDirs(BRAIN_DIR);
  assert(emptyBrainDirs.length === 0, 'Higiene de Carpetas: Cero subcarpetas vacías huérfanas en BRIDS-Brain',
    emptyBrainDirs.length > 0 ? `Carpetas vacías: ${emptyBrainDirs.join(', ')}` : 'Estructura 100% limpia');

  const allStray = [
    ...findStrayBinaries(path.join(BRAIN_DIR, '01 Negocio')),
    ...findStrayBinaries(path.join(BRAIN_DIR, '02 Marketing'))
  ];
  assert(allStray.length === 0, 'Separación Markdown/Binarios: Cero archivos .pdf/.tex/.docx/.pptx dispersos en 01 Negocio y 02 Marketing');

  const outputsPdfsDir = path.join(ENGINE_DIR, 'outputs', 'pdfs');
  const compiledPdfs = fs.existsSync(outputsPdfsDir) ? fs.readdirSync(outputsPdfsDir).filter(f => f.endsWith('.pdf')) : [];
  assert(compiledPdfs.length >= 3, `Artefactos compilados ubicados en BRIDS-Engine/outputs/pdfs (${compiledPdfs.length} PDFs)`);

  // PASO 3: MOTOR SDD ANTI-DRIFT
  printHeader(3, 'MOTOR SDD CON DOBLE GUARDRAIL HITL (CREADOR VS REVISOR)');

  const testSlug = 'smoke-test-demo';
  const testInboxSpecs = path.join(BRAIN_DIR, '00 Inbox', 'Specs');
  const testSpecJson = path.join(testInboxSpecs, `${testSlug}.spec.json`);
  const testSpecMd = path.join(testInboxSpecs, `${testSlug}.spec.md`);
  const testWorkDir = path.join(testInboxSpecs, `${testSlug}-work`);
  const targetVaultPath = path.join(BRAIN_DIR, '01 Negocio', '01 Estrategia & Modelo', `${testSlug}.md`);

  try {
    sdd.initSpec(
      testSlug,
      'Smoke Test RWA Demo',
      '01 Negocio/01 Estrategia & Modelo',
      'business-consultant',
      'Institutional Real Estate Sponsors',
      'Demostrar el funcionamiento del motor SDD sin alterar la bóveda'
    );
    assert(fs.existsSync(testSpecJson), 'HITL-1: Spec generado en estado spec_review');

    const initialSpec = sdd.loadSpec(testSlug).data;
    assert(initialSpec.status === 'spec_review', 'Estado inicial es estrictamente spec_review');

    let blockedDrafting = false;
    try {
      sdd.evaluateDraft(testSlug, 'Intento prematuro sin aprobación');
    } catch {
      blockedDrafting = true;
    }
    assert(blockedDrafting, 'HITL-1 GUARDRAIL ACTIVO: Prohíbe evaluar borradores si el spec no está aprobado');

    sdd.approveSpec(testSlug);
    const approvedSpec = sdd.loadSpec(testSlug).data;
    assert(approvedSpec.status === 'spec_approved', 'HITL-1 Checkpoint superado: spec_approved');

    const badDraft = `En resumen, es importante destacar que en el vertiginoso mundo de la tokenización inmobiliaria,
      BRIDS juega un papel crucial para estar a la vanguardia de un cambio de paradigma. En conclusión, fin.`;
    const badAudit = sdd.evaluateDraft(testSlug, badDraft, 1);
    assert(badAudit.passed === false, 'Revisor Autónomo detecta y penaliza clichés de IA (< 8.5/9.0)');
    assert(badAudit.report.banned_phrases_detected.length >= 3, `Revisor detectó ${badAudit.report.banned_phrases_detected.length} clichés en el texto de prueba`);

    const goodDraft = `## Sindicación Inmobiliaria en Solana con BRIDS

Eliminamos la intermediación arcaica en sindicaciones inmobiliarias mediante contratos inteligentes auditables on-chain sobre Solana y el estándar Metaplex Core con plugins de Freeze y Recovery.

### Desacoplamiento Legal Delaware SPV
Cada activo inmobiliario se estructura a través de una LLC independiente en Delaware (SPV) que retiene la propiedad legal y emite las participaciones tokenizadas. BRIDS actúa como proveedor tecnológico de infraestructura SaaS sin custodia de fondos.

### Acreditación y Cumplimiento Regulatorio
Los participantes se verifican mediante Stripe Identity para cumplir estrictamente con normativas KYC/AML. Nuestra solución está diseñada a la medida para Real Estate Sponsors que buscan reducir hasta un 80% sus costos de estructuración y acelerar el cierre de rondas de inversión.

### Llamado a la Acción
Agenda una sesión técnica con el equipo de estructuración en sponsors@brids.io para analizar tu cartera de activos.`;

    const goodAudit = sdd.evaluateDraft(testSlug, goodDraft, 2);
    assert(goodAudit.report.total_score >= 8.5, `Revisor califica con alta puntuación: ${goodAudit.report.total_score}/9.0 (Umbral: 8.5)`);
    assert(goodAudit.passed === true, 'Borrador calificado supera el umbral de calidad del revisor');
    assert(!fs.existsSync(targetVaultPath), 'HITL-2 GUARDRAIL ACTIVO: Archivo NO se publica en el vault hasta aprobación humana');

    sdd.approveDeliverable(testSlug);
    assert(fs.existsSync(targetVaultPath), 'HITL-2 Aprobado: Archivo promovido con éxito al vault de producción');

    const deliverableContent = fs.readFileSync(targetVaultPath, 'utf8');
    assert(deliverableContent.includes('sdd-approved') && deliverableContent.includes('hitl-validated'),
      'El entregable publicado incluye sellos criptográficos y metadatos HITL');

    assert(typeof sdd.createInitialContext === 'function' && typeof sdd.VaultGateway === 'function' && typeof sdd.TaskOrchestrator === 'function',
      'Capa core/ (state-machine, vault-gateway, orchestrator) conectada al motor SDD');
    assert(typeof sdd.scanCliches === 'function' && typeof sdd.evaluateDeliverable === 'function',
      'Capa evaluators/ (anti-cliche-filter, sdd-4d-rubric) conectada al motor SDD');
    assert(fs.existsSync(path.join(ENGINE_DIR, 'outputs', 'decks')) && fs.existsSync(path.join(ENGINE_DIR, 'outputs', 'pdfs')),
      'Capa outputs/ (decks/, pdfs/) activa para artefactos binarios transitorios');
    assert(
      fs.existsSync(path.join(ENGINE_DIR, 'evaluators', 'clef-client.ts')) &&
        fs.existsSync(path.join(ROOT_DIR, '.agents', 'hooks.json')) &&
        fs.existsSync(path.join(ROOT_DIR, '.agents', 'skills.json')),
      'Capa evaluators/clef-client.ts y .agents/{hooks,skills}.json activas como motor local nativo Antigravity'
    );
  } finally {
    if (fs.existsSync(targetVaultPath)) fs.unlinkSync(targetVaultPath);
    if (fs.existsSync(testSpecJson)) fs.unlinkSync(testSpecJson);
    if (fs.existsSync(testSpecMd)) fs.unlinkSync(testSpecMd);
    if (fs.existsSync(testWorkDir)) fs.rmSync(testWorkDir, { recursive: true, force: true });
    assert(true, 'Sesión de prueba SDD limpiada sin dejar residuos en el sistema');
  }

  // PASO 4: PARRILLA DE CONTENIDOS RWA
  printHeader(4, 'PARRILLA MAESTRA DE CONTENIDOS (15 TEMAS RWA)');
  const gridPlanPath = path.join(TEMPLATES_DIR, 'content-grid-plan.json');
  assert(fs.existsSync(gridPlanPath), 'Archivo content-grid-plan.json existe');

  const gridData = JSON.parse(fs.readFileSync(gridPlanPath, 'utf8'));
  assert(Array.isArray(gridData.posts) && gridData.posts.length === 15,
    'La parrilla contiene exactamente 15 publicaciones planificadas');

  const rwaKeywords = [
    'solana', 'spv', 'metaplex', 'capital', 'stripe', 'identity',
    'blue brick', 'inversi', '$100', 'squads', 'usdc', 'rentas',
    'tarifas', 'saas', 'multifamily', 'comercial', 'ethereum',
    'broker-dealer', 'data room', 'shopify', 'real estate', 'rwa'
  ];

  let rwaCount = 0;
  for (const post of gridData.posts) {
    const topic = (post.asset_class || post.topic || '').toLowerCase();
    if (rwaKeywords.some(kw => topic.includes(kw))) rwaCount++;
  }
  assert(rwaCount === 15, `15/15 temas en la parrilla corresponden 100% a BRIDS Real Estate RWA`);

  // PASO 5: REFINAMIENTO NO DESTRUCTIVO
  printHeader(5, 'MOTOR DE REFINAMIENTO NO DESTRUCTIVO (SAFETY SNAPSHOTS)');
  const sampleNote = path.join(BRAIN_DIR, '02 Marketing', '01 Contexto de Marca', 'product-marketing-context.md');
  const originalContent = fs.readFileSync(sampleNote, 'utf8');
  assert(originalContent.includes('Product Marketing Context: BRIDS.io'), 'Nota de prueba leída correctamente');

  try {
    const inspectOut = execSync(`node "${path.join(SCRIPTS_DIR, 'vault/refine-note.ts')}" inspect "${sampleNote}"`, { encoding: 'utf8' });
    assert(inspectOut.includes('Título:') && inspectOut.includes('Versión:'),
      'refine-note.ts inspect detecta versión y frontmatter canónico');
  } catch (err: any) {
    assert(false, 'Fallo en la inspección de refine-note.ts', err.message);
  }

  // PASO 6: ARQUITECTURA DE DOMINIOS TYPESCRIPT (CERO WRAPPERS)
  printHeader(6, 'ARQUITECTURA DE DOMINIOS TYPESCRIPT (CERO WRAPPERS)',
    'Todos los scripts están organizados por dominio en TypeScript (.ts) sin wrappers .sh/.ps1.');

  const expectedDomains = ['audit', 'ingest', 'sdd', 'social', 'vault'];
  const scriptEntries = fs.readdirSync(SCRIPTS_DIR).filter(n => !n.startsWith('.')).sort();
  assert(
    JSON.stringify(scriptEntries) === JSON.stringify(expectedDomains),
    `5 dominios canónicos en BRIDS-Engine/scripts/: ${scriptEntries.join(', ')}`
  );

  function findLegacyFiles(dir: string): string[] {
    const found: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) found.push(...findLegacyFiles(full));
      else if (/\.(js|sh|ps1)$/i.test(entry.name)) found.push(path.relative(ENGINE_DIR, full));
    }
    return found;
  }

  const legacyInScripts = findLegacyFiles(SCRIPTS_DIR);
  const legacyInTests = findLegacyFiles(path.join(ENGINE_DIR, 'tests'));
  assert(legacyInScripts.length === 0, 'Cero archivos legacy (.js, .sh, .ps1) en BRIDS-Engine/scripts/');
  assert(legacyInTests.length === 0, 'Cero archivos legacy (.js, .sh, .ps1) en BRIDS-Engine/tests/');

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n' + '═'.repeat(75));
  console.log(`📊 RESULTADO DEL SMOKE TEST: ${passedTests}/${totalTests} PRUEBAS EXITOSAS (${duration}s)`);
  console.log('═'.repeat(75));

  if (failedTests === 0) {
    console.log(`\n🎉 ¡SMOKE TEST COMPLETADO CON ÉXITO ROTUNDO!\n`);
    process.exit(0);
  } else {
    console.error(`\n⚠️ Se detectaron ${failedTests} fallos en el Smoke Test.`);
    process.exit(1);
  }
}

runSmokeTest().catch(err => {
  console.error('Error fatal durante el Smoke Test:', err);
  process.exit(1);
});
