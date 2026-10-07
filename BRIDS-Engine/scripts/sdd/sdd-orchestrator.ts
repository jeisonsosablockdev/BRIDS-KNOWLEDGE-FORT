#!/usr/bin/env node

/**
 * Spec-Driven Development (SDD), Multi-Agent Session Lifecycle & Two-Agent Evaluator-Optimizer Engine
 * BRIDS Knowledge Fort (TypeScript)
 *
 * Absorbs:
 *  - sdd-orchestrator (HITL-1, Evaluator-Optimizer Loop, HITL-2, Vault Promotion)
 *  - task-manager (Multi-Agent Session init, add, update, show, list, close)
 *  - task-init & loop-task
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BANNED_PATTERNS, scanCliches, autoRemediateDraft as evalAutoRemediateDraft } from '../../evaluators/anti-cliche-filter.ts';
import {
  SDD_THRESHOLD,
  evaluateDeliverable,
  auditDeliverableText,
  evaluateWithClefSync,
  computeClefCacheKey,
} from '../../evaluators/sdd-4d-rubric.ts';
import {
  createInitialContext,
  startSpecReview,
  approveSpec as smApproveSpec,
  evaluateCycle as smEvaluateCycle,
  approveDeliverable as smApproveDeliverable,
  QUALITY_THRESHOLD,
  MAX_OPTIMIZATION_CYCLES,
} from '../../core/state-machine.ts';
import { VaultGateway, ensureDir } from '../../core/vault-gateway.ts';
import { TaskOrchestrator } from '../../core/orchestrator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../..');
const VAULT_DIR = path.join(ROOT_DIR, 'BRIDS-Brain');
const VAULT_INBOX = path.join(VAULT_DIR, '00 Inbox');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'BRIDS-Engine', 'templates');

export const VALID_SUBAGENTS = [
  'business-consultant',
  'market-research-analyst',
  'pitch-deck-architect',
  'compliance-officer',
  'b2b-sponsor-lead',
  'founder-ghostwriter',
  'narrative-intelligence-analyst',
];

export const VALID_VAULT_PREFIXES = [
  '00 Inbox',
  '01 Negocio',
  '02 Marketing',
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
  '02 Marketing/07 Analitica & Crecimiento',
];

const vaultGateway = new VaultGateway(VAULT_DIR, TEMPLATES_DIR);
const taskOrchestrator = new TaskOrchestrator(vaultGateway);

export {
  BANNED_PATTERNS,
  SDD_THRESHOLD,
  QUALITY_THRESHOLD,
  MAX_OPTIMIZATION_CYCLES,
  createInitialContext,
  VaultGateway,
  TaskOrchestrator,
  scanCliches,
  evaluateDeliverable,
  evaluateWithClefSync,
  computeClefCacheKey,
  taskOrchestrator,
};

export const sanitizeSlug = (str = '') => vaultGateway.sanitizeSlug(str);
export const getSpecPaths = (slug: string) => vaultGateway.getSpecPaths(slug);
export const loadSpec = (slug: string) => vaultGateway.loadSpec(slug);
export const saveSpec = (paths: { slug: string }, specData: Record<string, any>) =>
  vaultGateway.saveSpec(paths.slug, specData as any);
export const auditText = (text: string, specData: Record<string, any> = {}) => auditDeliverableText(text, specData);
export const autoRemediateDraft = (text: string, _report: Record<string, any> = {}) => evalAutoRemediateDraft(text);

// -------------------------------------------------------------
// CORE SDD COMMANDS (DELEGATED TO TaskOrchestrator — 3-ROLE ARCHITECTURE)
// -------------------------------------------------------------

export function initSpec(
  slug?: string,
  title?: string,
  targetFolder?: string,
  subagentsStr?: string,
  icp?: string,
  goal?: string
) {
  if (!slug || !title || !targetFolder) {
    console.error('❌ Uso: sdd-orchestrator init <slug> "<titulo>" "<target-folder>" "<subagents>" "[icp]" "[goal]"');
    process.exit(1);
  }

  const cleanSlug = sanitizeSlug(slug);
  const paths = getSpecPaths(cleanSlug);

  const normalizedTarget = targetFolder.replace(/^\/+|\/+$/g, '');
  const isValidVaultFolder = VALID_VAULT_PREFIXES.some(
    (prefix) => normalizedTarget === prefix || normalizedTarget.startsWith(`${prefix}/`)
  );

  if (!isValidVaultFolder) {
    console.error(`❌ Carpeta de destino inválida: "${targetFolder}".`);
    process.exit(1);
  }

  const rawAgents = (subagentsStr || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const subagents = rawAgents.length > 0 ? rawAgents : ['founder-ghostwriter'];
  const unknownAgents = subagents.filter((a) => !VALID_SUBAGENTS.includes(a));
  if (unknownAgents.length > 0) {
    console.warn(`⚠️ Advertencia: Los siguientes agentes no pertenecen al squad estándar: ${unknownAgents.join(', ')}`);
  }

  if (fs.existsSync(paths.specJsonPath) && fs.existsSync(paths.specMdPath)) {
    console.log(`ℹ️ El spec "${cleanSlug}" ya existe en ${paths.specJsonPath}.`);
    const currentData = loadSpec(cleanSlug).data;
    console.log(`   Estado actual: ${currentData.status}`);
    return paths;
  }

  taskOrchestrator.initSpec({
    slug: cleanSlug,
    title,
    targetFolder: normalizedTarget,
    subagents,
    icp: icp || 'Real Estate Sponsors & LPs',
    goal: goal || `Consolidar ${title}`,
  });

  const canonicalVaultFile = path.join(normalizedTarget, `${cleanSlug}.md`);
  console.log(`✅ Spec inicializado con éxito: ${paths.specId}`);
  console.log(`   📄 Documento Spec: ${paths.specMdPath}`);
  console.log(`   ⚙️ Estado JSON:   ${paths.specJsonPath}`);
  console.log(`   🎯 Destino Final:  BRIDS-Brain/${canonicalVaultFile}`);
  console.log(`   🤖 Subagentes:     ${subagents.join(', ')}`);
  console.log(`\n🛑 GUARDRAIL HITL-1 ACTIVO:`);
  console.log(`   El spec y su ValidationContract están en espera de tu revisión humana.`);
  console.log(`   👉 Para aprobar:  node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts approve-spec ${cleanSlug}`);
  console.log(`   👉 Para ajustar:  node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts refine-spec ${cleanSlug} "<observaciones>"`);
  return paths;
}

export function refineSpec(slug?: string, userFeedback?: string) {
  if (!slug || !userFeedback) {
    console.error('❌ Uso: sdd-orchestrator refine-spec <slug> "<observaciones_del_usuario>"');
    process.exit(1);
  }
  const data = taskOrchestrator.refineSpec(slug, userFeedback);
  console.log(`✅ Especificación "${data.spec_id || data.id}" actualizada con el feedback del usuario.`);
  return data;
}

export function approveSpec(slug?: string) {
  if (!slug) {
    console.error('❌ Uso: sdd-orchestrator approve-spec <slug>');
    process.exit(1);
  }
  const { data } = loadSpec(slug);

  if (data.status === 'completed' || data.status === 'deliverable_review') {
    console.log(`ℹ️ La especificación "${slug}" ya fue aprobada previamente.`);
    return data;
  }

  if (data.hitl_checkpoints?.hitl_1_spec_approval?.status === 'approved' && data.status === 'spec_approved') {
    console.log(`ℹ️ La especificación "${slug}" ya se encuentra aprobada formalmente.`);
    return data;
  }

  const res = taskOrchestrator.approveSpec(slug);
  if (!res.success) {
    throw new Error(res.error);
  }

  const updated = loadSpec(slug).data;
  console.log(`🎉 GUARDRAIL HITL-1 SUPERADO: Especificación "${updated.spec_id || updated.id}" aprobada formalmente.`);
  console.log('   La ejecución de Workers en serie (contexto limpio) y el Validador Adversarial quedan habilitados.');
  return updated;
}

export function recordWorkerHandoff(
  slug?: string,
  workerId?: string,
  completedStr?: string,
  pendingStr?: string,
  decisionsStr?: string
) {
  if (!slug || !workerId || !completedStr) {
    console.error('❌ Uso: sdd-orchestrator handoff <slug> <worker-id> "<completado>" "[pendiente]" "[decisiones]"');
    process.exit(1);
  }
  const splitList = (raw?: string) =>
    (raw || '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);

  const handoff = taskOrchestrator.recordWorkerHandoff(slug, {
    worker_id: workerId,
    completed_items: splitList(completedStr),
    pending_items: splitList(pendingStr),
    decisions_made: splitList(decisionsStr),
  });

  console.log(`🤝 HANDOFF ESTRUCTURADO REGISTRADO (Paso #${handoff.step_index} - Worker: ${handoff.worker_id})`);
  console.log(`   ✅ Completados: ${handoff.completed_items.length} | ⏳ Pendientes: ${handoff.pending_items.length}`);
  return handoff;
}

export function evaluateDraft(slug: string, draftContent: string, cycleOverride: number | null = null) {
  const result = taskOrchestrator.auditAndEvaluateDraft(slug, draftContent, cycleOverride);
  const { report, data, passed, frozen } = result;
  const maxCycles = data.evaluation?.max_cycles || MAX_OPTIMIZATION_CYCLES;

  console.log(`\n🔍 AUDITORÍA ADVERSARIAL DE CICLO ${report.cycle}/${maxCycles}: ${data.spec_id || data.id}`);
  console.log(`   Motor Decisión:  ${report.clef_decision.engine} (SHA256: ${report.clef_decision.cache_key.slice(0, 12)})`);
  console.log(`   Puntaje Total:   ${report.total_score} / ${report.scale_max} (Umbral: ${report.passing_threshold})`);
  console.log(`   Objetivo & ICP:  ${report.scoring_dimensions['1_goal_and_icp'].score} / 2.5 (Clef P=${report.scoring_dimensions['1_goal_and_icp'].clef_probability})`);
  console.log(`   Técnica/Fuentes: ${report.scoring_dimensions['2_technical_veracity'].score} / 2.5 (Clef P=${report.scoring_dimensions['2_technical_veracity'].clef_probability})`);
  console.log(`   Voz Fundadora:   ${report.scoring_dimensions['3_founder_voice'].score} / 2.0 (Clef P=${report.scoring_dimensions['3_founder_voice'].clef_probability})`);
  console.log(`   Originalidad:    ${report.scoring_dimensions['4_lexical_originality'].score} / 2.0 (Clef P=${report.scoring_dimensions['4_lexical_originality'].clef_probability})`);

  if (passed) {
    console.log(`   🎉 ¡APROBADO POR EL VALIDADOR ADVERSARIAL! Nota >= ${report.passing_threshold}`);
    console.log(`\n🛑 GUARDRAIL HITL-2 ACTIVADO:`);
    console.log(`   El texto superó la auditoría autónoma (${report.total_score}/9.0) y espera tu revisión humana.`);
    console.log(`   El archivo NO ha sido promovido al vault de producción aún.`);
    return { passed: true, ready_for_hitl_2: true, report, data };
  }

  console.log(`   ⚠️ NO APROBADO POR EL VALIDADOR: Calificación insuficiente (${report.total_score} < ${report.passing_threshold})`);
  if (report.banned_phrases_detected.length > 0) {
    console.log(`   🚫 Clichés detectados: ${report.banned_phrases_detected.map((b) => `"${b.phrase}" (${b.count}x)`).join(', ')}`);
  }
  for (const dir of report.remediation_directives) {
    console.log(`      • ${dir}`);
  }

  if (frozen) {
    console.log(`\n🛑 LÍMITE DE SEGURIDAD ALCANZADO (${maxCycles} Ciclos).`);
    return { passed: false, frozen: true, report, data };
  }

  return { passed: false, frozen: false, report, data };
}

export function reviewDeliverable(slug?: string) {
  if (!slug) {
    console.error('❌ Uso: sdd-orchestrator review-deliverable <slug>');
    process.exit(1);
  }
  const { data } = loadSpec(slug);
  const currentCycle = data.evaluation?.current_cycle ?? data.iteration ?? 1;
  const draftToReview = vaultGateway.loadLatestDraft(slug, currentCycle) || '';

  console.log('\n' + '═'.repeat(80));
  console.log(`📄 REVISIÓN DE ENTREGABLE FINAL (HITL-2): ${data.spec_id || data.id} - ${data.title}`);
  console.log('═'.repeat(80));
  console.log(draftToReview.trim());
  console.log('═'.repeat(80));
}

export function refineDeliverable(slug?: string, userFeedback?: string) {
  if (!slug || !userFeedback) {
    console.error('❌ Uso: sdd-orchestrator refine-deliverable <slug> "<observaciones_del_usuario>"');
    process.exit(1);
  }
  return taskOrchestrator.refineDeliverable(slug, userFeedback);
}

export function formatFinalVaultNote(specData: Record<string, any>, rawDraft: string, report: Record<string, any>): string {
  return vaultGateway.formatFinalVaultNote(specData, rawDraft, report as any);
}

export function approveDeliverable(slug?: string) {
  if (!slug) {
    console.error('❌ Uso: sdd-orchestrator approve-deliverable <slug>');
    process.exit(1);
  }
  const { data, paths } = loadSpec(slug);

  if (data.status === 'completed') {
    console.log(`ℹ️ El entregable "${slug}" ya fue aprobado e integrado previamente.`);
    return data;
  }

  const finalScore = data.evaluation?.final_score ?? null;
  if (!fs.existsSync(paths.approvedDraftPath) && (finalScore === null || finalScore < QUALITY_THRESHOLD)) {
    throw new Error(
      `❌ No se puede integrar el entregable: no cuenta con una versión que supere el umbral de calidad >= ${QUALITY_THRESHOLD}.`
    );
  }

  const res = taskOrchestrator.approveDeliverable(slug, undefined, true);
  if (!res.success) {
    throw new Error(res.error);
  }

  console.log(`\n🎉 GUARDRAIL HITL-2 SUPERADO: Entregable aprobado formalmente por el usuario.`);
  console.log(`🚀 Promovido e integrado con éxito a: BRIDS-Brain/${res.data?.target_file || data.target_file}`);
  return res.data || data;
}

export function previewSpec(slug?: string) {
  if (!slug) {
    console.error('❌ Uso: sdd-orchestrator preview <slug>');
    process.exit(1);
  }
  const { data } = loadSpec(slug);
  console.log('\n' + '═'.repeat(75));
  console.log(`📋 ESPECIFICACIÓN: ${data.spec_id || data.id} - ${data.title}`);
  console.log('═'.repeat(75));
  console.log(`Estado Global:        ${String(data.status).toUpperCase()}`);
  console.log(`Destino en Vault:     BRIDS-Brain/${data.target_file || data.target_folder}`);
  console.log(`Subagentes Squad:     ${(data.subagents_involved || data.subagents || []).join(', ')}`);
  if (data.validation_contract) {
    console.log(`Contrato Validación:  ${data.validation_contract.contract_id} (Umbral >= ${data.validation_contract.quality_threshold})`);
  }
  console.log('═'.repeat(75) + '\n');
}

export function listSpecs() {
  const specsList = vaultGateway.listSpecs();
  console.log('\n' + '═'.repeat(85));
  console.log('📁 CATÁLOGO DE ESPECIFICACIONES SDD (BRIDS-BRAIN/00 INBOX/SPECS)');
  console.log('═'.repeat(85));

  if (specsList.length === 0) {
    console.log('  (No hay especificaciones registradas).');
  }

  for (const item of specsList) {
    try {
      const { data } = vaultGateway.loadSpec(item.slug);
      const statusIcon =
        data.status === 'completed'
          ? '✅'
          : data.status === 'spec_approved'
            ? '🟢'
            : data.status === 'deliverable_review'
              ? '🟡'
              : '⏳';
      const scoreStr =
        data.evaluation?.final_score !== null && data.evaluation?.final_score !== undefined
          ? `${data.evaluation.final_score}/9.0`
          : 'Pendiente';
      const h1 = data.hitl_checkpoints?.hitl_1_spec_approval?.status === 'approved' ? 'H1:OK' : 'H1:WAIT';
      const h2 = data.hitl_checkpoints?.hitl_2_deliverable_approval?.status === 'approved' ? 'H2:OK' : 'H2:WAIT';
      console.log(
        `${statusIcon} ${String(data.spec_id || item.slug).padEnd(25)} | [${h1} ${h2}] | Estado: ${String(data.status).padEnd(18)} | Nota: ${scoreStr.padEnd(10)} | ${data.title}`
      );
      console.log(
        `   └─ Destino: BRIDS-Brain/${data.target_file || data.target_folder} | Agentes: ${(data.subagents_involved || data.subagents || []).join(', ')}`
      );
    } catch {
      // ignore corrupted file
    }
  }
  console.log('═'.repeat(85) + '\n');
}

export function runTaskLoop(slug: string, initialDraftContent: string, maxCycles: number = MAX_OPTIMIZATION_CYCLES) {
  let currentDraft = initialDraftContent;
  let lastResult: any = null;

  for (let i = 0; i < maxCycles; i++) {
    lastResult = evaluateDraft(slug, currentDraft);
    if (lastResult.passed || lastResult.data.status === 'frozen_for_arbitration') {
      break;
    }
    currentDraft = autoRemediateDraft(currentDraft, lastResult.report);
  }

  return lastResult;
}

// -------------------------------------------------------------
// MULTI-AGENT SESSION LIFECYCLE (Absorbed from task-manager.js)
// -------------------------------------------------------------

function getSessionPath(sessionId: string): string {
  return path.join(VAULT_INBOX, `${sanitizeSlug(sessionId)}.json`);
}

function loadSession(sessionId: string): { data: Record<string, any>; path: string } {
  const filePath = getSessionPath(sessionId);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: No se encontró la sesión "${sessionId}" en ${filePath}`);
    process.exit(1);
  }
  return { data: JSON.parse(fs.readFileSync(filePath, 'utf8')), path: filePath };
}

function saveSession(filePath: string, data: Record<string, any>): void {
  data.updated_at = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export function initSession(sessionId?: string, goal?: string, icp?: string, constraints?: string) {
  if (!sessionId) {
    console.error('Uso: sdd-orchestrator session init <session-id> [objetivo] [icp] [restricciones]');
    process.exit(1);
  }
  ensureDir(VAULT_INBOX);
  const slug = sanitizeSlug(sessionId);
  const targetPath = getSessionPath(slug);
  if (fs.existsSync(targetPath)) {
    console.error(`⚠️ La sesión "${slug}" ya existe en ${targetPath}`);
    process.exit(1);
  }
  const now = new Date().toISOString();
  const sessionData = {
    session_id: slug,
    created_at: now,
    updated_at: now,
    status: 'in_progress',
    intent: {
      raw_prompt: slug,
      business_goal: goal || 'Objetivo comercial por definir',
      target_icp: icp || 'Audiencia objetivo por definir',
      constraints: constraints ? constraints.split(',').map((s) => s.trim()) : ['Tono directo', 'Sin clichés'],
      brand_context_verified: true,
    },
    workflows_chained: [] as string[],
    atomic_tasks: [] as Array<Record<string, any>>,
    metrics_and_measurement: {
      primary_kpi: 'Tasa de conversión / resultado',
      baseline_value: 'N/A',
      target_value: 'A definir',
      tracking_plan_path: '02 Marketing/07 Analitica & Crecimiento/',
    },
  };
  saveSession(targetPath, sessionData);
  console.log(`\n✅ Sesión de tarea inicializada exitosamente: ${slug}`);
  return sessionData;
}

export function listSessions(): void {
  ensureDir(VAULT_INBOX);
  const files = fs.readdirSync(VAULT_INBOX).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    console.log('\n📭 No hay sesiones de tareas activas en 00 Inbox.\n');
    return;
  }
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(VAULT_INBOX, file), 'utf8'));
    console.log(`📌 ${content.session_id || file} (${content.status})`);
  }
}

export function addSessionTask(
  sessionId?: string,
  title?: string,
  workflow?: string,
  skillsStr?: string,
  outputPath?: string,
  dependsOnStr?: string
) {
  if (!sessionId || !title || !workflow || !outputPath) {
    console.error('Uso: sdd-orchestrator add <session-id> "<titulo>" <workflow> "<skills>" "<output-path>" [depends-on]');
    process.exit(1);
  }
  const { data, path: filePath } = loadSession(sessionId);
  const tasks = data.atomic_tasks || [];
  const taskId = `TASK-${String(tasks.length + 1).padStart(3, '0')}`;
  const skills = (skillsStr || '').split(',').map((s) => s.trim()).filter(Boolean);
  const dependsOn = (dependsOnStr || '').split(',').map((s) => s.trim()).filter(Boolean);
  const newTask = {
    id: taskId,
    title: title.trim(),
    workflow: workflow.toUpperCase().trim(),
    skills,
    status: 'pending',
    depends_on: dependsOn,
    inputs: { context_file: 'BRIDS-Engine/context/product-marketing-context.md', reference_task_ids: dependsOn },
    output: { vault_path: outputPath.trim(), format: 'markdown', summary: `Entregable para ${title}` },
    validation_criteria: [`Cumple estándar de ${workflow}`, 'Revisión y formato verificados'],
  };
  tasks.push(newTask);
  data.atomic_tasks = tasks;
  if (!data.workflows_chained.includes(newTask.workflow)) data.workflows_chained.push(newTask.workflow);
  saveSession(filePath, data);
  console.log(`\n✅ Subtarea ${taskId} agregada a la sesión "${sessionId}".`);
  return newTask;
}

export function updateSessionTask(sessionId?: string, taskId?: string, newStatus?: string, summary?: string) {
  if (!sessionId || !taskId || !newStatus) {
    console.error('Uso: sdd-orchestrator update <session-id> <task-id> <pending|in_progress|completed|blocked> [resumen]');
    process.exit(1);
  }
  const statusLower = newStatus.toLowerCase().trim();
  if (!['pending', 'in_progress', 'completed', 'blocked'].includes(statusLower)) {
    console.error(`❌ Estado inválido: "${newStatus}"`);
    process.exit(1);
  }
  const { data, path: filePath } = loadSession(sessionId);
  const task = (data.atomic_tasks || []).find((t: any) => t.id === taskId.toUpperCase().trim());
  if (!task) {
    console.error(`❌ No se encontró la subtarea "${taskId}" en la sesión "${sessionId}"`);
    process.exit(1);
  }
  task.status = statusLower;
  if (summary) task.output.summary = summary.trim();
  if (data.atomic_tasks.length > 0 && data.atomic_tasks.every((t: any) => t.status === 'completed')) {
    data.status = 'completed';
  } else if (data.status === 'pending') {
    data.status = 'in_progress';
  }
  saveSession(filePath, data);
  console.log(`\n✅ Subtarea "${task.id}" actualizada a estado: ${statusLower.toUpperCase()}`);
  return data;
}

export function showSession(sessionId?: string) {
  if (!sessionId) {
    console.error('Uso: sdd-orchestrator show <session-id>');
    process.exit(1);
  }
  const { data } = loadSession(sessionId);
  console.log(`\n🎯 SESIÓN: ${data.session_id.toUpperCase()} [Estado: ${data.status.toUpperCase()}]`);
  return data;
}

export function closeSession(sessionId?: string, notes?: string) {
  if (!sessionId) {
    console.error('Uso: sdd-orchestrator close <session-id> [notas-finales]');
    process.exit(1);
  }
  const { data, path: filePath } = loadSession(sessionId);
  data.status = 'completed';
  if (notes) data.metrics_and_measurement.final_notes = notes;
  saveSession(filePath, data);
  console.log(`\n🎉 Sesión "${sessionId}" marcada como COMPLETADA.`);
  return data;
}

// -------------------------------------------------------------
// CLI DISPATCHER
// -------------------------------------------------------------

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const args = process.argv.slice(2);
  const cmd = args[0];

  switch (cmd) {
    case 'init':
      // Disambiguate between SDD init (has targetFolder inVALID_VAULT_PREFIXES) vs Session init
      if (args[3] && VALID_VAULT_PREFIXES.some((p) => args[3]!.replace(/^\/+|\/+$/g, '').startsWith(p))) {
        initSpec(args[1], args[2], args[3], args[4], args[5], args[6]);
      } else if (args.length <= 4 && (!args[3] || !args[3].includes('/'))) {
        initSession(args[1], args[2], args[3], args[4]);
      } else {
        initSpec(args[1], args[2], args[3], args[4], args[5], args[6]);
      }
      break;
    case 'session': {
      const sub = args[1];
      if (sub === 'init') initSession(args[2], args[3], args[4], args[5]);
      else if (sub === 'add') addSessionTask(args[2], args[3], args[4], args[5], args[6], args[7]);
      else if (sub === 'update') updateSessionTask(args[2], args[3], args[4], args[5]);
      else if (sub === 'show') showSession(args[2]);
      else if (sub === 'close') closeSession(args[2], args[3]);
      else listSessions();
      break;
    }
    case 'add':
      addSessionTask(args[1], args[2], args[3], args[4], args[5], args[6]);
      break;
    case 'update':
      updateSessionTask(args[1], args[2], args[3], args[4]);
      break;
    case 'show':
      showSession(args[1]);
      break;
    case 'close':
    case 'finish':
      closeSession(args[1], args[2]);
      break;
    case 'preview':
    case 'status':
      previewSpec(args[1]);
      break;
    case 'approve-spec':
    case 'approve':
      approveSpec(args[1]);
      break;
    case 'refine-spec':
      refineSpec(args[1], args[2]);
      break;
    case 'handoff':
      recordWorkerHandoff(args[1], args[2], args[3], args[4], args[5]);
      break;
    case 'evaluate': {
      const slug = args[1];
      const filePath = args[2];
      if (!slug || !filePath || !fs.existsSync(filePath)) {
        console.error('Uso: sdd-orchestrator evaluate <slug> <draft-file>');
        process.exit(1);
      }
      const draftText = fs.readFileSync(filePath, 'utf8');
      const res = evaluateDraft(slug, draftText);
      process.exit(res.passed ? 0 : 2);
      break;
    }
    case 'loop-task':
    case 'run-task-loop': {
      const slug = args[1];
      const filePath = args[2];
      if (!slug || !filePath || !fs.existsSync(filePath)) {
        console.error('Uso: sdd-orchestrator loop-task <slug> <draft-file>');
        process.exit(1);
      }
      const draftText = fs.readFileSync(filePath, 'utf8');
      const res = runTaskLoop(slug, draftText);
      process.exit(res && res.passed ? 0 : 2);
      break;
    }
    case 'review-deliverable':
      reviewDeliverable(args[1]);
      break;
    case 'refine-deliverable':
      refineDeliverable(args[1], args[2]);
      break;
    case 'approve-deliverable':
    case 'accept':
      approveDeliverable(args[1]);
      break;
    case 'list':
      listSpecs();
      break;
    case 'audit-text': {
      const filePath = args[1];
      if (!filePath || !fs.existsSync(filePath)) {
        console.error('Uso: sdd-orchestrator audit-text <file.md>');
        process.exit(1);
      }
      const text = fs.readFileSync(filePath, 'utf8');
      const report = auditText(text);
      console.log(JSON.stringify(report, null, 2));
      process.exit(report.passed ? 0 : 1);
      break;
    }
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      console.log(`
Spec-Driven Development (SDD) & Multi-Agent Session Engine - BRIDS.io (TypeScript)

Comandos SDD (Arquitectura de 3 Roles + Doble Guardrail HITL):
  init <slug> "<titulo>" "<target-folder>" "<subagents>" "[icp]" "[goal]"
  preview <slug> | refine-spec <slug> "<obs>" | approve-spec <slug>
  handoff <slug> <worker-id> "<completado>" "[pendiente]" "[decisiones]"
  evaluate <slug> <draft-file> | loop-task <slug> <draft-file>
  review-deliverable <slug> | refine-deliverable <slug> "<obs>" | approve-deliverable <slug>
  list

Comandos de Sesiones Multi-Agente:
  session init <id> [meta] [icp]
  session add <id> <titulo> <workflow> <skills> <path> [depends_on]
  session update <id> <task_id> <status> [resumen]
  session show <id> | session close <id> [notas]
`);
      break;
    default: {
      const toTitle = (s = '') => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const isVault = (s = '') => Boolean(s) && VALID_VAULT_PREFIXES.some((p) => s.replace(/^\/+|\/+$/g, '').startsWith(p));
      const title = isVault(args[2]) ? args[1] || toTitle(cmd) : toTitle(cmd);
      const folder = isVault(args[2]) ? args[2]! : isVault(args[3]) ? args[3]! : args[1] ? '01 Negocio/01 Estrategia & Modelo' : '00 Inbox';
      const agents = isVault(args[2]) ? args[3] || 'founder-ghostwriter,business-consultant' : 'founder-ghostwriter,business-consultant';
      const icp = isVault(args[2]) ? args[4] : args[2];
      const goal = isVault(args[2]) ? args[5] : args[1];
      initSpec(cmd, title, folder, agents, icp, goal);
      break;
    }
  }
}
