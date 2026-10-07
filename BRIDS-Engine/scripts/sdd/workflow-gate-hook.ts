#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STRATEGIC_MODEL_ROUTING,
  type TaskSpecData,
  type ExecutionConcurrencyMode,
} from '../../core/contracts.ts';
import { VaultGateway } from '../../core/vault-gateway.ts';
import { TaskOrchestrator } from '../../core/orchestrator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENGINE_DIR = path.resolve(__dirname, '../..');
const ROOT_DIR = path.resolve(ENGINE_DIR, '..');
const DEFAULT_BRAIN_DIR = path.join(ROOT_DIR, 'BRIDS-Brain');
const DEFAULT_SPECS_DIR = path.join(DEFAULT_BRAIN_DIR, '00 Inbox', 'Specs');

export interface PreToolUsePayload {
  sessionId?: string;
  conversationId?: string;
  artifactDirectoryPath?: string;
  toolCall: {
    id?: string;
    name: string;
    args: Record<string, any>;
  };
}

export interface StopHookPayload {
  sessionId?: string;
  conversationId?: string;
  stopReason?: string;
}

export interface HookOutput {
  decision?: 'allow' | 'deny' | 'continue';
  reason?: string;
  overwrite?: Record<string, any>;
}

export interface GateOptions {
  specsDir?: string;
  vaultRoot?: string;
}

const PARALLEL_READ_AGENTS = new Set<string>([
  'market-research-analyst',
  'narrative-intelligence-analyst',
  'research',
]);

function getExecutionMode(agentType: string): ExecutionConcurrencyMode {
  if (PARALLEL_READ_AGENTS.has(agentType)) {
    return 'parallel_read';
  }
  const route = STRATEGIC_MODEL_ROUTING[agentType];
  return route ? route.executionMode : 'serial_write';
}

function loadAllSpecs(specsDir: string): Array<{ slug: string; data: TaskSpecData }> {
  if (!fs.existsSync(specsDir)) return [];
  const entries = fs.readdirSync(specsDir);
  const specs: Array<{ slug: string; data: TaskSpecData }> = [];

  for (const entry of entries) {
    if (!entry.endsWith('.spec.json')) continue;
    const slug = entry.replace(/\.spec\.json$/, '');
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(specsDir, entry), 'utf8')) as TaskSpecData;
      specs.push({ slug, data: raw });
    } catch {
      // Ignore malformed JSON files in inbox
    }
  }
  return specs;
}

function isArtifactPath(targetFile: string, artifactDir?: string): boolean {
  const normalized = targetFile.replace(/\\/g, '/');
  if (artifactDir) {
    const normArtifactDir = artifactDir.replace(/\\/g, '/');
    if (normalized.startsWith(normArtifactDir)) return true;
  }
  return normalized.includes('/.gemini/antigravity/brain/');
}

function isProductionVaultPath(targetFile: string): boolean {
  const normalized = targetFile.replace(/\\/g, '/');
  return (
    normalized.includes('BRIDS-Brain/01 Negocio/') ||
    normalized.includes('BRIDS-Brain/02 Marketing/')
  );
}

function extractDraftWorkSlug(targetFile: string): string | null {
  const normalized = targetFile.replace(/\\/g, '/');
  const match = normalized.match(/\/00 Inbox\/Specs\/([^/]+)-work\/draft_cycle_\d+\.md$/);
  return match ? match[1] : null;
}

/**
 * Pure, synchronous, zero-latency (< 5ms) deterministic PreToolUse gate.
 * Enforces:
 * 1. Anti-Auto-Proceed on artifacts (forces RequestFeedback: false).
 * 2. HITL-1 & ValidationContract before writing any draft_cycle_N.md.
 * 3. HITL-2 protection against direct writes to BRIDS-Brain/01 Negocio or 02 Marketing without a completed Spec.
 * 4. Serial Write Execution, StructuredHandoff continuity, and Strategic Model Routing on invoke_subagent.
 */
export function evaluatePreToolUse(
  payload: PreToolUsePayload,
  options: GateOptions = {}
): HookOutput {
  const specsDir = options.specsDir ?? DEFAULT_SPECS_DIR;
  const toolName = payload?.toolCall?.name ?? '';
  const args = payload?.toolCall?.args ?? {};

  // =========================================================================
  // 1. FILE WRITE / EDIT GATES (write_to_file, replace_file_content, multi_replace_file_content)
  // =========================================================================
  if (
    toolName === 'write_to_file' ||
    toolName === 'replace_file_content' ||
    toolName === 'multi_replace_file_content'
  ) {
    const targetFile = String(args.TargetFile ?? '');

    // Rule 1A: Anti-Auto-Proceed on Artifacts (forces RequestFeedback: false)
    if (
      toolName === 'write_to_file' &&
      isArtifactPath(targetFile, payload.artifactDirectoryPath) &&
      args.ArtifactMetadata &&
      args.ArtifactMetadata.RequestFeedback === true
    ) {
      return {
        decision: 'allow',
        overwrite: {
          ...args,
          ArtifactMetadata: {
            ...args.ArtifactMetadata,
            RequestFeedback: false,
          },
        },
      };
    }

    // Rule 1B: HITL-1 & ValidationContract Gate on <slug>-work/draft_cycle_N.md
    const draftSlug = extractDraftWorkSlug(targetFile);
    if (draftSlug) {
      const specPath = path.join(specsDir, `${draftSlug}.spec.json`);
      if (!fs.existsSync(specPath)) {
        return {
          decision: 'deny',
          reason: `🛑 BLOQUEO HITL-1 (workflow-gate-hook): No existe un Spec registrado para "${draftSlug}". Inicializa y aprueba el Spec antes de redactar borradores.`,
        };
      }
      const spec = JSON.parse(fs.readFileSync(specPath, 'utf8')) as TaskSpecData;
      if (spec.status === 'initialized' || spec.status === 'spec_review') {
        return {
          decision: 'deny',
          reason: `🛑 BLOQUEO HITL-1 (workflow-gate-hook): El Spec "${draftSlug}" está en estado "${spec.status}" sin aprobación humana (hitl_1_approved=false). Ejecuta approve-spec tras confirmación del usuario.`,
        };
      }
      const criteria = spec.validation_contract?.acceptance_criteria ?? [];
      if (criteria.length === 0) {
        return {
          decision: 'deny',
          reason: `🛑 BLOQUEO DE CONTRATO (workflow-gate-hook): El Spec "${draftSlug}" no posee un ValidationContract con acceptance_criteria definidos.`,
        };
      }
    }

    // Rule 1C: HITL-2 Production Vault Protection (01 Negocio / 02 Marketing)
    if (isProductionVaultPath(targetFile)) {
      const normalizedTarget = targetFile.replace(/\\/g, '/');
      const allSpecs = loadAllSpecs(specsDir);

      // Find if there is a Spec matching this target file
      const matchingSpec = allSpecs.find(({ slug, data }) => {
        if (data.target_file && normalizedTarget.endsWith(data.target_file.replace(/\\/g, '/'))) {
          return true;
        }
        return normalizedTarget.endsWith(`${slug}.md`);
      });

      if (!matchingSpec) {
        return {
          decision: 'deny',
          reason: `🛑 BLOQUEO HITL-2 (workflow-gate-hook): Prohibido escribir directamente en BRIDS-Brain/ (01 Negocio / 02 Marketing) sin un Spec SDD aprobado y completado. Usa sdd-orchestrator.ts init -> approve-spec -> approve-deliverable.`,
        };
      }

      const hitl2Approved =
        matchingSpec.data.hitl_checkpoints?.hitl_2_deliverable_approval?.status === 'approved' ||
        Boolean((matchingSpec.data as any).hitl_2_approved);

      if (matchingSpec.data.status !== 'completed' || !hitl2Approved) {
        return {
          decision: 'deny',
          reason: `🛑 BLOQUEO HITL-2 (workflow-gate-hook): El Spec "${matchingSpec.slug}" está en estado "${matchingSpec.data.status}" (hitl_2_approved=${hitl2Approved}). Usa "sdd-orchestrator.ts approve-deliverable ${matchingSpec.slug}" tras aprobación humana.`,
        };
      }
    }

    return { decision: 'allow' };
  }

  // =========================================================================
  // 2. SUBAGENT INVOCATION GATES (invoke_subagent)
  // =========================================================================
  if (toolName === 'invoke_subagent') {
    const subagents: Array<Record<string, any>> = Array.isArray(args.Subagents)
      ? args.Subagents
      : [];

    if (subagents.length === 0) {
      return { decision: 'allow' };
    }

    // Rule 2A: Serial Execution for Writes, Parallel for Reads
    if (subagents.length > 1) {
      const nonParallelAgents = subagents
        .map((s) => String(s.TypeName || s.Role || ''))
        .filter((agentName) => getExecutionMode(agentName) !== 'parallel_read');

      if (nonParallelAgents.length > 0) {
        return {
          decision: 'deny',
          reason: `🛑 VIOLACIÓN DE EJECUCIÓN EN SERIE (workflow-gate-hook): Intentaste invocar ${subagents.length} subagentes en paralelo incluyendo Workers de escritura (${nonParallelAgents.join(', ')}). Los Workers serial_write deben ejecutarse UNO POR UNO en serie con StructuredHandoff. Solo los recolectores de lectura (market-research-analyst, narrative-intelligence-analyst, research) pueden correr en paralelo.`,
        };
      }
    }

    // Rule 2B: Verify HITL-1 & Handoff Continuity when a Spec slug is referenced in Prompt
    const allSpecs = loadAllSpecs(specsDir);
    for (const sub of subagents) {
      const agentType = String(sub.TypeName || '');
      const promptText = String(sub.Prompt || '');
      const mode = getExecutionMode(agentType);

      if (mode === 'serial_write') {
        for (const { slug, data } of allSpecs) {
          if (promptText.includes(slug)) {
            if (data.status === 'initialized' || data.status === 'spec_review') {
              return {
                decision: 'deny',
                reason: `🛑 BLOQUEO HITL-1 (workflow-gate-hook): No puedes invocar al Worker de escritura "${agentType}" para el Spec "${slug}" porque sigue en estado "${data.status}" sin aprobación humana.`,
              };
            }

            // Check Serial Handoff ordering if topology has multiple serialWriteWorkers
            const rawSerialWorkers =
              data.execution_topology?.serialWriteWorkers ??
              (data.execution_topology as any)?.serial_write_workers ??
              [];
            const serialChain: string[] = rawSerialWorkers.map((w: any) =>
              typeof w === 'string' ? w : String(w.agentId || '')
            );
            const workerIdx = serialChain.indexOf(agentType);
            if (workerIdx > 0) {
              const prevWorker = serialChain[workerIdx - 1];
              const handoffs = data.worker_handoffs ?? [];
              const prevCompleted = handoffs.some(
                (h) => h.worker_id === prevWorker && h.completed_items.length > 0
              );
              if (!prevCompleted) {
                return {
                  decision: 'deny',
                  reason: `🛑 BLOQUEO DE HANDOFF EN SERIE (workflow-gate-hook): No puedes invocar a "${agentType}" (paso ${workerIdx + 1}) para "${slug}" hasta que el Worker previo "${prevWorker}" registre su StructuredHandoff completado.`,
                };
              }
            }
          }
        }
      }
    }

    // Rule 2C: Strategic Model Routing (flash for parallel_read, pro/inherit for serial_write)
    let modified = false;
    const updatedSubagents = subagents.map((sub) => {
      const agentType = String(sub.TypeName || '');
      const route = STRATEGIC_MODEL_ROUTING[agentType];
      if (!route) return sub;

      if (route.executionMode === 'parallel_read' && sub.Model !== 'flash') {
        modified = true;
        return { ...sub, Model: 'flash' };
      }

      if (
        route.executionMode === 'serial_write' &&
        (sub.Model === 'flash' || sub.Model === 'flash_lite' || !sub.Model)
      ) {
        modified = true;
        return { ...sub, Model: route.modelTier };
      }

      return sub;
    });

    if (modified) {
      return {
        decision: 'allow',
        overwrite: {
          ...args,
          Subagents: updatedSubagents,
        },
      };
    }

    return { decision: 'allow' };
  }

  return { decision: 'allow' };
}

/**
 * Asynchronous Stop Hook Gate (Role 3: Zero-Bias Adversarial Validator).
 * Inspects active Specs in `00 Inbox/Specs/` for any `draft_cycle_<N>.md` that has not yet
 * been audited by `criticism_cycle_<N>.json`. Runs `TaskOrchestrator.auditAndEvaluateDraft`
 * (using local Clef System One + 4D Rubric with 0 Gemini tokens) and forces the agent to
 * continue if the draft fails the ValidationContract (< 8.5/9.0).
 */
export async function evaluateStopHook(
  _payload: StopHookPayload,
  options: GateOptions = {}
): Promise<HookOutput> {
  const vaultRoot = options.vaultRoot ?? DEFAULT_BRAIN_DIR;
  const specsDir = options.specsDir ?? path.join(vaultRoot, '00 Inbox', 'Specs');

  if (!fs.existsSync(specsDir)) {
    return {};
  }

  const allSpecs = loadAllSpecs(specsDir);
  const vault = new VaultGateway(vaultRoot);
  const orchestrator = new TaskOrchestrator(vault);

  for (const { slug, data } of allSpecs) {
    if (data.status !== 'spec_approved' && data.status !== 'task_loop') {
      continue;
    }

    const workDir = path.join(specsDir, `${slug}-work`);
    if (!fs.existsSync(workDir)) continue;

    const files = fs.readdirSync(workDir);
    const draftCycles = files
      .map((f) => {
        const m = f.match(/^draft_cycle_(\d+)\.md$/);
        return m ? Number(m[1]) : null;
      })
      .filter((n): n is number => n !== null)
      .sort((a, b) => b - a);

    if (draftCycles.length === 0) continue;

    const latestCycle = draftCycles[0];
    const criticismPath = path.join(workDir, `criticism_cycle_${latestCycle}.json`);

    // Only trigger adversarial evaluation if the latest draft has not been audited yet
    if (!fs.existsSync(criticismPath)) {
      const draftPath = path.join(workDir, `draft_cycle_${latestCycle}.md`);
      const draftContent = fs.readFileSync(draftPath, 'utf8');

      const evalRes = await orchestrator.auditAndEvaluateDraft(slug, draftContent, latestCycle);
      if (!evalRes.passed && evalRes.state !== 'frozen_for_arbitration') {
        const directives = (evalRes.report?.remediation_directives ?? []).slice(0, 3).join(' | ');
        return {
          decision: 'continue',
          reason: `⚖️ VALIDADOR ADVERSARIAL (Stop Hook - Score ${evalRes.score}/9.0 < 8.5): El borrador draft_cycle_${latestCycle}.md de "${slug}" no superó el ValidationContract (${evalRes.engine ?? '4d-rubric'}). Resuelve estas directivas antes de finalizar: ${directives}`,
        };
      }
    }
  }

  return {};
}

async function runCli(): Promise<void> {
  const mode = process.argv[2] || 'pre-tool';
  let rawInput = '';
  try {
    rawInput = fs.readFileSync(0, 'utf8').trim();
  } catch {
    rawInput = '';
  }

  const payload = rawInput ? JSON.parse(rawInput) : {};

  if (mode === 'pre-tool') {
    const result = evaluatePreToolUse(payload);
    process.stdout.write(JSON.stringify(result) + '\n');
    return;
  }

  if (mode === 'stop-check') {
    const result = await evaluateStopHook(payload);
    process.stdout.write(JSON.stringify(result) + '\n');
    return;
  }

  process.stdout.write(JSON.stringify({ decision: 'allow' }) + '\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli().catch(() => {
    // Fail-open on unexpected CLI parsing error to avoid bricking the IDE
    process.stdout.write(JSON.stringify({ decision: 'allow' }) + '\n');
  });
}
