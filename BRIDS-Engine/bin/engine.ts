#!/usr/bin/env node

/**
 * BRIDS-Engine Unified CLI
 * Single, type-safe entrypoint for task lifecycle, SDD double-loop, and vault synchronization.
 * 
 * Usage:
 *   node BRIDS-Engine/bin/engine.ts <command> [args]
 * 
 * @spec SPEC-001 (Ported & adapted from Academic-Engine architecture)
 */

import fs from 'node:fs';
import path from 'node:path';
import { TaskOrchestrator } from '../core/orchestrator.ts';
import { VaultGateway } from '../core/vault-gateway.ts';

const args = process.argv.slice(2);
const command = args[0] || 'help';

const orchestrator = new TaskOrchestrator();
const vault = orchestrator.getVault();

function printHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║               🏛️  BRIDS-ENGINE CLI RUNNER  v2.0                   ║
║           Harness Modular para RWA, Venture & YC Preparation      ║
╚═══════════════════════════════════════════════════════════════════╝

Comandos de Tareas y Ciclo de Vida:
  task init <slug> [titulo] [carpeta] [subagentes] [icp] [meta]
      Inicializa un nuevo entregable y genera su especificación formal (spec_review).
      
  task preview <slug>
      Inspecciona el objeto canónico del spec antes de su aprobación (HITL-1).
      
  task approve-spec <slug>
      [HITL-1] Aprueba formalmente el Spec para desbloquear la redacción (spec_approved).
      
  task evaluate <slug> <archivo-borrador|texto>
      Evalúa el borrador con la rúbrica 4D (filtro anti-clichés + calidad >= 8.5).
      
  task review-deliverable <slug>
      Inspecciona el borrador que superó la rúbrica antes de publicarlo (HITL-2).
      
  task approve-deliverable <slug>
      [HITL-2] Aprueba el entregable final y lo publica en BRIDS-Brain (completed).
      
  task status <slug>
      Muestra el estado actual, ciclo y puntajes de una tarea.
      
  task list
      Lista todas las especificaciones activas y su estado en el Vault.

Comandos de Mantenimiento y Búsqueda:
  skills validate
      Ejecuta la validación de conformidad con Agent Skills Specification.
      
  vault search <query> [--limit N]
      Ejecuta búsqueda ultrarrápida in-memory dentro de BRIDS-Brain.
      
  help
      Muestra esta ayuda.
`);
}

function handleTaskInit(taskArgs: string[]) {
  const slug = taskArgs[0];
  if (!slug) {
    console.error('❌ Error: Falta el slug de la tarea. Ejemplo: engine task init rwa-tokenomics-v1');
    process.exit(1);
  }

  const title = taskArgs[1] || slug;
  const targetFolder = taskArgs[2] || '01 Negocio/01 Estrategia & Modelo';
  const subagentsRaw = taskArgs[3] || 'business-consultant';
  const subagents = subagentsRaw.split(',').map(s => s.trim()).filter(Boolean);
  const icp = taskArgs[4] || 'Institutional Real Estate Sponsors & YC Investors';
  const goal = taskArgs[5] || title;

  const context = orchestrator.initSpec(slug, title, targetFolder, subagents, icp, goal);
  console.log(`\n✅ Spec inicializado con éxito:`);
  console.log(`   - Slug:         ${context.slug}`);
  console.log(`   - Título:       ${context.title}`);
  console.log(`   - Estado:       ${context.state} (En espera de aprobación HITL-1)`);
  console.log(`   - Ubicación:    BRIDS-Brain/00 Inbox/Specs/${context.slug}.spec.md\n`);
}

function handlePreviewSpec(taskArgs: string[]) {
  const slug = taskArgs[0];
  if (!slug) {
    console.error('❌ Error: Especifica el slug a visualizar. Ejemplo: engine task preview mi-tarea');
    process.exit(1);
  }

  const loaded = vault.loadSpec(slug);
  console.log(`\n📄 [PREVIEW SPEC] ${loaded.data.title}`);
  console.log(`   - Slug:      ${loaded.data.slug}`);
  console.log(`   - Estado:    ${loaded.data.status}`);
  console.log(`   - Destino:   ${loaded.data.target_folder}`);
  console.log(`   - Subagentes: ${loaded.data.subagents.join(', ')}`);
  console.log(`   - ICP:       ${loaded.data.icp}`);
  console.log(`   - Objetivo:  ${loaded.data.goal}\n`);
  if (fs.existsSync(loaded.paths.specMdPath)) {
    console.log(fs.readFileSync(loaded.paths.specMdPath, 'utf8'));
  }
}

function handleApproveSpec(taskArgs: string[]) {
  const slug = taskArgs[0];
  if (!slug) {
    console.error('❌ Error: Especifica el slug a aprobar. Ejemplo: engine task approve-spec mi-tarea');
    process.exit(1);
  }

  const res = orchestrator.approveSpec(slug);
  if (!res.success) {
    console.error(`❌ Fallo en la aprobación HITL-1: ${res.error}`);
    process.exit(1);
  }

  console.log(`\n🎉 [HITL-1 APROBADO] Spec aprobado formalmente.`);
  console.log(`   - Estado: ${res.context.state}`);
  console.log(`   - Siguiente paso: Iniciar redacción con el bucle de optimización (task evaluate).\n`);
}

function handleEvaluateDraft(taskArgs: string[]) {
  const slug = taskArgs[0];
  const draftInput = taskArgs[1];
  if (!slug || !draftInput) {
    console.error('❌ Error: Uso: engine task evaluate <slug> <archivo-borrador|texto>');
    process.exit(1);
  }

  let content = draftInput;
  if (fs.existsSync(draftInput)) {
    content = fs.readFileSync(draftInput, 'utf8');
  }

  // Dimensiones automáticas basadas en contenido
  const loaded = vault.loadSpec(slug);
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  
  // Heurística base para evaluación
  const goal = (loaded.data.goal || '').toLowerCase();
  const icp = (loaded.data.icp || '').toLowerCase();
  const lower = content.toLowerCase();
  
  const hasGoal = goal ? goal.split(/\s+/).some(w => w.length > 3 && lower.includes(w)) : true;
  const hasIcp = icp ? icp.split(/\s+/).some(w => w.length > 4 && lower.includes(w)) : true;
  const goalScore = (hasGoal ? 1.5 : 0.5) + (hasIcp ? 1.0 : 0.2);

  const hasSolana = /solana|metaplex|token|delaware|spv|on-chain/i.test(content);
  const techScore = hasSolana ? 2.5 : 1.5;
  const structScore = wordCount >= 100 ? 2.0 : 1.0;
  const origScore = 2.0;

  const result = orchestrator.evaluateDraft(
    slug,
    content,
    {
      goalIcp: goalScore,
      techRigor: techScore,
      founderVoice: structScore,
      originalityLexicon: origScore
    },
    ['Evaluación programática via engine.ts']
  );

  console.log(`\n📊 [REPORTE DE EVALUACIÓN 4D]`);
  console.log(`   - Calificación Neta: ${result.report.score} / 9.0 (Umbral: ${result.report.threshold})`);
  console.log(`   - ¿Aprobado?:        ${result.report.passed ? '✅ SÍ' : '❌ NO'}`);
  console.log(`   - Penalización:      -${result.report.clichesPenalty} pts por clichés`);
  console.log(`   - Nuevo Estado:      ${result.transition.context.state}`);
  console.log(`   - Ciclo Actual:      ${result.transition.context.currentCycle} / ${result.transition.context.maxCycles}\n`);
}

function handleReviewDeliverable(taskArgs: string[]) {
  const slug = taskArgs[0];
  if (!slug) {
    console.error('❌ Error: Especifica el slug a revisar. Ejemplo: engine task review-deliverable mi-tarea');
    process.exit(1);
  }

  const loaded = vault.loadSpec(slug);
  console.log(`\n🔍 [REVIEW DELIVERABLE] ${loaded.data.title}`);
  console.log(`   - Estado: ${loaded.data.status}`);
  if (fs.existsSync(loaded.paths.approvedDraftPath)) {
    console.log(fs.readFileSync(loaded.paths.approvedDraftPath, 'utf8'));
  } else {
    console.log(`⚠️ No se encontró borrador aprobado en ${loaded.paths.approvedDraftPath}`);
  }
}

function handleApproveDeliverable(taskArgs: string[]) {
  const slug = taskArgs[0];
  if (!slug) {
    console.error('❌ Error: Especifica el slug a aprobar. Ejemplo: engine task approve-deliverable mi-tarea');
    process.exit(1);
  }

  const res = orchestrator.approveDeliverable(slug);
  if (!res.success) {
    console.error(`❌ Fallo en la aprobación HITL-2: ${res.error}`);
    process.exit(1);
  }

  console.log(`\n🎉 [HITL-2 APROBADO] Entregable aprobado y publicado con éxito.`);
  console.log(`   - Estado: ${res.context.state}`);
  console.log(`   - Publicado en: ${res.context.slug}.md en BRIDS-Brain\n`);
}

function handleTaskStatus(taskArgs: string[]) {
  const slug = taskArgs[0];
  if (!slug) {
    console.error('❌ Error: Especifica el slug. Ejemplo: engine task status mi-tarea');
    process.exit(1);
  }

  const loaded = vault.loadSpec(slug);
  console.log(`\n📋 [ESTADO DE LA TAREA]`);
  console.log(`   - Título:   ${loaded.data.title}`);
  console.log(`   - Slug:     ${loaded.data.slug}`);
  console.log(`   - Estado:   ${loaded.data.status}`);
  console.log(`   - Ciclos:   ${loaded.data.evaluation?.current_cycle || 0} / ${loaded.data.evaluation?.max_cycles || 5}`);
  console.log(`   - Destino:  ${loaded.data.target_folder}`);
  console.log(`   - Ubicación spec: ${loaded.paths.specJsonPath}\n`);
}

function handleTaskList() {
  const specsDir = vault.getSpecsDir();
  if (!fs.existsSync(specsDir)) {
    console.log('No hay tareas ni specs inicializados.');
    return;
  }

  const files = fs.readdirSync(specsDir).filter(f => f.endsWith('.spec.json'));
  console.log(`\n📋 Catálogo de Specs Activos en BRIDS-Brain (${files.length}):`);
  for (const file of files) {
    const raw = fs.readFileSync(path.join(specsDir, file), 'utf8');
    const data = JSON.parse(raw);
    console.log(`   • [${data.status.padEnd(20)}] ${data.slug} - ${data.title}`);
  }
  console.log('');
}

// -------------------------------------------------------------
// MAIN DISPATCHER
// -------------------------------------------------------------
switch (command) {
  case 'task': {
    const sub = args[1];
    const taskArgs = args.slice(2);
    switch (sub) {
      case 'init': handleTaskInit(taskArgs); break;
      case 'preview': handlePreviewSpec(taskArgs); break;
      case 'approve-spec': handleApproveSpec(taskArgs); break;
      case 'evaluate': handleEvaluateDraft(taskArgs); break;
      case 'review-deliverable': handleReviewDeliverable(taskArgs); break;
      case 'approve-deliverable': handleApproveDeliverable(taskArgs); break;
      case 'status': handleTaskStatus(taskArgs); break;
      case 'list': handleTaskList(); break;
      default:
        console.error(`Comando de tarea desconocido: ${sub}`);
        printHelp();
        process.exit(1);
    }
    break;
  }
  case 'skills': {
    const sub = args[1];
    if (sub === 'validate') {
      const script = path.join(__dirname, '../scripts/validate-skills.sh');
      import('node:child_process').then(cp => {
        cp.execSync(`bash "${script}"`, { stdio: 'inherit' });
      });
    } else {
      console.log('Uso: engine skills validate');
    }
    break;
  }
  case 'help':
  default:
    printHelp();
    break;
}
