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
  SkillRecommendation,
  SpecAdversarialReport,
  ExecutionEngineType,
  TeamworkScaleMode,
  TeamworkIntegrityMode,
  TeamworkConfig,
} from './contracts.ts';
import {
  evaluateDeliverable,
  auditDeliverableText,
  discoverSkillsForTask,
  auditSpecDocument,
} from '../evaluators/sdd-4d-rubric.ts';
import type { RubricDimensions, EvaluationReport, FullAuditReport } from '../evaluators/sdd-4d-rubric.ts';
import { scanCliches, autoRemediateDraft } from '../evaluators/anti-cliche-filter.ts';

export type {
  CreateSpecRequest,
  StructuredHandoff,
  ValidationContract,
  ExecutionTopologyPlan,
  SkillRecommendation,
  SpecAdversarialReport,
  ExecutionEngineType,
  TeamworkScaleMode,
  TeamworkIntegrityMode,
  TeamworkConfig,
};

export class TaskOrchestrator {
  private vault: VaultGateway;

  constructor(vault?: VaultGateway) {
    this.vault = vault || new VaultGateway();
  }

  getVault(): VaultGateway {
    return this.vault;
  }

  /**
   * HITL-0 Skill Discovery: Ranks the top skills, subagents, and recommended execution engine
   * ('native_squad' vs 'teamwork_preview' + scale mode) for a given task query and vault folder.
   */
  discoverSkills(
    query: string,
    targetFolder: string = '',
    limit: number = 4
  ): {
    skills: SkillRecommendation[];
    recommendedSubagents: string[];
    recommendedExecutionEngine: ExecutionEngineType;
    recommendedTeamworkScale?: TeamworkScaleMode;
  } {
    return discoverSkillsForTask(query, targetFolder, limit);
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
  ): Required<
    Omit<
      CreateSpecRequest,
      | 'validationContract'
      | 'featureBranch'
      | 'approvedSkills'
      | 'executionEngine'
      | 'teamworkScale'
      | 'teamworkIntegrityMode'
    >
  > & {
    approvedSkills?: string[];
    featureBranch?: string;
    executionEngine?: ExecutionEngineType;
    teamworkScale?: TeamworkScaleMode;
    teamworkIntegrityMode?: TeamworkIntegrityMode;
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
        approvedSkills: requestOrSlug.approvedSkills,
        icp: requestOrSlug.icp || 'Institutional Real Estate Sponsors & YC Investors',
        goal: requestOrSlug.goal || '',
        featureBranch: requestOrSlug.featureBranch,
        executionEngine: requestOrSlug.executionEngine,
        teamworkScale: requestOrSlug.teamworkScale,
        teamworkIntegrityMode: requestOrSlug.teamworkIntegrityMode,
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
   * Renders the canonical /teamwork-preview Step 9 prompt from TaskSpecData,
   * preserving Teamwork's opening line routing rules ("Specify What, Not How") and
   * embedding BRIDS-Engine's deterministic CLI verification oracle as the Forcing Function.
   */
  renderTeamworkPrompt(slug: string, specOverride?: TaskSpecData): string {
    const data = specOverride ?? this.vault.loadSpec(slug).data;
    const scale = data.teamwork_config?.scale_mode || 'full';
    const integrity = data.teamwork_config?.integrity_mode || 'development';
    const workingDir = data.teamwork_config?.working_directory || this.vault.getVaultDir();
    const verificationCmd =
      data.teamwork_config?.verification_command ||
      `node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts evaluate ${data.slug} "BRIDS-Brain/00 Inbox/Specs/${data.slug}-work/draft_cycle_1.md"`;

    let openingPrefix = '';
    if (scale === 'small') {
      openingPrefix = 'This is a single self-contained fix; keep it small and focused.\n\n';
    } else if (scale === 'proof_large') {
      openingPrefix = 'Use a very large team of agents.\n\n';
    }

    const description = `${data.title}. ${data.goal || data.intent?.business_goal || `Deliverable for ${data.icp}.`}`;
    const criteria = data.validation_contract?.acceptance_criteria || [];
    const anchors = data.validation_contract?.required_technical_anchors || ['Solana', 'Metaplex', 'Delaware', 'SPV'];
    const skills = data.approved_skills || [];

    const criteriaLines = criteria.map((c) => `- [ ] ${c}`).join('\n');
    const skillsLines =
      skills.length > 0
        ? `\n### Reference Skills (HITL-0 Approved)\n${skills.map((s) => `- \`BRIDS-Engine/skills/${s}/SKILL.md\``).join('\n')}\n`
        : '';

    return (
      `${openingPrefix}${description}\n\n` +
      `Working directory: ${workingDir}\n` +
      `Integrity mode: ${integrity}\n` +
      `${skillsLines}\n` +
      `## Requirements\n\n` +
      `### R1. Primary Deliverable (${data.title})\n` +
      `Produce the complete deliverable tailored to ${data.icp}, grounded in BRIDS architecture (${anchors.join(', ')}).\n\n` +
      `### R2. Controlled Vault Infrastructure\n` +
      `Write all working drafts exclusively inside \`BRIDS-Brain/00 Inbox/Specs/${data.slug}-work/draft_cycle_1.md\`. Do not write directly to \`BRIDS-Brain/01 Negocio\` or \`02 Marketing\` before HITL-2 approval.\n\n` +
      `## Verification Resources\n\n` +
      `- **Programmatic Forcing Function (Mandatory Oracle):**\n` +
      `  \`${verificationCmd}\`\n` +
      `- The command evaluates the 4D Rubric + Anti-Cliché Filter + Clef System One and must exit with code \`0\` (score >= 8.5/9.0).\n\n` +
      `## Acceptance Criteria\n\n` +
      `### Quality & Contract Verification\n` +
      `${criteriaLines}\n` +
      `- [ ] \`${verificationCmd}\` passes with score >= 8.5/9.0 and 0 banned clichés.\n`
    );
  }

  /**
   * Role 1 (Orchestrator): Initializes a new deliverable spec in state 'spec_review'
   * with HITL-0 approved skills, ValidationContract, Serial/Parallel ExecutionTopologyPlan,
   * optional Teamwork Swarm configuration (prompt_draft.md), and an initial Adversarial Spec Critic audit.
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

    const discovered = discoverSkillsForTask(`${req.title} ${req.goal}`, normalizedFolder, 3);
    const approvedSkills =
      req.approvedSkills && req.approvedSkills.length > 0
        ? req.approvedSkills
        : discovered.skills.map((s) => s.skillId);

    const executionEngine: ExecutionEngineType = req.executionEngine || 'native_squad';
    const verificationCommand = `node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts evaluate ${cleanSlug} "BRIDS-Brain/00 Inbox/Specs/${cleanSlug}-work/draft_cycle_1.md"`;
    let teamworkConfig: TeamworkConfig | undefined = undefined;
    if (executionEngine === 'teamwork_preview') {
      teamworkConfig = {
        scale_mode: req.teamworkScale || discovered.recommendedTeamworkScale || 'full',
        integrity_mode: req.teamworkIntegrityMode || 'development',
        working_directory: path.resolve(this.vault.getVaultDir(), '..'),
        prompt_draft_path: path.join(paths.workDir, 'prompt_draft.md'),
        verification_command: verificationCommand,
      };
    }

    const topology = buildExecutionTopology(req.subagents);
    const canonicalVaultFile = path.join(normalizedFolder, `${cleanSlug}.md`);

    let gitBranchTopology = undefined;
    if (req.featureBranch) {
      const featureClean = this.vault.sanitizeSlug(
        req.featureBranch.replace(/^(feat|feature|spec)\//, '').split('/')[0] || req.featureBranch
      );
      gitBranchTopology = {
        feature_branch: `feat/${featureClean}`,
        spec_branch: `spec/${featureClean}/${cleanSlug}`,
        merged_at: null,
      };
    }

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
      approved_skills: approvedSkills,
      hitl_0_skills_approved: Boolean(req.approvedSkills && req.approvedSkills.length > 0),
      execution_engine: executionEngine,
      ...(teamworkConfig ? { teamwork_config: teamworkConfig } : {}),
      icp: req.icp,
      goal: req.goal,
      status: reviewResult.context.state,
      iteration: 0,
      created_at: now,
      updated_at: now,
      ...(gitBranchTopology ? { git_branch_topology: gitBranchTopology } : {}),
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
          name:
            executionEngine === 'teamwork_preview'
              ? 'Teamwork Swarm Execution (Specify What, Not How + Forcing Function)'
              : 'Fresh-Context Serial Worker Implementation & Structured Handoffs',
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
      approvedSkills,
      icp: req.icp,
      goal: req.goal,
      dateStr,
      state: reviewResult.context.state,
      executionEngine,
      verificationCommand,
    });

    specData.spec_evaluation = auditSpecDocument(specMarkdown, specData, 1);

    this.vault.saveSpec(cleanSlug, specData, specMarkdown);
    if (executionEngine === 'teamwork_preview') {
      const promptDraft = this.renderTeamworkPrompt(cleanSlug, specData);
      this.vault.saveTeamworkPromptDraft(cleanSlug, promptDraft);
    }
    return reviewResult.context;
  }

  /**
   * Adversarial Spec Critic Loop (Pre-HITL-1): Audits and optionally updates the Spec Markdown
   * before human HITL-1 approval.
   */
  evaluateAndRefineSpec(slug: string, customSpecMarkdown?: string): SpecAdversarialReport {
    const loaded = this.vault.loadSpec(slug);
    const prevCycle = loaded.data.spec_evaluation?.cycle ?? 0;
    const nextCycle = prevCycle + 1;

    let mdContent = customSpecMarkdown;
    if (mdContent === undefined) {
      mdContent = this.vault.renderSpecMarkdown({
        slug: loaded.data.slug,
        title: loaded.data.title,
        targetFolder: loaded.data.target_folder,
        subagents: loaded.data.subagents,
        approvedSkills: loaded.data.approved_skills,
        icp: loaded.data.icp,
        goal: loaded.data.goal,
        dateStr: (loaded.data.updated_at || new Date().toISOString()).split('T')[0]!,
        state: String(loaded.data.status),
        executionEngine: loaded.data.execution_engine,
        verificationCommand: loaded.data.teamwork_config?.verification_command,
      });
    }

    const report = auditSpecDocument(mdContent, loaded.data, nextCycle);
    loaded.data.spec_evaluation = report;
    this.vault.saveSpec(slug, loaded.data, customSpecMarkdown !== undefined ? customSpecMarkdown : undefined);
    return report;
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

    const dateStr = now.split('T')[0]!;
    const refreshedMarkdown = this.vault.renderSpecMarkdown({
      slug: data.slug,
      title: data.title,
      targetFolder: data.target_folder,
      subagents: data.subagents,
      approvedSkills: data.approved_skills,
      icp: data.icp,
      goal: data.goal,
      dateStr,
      state: 'spec_review',
    });
    data.spec_evaluation = auditSpecDocument(
      refreshedMarkdown,
      data,
      (data.spec_evaluation?.cycle ?? 0) + 1
    );

    this.vault.saveSpec(slug, data, refreshedMarkdown);
    this.vault.appendSpecFeedback(slug, dateStr, userFeedback);
    return data;
  }

  /**
   * Human approves specification & ValidationContract (HITL-1 Guardrail)
   * Blocks approval if the Adversarial Spec Critic scored the Spec < 8.5/9.0.
   */
  approveSpec(slug: string): TransitionResult {
    const loaded = this.vault.loadSpec(slug);
    const ctx = this.buildContextFromSpec(loaded.data);

    if (loaded.data.spec_evaluation && !loaded.data.spec_evaluation.passed) {
      return {
        success: false,
        context: ctx,
        error: `Adversarial Spec Critic bloqueó HITL-1: El Spec "${slug}" obtuvo ${loaded.data.spec_evaluation.score}/9.0 (< 8.5). Defectos: ${loaded.data.spec_evaluation.defects.join(' | ')}`,
      };
    }

    const res = smApproveSpec(ctx);

    if (!res.success) {
      return res;
    }

    const now = new Date().toISOString();
    loaded.data.status = res.context.state;
    loaded.data.hitl_0_skills_approved = true;
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
