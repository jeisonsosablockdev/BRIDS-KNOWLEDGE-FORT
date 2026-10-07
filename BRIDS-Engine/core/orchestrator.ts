/**
 * SDD Task Orchestrator: High-Level Application Coordinator for BRIDS Knowledge Fort
 * Implements the Three-Role Architecture:
 *  1. Orchestrator (Planning, Milestones & ValidationContract)
 *  2. Workers (Fresh-Context Serial Execution & StructuredHandoff)
 *  3. Adversarial Validators (Zero-Creator-Bias Technical & Functional QA)
 *
 * Purely coordinates TaskStateMachine, VaultGateway, and Evaluators without direct fs I/O.
 *
 * @spec SPEC-BRIDS-001 (BRIDS-Engine Clean Architecture — Solana RWA & YC Venture)
 */

import path from 'node:path';
import {
  createInitialContext,
  startSpecReview,
  approveSpec as smApproveSpec,
  evaluateCycle as smEvaluateCycle,
  approveDeliverable as smApproveDeliverable,
  QUALITY_THRESHOLD,
  MAX_OPTIMIZATION_CYCLES,
} from './state-machine.ts';
import type { TaskContext, TransitionResult, TaskLifecycleState } from './state-machine.ts';
import { VaultGateway } from './vault-gateway.ts';
import {
  buildExecutionTopology,
  createDefaultValidationContract,
} from './contracts.ts';
import type {
  TaskSpecData,
  CreateSpecRequest,
  StructuredHandoff,
  ValidationContract,
  ExecutionTopologyPlan,
} from './contracts.ts';
import { evaluateDeliverable, auditDeliverableText } from '../evaluators/sdd-4d-rubric.ts';
import type { RubricDimensions, EvaluationReport, FullAuditReport } from '../evaluators/sdd-4d-rubric.ts';
import { scanCliches, autoRemediateDraft } from '../evaluators/anti-cliche-filter.ts';

export type {
  CreateSpecRequest,
  StructuredHandoff,
  ValidationContract,
  ExecutionTopologyPlan,
};

export class TaskOrchestrator {
  private vault: VaultGateway;

  constructor(vault?: VaultGateway) {
    this.vault = vault || new VaultGateway();
  }

  getVault(): VaultGateway {
    return this.vault;
  }

  private buildContextFromSpec(data: TaskSpecData): TaskContext {
    const cycle = data.evaluation?.current_cycle ?? data.iteration ?? 0;
    const threshold =
      data.evaluation?.passing_threshold ??
      data.evaluation?.target_score ??
      data.validation_contract?.quality_threshold ??
      QUALITY_THRESHOLD;
    return {
      slug: data.slug,
      title: data.title,
      state: (data.status as TaskLifecycleState) || 'initialized',
      currentCycle: cycle,
      maxCycles: data.evaluation?.max_cycles ?? MAX_OPTIMIZATION_CYCLES,
      qualityThreshold: threshold,
      lastScore: data.evaluation?.final_score ?? 0,
      history: data.evaluation?.history ?? [],
    };
  }

  private normalizeCreateRequest(
    requestOrSlug: CreateSpecRequest | string,
    title?: string,
    targetFolder: string = '01 Negocio/01 Estrategia & Modelo',
    subagents: string[] = ['business-consultant'],
    icp: string = 'Institutional Real Estate Sponsors & YC Investors',
    goal: string = ''
  ): Required<Omit<CreateSpecRequest, 'validationContract'>> & {
    validationContract?: Partial<ValidationContract>;
  } {
    if (typeof requestOrSlug === 'object' && requestOrSlug !== null) {
      return {
        slug: requestOrSlug.slug,
        title: requestOrSlug.title,
        targetFolder: requestOrSlug.targetFolder || '01 Negocio/01 Estrategia & Modelo',
        subagents:
          requestOrSlug.subagents && requestOrSlug.subagents.length > 0
            ? requestOrSlug.subagents
            : ['business-consultant'],
        icp: requestOrSlug.icp || 'Institutional Real Estate Sponsors & YC Investors',
        goal: requestOrSlug.goal || '',
        validationContract: requestOrSlug.validationContract,
      };
    }

    return {
      slug: requestOrSlug,
      title: title || requestOrSlug,
      targetFolder,
      subagents: subagents.length > 0 ? subagents : ['business-consultant'],
      icp,
      goal,
    };
  }

  /**
   * Role 1 (Orchestrator): Initializes a new deliverable spec in state 'spec_review'
   * with a formal ValidationContract and Serial/Parallel ExecutionTopologyPlan.
   */
  initSpec(
    requestOrSlug: CreateSpecRequest | string,
    title?: string,
    targetFolder?: string,
    subagents?: string[],
    icp?: string,
    goal?: string
  ): TaskContext {
    const req = this.normalizeCreateRequest(requestOrSlug, title, targetFolder, subagents, icp, goal);
    const cleanSlug = this.vault.sanitizeSlug(req.slug);
    const paths = this.vault.getSpecPaths(cleanSlug);
    const normalizedFolder = req.targetFolder.replace(/^\/+|\/+$/g, '');
    const now = new Date().toISOString();
    const dateStr = now.split('T')[0]!;

    const initialCtx = createInitialContext(cleanSlug, req.title);
    const reviewResult = startSpecReview(initialCtx);

    const baseContract = createDefaultValidationContract(paths.specId, QUALITY_THRESHOLD);
    const validationContract: ValidationContract = {
      ...baseContract,
      ...req.validationContract,
    };

    const topology = buildExecutionTopology(req.subagents);
    const canonicalVaultFile = path.join(normalizedFolder, `${cleanSlug}.md`);

    const specData: TaskSpecData = {
      spec_version: '3.0.0',
      id: paths.specId,
      spec_id: paths.specId,
      slug: cleanSlug,
      title: req.title,
      target_folder: normalizedFolder,
      target_vault_folder: normalizedFolder,
      target_file: canonicalVaultFile,
      subagents: req.subagents,
      subagents_involved: req.subagents,
      icp: req.icp,
      goal: req.goal,
      status: reviewResult.context.state,
      iteration: 0,
      created_at: now,
      updated_at: now,
      validation_contract: validationContract,
      execution_topology: topology,
      worker_handoffs: [],
      hitl_checkpoints: {
        hitl_1_spec_approval: {
          status: 'pending',
          approved_at: null,
          user_feedback: [],
        },
        hitl_2_deliverable_approval: {
          status: 'pending',
          approved_at: null,
          user_feedback: [],
        },
      },
      intent: {
        business_goal: req.goal || `Consolidar ${req.title}`,
        target_icp: req.icp,
        constraints: ['Cero clichés de IA', 'Solana & Metaplex grounding', 'Estilo fundador'],
      },
      evaluation: {
        current_cycle: 0,
        max_cycles: MAX_OPTIMIZATION_CYCLES,
        passing_threshold: validationContract.quality_threshold,
        target_score: validationContract.quality_threshold,
        scale_max: 9.0,
        final_score: null,
        history: [],
        criticism_history: [],
      },
      evaluations: [],
      execution_steps: [
        {
          id: 'STEP-01',
          name: 'HITL-1 Spec & Validation Contract Approval',
          role: 'orchestrator',
          execution_mode: 'serial_write',
          model_tier: 'pro',
          status: 'in_progress',
          depends_on: [],
        },
        {
          id: 'STEP-02',
          name: 'Fresh-Context Serial Worker Implementation & Structured Handoffs',
          role: 'worker',
          execution_mode: 'serial_write',
          model_tier: topology.serialWriteWorkers[0]?.modelTier || 'pro',
          status: 'pending',
          depends_on: ['STEP-01'],
        },
        {
          id: 'STEP-03',
          name: 'Adversarial Validator Loop (Technical + Functional QA)',
          role: 'validator',
          execution_mode: 'serial_write',
          model_tier: 'pro',
          status: 'pending',
          depends_on: ['STEP-02'],
        },
        {
          id: 'STEP-04',
          name: 'HITL-2 Deliverable Review & Approval',
          role: 'orchestrator',
          execution_mode: 'serial_write',
          model_tier: 'pro',
          status: 'pending',
          depends_on: ['STEP-03'],
        },
        {
          id: 'STEP-05',
          name: 'Atomic Vault Promotion & Safety Backup',
          role: 'orchestrator',
          execution_mode: 'serial_write',
          model_tier: 'pro',
          status: 'pending',
          depends_on: ['STEP-04'],
        },
      ],
    };

    const specMarkdown = this.vault.renderSpecMarkdown({
      slug: cleanSlug,
      title: req.title,
      targetFolder: normalizedFolder,
      subagents: req.subagents,
      icp: req.icp,
      goal: req.goal,
      dateStr,
      state: reviewResult.context.state,
    });

    this.vault.saveSpec(cleanSlug, specData, specMarkdown);
    return reviewResult.context;
  }

  /**
   * Refines the specification based on human feedback before HITL-1 approval
   */
  refineSpec(slug: string, userFeedback: string): TaskSpecData {
    const { data } = this.vault.loadSpec(slug);
    if (data.status === 'completed') {
      return data;
    }

    const now = new Date().toISOString();
    if (!data.hitl_checkpoints) {
      data.hitl_checkpoints = {
        hitl_1_spec_approval: { status: 'pending', approved_at: null, user_feedback: [] },
        hitl_2_deliverable_approval: { status: 'pending', approved_at: null, user_feedback: [] },
      };
    }
    data.hitl_checkpoints.hitl_1_spec_approval.user_feedback.push({
      timestamp: now,
      feedback: userFeedback,
    });
    data.hitl_checkpoints.hitl_1_spec_approval.status = 'refining';
    data.status = 'spec_review';

    this.vault.appendSpecFeedback(slug, now.split('T')[0]!, userFeedback);
    this.vault.saveSpec(slug, data);
    return data;
  }

  /**
   * Human approves specification & ValidationContract (HITL-1 Guardrail)
   */
  approveSpec(slug: string): TransitionResult {
    const loaded = this.vault.loadSpec(slug);
    const ctx = this.buildContextFromSpec(loaded.data);
    const res = smApproveSpec(ctx);

    if (!res.success) {
      return res;
    }

    const now = new Date().toISOString();
    loaded.data.status = res.context.state;
    if (loaded.data.hitl_checkpoints) {
      loaded.data.hitl_checkpoints.hitl_1_spec_approval.status = 'approved';
      loaded.data.hitl_checkpoints.hitl_1_spec_approval.approved_at = now;
    }
    if (loaded.data.execution_steps && loaded.data.execution_steps.length >= 2) {
      loaded.data.execution_steps[0]!.status = 'completed';
      loaded.data.execution_steps[1]!.status = 'in_progress';
    }

    this.vault.saveSpec(slug, loaded.data);
    this.vault.snapshotApprovedSpec(slug);

    return res;
  }

  /**
   * Role 2 (Workers): Records a Structured Handoff after a Worker completes its serial turn in fresh context.
   */
  recordWorkerHandoff(
    slug: string,
    handoffInput: {
      worker_id: string;
      completed_items: string[];
      pending_items?: string[];
      decisions_made?: string[];
      issues_encountered?: string[];
      artifact_snapshot?: string;
    }
  ): StructuredHandoff {
    const loaded = this.vault.loadSpec(slug);
    if (loaded.data.status === 'initialized' || loaded.data.status === 'spec_review') {
      throw new Error(
        `HITL-1 Violation: Worker '${handoffInput.worker_id}' cannot execute or record a handoff before spec approval (state: '${loaded.data.status}').`
      );
    }

    const existingHandoffs = loaded.data.worker_handoffs || [];
    const handoff: StructuredHandoff = {
      worker_id: handoffInput.worker_id.trim().toLowerCase(),
      step_index: existingHandoffs.length + 1,
      completed_items: handoffInput.completed_items,
      pending_items: handoffInput.pending_items || [],
      decisions_made: handoffInput.decisions_made || [],
      issues_encountered: handoffInput.issues_encountered || [],
      artifact_snapshot: handoffInput.artifact_snapshot,
      timestamp: new Date().toISOString(),
    };

    this.vault.saveWorkerHandoff(slug, handoff);
    loaded.data.worker_handoffs = [...existingHandoffs, handoff];
    this.vault.saveSpec(slug, loaded.data);
    return handoff;
  }

  /**
   * Evaluates draft in the autonomous optimization loop with explicit RubricDimensions
   */
  evaluateDraft(
    slug: string,
    draftContent: string,
    dimensions: RubricDimensions,
    observations: string[] = []
  ): { transition: TransitionResult; report: EvaluationReport } {
    const loaded = this.vault.loadSpec(slug);
    const ctx = this.buildContextFromSpec(loaded.data);

    const clicheScan = scanCliches(draftContent);
    const report = evaluateDeliverable(dimensions, clicheScan.totalPenalty, observations);
    const transition = smEvaluateCycle(ctx, report.score);

    if (transition.success) {
      loaded.data.status = transition.context.state;
      loaded.data.iteration = transition.context.currentCycle;
      if (!loaded.data.evaluation) {
        loaded.data.evaluation = {
          current_cycle: transition.context.currentCycle,
          max_cycles: MAX_OPTIMIZATION_CYCLES,
          passing_threshold: QUALITY_THRESHOLD,
          target_score: QUALITY_THRESHOLD,
          scale_max: 9.0,
          final_score: report.score,
          history: [],
          criticism_history: [],
        };
      }
      loaded.data.evaluation.current_cycle = transition.context.currentCycle;
      loaded.data.evaluation.final_score = report.score;
      loaded.data.evaluation.history = transition.context.history;

      this.vault.saveDraftCycle(slug, transition.context.currentCycle, draftContent, report.passed, report.score);
      this.vault.saveSpec(slug, loaded.data);
    }

    return { transition, report };
  }

  /**
   * Role 3 (Adversarial Validator): Audits draft text against the 4D Rubric, Clef System One,
   * ValidationContract, and StructuredHandoffs without creator bias.
   */
  auditAndEvaluateDraft(
    slug: string,
    draftContent: string,
    cycleOverride: number | null = null
  ): {
    passed: boolean;
    ready_for_hitl_2?: boolean;
    frozen?: boolean;
    report: FullAuditReport;
    data: TaskSpecData;
    transition: TransitionResult;
  } {
    const loaded = this.vault.loadSpec(slug);
    const data = loaded.data;

    const isSpecApproved = data.hitl_checkpoints?.hitl_1_spec_approval?.status === 'approved';
    if (!isSpecApproved && (data.status === 'spec_review' || data.status === 'initialized')) {
      const blocked = smEvaluateCycle(this.buildContextFromSpec(data), 0);
      throw new Error(
        `❌ HITL-1 BLOQUEADO: ${blocked.error || 'No se puede redactar ni evaluar el entregable sin aprobación previa del Spec por el usuario.'}`
      );
    }

    const currentCycleCount = data.evaluation?.current_cycle ?? data.iteration ?? 0;
    const cycle = cycleOverride !== null ? cycleOverride : currentCycleCount + 1;
    const preCycleCtx: TaskContext = {
      ...this.buildContextFromSpec(data),
      state: 'task_loop',
      currentCycle: Math.max(0, cycle - 1),
    };

    const report = auditDeliverableText(draftContent, data as Record<string, unknown>);
    report.spec_id = data.spec_id || data.id;
    report.cycle = cycle;
    report.target_file = data.target_file;
    report.timestamp = new Date().toISOString();

    const smResult = smEvaluateCycle(preCycleCtx, report.total_score);

    this.vault.saveDraftCycle(slug, cycle, draftContent, report.passed, report.total_score);
    const reportFile = this.vault.saveCriticismReport(slug, cycle, report);

    if (!data.evaluation) {
      data.evaluation = {
        current_cycle: cycle,
        max_cycles: MAX_OPTIMIZATION_CYCLES,
        passing_threshold: QUALITY_THRESHOLD,
        target_score: QUALITY_THRESHOLD,
        scale_max: 9.0,
        final_score: report.total_score,
        history: smResult.context.history,
        criticism_history: [],
      };
    }

    data.evaluation.current_cycle = cycle;
    data.evaluation.final_score = report.total_score;
    data.evaluation.history = smResult.context.history;
    if (!data.evaluation.criticism_history) {
      data.evaluation.criticism_history = [];
    }
    data.evaluation.criticism_history.push({
      cycle,
      total_score: report.total_score,
      passed: report.passed,
      timestamp: report.timestamp,
      banned_phrases_count: report.banned_phrases_detected.length,
      clef_engine: report.clef_decision.engine,
      clef_cache_key: report.clef_decision.cache_key,
      report_file: reportFile,
    });

    if (report.passed) {
      data.status = smResult.context.state;
      if (data.execution_steps && data.execution_steps.length >= 4) {
        data.execution_steps[1]!.status = 'completed';
        data.execution_steps[2]!.status = 'completed';
        data.execution_steps[3]!.status = 'in_progress';
      }
      this.vault.saveSpec(slug, data);
      return { passed: true, ready_for_hitl_2: true, report, data, transition: smResult };
    }

    if (smResult.context.state === 'frozen_for_arbitration' || cycle >= (data.evaluation.max_cycles || MAX_OPTIMIZATION_CYCLES)) {
      data.status = 'frozen_for_arbitration';
      this.vault.saveSpec(slug, data);
      return { passed: false, frozen: true, report, data, transition: smResult };
    }

    data.status = 'draft_optimizing';
    this.vault.saveSpec(slug, data);
    return { passed: false, frozen: false, report, data, transition: smResult };
  }

  /**
   * Runs the autonomous Evaluator-Optimizer loop (up to maxCycles) until >= 8.5/9.0 or frozen_for_arbitration
   */
  runTaskLoop(
    slug: string,
    initialDraftContent: string,
    maxCycles: number = MAX_OPTIMIZATION_CYCLES
  ): {
    passed: boolean;
    cyclesRun: number;
    finalScore: number;
    finalStatus: string;
    lastAudit: FullAuditReport;
    report: FullAuditReport;
    data: TaskSpecData;
  } {
    let currentDraft = initialDraftContent;
    let cyclesRun = 0;
    let lastAudit: FullAuditReport = auditDeliverableText(currentDraft);
    let finalStatus = 'in_optimization';
    let latestData: TaskSpecData = this.vault.loadSpec(slug).data;

    for (let i = 0; i < maxCycles; i++) {
      cyclesRun++;
      const loaded = this.vault.loadSpec(slug);
      latestData = loaded.data;
      lastAudit = auditDeliverableText(currentDraft, loaded.data as Record<string, unknown>);

      const dims: RubricDimensions = {
        goalIcp: lastAudit.scoring_dimensions['1_goal_and_icp'].score,
        techRigor: lastAudit.scoring_dimensions['2_technical_veracity'].score,
        founderVoice: lastAudit.scoring_dimensions['3_founder_voice'].score,
        originalityLexicon: 2.0,
      };

      const { transition, report } = this.evaluateDraft(
        slug,
        currentDraft,
        dims,
        lastAudit.remediation_directives
      );
      finalStatus = transition.context.state;
      latestData = this.vault.loadSpec(slug).data;

      if (report.passed || finalStatus === 'deliverable_review' || finalStatus === 'frozen_for_arbitration') {
        break;
      }

      currentDraft = autoRemediateDraft(currentDraft);
    }

    return {
      passed: lastAudit.passed,
      cyclesRun,
      finalScore: lastAudit.total_score,
      finalStatus,
      lastAudit,
      report: lastAudit,
      data: latestData,
    };
  }

  /**
   * Human requests deliverable refinement at HITL-2
   */
  refineDeliverable(slug: string, userFeedback: string) {
    const { data } = this.vault.loadSpec(slug);
    const currentCycle = data.evaluation?.current_cycle ?? data.iteration ?? 1;
    const baseDraft = this.vault.loadLatestDraft(slug, currentCycle);
    if (!baseDraft) {
      throw new Error(`No hay borrador previo para refinar en ${slug}`);
    }

    const now = new Date().toISOString();
    if (data.hitl_checkpoints) {
      data.hitl_checkpoints.hitl_2_deliverable_approval.user_feedback.push({
        timestamp: now,
        feedback: userFeedback,
      });
    }
    data.status = 'deliverable_refining';
    this.vault.saveSpec(slug, data);

    const refinedDraft = autoRemediateDraft(
      `${baseDraft}\n\n### Actualización por Revisión de Feedback (${now.split('T')[0]})\n${userFeedback}`
    );

    return this.auditAndEvaluateDraft(slug, refinedDraft, currentCycle + 1);
  }

  /**
   * Human approves deliverable and commits to BRIDS-Brain (HITL-2 Guardrail)
   */
  approveDeliverable(
    slug: string,
    finalContent?: string,
    formatWithFrontmatter: boolean = false
  ): TransitionResult & { deliverablePath?: string; data?: TaskSpecData } {
    const loaded = this.vault.loadSpec(slug);
    const ctx = this.buildContextFromSpec(loaded.data);
    const res = smApproveDeliverable(ctx);

    if (!res.success) {
      return res;
    }

    const cycle = loaded.data.evaluation?.current_cycle ?? loaded.data.iteration ?? 1;
    const contentToCommit = finalContent || this.vault.loadLatestDraft(slug, cycle);

    if (!contentToCommit) {
      return {
        success: false,
        context: ctx,
        error: `No approved draft found to commit for task "${slug}".`,
      };
    }

    const finalPayload = formatWithFrontmatter
      ? this.vault.formatFinalVaultNote(loaded.data, contentToCommit, {
          total_score: loaded.data.evaluation?.final_score ?? QUALITY_THRESHOLD,
          passing_threshold:
            loaded.data.evaluation?.passing_threshold ??
            loaded.data.evaluation?.target_score ??
            QUALITY_THRESHOLD,
        })
      : contentToCommit;

    const { targetPath } = this.vault.commitDeliverable(slug, finalPayload, loaded.data.target_folder);

    const now = new Date().toISOString();
    loaded.data.status = res.context.state;
    if (loaded.data.hitl_checkpoints) {
      loaded.data.hitl_checkpoints.hitl_2_deliverable_approval.status = 'approved';
      loaded.data.hitl_checkpoints.hitl_2_deliverable_approval.approved_at = now;
    }
    if (loaded.data.execution_steps && loaded.data.execution_steps.length >= 5) {
      loaded.data.execution_steps[3]!.status = 'completed';
      loaded.data.execution_steps[4]!.status = 'completed';
    }

    this.vault.markSpecMarkdownCompleted(slug);
    this.vault.saveSpec(slug, loaded.data);

    return {
      ...res,
      deliverablePath: targetPath,
      data: loaded.data,
    };
  }
}
