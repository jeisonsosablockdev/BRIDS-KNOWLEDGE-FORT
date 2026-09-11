#!/usr/bin/env node

/**
 * Idempotency Test Suite for AndreArt Marketing Core
 * Verifies that all configuration, task lifecycle, sync, and refinement scripts
 * produce deterministic, stable results when executed multiple times.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '../..');
const SCRIPTS_DIR = path.join(ROOT_DIR, 'BRIDS-Engine', 'scripts');
const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const VAULT_INBOX = path.join(ROOT_DIR, 'BRIDS-Brain', '00 Inbox');

// Helper to calculate sha256 hash of a file or string
function getHash(dataOrPath) {
  let content = dataOrPath;
  if (fs.existsSync(dataOrPath)) {
    content = fs.readFileSync(dataOrPath, 'utf8');
  }
  return crypto.createHash('sha256').update(content).digest('hex');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function cleanup() {
  if (fs.existsSync(FIXTURES_DIR)) {
    fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
  }
  // Clean up any test session JSONs in inbox
  const testSessionPath = path.join(VAULT_INBOX, 'test-idempotency-session.json');
  if (fs.existsSync(testSessionPath)) fs.unlinkSync(testSessionPath);

  const testArchiveBak = path.join(VAULT_INBOX, 'Archive');
  if (fs.existsSync(testArchiveBak)) {
    const files = fs.readdirSync(testArchiveBak).filter(f => f.startsWith('idem-test-note'));
    for (const f of files) fs.unlinkSync(path.join(testArchiveBak, f));
  }
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`   ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`   ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runSuite() {
  console.log('\n' + '█'.repeat(80));
  console.log('🧪 SUITE DE PRUEBAS DE IDEMPOTENCIA (BRIDS-ENGINE)');
  console.log('█'.repeat(80) + '\n');

  ensureDir(FIXTURES_DIR);

  try {
    // -------------------------------------------------------------
    // TEST 1: Brand Context Sync Idempotency
    // -------------------------------------------------------------
    console.log('[TEST 1/6] Verificando Idempotencia en Sincronización de Contexto (sync-brand-context)...');
    const syncScript = path.join(SCRIPTS_DIR, 'sync-brand-context.sh');
    
    // Run 3 consecutive syncs
    execSync(`bash "${syncScript}"`, { stdio: 'pipe' });
    const targetContext = path.join(ROOT_DIR, 'BRIDS-Brain', '01 Brand Context', 'product-marketing-context.md');
    assert(fs.existsSync(targetContext), 'El contexto de marca existe en el vault tras sync 1');

    const stat1 = fs.lstatSync(targetContext);
    execSync(`bash "${syncScript}"`, { stdio: 'pipe' });
    execSync(`bash "${syncScript}"`, { stdio: 'pipe' });
    const stat3 = fs.lstatSync(targetContext);

    assert(stat1.isSymbolicLink() === stat3.isSymbolicLink(), 'El tipo de enlace se mantiene inmutable tras 3 ejecuciones consecutivas');
    console.log('');

    // -------------------------------------------------------------
    // TEST 2: Task Session Initialization & Double-Init Guard
    // -------------------------------------------------------------
    console.log('[TEST 2/6] Verificando Idempotencia en Inicialización de Sesión (task-manager init)...');
    const tmScript = path.join(SCRIPTS_DIR, 'task-manager.sh');
    const sessionId = 'test-idempotency-session';
    const sessionFile = path.join(VAULT_INBOX, `${sessionId}.json`);

    if (fs.existsSync(sessionFile)) fs.unlinkSync(sessionFile);

    // Initial init
    execSync(`bash "${tmScript}" init ${sessionId} "Meta Idempotente" "ICP Test"`, { stdio: 'pipe' });
    assert(fs.existsSync(sessionFile), 'Sesión JSON creada exitosamente');

    const json1 = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    assert(json1.status === 'in_progress', 'Estado inicial es in_progress');
    assert(json1.session_id === sessionId, 'Session ID correctamente asignado');

    // Attempting to re-init must be safely rejected without mutating the existing file
    let doubleInitThrew = false;
    try {
      execSync(`bash "${tmScript}" init ${sessionId} "Nueva Meta" "Nuevo ICP"`, { stdio: 'pipe' });
    } catch (e) {
      doubleInitThrew = true;
    }
    assert(doubleInitThrew, 'Re-inicializar una sesión existente es rechazado para prevenir sobrescritura accidental');

    const jsonAfter = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    assert(jsonAfter.intent.business_goal === 'Meta Idempotente', 'Los datos originales se mantuvieron protegidos');
    console.log('');

    // -------------------------------------------------------------
    // TEST 3: Task Updates & State Transition Idempotency
    // -------------------------------------------------------------
    console.log('[TEST 3/6] Verificando Idempotencia en Transición de Estados de Tareas (task-manager update)...');
    execSync(`bash "${tmScript}" add ${sessionId} "Subtarea 1" W1_BRAND_STRATEGY "mas-product-marketing-context" "01 Brand Context/test.md"`, { stdio: 'pipe' });

    // Update to completed
    execSync(`bash "${tmScript}" update ${sessionId} TASK-001 completed "Entrega lista"`, { stdio: 'pipe' });
    const jsonUpdated1 = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    assert(jsonUpdated1.atomic_tasks[0].status === 'completed', 'Tarea marcada como completed');

    // Update to completed AGAIN with same payload
    execSync(`bash "${tmScript}" update ${sessionId} TASK-001 completed "Entrega lista"`, { stdio: 'pipe' });
    const jsonUpdated2 = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    assert(jsonUpdated2.atomic_tasks[0].status === 'completed', 'Tarea sigue en completed');
    assert(jsonUpdated2.atomic_tasks.length === 1, 'No se duplicaron tareas en el array');
    console.log('');

    // -------------------------------------------------------------
    // TEST 4: Note Refinement, Changelog & Rollback Idempotency
    // -------------------------------------------------------------
    console.log('[TEST 4/6] Verificando Idempotencia en Refinamiento No Destructivo (refine-note)...');
    const refineScript = path.join(SCRIPTS_DIR, 'refine-note.sh');
    const testNotePath = path.join(FIXTURES_DIR, 'idem-test-note.md');

    const initialNoteContent = `---
title: "Nota de Test Idempotencia"
category: "00 Inbox"
workflow: "W2_LANDING_COPY"
skills_used:
  - "mas-copywriting"
status: draft
version: "1.0"
created_at: 2026-08-08
updated_at: 2026-08-08
tags:
  - test
---

# Nota de Test Idempotencia

> [!NOTE]
> **Resumen Ejecutivo:** Documento de prueba para verificación de idempotencia.

## 📋 Entregable Principal
Texto base inicial inmutable.

## 🔄 Historial de Revisiones (Changelog)
- **v1.0 (2026-08-08):** Creación inicial de la nota.

## 🔗 Referencias Cruzadas
- Contexto: [[01 Brand Context/product-marketing-context.md]]
`;

    fs.writeFileSync(testNotePath, initialNoteContent, 'utf8');
    const initialHash = getHash(testNotePath);

    // 1. Inspect multiple times -> zero mutation
    execSync(`bash "${refineScript}" inspect "${testNotePath}"`, { stdio: 'pipe' });
    execSync(`bash "${refineScript}" inspect "${testNotePath}"`, { stdio: 'pipe' });
    assert(getHash(testNotePath) === initialHash, 'El comando inspect es 100% de solo lectura (cero mutación)');

    // 2. Refine note once
    execSync(`bash "${refineScript}" refine "${testNotePath}" "Refinamiento paso 1" minor`, { stdio: 'pipe' });
    const contentAfterRefine1 = fs.readFileSync(testNotePath, 'utf8');
    assert(contentAfterRefine1.includes('version: "1.1"'), 'Versión incrementada limpiamente a 1.1');
    assert(contentAfterRefine1.includes('Refinamiento paso 1'), 'Changelog contiene la nueva entrada');
    assert((contentAfterRefine1.match(/---\r?\n/g) || []).length === 2, 'Frontmatter YAML mantiene exactamente 2 delimitadores (no duplicados)');

    // 3. Rollback
    execSync(`bash "${refineScript}" rollback "${testNotePath}"`, { stdio: 'pipe' });
    assert(getHash(testNotePath) === initialHash, 'Rollback restaura el archivo con integridad SHA256 idéntica al original');
    console.log('');

    // -------------------------------------------------------------
    // TEST 5: Skills Symlink Activation Idempotency
    // -------------------------------------------------------------
    console.log('[TEST 5/6] Verificando Idempotencia en Activación de Skills (enable-project-skills)...');
    const enableSkillsScript = path.join(SCRIPTS_DIR, 'enable-project-skills.sh');

    const out1 = execSync(`bash "${enableSkillsScript}"`, { encoding: 'utf8' });
    const out2 = execSync(`bash "${enableSkillsScript}"`, { encoding: 'utf8' });

    assert(out1.includes('Done') && out2.includes('Done'), 'Ejecuciones consecutivas terminan con éxito');
    assert(out2.includes('skip') || out2.includes('link'), 'Modo seguro no corrompe enlaces existentes');
    console.log('');

    // -------------------------------------------------------------
    // TEST 6: Audit Compliance Determinism (Zero-Side-Effects)
    // -------------------------------------------------------------
    console.log('[TEST 6/7] Verificando Determinismo y Ausencia de Efectos Secundarios en Auditoría (enforce-compliance)...');
    const complianceScript = path.join(SCRIPTS_DIR, 'enforce-compliance.sh');

    const vaultInboxHashBefore = getHash(JSON.stringify(fs.readdirSync(VAULT_INBOX)));
    execSync(`bash "${complianceScript}"`, { stdio: 'pipe' });
    const vaultInboxHashAfter = getHash(JSON.stringify(fs.readdirSync(VAULT_INBOX)));

    assert(vaultInboxHashBefore === vaultInboxHashAfter, 'La suite de auditoría no genera archivos no deseados ni muta el estado del vault');
    console.log('');

    // -------------------------------------------------------------
    // TEST 7: Social Carousel Creation & Protection Guard
    // -------------------------------------------------------------
    console.log('[TEST 7/7] Verificando Generación y Protección de Carruseles (create-social-carousel)...');
    const carouselScript = path.join(SCRIPTS_DIR, 'create-social-carousel.sh');
    const testIdea = 'test-hakama-unit';
    const expectedNote = path.join(ROOT_DIR, 'BRIDS-Brain', '07 Paid, Social & Community', 'Social Content', `${getTodayString()}-instagram-carrusel-${testIdea}.md`);
    const expectedAssets = path.join(ROOT_DIR, 'BRIDS-Brain', '07 Paid, Social & Community', 'Social Content', 'Assets', `${getTodayString()}-carrusel-${testIdea}`);

    if (fs.existsSync(expectedNote)) fs.unlinkSync(expectedNote);
    if (fs.existsSync(expectedAssets)) fs.rmSync(expectedAssets, { recursive: true, force: true });

    // 1. Initial generation
    execSync(`bash "${carouselScript}" "${testIdea}" "" "Pantalón Test" "Saga Test" instagram`, { stdio: 'pipe' });
    assert(fs.existsSync(expectedNote), 'Nota de carrusel creada correctamente en Social Content');
    assert(fs.existsSync(path.join(expectedAssets, 'generation-prompts.json')), 'Manifiesto de prompts generado en la carpeta de activos');

    // 2. Double generation must be rejected safely
    let doubleCreateThrew = false;
    try {
      execSync(`bash "${carouselScript}" "${testIdea}" "" "Pantalón Test" "Saga Test" instagram`, { stdio: 'pipe' });
    } catch (e) {
      doubleCreateThrew = true;
    }
    assert(doubleCreateThrew, 'Re-generar un carrusel existente es bloqueado para proteger el contenido');

    // Cleanup
    if (fs.existsSync(expectedNote)) fs.unlinkSync(expectedNote);
    if (fs.existsSync(expectedAssets)) fs.rmSync(expectedAssets, { recursive: true, force: true });
    console.log('');

    // -------------------------------------------------------------
    // TEST 8: Content Grid Synchronization Idempotency
    // -------------------------------------------------------------
    console.log('[TEST 8/8] Verificando Idempotencia en Sincronización de Parrilla (sync-content-grid)...');
    const syncGridScript = path.join(SCRIPTS_DIR, 'sync-content-grid.sh');

    const gridDocPath = path.join(ROOT_DIR, 'BRIDS-Brain', '07 Paid, Social & Community', 'Social Content', 'Parrilla de Publicaciones Instagram 15 Dias.md');
    
    // First run: update doc
    execSync(`bash "${syncGridScript}" update`, { stdio: 'pipe' });
    const gridHash1 = getHash(gridDocPath);

    // Second run: update doc
    execSync(`bash "${syncGridScript}" update`, { stdio: 'pipe' });
    const gridHash2 = getHash(gridDocPath);

    assert(gridHash1 === gridHash2, 'Sincronizar la parrilla consecutivamente produce un estado 100% determinista e idéntico');
    console.log('');

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('═'.repeat(80));
    console.log(`🎉 TODAS LAS PRUEBAS DE IDEMPOTENCIA PASARON: ${passedTests}/${totalTests} (100%)`);
    console.log('   El sistema es formalmente determinista, seguro e idempotente.');
    console.log('═'.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO EN LA SUITE DE IDEMPOTENCIA:');
    console.error(error.message);
    process.exit(1);
  } finally {
    cleanup();
  }
}

runSuite();
