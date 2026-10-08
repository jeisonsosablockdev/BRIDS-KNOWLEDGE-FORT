#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STRATEGIC_MODEL_ROUTING,
  type TaskSpecData,
  type ExecutionConcurrencyMode,
} from '../../core/contracts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENGINE_DIR = path.resolve(__dirname, '../..');
const ROOT_DIR = path.resolve(ENGINE_DIR, '..');
const DEFAULT_BRAIN_DIR = path.join(ROOT_DIR, 'BRIDS-Brain');
const DEFAULT_SPECS_DIR = path.join(DEFAULT_BRAIN_DIR, '00 Inbox', 'Specs');
const DEFAULT_AGENTS_DIR = path.join(ENGINE_DIR, 'agents');

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
  fullyIdle?: boolean;
  executionNum?: number;
}

export interface HookOutput {
  decision?: 'allow' | 'deny' | 'continue';
  reason?: string;
  overwrite?: Record<string, any>;
}

export interface GateOptions {
  specsDir?: string;
  vaultRoot?: string;
  agentsDir?: string;
  gitRoot?: string;
}

export function readCurrentGitBranch(gitRoot: string = ROOT_DIR): string | null {
  const headPath = path.join(gitRoot, '.git', 'HEAD');
  if (!fs.existsSync(headPath)) return null;
  const raw = fs.readFileSync(headPath, 'utf8').trim();
  return raw.startsWith('ref: refs/heads/') ? raw.slice('ref: refs/heads/'.length) : null;
}

const PARALLEL_READ_AGENTS = new Set<string>([
  'market-research-analyst',
  'narrative-intelligence-analyst',
  'research',
]);

const AUTHORIZED_VAULT_SCRIPTS = [
  'sdd-orchestrator.ts',
  'refine-note.ts',
  'sync-technical-docs.ts',
  'sync-narrative-intelligence.ts',
  'sync-workspace-context.ts',
  'ingest-yc-academy.ts',
  'social-generator.ts',
  'engine.ts',
];

function getExecutionMode(agentType: string): ExecutionConcurrencyMode {
  if (PARALLEL_READ_AGENTS.has(agentType)) {
    return 'parallel_read';
  }
  const route = STRATEGIC_MODEL_ROUTING[agentType];
  return route ? route.executionMode : 'serial_write';
}

export function loadAgentSystemPrompt(
  agentName: string,
  agentsDir: string = DEFAULT_AGENTS_DIR
): string | null {
  const safeName = agentName.replace(/[^a-z0-9_-]/gi, '');
  if (!safeName) return null;
  const yamlPath = path.join(agentsDir, `${safeName}.yaml`);
  if (!fs.existsSync(yamlPath)) return null;

  const raw = fs.readFileSync(yamlPath, 'utf8');
  const match = raw.match(/^system_prompt:\s*\|\r?\n([\s\S]*)$/m);
  if (!match || !match[1]) return null;

  return match[1]
    .split(/\r?\n/)
    .map((line) => (line.startsWith('  ') ? line.slice(2) : line))
    .join('\n')
    .trim();
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
  if (normalized.endsWith('/index.md')) return false;
  return (
    normalized.includes('BRIDS-Brain/01 Negocio/') ||
    normalized.includes('BRIDS-Brain/02 Marketing/') ||
    normalized.includes('BRIDS-Brain/03 Academy/')
  );
}

function extractDraftWorkSlug(targetFile: string): string | null {
  const normalized = targetFile.replace(/\\/g, '/');
  const match = normalized.match(/\/00 Inbox\/Specs\/([^/]+)-work\/draft_cycle_\d+\.md$/);
  return match ? match[1] : null;
}

function isDirectVaultWriteCommand(commandLine: string): boolean {
  const normalized = commandLine.replace(/\\/g, '/');
  const touchesProductionVault =
    normalized.includes('BRIDS-Brain/01 Negocio') ||
    normalized.includes('BRIDS-Brain/02 Marketing') ||
    normalized.includes('BRIDS-Brain/03 Academy');
  if (!touchesProductionVault) return false;

  const usesAuthorizedScript = AUTHORIZED_VAULT_SCRIPTS.some((s) => normalized.includes(s));
  if (usesAuthorizedScript) return false;

  // Detect shell redirections or file mutation commands targeting the vault directly
  return /(?:>>?|tee\s|cp\s|mv\s|cat\s.*>|echo\s.*>|printf\s.*>|sed\s+-i|perl\s+-i)/.test(
    normalized
  );
}

/**
 * Pure, synchronous, zero-latency (< 5ms) deterministic PreToolUse gate.
 * Enforces:
 * 1. Anti-Auto-Proceed on artifacts (forces RequestFeedback: false via shallow overwrite).
 * 2. HITL-1 & ValidationContract before writing any draft_cycle_N.md.
 * 3. HITL-2 protection against direct writes to BRIDS-Brain/01 Negocio or 02 Marketing (including run_command shell redirections).
 * 4. Serial Write Execution, StructuredHandoff continuity, JIT Persona Injection (agents/*.yaml), and Strategic Model Routing on invoke_subagent / start_subagent.
 */
export function evaluatePreToolUse(
  payload: PreToolUsePayload,
  options: GateOptions = {}
): HookOutput {
  const specsDir = options.specsDir ?? DEFAULT_SPECS_DIR;
  const agentsDir = options.agentsDir ?? DEFAULT_AGENTS_DIR;
  const gitRoot =
    options.gitRoot ?? (options.specsDir ? path.resolve(options.specsDir, '../../..') : ROOT_DIR);
  const activeBranch = readCurrentGitBranch(gitRoot);
  const toolName = payload?.toolCall?.name ?? '';
  const args = payload?.toolCall?.args ?? {};

  // =========================================================================
  // 1. FILE WRITE / EDIT GATES (IDE + Python SDK tool names)
  // =========================================================================
  if (
    toolName === 'write_to_file' ||
    toolName === 'replace_file_content' ||
    toolName === 'multi_replace_file_content' ||
    toolName === 'create_file' ||
    toolName === 'edit_file'
  ) {
    const targetFile = String(args.TargetFile ?? args.path ?? args.file_path ?? '');
    const isArtifact = isArtifactPath(targetFile, payload.artifactDirectoryPath);

    // Rule 1A: Anti-Auto-Proceed on Artifacts (forces RequestFeedback: false via shallow overwrite)
    if (
      (toolName === 'write_to_file' || toolName === 'create_file') &&
      isArtifact &&
      args.ArtifactMetadata &&
      args.ArtifactMetadata.RequestFeedback === true
    ) {
      return {
        decision: 'allow',
        overwrite: {
          ArtifactMetadata: {
            ...args.ArtifactMetadata,
            RequestFeedback: false,
          },
        },
      };
    }

    // Rule 1A-Main: Main Branch Immutability Protection (blocks direct edits on main)
    if (!isArtifact && activeBranch === 'main') {
      return {
        decision: 'deny',
        reason: `🛑 BLOQUEO DE RAMA MAIN (workflow-gate-hook): Prohibido modificar archivos directamente en "main". Trabaja sobre "develop", "feat/<feature>" o "spec/<feature>/<slug>" y promueve con "node BRIDS-Engine/bin/engine.ts promote main".`,
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
      const expectedBranch = spec.git_branch_topology?.spec_branch;
      if (expectedBranch && activeBranch && activeBranch !== expectedBranch) {
        return {
          decision: 'deny',
          reason: `🛑 BLOQUEO DE RAMA SDD (workflow-gate-hook): El Spec "${draftSlug}" pertenece a la rama hija "${expectedBranch}", pero el repositorio está en "${activeBranch}". Cambia a la rama hija antes de redactar borradores.`,
        };
      }
    }

    // Rule 1C: HITL-2 Production Vault Protection (01 Negocio / 02 Marketing)
    if (isProductionVaultPath(targetFile)) {
      const normalizedTarget = targetFile.replace(/\\/g, '/');
      const allSpecs = loadAllSpecs(specsDir);

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
  // 2. SHELL COMMAND VAULT & MAIN BRANCH BYPASS GUARD (run_command)
  // =========================================================================
  if (toolName === 'run_command') {
    const commandLine = String(args.CommandLine ?? args.command ?? '');
    if (isDirectVaultWriteCommand(commandLine)) {
      return {
        decision: 'deny',
        reason: `🛑 BLOQUEO HITL-2 (workflow-gate-hook): Prohibido escribir o redirigir archivos directamente a BRIDS-Brain/01 Negocio o 02 Marketing mediante shell. Usa los scripts autorizados (sdd-orchestrator.ts approve-deliverable o refine-note.ts).`,
      };
    }

    const isOfficialPromote =
      commandLine.includes('promote main') || commandLine.includes('promote release');
    if (
      !isOfficialPromote &&
      (activeBranch === 'main' && /\bgit\s+(commit|merge|push)\b/.test(commandLine)) ||
      (!isOfficialPromote && /\bgit\s+push\s+\S+\s+main\b/.test(commandLine))
    ) {
      return {
        decision: 'deny',
        reason: `🛑 BLOQUEO DE RAMA MAIN (workflow-gate-hook): Prohibido hacer commits, merges o push directos sobre "main". Trabaja en "develop" y usa "node BRIDS-Engine/bin/engine.ts promote main".`,
      };
    }

    return { decision: 'allow' };
  }

  // =========================================================================
  // 3. SUBAGENT INVOCATION GATES (invoke_subagent + start_subagent)
  // =========================================================================
  if (toolName === 'invoke_subagent' || toolName === 'start_subagent') {
    const isBatch = Array.isArray(args.Subagents);
    const subagents: Array<Record<string, any>> = isBatch
      ? args.Subagents
      : args.TypeName || args.Prompt || args.Role
        ? [args]
        : [];

    if (subagents.length === 0) {
      return { decision: 'allow' };
    }

    // Rule 3A: Serial Execution for Writes, Parallel for Reads
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

    // Rule 3B: Verify HITL-1, Child Branch (for teamwork_preview) & Handoff Continuity when a Spec slug is referenced in Prompt
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

            if (agentType === 'teamwork_preview') {
              const expectedBranch = data.git_branch_topology?.spec_branch;
              if (expectedBranch && activeBranch && activeBranch !== expectedBranch) {
                return {
                  decision: 'deny',
                  reason: `🛑 BLOQUEO DE RAMA SDD (workflow-gate-hook): El Spec "${slug}" pertenece a la rama hija "${expectedBranch}", pero el repositorio está en "${activeBranch}". Cambia a la rama hija antes de delegar a teamwork_preview.`,
                };
              }
              continue;
            }

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

    // Rule 3C: JIT Persona Injection (agents/*.yaml) + Approved Skills Injection + Strategic Model Routing
    // (When agentType === 'teamwork_preview', preserve exact prompt opening & Model, appending only the suffix)
    let modified = false;
    const updatedSubagents = subagents.map((sub) => {
      const agentType = String(sub.TypeName || '');
      let nextSub = { ...sub };

      const rawPrompt = String(nextSub.Prompt || '');
      const matchedSpec = allSpecs.find(
        ({ slug, data }) =>
          rawPrompt.includes(slug) ||
          data.status === 'spec_approved' ||
          data.status === 'task_loop'
      );
      const approvedSkills = matchedSpec?.data.approved_skills ?? [];
      const skillsBlock =
        approvedSkills.length > 0 && !rawPrompt.includes('[APPROVED_SKILLS:')
          ? `\n\n[APPROVED_SKILLS: ${approvedSkills.join(', ')}]\nLectura obligatoria de SKILL.md antes de ejecutar:\n${approvedSkills
              .map((s) => `- BRIDS-Engine/skills/${s}/SKILL.md`)
              .join('\n')}`
          : '';

      if (agentType === 'teamwork_preview') {
        const targetSlug = matchedSpec?.slug || 'active-spec';
        const verificationCmd =
          matchedSpec?.data.teamwork_config?.verification_command ||
          `node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts evaluate ${targetSlug} "BRIDS-Brain/00 Inbox/Specs/${targetSlug}-work/draft_cycle_1.md"`;
        const verificationSuffix = !rawPrompt.includes('sdd-orchestrator.ts evaluate')
          ? `\n\n## BRIDS-Engine Verification & Infrastructure Guardrails\n- Oráculo Programático Obligatorio (Forcing Function): \`${verificationCmd}\`\n- Sandbox de trabajo: \`BRIDS-Brain/00 Inbox/Specs/${targetSlug}-work/\``
          : '';

        if (skillsBlock || verificationSuffix) {
          modified = true;
          nextSub.Prompt = `${rawPrompt}${verificationSuffix}${skillsBlock}`;
        }
        return nextSub;
      }

      // JIT Persona Injection from BRIDS-Engine/agents/<agentType>.yaml
      if (agentType && !rawPrompt.includes('[AGENT_PERSONA:')) {
        const systemPrompt = loadAgentSystemPrompt(agentType, agentsDir);
        if (systemPrompt) {
          modified = true;
          nextSub.Prompt = `[AGENT_PERSONA: ${agentType}]\n${systemPrompt}${skillsBlock}\n\n[ASSIGNED_TASK]\n${rawPrompt}`;
        } else if (skillsBlock) {
          modified = true;
          nextSub.Prompt = `${skillsBlock.trim()}\n\n[ASSIGNED_TASK]\n${rawPrompt}`;
        }
      } else if (skillsBlock) {
        modified = true;
        nextSub.Prompt = `${rawPrompt}${skillsBlock}`;
      }

      // Strategic Model Routing (flash for parallel_read, pro/inherit for serial_write)
      const route = STRATEGIC_MODEL_ROUTING[agentType];
      if (route) {
        if (route.executionMode === 'parallel_read' && nextSub.Model !== 'flash') {
          modified = true;
          nextSub.Model = 'flash';
        } else if (
          route.executionMode === 'serial_write' &&
          (nextSub.Model === 'flash' || nextSub.Model === 'flash_lite' || !nextSub.Model)
        ) {
          modified = true;
          nextSub.Model = route.modelTier;
        }
      }

      return nextSub;
    });

    if (modified) {
      if (isBatch) {
        return {
          decision: 'allow',
          overwrite: {
            Subagents: updatedSubagents,
          },
        };
      }
      const single = updatedSubagents[0];
      const flatOverwrite: Record<string, any> = {};
      if (single.Model !== args.Model) flatOverwrite.Model = single.Model;
      if (single.Prompt !== args.Prompt) flatOverwrite.Prompt = single.Prompt;
      return {
        decision: 'allow',
        overwrite: flatOverwrite,
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
  payload: StopHookPayload,
  options: GateOptions = {}
): Promise<HookOutput> {
  // Guard against background tasks still running or infinite Stop hook continuation loops
  if (payload?.fullyIdle === false || (payload?.executionNum ?? 1) >= 3) {
    return {};
  }

  const vaultRoot = options.vaultRoot ?? DEFAULT_BRAIN_DIR;
  const specsDir = options.specsDir ?? path.join(vaultRoot, '00 Inbox', 'Specs');

  if (!fs.existsSync(specsDir)) {
    return {};
  }

  const allSpecs = loadAllSpecs(specsDir);
  const { VaultGateway } = await import('../../core/vault-gateway.ts');
  const { TaskOrchestrator } = await import('../../core/orchestrator.ts');
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

      const evalRes = orchestrator.auditAndEvaluateDraft(slug, draftContent, latestCycle);
      if (!evalRes.passed && !evalRes.frozen) {
        const score = evalRes.report.total_score;
        const engine = evalRes.report.clef_decision?.engine ?? '4d-rubric';
        const directives = (evalRes.report.remediation_directives ?? []).slice(0, 3).join(' | ');
        return {
          decision: 'continue',
          reason: `⚖️ VALIDADOR ADVERSARIAL (Stop Hook - Score ${score}/9.0 < 8.5): El borrador draft_cycle_${latestCycle}.md de "${slug}" no superó el ValidationContract (${engine}). Resuelve estas directivas antes de finalizar: ${directives}`,
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
