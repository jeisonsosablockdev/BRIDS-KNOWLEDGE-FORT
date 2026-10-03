/**
 * SDD Task Orchestrator: High-Level Application Coordinator for BRIDS Knowledge Fort
 * Integrates TaskStateMachine, VaultGateway, and SDD 4D Evaluators.
 * 
 * @spec SPEC-001 (Ported & adapted from Academic-Engine architecture)
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  createInitialContext,
  startSpecReview,
  approveSpec as smApproveSpec,
  evaluateCycle as smEvaluateCycle,
  approveDeliverable as smApproveDeliverable,
  QUALITY_THRESHOLD,
  MAX_OPTIMIZATION_CYCLES
} from './state-machine.ts';
import type { TaskContext, TransitionResult } from './state-machine.ts';
import { VaultGateway } from './vault-gateway.ts';
import type { TaskSpecData } from './vault-gateway.ts';
import { evaluateDeliverable } from '../evaluators/sdd-4d-rubric.ts';
import type { RubricDimensions, EvaluationReport } from '../evaluators/sdd-4d-rubric.ts';
import { scanCliches } from '../evaluators/anti-cliche-filter.ts';

export class TaskOrchestrator {
  private vault: VaultGateway;

  constructor(vault?: VaultGateway) {
    this.vault = vault || new VaultGateway();
  }

  getVault(): VaultGateway {
    return this.vault;
  }

  private buildContextFromSpec(data: TaskSpecData): TaskContext {
    const cycle = (data.evaluation && data.evaluation.current_cycle) || data.iteration || 0;
    return {
      slug: data.slug,
      title: data.title,
      state: (data.status as any) || 'initialized',
      currentCycle: cycle,
      maxCycles: MAX_OPTIMIZATION_CYCLES,
      qualityThreshold: QUALITY_THRESHOLD,
      lastScore: 0,
      history: (data.evaluation && data.evaluation.history) || []
    };
  }

  /**
   * Initializes a new deliverable spec in state 'spec_review'
   */
  initSpec(
    slug: string,
    title: string,
    targetFolder: string = '01 Negocio/01 Estrategia & Modelo',
    subagents: string[] = ['business-consultant'],
    icp: string = 'Institutional Real Estate Sponsors & YC Investors',
    goal: string = ''
  ): TaskContext {
    const cleanSlug = this.vault.sanitizeSlug(slug);
    const initialCtx = createInitialContext(cleanSlug, title);
    const reviewResult = startSpecReview(initialCtx);

    const specData: TaskSpecData = {
      spec_version: '2.0.0',
      id: `SPEC-${cleanSlug.toUpperCase()}`,
      slug: cleanSlug,
      title,
      target_folder: targetFolder,
      subagents,
      icp,
      goal,
      status: reviewResult.context.state,
      iteration: 0,
      evaluation: {
        current_cycle: 0,
        max_cycles: MAX_OPTIMIZATION_CYCLES,
        passing_threshold: QUALITY_THRESHOLD,
        history: []
      },
      evaluations: []
    };

    const specMarkdown = 
      `# Spec: ${title}\n\n` +
      `- **Slug:** ${cleanSlug}\n` +
      `- **Objetivo:** ${goal || title}\n` +
      `- **Público Objetivo (ICP):** ${icp}\n` +
      `- **Subagentes Asignados:** ${subagents.join(', ')}\n` +
      `- **Destino Canónico:** ${targetFolder}/${cleanSlug}.md\n` +
      `- **Estado:** ${reviewResult.context.state}\n\n` +
      `## Criterios de Aceptación Verificables\n` +
      `1. Cobertura completa de la propuesta de valor y economía unitaria.\n` +
      `2. Veracidad técnica con anclas on-chain (Solana, Metaplex Core, Delaware SPV).\n` +
      `3. Cero clichés de LLM y tono directo de fundador YC.\n`;

    this.vault.saveSpec(cleanSlug, specData, specMarkdown);
    return reviewResult.context;
  }

  /**
   * Human approves specification (HITL-1 Guardrail)
   */
  approveSpec(slug: string): TransitionResult {
    const loaded = this.vault.loadSpec(slug);
    const ctx = this.buildContextFromSpec(loaded.data);
    const res = smApproveSpec(ctx);

    if (!res.success) {
      return res;
    }

    // Persist updated state
    loaded.data.status = res.context.state;
    this.vault.saveSpec(slug, loaded.data);

    // Save snapshot of approved spec in work directory
    const paths = loaded.paths;
    if (!fs.existsSync(paths.workDir)) {
      fs.mkdirSync(paths.workDir, { recursive: true });
    }
    const currentMd = fs.existsSync(paths.specMdPath)
      ? fs.readFileSync(paths.specMdPath, 'utf8')
      : '';
    fs.writeFileSync(paths.approvedSpecPath, currentMd, 'utf8');

    return res;
  }

  /**
   * Evaluates draft in the autonomous optimization loop
   */
  evaluateDraft(
    slug: string,
    draftContent: string,
    dimensions: RubricDimensions,
    observations: string[] = []
  ): { transition: TransitionResult; report: EvaluationReport } {
    const loaded = this.vault.loadSpec(slug);
    const ctx = this.buildContextFromSpec(loaded.data);

    // 1. Scan for AI clichés
    const clicheScan = scanCliches(draftContent);

    // 2. Score via 4D rubric
    const report = evaluateDeliverable(dimensions, clicheScan.totalPenalty, observations);

    // 3. Attempt state machine transition
    const transition = smEvaluateCycle(ctx, report.score);

    if (transition.success) {
      // Update spec data
      loaded.data.status = transition.context.state;
      loaded.data.iteration = transition.context.currentCycle;
      if (!loaded.data.evaluation) {
        loaded.data.evaluation = {
          current_cycle: transition.context.currentCycle,
          max_cycles: MAX_OPTIMIZATION_CYCLES,
          passing_threshold: QUALITY_THRESHOLD,
          history: []
        };
      }
      loaded.data.evaluation.current_cycle = transition.context.currentCycle;
      loaded.data.evaluation.history = transition.context.history;

      // Save draft cycle
      const paths = loaded.paths;
      if (!fs.existsSync(paths.workDir)) {
        fs.mkdirSync(paths.workDir, { recursive: true });
      }
      const draftPath = path.join(paths.workDir, `draft_cycle_${transition.context.currentCycle}.md`);
      fs.writeFileSync(draftPath, draftContent, 'utf8');

      if (report.passed) {
        fs.writeFileSync(paths.approvedDraftPath, draftContent, 'utf8');
      }

      this.vault.saveSpec(slug, loaded.data);
    }

    return { transition, report };
  }

  /**
   * Human approves deliverable and commits to BRIDS-Brain (HITL-2 Guardrail)
   */
  approveDeliverable(slug: string, finalContent?: string): TransitionResult {
    const loaded = this.vault.loadSpec(slug);
    const ctx = this.buildContextFromSpec(loaded.data);
    const res = smApproveDeliverable(ctx);

    if (!res.success) {
      return res;
    }

    let contentToCommit = finalContent;
    if (!contentToCommit) {
      if (fs.existsSync(loaded.paths.approvedDraftPath)) {
        contentToCommit = fs.readFileSync(loaded.paths.approvedDraftPath, 'utf8');
      } else {
        const cycle = loaded.data.evaluation?.current_cycle || 1;
        const cycleFile = path.join(loaded.paths.workDir, `draft_cycle_${cycle}.md`);
        if (fs.existsSync(cycleFile)) {
          contentToCommit = fs.readFileSync(cycleFile, 'utf8');
        }
      }
    }

    if (!contentToCommit) {
      return {
        success: false,
        context: ctx,
        error: `No approved draft found to commit for task "${slug}".`
      };
    }

    // Commit deliverable to production vault
    this.vault.commitDeliverable(slug, contentToCommit);

    // Update spec status
    loaded.data.status = res.context.state;
    this.vault.saveSpec(slug, loaded.data);

    return res;
  }
}
