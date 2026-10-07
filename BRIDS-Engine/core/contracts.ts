/**
 * Domain Contracts for BRIDS-Engine Three-Role Architecture:
 *  1. Orchestrator (Planning, Milestones & Validation Contract)
 *  2. Workers (Fresh-Context Implementation, Serial Write vs Parallel Read & Structured Handoffs)
 *  3. Adversarial Validators (Zero-Creator-Bias Technical & Functional QA)
 *
 * @spec SPEC-BRIDS-001 (BRIDS-Engine Clean Architecture — Solana RWA & YC Venture)
 */

import type { TaskHistoryEntry, TaskLifecycleState } from './state-machine.ts';

export type AgentRoleType = 'orchestrator' | 'worker' | 'validator';
export type ExecutionConcurrencyMode = 'serial_write' | 'parallel_read';
export type ModelTier = 'pro' | 'flash' | 'inherit';

export interface AgentArchitectureProfile {
  agentId: string;
  roleType: AgentRoleType;
  executionMode: ExecutionConcurrencyMode;
  contextIsolation: 'fresh_context';
  modelTier: ModelTier;
  requiresStructuredHandoff: boolean;
}

/**
 * Strategic Model Selection & Execution Topology Catalog
 * - Slow/Deep reasoning ('pro') for Orchestrator planning, Legal/Financial modeling, and Adversarial Validation
 * - Fast/Low-latency ('flash') for Parallel Read-Only research gatherers
 */
export const STRATEGIC_MODEL_ROUTING: Record<string, AgentArchitectureProfile> = {
  orchestrator: {
    agentId: 'orchestrator',
    roleType: 'orchestrator',
    executionMode: 'serial_write',
    contextIsolation: 'fresh_context',
    modelTier: 'pro',
    requiresStructuredHandoff: false,
  },
  'market-research-analyst': {
    agentId: 'market-research-analyst',
    roleType: 'worker',
    executionMode: 'parallel_read',
    contextIsolation: 'fresh_context',
    modelTier: 'flash',
    requiresStructuredHandoff: true,
  },
  'narrative-intelligence-analyst': {
    agentId: 'narrative-intelligence-analyst',
    roleType: 'worker',
    executionMode: 'parallel_read',
    contextIsolation: 'fresh_context',
    modelTier: 'flash',
    requiresStructuredHandoff: true,
  },
  'business-consultant': {
    agentId: 'business-consultant',
    roleType: 'worker',
    executionMode: 'serial_write',
    contextIsolation: 'fresh_context',
    modelTier: 'pro',
    requiresStructuredHandoff: true,
  },
  'compliance-officer': {
    agentId: 'compliance-officer',
    roleType: 'worker',
    executionMode: 'serial_write',
    contextIsolation: 'fresh_context',
    modelTier: 'pro',
    requiresStructuredHandoff: true,
  },
  'pitch-deck-architect': {
    agentId: 'pitch-deck-architect',
    roleType: 'worker',
    executionMode: 'serial_write',
    contextIsolation: 'fresh_context',
    modelTier: 'pro',
    requiresStructuredHandoff: true,
  },
  'b2b-sponsor-lead': {
    agentId: 'b2b-sponsor-lead',
    roleType: 'worker',
    executionMode: 'serial_write',
    contextIsolation: 'fresh_context',
    modelTier: 'inherit',
    requiresStructuredHandoff: true,
  },
  'founder-ghostwriter': {
    agentId: 'founder-ghostwriter',
    roleType: 'worker',
    executionMode: 'serial_write',
    contextIsolation: 'fresh_context',
    modelTier: 'pro',
    requiresStructuredHandoff: true,
  },
  'sdd-reviewer': {
    agentId: 'sdd-reviewer',
    roleType: 'validator',
    executionMode: 'serial_write',
    contextIsolation: 'fresh_context',
    modelTier: 'pro',
    requiresStructuredHandoff: false,
  },
};

export interface ExecutionTopologyPlan {
  orchestrator: AgentArchitectureProfile;
  parallelReadGatherers: AgentArchitectureProfile[];
  serialWriteWorkers: AgentArchitectureProfile[];
  adversarialValidator: AgentArchitectureProfile;
}

/**
 * Separates assigned subagents into Parallel Read Gatherers vs Serial Write Workers
 * to prevent write conflicts and inconsistent decisions across workers.
 */
export function buildExecutionTopology(subagents: string[]): ExecutionTopologyPlan {
  const parallelReadGatherers: AgentArchitectureProfile[] = [];
  const serialWriteWorkers: AgentArchitectureProfile[] = [];

  for (const rawId of subagents) {
    const id = rawId.trim().toLowerCase();
    const profile: AgentArchitectureProfile = STRATEGIC_MODEL_ROUTING[id] ?? {
      agentId: id,
      roleType: 'worker',
      executionMode: 'serial_write',
      contextIsolation: 'fresh_context',
      modelTier: 'inherit',
      requiresStructuredHandoff: true,
    };

    if (profile.executionMode === 'parallel_read') {
      parallelReadGatherers.push(profile);
    } else {
      serialWriteWorkers.push(profile);
    }
  }

  return {
    orchestrator: STRATEGIC_MODEL_ROUTING.orchestrator!,
    parallelReadGatherers,
    serialWriteWorkers,
    adversarialValidator: STRATEGIC_MODEL_ROUTING['sdd-reviewer']!,
  };
}

/**
 * Validation Contract established by the Orchestrator BEFORE any Worker writes a line of code/prose.
 */
export interface ValidationContract {
  contract_id: string;
  required_technical_anchors: string[];
  forbidden_claims: string[];
  min_word_count: number;
  requires_actionable_cta: boolean;
  quality_threshold: number;
  acceptance_criteria: string[];
}

/**
 * Structured Handoff emitted by each Worker when finishing its turn in fresh context.
 * Enables seamless continuity for the next serial Worker and transparent auditing for the Validator.
 */
export interface StructuredHandoff {
  worker_id: string;
  step_index: number;
  completed_items: string[];
  pending_items: string[];
  decisions_made: string[];
  issues_encountered: string[];
  artifact_snapshot?: string;
  timestamp: string;
}

/**
 * Hierarchical Feature -> Spec Git Branch Topology
 */
export interface GitBranchTopology {
  feature_branch: string;   // Parent feature branch, e.g., "feat/yc-data-room"
  spec_branch: string;      // Child spec branch, e.g., "spec/yc-data-room/spv-legal-memo"
  merged_at?: string | null;
}

/**
 * Discovered Skill Recommendation for HITL-0 Approval
 */
export interface SkillRecommendation {
  skillId: string;
  name: string;
  description: string;
  skillMdPath: string;
  relevanceScore: number;
  reason: string;
}

/**
 * Adversarial Spec Quality Report (Pre-HITL-1)
 */
export interface SpecAdversarialReport {
  score: number;
  passed: boolean;
  cycle: number;
  engine?: 'clef-flash' | 'heuristic-fallback';
  dimensions: {
    skillIntegration: number;      // Max 2.5
    vaultGrounding: number;        // Max 2.5
    contractSpecificity: number;   // Max 2.0
    workerHandoffClarity: number;  // Max 2.0
  };
  defects: string[];
  remediation_directives: string[];
  timestamp: string;
}

/**
 * Value Object / DTO for initializing a Spec without positional parameter pollution.
 */
export interface CreateSpecRequest {
  slug: string;
  title: string;
  targetFolder?: string;
  subagents?: string[];
  approvedSkills?: string[];
  icp?: string;
  goal?: string;
  featureBranch?: string;
  validationContract?: Partial<ValidationContract>;
}

export interface HitlCheckpointRecord {
  status: 'pending' | 'refining' | 'approved';
  approved_at: string | null;
  user_feedback: Array<{ timestamp: string; feedback: string }>;
}

export interface CriticismHistoryEntry {
  cycle: number;
  total_score: number;
  passed: boolean;
  timestamp: string;
  banned_phrases_count: number;
  clef_engine: string;
  clef_cache_key: string;
  report_file?: string;
}

export interface ExecutionStepRecord {
  id: string;
  name: string;
  role: AgentRoleType;
  execution_mode: ExecutionConcurrencyMode;
  model_tier: ModelTier;
  status: 'pending' | 'in_progress' | 'completed';
  depends_on: string[];
}

/**
 * Unified Canonical Specification Schema for BRIDS-Engine
 */
export interface TaskSpecData {
  spec_version?: string;
  id?: string;
  spec_id?: string;
  slug: string;
  title: string;
  target_folder: string;
  target_vault_folder?: string;
  target_file?: string;
  subagents: string[];
  subagents_involved?: string[];
  approved_skills?: string[];
  hitl_0_skills_approved?: boolean;
  spec_evaluation?: SpecAdversarialReport;
  icp: string;
  goal: string;
  status: TaskLifecycleState | string;
  iteration?: number;
  created_at?: string;
  updated_at?: string;
  git_branch_topology?: GitBranchTopology;
  validation_contract?: ValidationContract;
  execution_topology?: ExecutionTopologyPlan;
  worker_handoffs?: StructuredHandoff[];
  hitl_checkpoints?: {
    hitl_1_spec_approval: HitlCheckpointRecord;
    hitl_2_deliverable_approval: HitlCheckpointRecord;
  };
  intent?: {
    business_goal: string;
    target_icp: string;
    constraints: string[];
  };
  evaluation?: {
    current_cycle: number;
    max_cycles: number;
    passing_threshold: number;
    target_score?: number;
    scale_max?: number;
    final_score?: number | null;
    history: TaskHistoryEntry[];
    criticism_history?: CriticismHistoryEntry[];
  };
  evaluations?: unknown[];
  execution_steps?: ExecutionStepRecord[];
}

export function createDefaultValidationContract(
  specId: string,
  qualityThreshold: number = 8.5
): ValidationContract {
  return {
    contract_id: `VC-${specId}`,
    required_technical_anchors: ['Solana', 'Metaplex', 'Delaware', 'SPV'],
    forbidden_claims: [
      'live on solana mainnet-beta',
      'retorno garantizado 100%',
      'cero riesgo absoluto',
    ],
    min_word_count: 100,
    requires_actionable_cta: true,
    quality_threshold: qualityThreshold,
    acceptance_criteria: [
      'Cobertura completa de la propuesta de valor y economía unitaria para el ICP.',
      'Veracidad técnica con anclas on-chain (Solana, Metaplex Core, Delaware SPV).',
      'Cero clichés de IA y voz directa de fundador YC.',
      'Cero bloqueos o tareas críticas pendientes en el StructuredHandoff final.',
    ],
  };
}
