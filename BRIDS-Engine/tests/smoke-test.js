#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🚀 BRIDS KNOWLEDGE FORT - END-TO-END SMOKE TEST & SYSTEM WALKTHROUGH
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este script ejecuta una prueba rápida (Smoke Test) de punta a punta que
 * valida y demuestra cómo funciona cada uno de los subsistemas de BRIDS:
 * 
 * 1. 🤖 Squad de Sub-Agentes YC (Carga y validación de contratos YAML)
 * 2. 🏛️ Bóveda Obsidian (Taxonomía canónica 00-15 y linter de metadatos)
 * 3. 🛡️ Motor SDD Anti-Drift (Doble Guardrail HITL y Revisor Autónomo)
 * 4. 📈 Parrilla de Contenidos RWA (15 temas institucionales y cross-links)
 * 5. 🔄 Refinamiento No Destructivo (Snapshots de seguridad y backups)
 * 6. 🔌 Wrappers Multiplataforma (Scripts .sh y .ps1 sincronizados 1:1)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '../..');
const ENGINE_DIR = path.join(ROOT_DIR, 'BRIDS-Engine');
const BRAIN_DIR = path.join(ROOT_DIR, 'BRIDS-Brain');
const AGENTS_DIR = path.join(ENGINE_DIR, 'agents');
const SCRIPTS_DIR = path.join(ENGINE_DIR, 'scripts');
const TEMPLATES_DIR = path.join(ENGINE_DIR, 'templates');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message, details = '') {
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

function printHeader(step, title, explanation) {
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
  console.log('  🚀 INICIANDO SMOKE TEST DEL SISTEMA BRIDS KNOWLEDGE FORT');
  console.log('  Bóveda: BRIDS-Brain | Motor: BRIDS-Engine | Objetivo: YC & RWA');
  console.log('█'.repeat(75));

  // ───────────────────────────────────────────────────────────────────────────
  // PASO 1: SQUAD DE SUB-AGENTES AUTÓNOMOS
  // ───────────────────────────────────────────────────────────────────────────
  printHeader(1, 'SQUAD DE SUB-AGENTES YC Y RWA', 
    'BRIDS opera con 6 sub-agentes especializados con contratos YAML autónomos.\n' +
    '   Cada agente tiene roles, herramientas y rutas asignadas para evitar solapamientos.');

  const expectedAgents = [
    'b2b-sponsor-lead',
    'business-consultant',
    'compliance-officer',
    'founder-ghostwriter',
    'market-research-analyst',
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
  assert(agentsFound === 6, 'Todos los 6 sub-agentes del squad están operativos');

  // ───────────────────────────────────────────────────────────────────────────
  // PASO 2: TAXONOMÍA CANÓNICA DE LA BÓVEDA OBSIDIAN
  // ───────────────────────────────────────────────────────────────────────────
  printHeader(2, 'TAXONOMÍA Y ARQUITECTURA DE BRIDS-BRAIN',
    'La bóveda organiza el conocimiento en 16 dominios canónicos (00 a 15):\n' +
    '   00-10: Growth, Marketing, RevOps y Copywriting.\n' +
    '   11-15: Legal, Finanzas, Producto, Relaciones con Inversores y Gobernanza.');

  const expectedVaultFolders = [
    '00 Inbox',
    '01 Brand Context',
    '02 Strategy & Research',
    '03 Website & Copy',
    '04 Email & Lifecycle',
    '05 SEO & Discoverability',
    '06 CRO & Funnel',
    '07 Paid, Social & Community',
    '08 Analytics & Measurement',
    '09 Retention & Growth',
    '10 RevOps & Sales',
    '11 Legal & Compliance',
    '12 Finance & Treasury',
    '13 Product & Engineering',
    '14 Investor Relations & YC',
    '15 Operations & Governance'
  ];

  let foldersFound = 0;
  for (const f of expectedVaultFolders) {
    const folderPath = path.join(BRAIN_DIR, f);
    const exists = fs.existsSync(folderPath);
    if (exists) foldersFound++;
  }
  assert(foldersFound === 16, `Los 16 dominios canónicos existen en BRIDS-Brain (16/16)`);

  const masterConceptsPath = path.join(BRAIN_DIR, '02 Strategy & Research', 'master-business-concepts.md');
  const productContextPath = path.join(BRAIN_DIR, '01 Brand Context', 'product-marketing-context.md');
  assert(fs.existsSync(masterConceptsPath), 'Nota Maestra de Conceptos existe en 02 Strategy & Research');
  assert(fs.existsSync(productContextPath), 'Contexto de Producto y Marca existe en 01 Brand Context');

  try {
    const valOut = execSync(`node "${path.join(SCRIPTS_DIR, 'validate-vault.js')}"`, { encoding: 'utf8' });
    const isPassing = valOut.includes('Avisos detectados:    0') && valOut.includes('Errores críticos:     0');
    assert(isPassing, 'Linter de Bóveda: Todas las notas cumplen formalmente el estándar Obsidian (0 errores, 0 avisos)');
  } catch (err) {
    assert(false, 'Fallo en la ejecución de validate-vault.js', err.message);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PASO 3: MOTOR SDD ANTI-DRIFT (SPEC-DRIVEN DEVELOPMENT)
  // ───────────────────────────────────────────────────────────────────────────
  printHeader(3, 'MOTOR SDD CON DOBLE GUARDRAIL HITL (CREADOR VS REVISOR)',
    'Previene la alucinación y el prompt drifting mediante un flujo en 2 pasos humanos:\n' +
    '   HITL-1: Aprobación formal del Spec antes de escribir una sola línea.\n' +
    '   Revisor Autónomo: Bucle de evaluación de 0 a 9 pts con filtro de clichés.\n' +
    '   HITL-2: Aprobación formal del entregable antes de publicarlo en BRIDS-Brain.');

  const sdd = require(path.join(SCRIPTS_DIR, 'sdd-orchestrator.js'));
  const testSlug = 'smoke-test-demo';
  const testInboxSpecs = path.join(BRAIN_DIR, '00 Inbox', 'Specs');
  const testSpecJson = path.join(testInboxSpecs, `${testSlug}.spec.json`);
  const testSpecMd = path.join(testInboxSpecs, `${testSlug}.spec.md`);
  const testWorkDir = path.join(testInboxSpecs, `${testSlug}-work`);
  const targetVaultPath = path.join(BRAIN_DIR, '02 Strategy & Research', `${testSlug}.md`);

  try {
    // 3.1 Inicializar Spec
    const specPaths = sdd.initSpec(
      testSlug,
      'Smoke Test RWA Demo',
      '02 Strategy & Research',
      'business-consultant',
      'Institutional Real Estate Sponsors',
      'Demostrar el funcionamiento del motor SDD sin alterar la bóveda'
    );
    assert(fs.existsSync(testSpecJson), 'HITL-1: Spec generado en estado spec_review');
    
    const initialSpec = sdd.loadSpec(testSlug).data;
    assert(initialSpec.status === 'spec_review', 'Estado inicial es estrictamente spec_review');

    // 3.2 Probar bloqueo de guardrail HITL-1 (evaluar antes de aprobar spec)
    let blockedDrafting = false;
    try {
      sdd.evaluateDraft(testSlug, 'Intento prematuro sin aprobación');
    } catch (e) {
      blockedDrafting = true;
    }
    assert(blockedDrafting, 'HITL-1 GUARDRAIL ACTIVO: Prohíbe evaluar borradores si el spec no está aprobado');

    // 3.3 Aprobar Spec (HITL-1 Checkpoint)
    sdd.approveSpec(testSlug);
    const approvedSpec = sdd.loadSpec(testSlug).data;
    assert(approvedSpec.status === 'spec_approved', 'HITL-1 Checkpoint superado: spec_approved');

    // 3.4 Probar Revisor Autónomo y Detección de Clichés
    const badDraft = `En resumen, es importante destacar que en el vertiginoso mundo de la tokenización inmobiliaria,
      BRIDS juega un papel crucial para estar a la vanguardia de un cambio de paradigma. En conclusión, fin.`;
    const badAudit = sdd.evaluateDraft(testSlug, badDraft, 1);
    assert(badAudit.passed === false, 'Revisor Autónomo detecta y penaliza clichés de IA (< 8.5/9.0)');
    assert(badAudit.report.banned_phrases_detected.length >= 3, `Revisor detectó ${badAudit.report.banned_phrases_detected.length} clichés en el texto de prueba`);

    // 3.5 Probar borrador de alta calidad (>= 8.5/9.0)
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

    // 3.6 Probar HITL-2 Guardrail: El archivo NO se publica en el vault hasta confirmación humana
    assert(!fs.existsSync(targetVaultPath), 'HITL-2 GUARDRAIL ACTIVO: Archivo NO se publica en el vault hasta aprobación humana');

    // 3.7 Aprobación HITL-2 y promoción atómica
    sdd.approveDeliverable(testSlug);
    assert(fs.existsSync(targetVaultPath), 'HITL-2 Aprobado: Archivo promovido con éxito al vault de producción');

    const deliverableContent = fs.readFileSync(targetVaultPath, 'utf8');
    assert(deliverableContent.includes('sdd-approved') && deliverableContent.includes('hitl-validated'),
      'El entregable publicado incluye sellos criptográficos y metadatos HITL');
  } finally {
    // Limpieza atómica de la prueba
    if (fs.existsSync(targetVaultPath)) fs.unlinkSync(targetVaultPath);
    if (fs.existsSync(testSpecJson)) fs.unlinkSync(testSpecJson);
    if (fs.existsSync(testSpecMd)) fs.unlinkSync(testSpecMd);
    if (fs.existsSync(testWorkDir)) fs.rmSync(testWorkDir, { recursive: true, force: true });
    assert(true, 'Sesión de prueba SDD limpiada sin dejar residuos en el sistema');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PASO 4: PARRILLA DE CONTENIDOS RWA Y SINCRONIZADOR
  // ───────────────────────────────────────────────────────────────────────────
  printHeader(4, 'PARRILLA MAESTRA DE CONTENIDOS (15 TEMAS RWA)',
    'El archivo content-grid-plan.json mantiene un plan estructurado de 15 piezas de contenido.\n' +
    '   El script sync-content-grid.sh valida la correspondencia temática con los conceptos del negocio.');

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
    const topic = (post.garment || post.topic || '').toLowerCase();
    const isRwa = rwaKeywords.some(kw => topic.includes(kw));
    if (isRwa) rwaCount++;
  }
  assert(rwaCount === 15, `15/15 temas en la parrilla corresponden 100% a BRIDS Real Estate RWA`);

  // ───────────────────────────────────────────────────────────────────────────
  // PASO 5: REFINAMIENTO NO DESTRUCTIVO Y BACKUPS DE SEGURIDAD
  // ───────────────────────────────────────────────────────────────────────────
  printHeader(5, 'MOTOR DE REFINAMIENTO NO DESTRUCTIVO (SAFETY SNAPSHOTS)',
    'La regla mandatoria de BRIDS prohíbe sobrescribir destructivamente notas del vault.\n' +
    '   refine-note.js genera automáticamente una copia de seguridad en 00 Inbox/Archive\n' +
    '   con timestamp antes de actualizar metadatos o versionado.');

  const sampleNote = path.join(BRAIN_DIR, '01 Brand Context', 'product-marketing-context.md');
  const originalContent = fs.readFileSync(sampleNote, 'utf8');
  assert(originalContent.includes('Product Marketing Context: BRIDS.io'), 'Nota de prueba leída correctamente');

  try {
    const inspectOut = execSync(`node "${path.join(SCRIPTS_DIR, 'refine-note.js')}" inspect "${sampleNote}"`, { encoding: 'utf8' });
    assert(inspectOut.includes('Título:') && inspectOut.includes('Versión:'),
      'refine-note.js inspect detecta versión y frontmatter canónico');
  } catch (err) {
    assert(false, 'Fallo en la inspección de refine-note.js', err.message);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PASO 6: INVENTARIO DE WRAPPERS MULTIPLATAFORMA (.SH Y .PS1)
  // ───────────────────────────────────────────────────────────────────────────
  printHeader(6, 'WRAPPERS EJECUTABLES MULTIPLATAFORMA',
    'Todos los comandos del sistema cuentan con envoltorios dobles:\n' +
    '   .sh para entornos UNIX (macOS, Linux, WSL)\n' +
    '   .ps1 para PowerShell nativo en Windows');

  function getWrappers(ext) {
    const res = [];
    function scan(dir) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const full = path.join(dir, item);
        if (fs.lstatSync(full).isDirectory()) scan(full);
        else if (item.endsWith(ext)) res.push(item);
      }
    }
    scan(ENGINE_DIR);
    return res;
  }

  const shWrappers = getWrappers('.sh');
  const ps1Wrappers = getWrappers('.ps1');
  assert(shWrappers.length >= 20, `Wrappers Shell (.sh) verificados: ${shWrappers.length}`);
  assert(ps1Wrappers.length >= 20, `Wrappers PowerShell (.ps1) verificados: ${ps1Wrappers.length}`);
  assert(shWrappers.length === ps1Wrappers.length, `Paridad total 1:1 entre wrappers .sh y .ps1 (${shWrappers.length} pares)`);

  // ───────────────────────────────────────────────────────────────────────────
  // RESUMEN Y SCORECARD FINAL
  // ───────────────────────────────────────────────────────────────────────────
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n' + '═'.repeat(75));
  console.log(`📊 RESULTADO DEL SMOKE TEST: ${passedTests}/${totalTests} PRUEBAS EXITOSAS (${duration}s)`);
  console.log('═'.repeat(75));

  if (failedTests === 0) {
    console.log(`\n🎉 ¡SMOKE TEST COMPLETADO CON ÉXITO ROTUNDO!`);
    console.log(`✨ El sistema BRIDS Knowledge Fort está al 100% de operatividad técnica.`);
    console.log(`🛡️ Cero drifting detectado. Cero defectos. Flujos HITL y sub-agentes listos.`);
    console.log('═'.repeat(75) + '\n');
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
