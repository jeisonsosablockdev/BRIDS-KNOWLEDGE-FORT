#!/usr/bin/env node

/**
 * Idempotency Test Suite for BRIDS-Engine (TypeScript Domain Architecture)
 * Verifies that all domain scripts (sdd, ingest, vault, audit, social)
 * produce deterministic, stable results when executed multiple times.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as orchestrator from '../scripts/sdd/sdd-orchestrator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const SCRIPTS_DIR = path.join(ROOT_DIR, 'BRIDS-Engine', 'scripts');
const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const VAULT_INBOX = path.join(ROOT_DIR, 'BRIDS-Brain', '00 Inbox');

function getHash(dataOrPath: string): string {
  let content = dataOrPath;
  if (fs.existsSync(dataOrPath)) {
    content = fs.readFileSync(dataOrPath, 'utf8');
  }
  return crypto.createHash('sha256').update(content).digest('hex');
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getTodayString(): string {
  return new Date().toLocaleDateString('sv-SE');
}

function cleanup() {
  if (fs.existsSync(FIXTURES_DIR)) {
    fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
  }
  const testSessionPath = path.join(VAULT_INBOX, 'test-idempotency-session.json');
  if (fs.existsSync(testSessionPath)) fs.unlinkSync(testSessionPath);

  const testArchiveBak = path.join(VAULT_INBOX, 'Archive');
  if (fs.existsSync(testArchiveBak)) {
    const files = fs.readdirSync(testArchiveBak).filter(f => f.startsWith('idem-test-note'));
    for (const f of files) fs.unlinkSync(path.join(testArchiveBak, f));
  }

  const specsDir = path.join(VAULT_INBOX, 'Specs');
  if (fs.existsSync(specsDir)) {
    const specFiles = fs.readdirSync(specsDir).filter(f => f.startsWith('test-sdd-idem') || f.startsWith('test-sdd-freeze'));
    for (const f of specFiles) {
      const fullP = path.join(specsDir, f);
      if (fs.lstatSync(fullP).isDirectory()) {
        fs.rmSync(fullP, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullP);
      }
    }
  }
  const testDeliverable = path.join(ROOT_DIR, 'BRIDS-Brain', '01 Negocio', '01 Estrategia & Modelo', 'test-sdd-idem.md');
  if (fs.existsSync(testDeliverable)) fs.unlinkSync(testDeliverable);
}

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
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
  console.log('🧪 SUITE DE PRUEBAS DE IDEMPOTENCIA (BRIDS-ENGINE TS)');
  console.log('█'.repeat(80) + '\n');

  ensureDir(FIXTURES_DIR);

  try {
    // TEST 1: Brand Context Sync Idempotency
    console.log('[TEST 1/9] Verificando Idempotencia en Sincronización de Contexto (sync-workspace-context.ts)...');
    const syncScript = path.join(SCRIPTS_DIR, 'ingest/sync-workspace-context.ts');

    execSync(`node "${syncScript}" brand`, { stdio: 'pipe' });
    const targetContext = path.join(ROOT_DIR, 'BRIDS-Brain', '02 Marketing', '01 Contexto de Marca', 'product-marketing-context.md');
    assert(fs.existsSync(targetContext), 'El contexto de marca existe en el vault tras sync 1');

    const stat1 = fs.lstatSync(targetContext);
    execSync(`node "${syncScript}" brand`, { stdio: 'pipe' });
    execSync(`node "${syncScript}" brand`, { stdio: 'pipe' });
    const stat3 = fs.lstatSync(targetContext);

    assert(stat1.isSymbolicLink() === stat3.isSymbolicLink(), 'El tipo de enlace se mantiene inmutable tras 3 ejecuciones consecutivas');
    console.log('');

    // TEST 2: Task Session Initialization & Double-Init Guard
    console.log('[TEST 2/9] Verificando Idempotencia en Inicialización de Sesión (sdd-orchestrator.ts session-init)...');
    const sddScript = path.join(SCRIPTS_DIR, 'sdd/sdd-orchestrator.ts');
    const sessionId = 'test-idempotency-session';
    const sessionFile = path.join(VAULT_INBOX, `${sessionId}.json`);

    if (fs.existsSync(sessionFile)) fs.unlinkSync(sessionFile);

    execSync(`node "${sddScript}" session init ${sessionId} "Meta Idempotente" "ICP Test"`, { stdio: 'pipe' });
    assert(fs.existsSync(sessionFile), 'Sesión JSON creada exitosamente');

    const json1 = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    assert(json1.status === 'in_progress', 'Estado inicial es in_progress');
    assert(json1.session_id === sessionId, 'Session ID correctamente asignado');

    let doubleInitThrew = false;
    try {
      execSync(`node "${sddScript}" session init ${sessionId} "Nueva Meta" "Nuevo ICP"`, { stdio: 'pipe' });
    } catch {
      doubleInitThrew = true;
    }
    assert(doubleInitThrew, 'Re-inicializar una sesión existente es rechazado para prevenir sobrescritura accidental');

    const jsonAfter = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    assert(jsonAfter.intent.business_goal === 'Meta Idempotente', 'Los datos originales se mantuvieron protegidos');
    console.log('');

    // TEST 3: Task Updates & State Transition Idempotency
    console.log('[TEST 3/9] Verificando Idempotencia en Transición de Estados de Tareas (sdd-orchestrator.ts add/update)...');
    execSync(`node "${sddScript}" add ${sessionId} "Subtarea 1" W1_BRAND_STRATEGY "mas-product-marketing-context" "02 Marketing/01 Contexto de Marca/test.md"`, { stdio: 'pipe' });

    execSync(`node "${sddScript}" update ${sessionId} TASK-001 completed "Entrega lista"`, { stdio: 'pipe' });
    const jsonUpdated1 = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    assert(jsonUpdated1.atomic_tasks[0].status === 'completed', 'Tarea marcada como completed');

    execSync(`node "${sddScript}" update ${sessionId} TASK-001 completed "Entrega lista"`, { stdio: 'pipe' });
    const jsonUpdated2 = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    assert(jsonUpdated2.atomic_tasks[0].status === 'completed', 'Tarea sigue en completed');
    assert(jsonUpdated2.atomic_tasks.length === 1, 'No se duplicaron tareas en el array');
    if (fs.existsSync(sessionFile)) fs.unlinkSync(sessionFile);
    console.log('');

    // TEST 4: Note Refinement, Changelog & Rollback Idempotency
    console.log('[TEST 4/9] Verificando Idempotencia en Refinamiento No Destructivo (refine-note.ts)...');
    const refineScript = path.join(SCRIPTS_DIR, 'vault/refine-note.ts');
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
- Contexto: [[02 Marketing/01 Contexto de Marca/product-marketing-context.md]]
`;

    fs.writeFileSync(testNotePath, initialNoteContent, 'utf8');
    const initialHash = getHash(testNotePath);

    execSync(`node "${refineScript}" inspect "${testNotePath}"`, { stdio: 'pipe' });
    execSync(`node "${refineScript}" inspect "${testNotePath}"`, { stdio: 'pipe' });
    assert(getHash(testNotePath) === initialHash, 'El comando inspect es 100% de solo lectura (cero mutación)');

    execSync(`node "${refineScript}" refine "${testNotePath}" "Refinamiento paso 1" minor`, { stdio: 'pipe' });
    const contentAfterRefine1 = fs.readFileSync(testNotePath, 'utf8');
    assert(contentAfterRefine1.includes('version: "1.1"'), 'Versión incrementada limpiamente a 1.1');
    assert(contentAfterRefine1.includes('Refinamiento paso 1'), 'Changelog contiene la nueva entrada');
    assert((contentAfterRefine1.match(/---\r?\n/g) || []).length === 2, 'Frontmatter YAML mantiene exactamente 2 delimitadores');

    execSync(`node "${refineScript}" rollback "${testNotePath}"`, { stdio: 'pipe' });
    assert(getHash(testNotePath) === initialHash, 'Rollback restaura el archivo con integridad SHA256 idéntica al original');
    console.log('');

    // TEST 5: Skills Symlink Activation Idempotency
    console.log('[TEST 5/9] Verificando Idempotencia en Activación de Skills (sync-workspace-context.ts skills)...');
    const out1 = execSync(`node "${syncScript}" skills`, { encoding: 'utf8' });
    const out2 = execSync(`node "${syncScript}" skills`, { encoding: 'utf8' });
    assert(out1.includes('Done') && out2.includes('Done'), 'Ejecuciones consecutivas terminan con éxito');
    console.log('');

    // TEST 6: Audit Compliance Determinism
    console.log('[TEST 6/9] Verificando Determinismo y Ausencia de Efectos Secundarios en Auditoría (audit-runner.ts)...');
    const auditScript = path.join(SCRIPTS_DIR, 'audit/audit-runner.ts');

    const vaultInboxHashBefore = getHash(JSON.stringify(fs.readdirSync(VAULT_INBOX)));
    execSync(`node "${auditScript}" compliance`, { stdio: 'pipe' });
    const vaultInboxHashAfter = getHash(JSON.stringify(fs.readdirSync(VAULT_INBOX)));

    assert(vaultInboxHashBefore === vaultInboxHashAfter, 'La suite de auditoría no genera archivos no deseados ni muta el estado del vault');
    console.log('');

    // TEST 7: Social Carousel Creation & Protection Guard
    console.log('[TEST 7/9] Verificando Generación y Protección de Carruseles (social-generator.ts carousel)...');
    const socialScript = path.join(SCRIPTS_DIR, 'social/social-generator.ts');
    const testIdea = 'test-rwa-unit';
    const expectedNote = path.join(ROOT_DIR, 'BRIDS-Brain', '02 Marketing', '03 Redes Sociales & Contenido', `${getTodayString()}-linkedin-carrusel-${testIdea}.md`);
    const expectedAssets = path.join(ROOT_DIR, 'BRIDS-Brain', '02 Marketing', '03 Redes Sociales & Contenido', 'Assets', `${getTodayString()}-carrusel-${testIdea}`);

    if (fs.existsSync(expectedNote)) fs.unlinkSync(expectedNote);
    if (fs.existsSync(expectedAssets)) fs.rmSync(expectedAssets, { recursive: true, force: true });

    execSync(`node "${socialScript}" carousel "${testIdea}" "" "Commercial Real Estate" "Solana Metaplex Core" linkedin`, { stdio: 'pipe' });
    assert(fs.existsSync(expectedNote), 'Nota de carrusel creada correctamente en Social Content');
    assert(fs.existsSync(path.join(expectedAssets, 'generation-prompts.json')), 'Manifiesto de prompts generado en la carpeta de activos');

    let doubleCreateThrew = false;
    try {
      execSync(`node "${socialScript}" carousel "${testIdea}" "" "Commercial Real Estate" "Solana Metaplex Core" linkedin`, { stdio: 'pipe' });
    } catch {
      doubleCreateThrew = true;
    }
    assert(doubleCreateThrew, 'Re-generar un carrusel existente es bloqueado para proteger el contenido');

    if (fs.existsSync(expectedNote)) fs.unlinkSync(expectedNote);
    if (fs.existsSync(expectedAssets)) fs.rmSync(expectedAssets, { recursive: true, force: true });
    console.log('');

    // TEST 8: Content Grid Synchronization Idempotency
    console.log('[TEST 8/9] Verificando Idempotencia en Sincronización de Parrilla (social-generator.ts grid)...');
    const gridDocPath = path.join(ROOT_DIR, 'BRIDS-Brain', '02 Marketing', '02 Estrategia & Parrilla', 'parrilla-publicaciones-redes-sociales.md');
    execSync(`node "${socialScript}" grid update`, { stdio: 'pipe' });
    const gridHash1 = getHash(gridDocPath);
    execSync(`node "${socialScript}" grid update`, { stdio: 'pipe' });
    const gridHash2 = getHash(gridDocPath);
    assert(gridHash1 === gridHash2, 'La actualización de la parrilla es 100% idempotente');
    console.log('');

    // TEST 9: SDD Engine Idempotency & Two-Agent Evaluator-Optimizer Cycle
    console.log('[TEST 9/9] Verificando Idempotencia en Motor SDD y Bucle Creador-Revisor (sdd-orchestrator.ts)...');
    const testSddSlug = 'test-sdd-idem';
    const sddSpecJson = path.join(VAULT_INBOX, 'Specs', `${testSddSlug}.spec.json`);
    const sddSpecMd = path.join(VAULT_INBOX, 'Specs', `${testSddSlug}.spec.md`);
    const sddWorkDir = path.join(VAULT_INBOX, 'Specs', `${testSddSlug}-work`);
    const sddDeliverable = path.join(ROOT_DIR, 'BRIDS-Brain', '01 Negocio', '01 Estrategia & Modelo', `${testSddSlug}.md`);

    if (fs.existsSync(sddSpecJson)) fs.unlinkSync(sddSpecJson);
    if (fs.existsSync(sddSpecMd)) fs.unlinkSync(sddSpecMd);
    if (fs.existsSync(sddWorkDir)) fs.rmSync(sddWorkDir, { recursive: true, force: true });
    if (fs.existsSync(sddDeliverable)) fs.unlinkSync(sddDeliverable);

    execSync(`node "${sddScript}" init "${testSddSlug}" "Estrategia Tokenización Test" "01 Negocio/01 Estrategia & Modelo" "business-consultant,founder-ghostwriter" "Real Estate Sponsors" "Levantamiento de $10M"`, { stdio: 'pipe' });
    assert(fs.existsSync(sddSpecJson), 'Spec JSON creado correctamente en 00 Inbox/Specs');

    const initialSpecData = JSON.parse(fs.readFileSync(sddSpecJson, 'utf8'));
    assert(initialSpecData.status === 'spec_review', 'Estado inicial del spec es spec_review');
    assert(initialSpecData.hitl_checkpoints.hitl_1_spec_approval.status === 'pending', 'Checkpoint HITL-1 está en estado pending');

    const specJsonHash1 = getHash(sddSpecJson);
    execSync(`node "${sddScript}" init "${testSddSlug}" "Estrategia Tokenización Test" "01 Negocio/01 Estrategia & Modelo" "business-consultant,founder-ghostwriter" "Real Estate Sponsors" "Levantamiento de $10M"`, { stdio: 'pipe' });
    const specJsonHash2 = getHash(sddSpecJson);
    assert(specJsonHash1 === specJsonHash2, 'Doble inicialización de spec es 100% idempotente');

    let evalBlockedBeforeH1 = false;
    try {
      orchestrator.evaluateDraft(testSddSlug, 'Intento de borrador prematuro');
    } catch {
      evalBlockedBeforeH1 = true;
    }
    assert(evalBlockedBeforeH1, 'Intentar evaluar un borrador sin aprobar el spec (HITL-1) es bloqueado');

    execSync(`node "${sddScript}" refine-spec "${testSddSlug}" "Añadir requerimiento de gobernanza Delaware"`, { stdio: 'pipe' });
    const refinedSpecData = JSON.parse(fs.readFileSync(sddSpecJson, 'utf8'));
    assert(refinedSpecData.hitl_checkpoints.hitl_1_spec_approval.user_feedback.length > 0, 'Feedback de usuario registrado en HITL-1');

    execSync(`node "${sddScript}" approve-spec "${testSddSlug}"`, { stdio: 'pipe' });
    const approvedData1 = JSON.parse(fs.readFileSync(sddSpecJson, 'utf8'));
    assert(approvedData1.status === 'spec_approved', 'Spec pasa a estado spec_approved formalmente');

    execSync(`node "${sddScript}" approve-spec "${testSddSlug}"`, { stdio: 'pipe' });
    const approvedData2 = JSON.parse(fs.readFileSync(sddSpecJson, 'utf8'));
    assert(approvedData2.status === 'spec_approved', 'Doble aprobación es idempotente');

    const flawedDraft = 'En resumen, en el vertiginoso mundo inmobiliario, BRIDS juega un papel crucial a la vanguardia. En conclusión es importante destacar el cambio de paradigma.';
    const auditFlawed = orchestrator.evaluateDraft(testSddSlug, flawedDraft, 1);
    assert(!auditFlawed.passed, 'Borrador con muletillas robóticas es rechazado con nota < 8.5');
    assert(auditFlawed.report.banned_phrases_detected.length > 0, 'El revisor detecta y lista las muletillas de IA encontradas');
    assert(!fs.existsSync(sddDeliverable), 'El entregable rechazado NO es promovido al vault');

    const pristineDraft = `## Sindicación Inmobiliaria en Solana con BRIDS

Eliminamos la intermediación arcaica en sindicaciones inmobiliarias mediante contratos inteligentes auditables on-chain sobre Solana y el estándar Metaplex Core con plugins de Freeze y Recovery.

### Desacoplamiento Legal Delaware SPV
Cada activo inmobiliario se estructura a través de una LLC independiente en Delaware (SPV) que retiene la propiedad legal y emite las participaciones tokenizadas. BRIDS actúa como proveedor tecnológico de infraestructura SaaS sin custodia de fondos.

### Acreditación y Cumplimiento Regulatorio
Los participantes se verifican mediante Stripe Identity para cumplir estrictamente con normativas KYC/AML. Nuestra solución está diseñada a la medida para Real Estate Sponsors que buscan reducir hasta un 80% sus costos de estructuración y acelerar el cierre de rondas de inversión.

### Llamado a la Acción
Agenda una sesión técnica con el equipo de estructuración en sponsors@brids.io para analizar tu cartera de activos.`;
    const auditPassed = orchestrator.evaluateDraft(testSddSlug, pristineDraft, 2);
    assert(auditPassed.passed, 'Borrador de alta calidad obtiene calificación >= 8.5');

    const h2PendingData = JSON.parse(fs.readFileSync(sddSpecJson, 'utf8'));
    assert(h2PendingData.status === 'deliverable_review', 'Estado pasa a deliverable_review tras aprobar el revisor');
    assert(!fs.existsSync(sddDeliverable), 'HITL-2 GUARDRAIL: El entregable no es promovido hasta aprobación humana');

    execSync(`node "${sddScript}" refine-deliverable "${testSddSlug}" "Añadir cláusula de liquidez institucional"`, { stdio: 'pipe' });
    const refinedDeliverableData = JSON.parse(fs.readFileSync(sddSpecJson, 'utf8'));
    assert(refinedDeliverableData.hitl_checkpoints.hitl_2_deliverable_approval.user_feedback.length > 0, 'Feedback de HITL-2 registrado');

    execSync(`node "${sddScript}" approve-deliverable "${testSddSlug}"`, { stdio: 'pipe' });
    assert(fs.existsSync(sddDeliverable), 'Entregable aprobado en HITL-2 es promovido al vault canónico');

    const finalCompletedData = JSON.parse(fs.readFileSync(sddSpecJson, 'utf8'));
    assert(finalCompletedData.status === 'completed', 'Estado del spec pasa a completed tras aprobación HITL-2');

    execSync(`node "${sddScript}" approve-deliverable "${testSddSlug}"`, { stdio: 'pipe' });
    const deliverableContent = fs.readFileSync(sddDeliverable, 'utf8');
    assert(deliverableContent.includes('sdd-approved') && deliverableContent.includes('hitl-validated'), 'El entregable final incluye metadatos HITL');

    // 5-Cycle Freeze Guard
    const testFreezeSlug = 'test-sdd-freeze';
    execSync(`node "${sddScript}" init "${testFreezeSlug}" "Freeze Test" "01 Negocio/01 Estrategia & Modelo" "business-consultant" "Sponsors" "Goal"`, { stdio: 'pipe' });
    execSync(`node "${sddScript}" approve-spec "${testFreezeSlug}"`, { stdio: 'pipe' });

    let freezeResult: any;
    for (let c = 1; c <= 5; c++) {
      freezeResult = orchestrator.evaluateDraft(testFreezeSlug, flawedDraft, c);
    }
    assert(freezeResult.frozen === true, 'Al alcanzar 5 ciclos fallidos, el spec se congela');
    assert(freezeResult.data.status === 'frozen_for_arbitration', 'Estado del spec pasa a frozen_for_arbitration');

    console.log('\n' + '═'.repeat(80));
    console.log(`🎉 TODAS LAS PRUEBAS DE IDEMPOTENCIA PASARON: ${passedTests}/${totalTests} (100%)`);
    console.log('═'.repeat(80) + '\n');
  } catch (error: any) {
    console.error('\n❌ ERROR CRÍTICO EN LA SUITE DE IDEMPOTENCIA:');
    console.error(error.message);
    process.exit(1);
  } finally {
    cleanup();
  }
}

runSuite();
