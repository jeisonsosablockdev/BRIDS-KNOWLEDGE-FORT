/**
 * SDD 4-Dimensional Quality Rubric Engine for BRIDS Knowledge Fort
 * Hybrid Evaluator:
 *  - Layer 0: Deterministic Regex & Anti-Cliché Filter (anti-cliche-filter.ts)
 *  - Layer 1: Cloudflare Clef System One (/v1/systemone) with SHA-256 idempotence (clef-client.ts)
 *
 * Evaluates deliverables on 0 to 9.0 scale against a strict >= 8.5 approval threshold.
 *
 * @spec SPEC-BRIDS-001 (BRIDS-Engine Clean Architecture — Solana RWA & YC Venture)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanCliches } from './anti-cliche-filter.ts';
import { evaluateWithClefSync, computeClefCacheKey } from './clef-client.ts';
import type { ClefDecisionVerdict, ClefProbabilities } from './clef-client.ts';
import type {
  SkillRecommendation,
  SpecAdversarialReport,
  ExecutionEngineType,
  TeamworkScaleMode,
} from '../core/contracts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_SKILLS_DIR = path.resolve(__dirname, '../skills');
const DEFAULT_AGENTS_DIR = path.resolve(__dirname, '../agents');

export { evaluateWithClefSync, computeClefCacheKey };
export type {
  ClefDecisionVerdict,
  ClefProbabilities,
  SkillRecommendation,
  SpecAdversarialReport,
  ExecutionEngineType,
  TeamworkScaleMode,
};

export interface RubricDimensions {
  goalIcp: number;            // Max 2.5
  techRigor: number;          // Max 2.5
  founderVoice: number;       // Max 2.0
  originalityLexicon: number; // Max 2.0
}

export interface EvaluationReport {
  score: number;
  passed: boolean;
  threshold: number;
  dimensions: RubricDimensions;
  clichesPenalty: number;
  observations: string[];
}

export interface FullAuditReport {
  spec_id?: string;
  cycle?: number;
  target_file?: string;
  timestamp?: string;
  total_score: number;
  scale_max: number;
  passing_threshold: number;
  passed: boolean;
  clef_decision: {
    engine: 'clef-flash' | 'heuristic-fallback';
    model: string;
    cache_key: string;
    cached: boolean;
    probabilities: ClefProbabilities;
  };
  scoring_dimensions: {
    '1_goal_and_icp': {
      name: string;
      score: number;
      max_score: number;
      passed: boolean;
      clef_probability: number;
      findings: string[];
    };
    '2_technical_veracity': {
      name: string;
      score: number;
      max_score: number;
      passed: boolean;
      clef_probability: number;
      findings: string[];
    };
    '3_founder_voice': {
      name: string;
      score: number;
      max_score: number;
      passed: boolean;
      clef_probability: number;
      findings: string[];
    };
    '4_lexical_originality': {
      name: string;
      score: number;
      max_score: number;
      passed: boolean;
      clef_probability: number;
      banned_phrases_found: Array<{ phrase: string; count: number; penaltyApplied: number }>;
      findings: string[];
    };
  };
  banned_phrases_detected: Array<{ phrase: string; count: number; penaltyApplied: number }>;
  remediation_directives: string[];
  adversarial_validation?: {
    validator_role: 'sdd-reviewer';
    zero_creator_bias: true;
    technical_qa_passed: boolean;
    functional_icp_qa_passed: boolean;
    contract_verified: boolean;
    unresolved_handoff_items: string[];
  };
}

export const SDD_THRESHOLD = 8.5;
const SCALE_MAX = 9.0;
const MIN_RECOMMENDED_WORDS = 100;

// Clef System One probability floors/ceilings
const CLEF_MIN_GOAL_PROB = 0.50;
const CLEF_MIN_TECH_PROB = 0.50;
const CLEF_MIN_VOICE_PROB = 0.35;
const CLEF_MAX_SYNTHETIC_CLICHE_PROB = 0.65;

const CTA_PATTERN = /(agenda|contacto|demo|invers|descarga|participa|comienza|empieza|hablemos|call to action|cta|sindicaci[oó]n)/i;
const SOLANA_RWA_GROUNDING_PATTERN = /(solana|metaplex|delaware|spv|llc|smart contract|on-chain|tokeniz|inmueble|rwa|real estate|stripe identity)/i;
const SPECULATIVE_PROMISE_PATTERN = /(retorno garantizado 100%|cero riesgo absoluto|duplica tu dinero|sin riesgo legal)/i;
const MAINNET_FABRICATION_PATTERN = /(live on solana mainnet-beta|desplegado en mainnet de solana|operando en mainnet|production on solana mainnet)/i;
const PASSIVE_CORPORATE_FILLER_PATTERN = /(se podr[ií]a argumentar que|es menester se[ñn]alar|podemos colegir|a modo de introducci[oó]n|el presente documento pretende)/gi;
const FOUNDER_CONVICTION_PATTERN = /(construimos|eliminamos|resolvemos|brids|nuestro|optimizamos|directo|desarrollador|inversor|liquidez)/i;

function clampScore(value: number, max: number): number {
  return Math.max(0, Math.min(max, Number(value.toFixed(2))));
}

export function evaluateDeliverable(
  dimensions: RubricDimensions,
  clichePenalty: number = 0,
  observations: string[] = []
): EvaluationReport {
  const clamped: RubricDimensions = {
    goalIcp: clampScore(dimensions.goalIcp, 2.5),
    techRigor: clampScore(dimensions.techRigor, 2.5),
    founderVoice: clampScore(dimensions.founderVoice, 2.0),
    originalityLexicon: clampScore(dimensions.originalityLexicon, 2.0)
  };

  const rawSum = clamped.goalIcp + clamped.techRigor + clamped.founderVoice + clamped.originalityLexicon;
  const netScore = clampScore(rawSum - clichePenalty, SCALE_MAX);

  return {
    score: netScore,
    passed: netScore >= SDD_THRESHOLD,
    threshold: SDD_THRESHOLD,
    dimensions: clamped,
    clichesPenalty: Number(clichePenalty.toFixed(2)),
    observations
  };
}

function evaluateGoalAndIcp(content: string, targetIcp: string, clefProb: number): { score: number; findings: string[] } {
  let score = 2.5;
  const findings: string[] = [];

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_RECOMMENDED_WORDS) {
    score -= 1.0;
    findings.push(`Extensión insuficiente (${wordCount} palabras; mínimo recomendado ${MIN_RECOMMENDED_WORDS} palabras).`);
  }

  if (!CTA_PATTERN.test(content)) {
    score -= 0.5;
    findings.push('Falta un Llamado a la Acción (CTA) directo o próximo paso accionable.');
  }

  if (targetIcp) {
    const icpKeywords = targetIcp.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    const matchedIcp = icpKeywords.some((k) => content.toLowerCase().includes(k));
    if (!matchedIcp && icpKeywords.length > 0) {
      score -= 0.3;
      findings.push(`No se encontraron referencias explícitas al perfil ICP (${targetIcp}).`);
    }
  }

  if (clefProb < CLEF_MIN_GOAL_PROB) {
    const clefPenalty = Number(((CLEF_MIN_GOAL_PROB - clefProb) * 1.2).toFixed(2));
    score -= clefPenalty;
    findings.push(`Clef System One (P=${clefProb}): Baja alineación semántica con el objetivo comercial e ICP.`);
  }

  return { score: clampScore(score, 2.5), findings };
}

function evaluateTechnicalVeracity(content: string, clefProb: number): { score: number; findings: string[] } {
  let score = 2.5;
  const findings: string[] = [];

  if (!SOLANA_RWA_GROUNDING_PATTERN.test(content)) {
    score -= 1.0;
    findings.push('Faltan anclas técnicas verificables (Solana, Metaplex Core, Delaware SPV, RWA).');
  }
  if (SPECULATIVE_PROMISE_PATTERN.test(content)) {
    score -= 1.5;
    findings.push('Alerta regulatoria: contiene promesas especulativas o garantías de retorno irrealistas.');
  }
  if (MAINNET_FABRICATION_PATTERN.test(content)) {
    score -= 1.0;
    findings.push('Alerta de veracidad técnica: El producto opera en devnet / staging con contratos Metaplex Core; no afirmar despliegue en mainnet-beta.');
  }
  if (clefProb < CLEF_MIN_TECH_PROB) {
    const clefPenalty = Number(((CLEF_MIN_TECH_PROB - clefProb) * 1.2).toFixed(2));
    score -= clefPenalty;
    findings.push(`Clef System One (P=${clefProb}): Insuficiente rigor técnico verificable en arquitectura RWA/Solana.`);
  }

  return { score: clampScore(score, 2.5), findings };
}

function evaluateFounderVoice(content: string, clefProb: number): { score: number; findings: string[] } {
  let score = 2.0;
  const findings: string[] = [];

  const fillerMatches = (content.match(PASSIVE_CORPORATE_FILLER_PATTERN) || []).length;
  if (fillerMatches > 0) {
    score -= fillerMatches * 0.4;
    findings.push(`Se detectó prosa corporativa pasiva/impersonal (${fillerMatches} ocurrencias).`);
  }
  if (!FOUNDER_CONVICTION_PATTERN.test(content)) {
    score -= 0.4;
    findings.push('Falta asertividad y convicción de fundador en la resolución del problema.');
  }
  if (clefProb < CLEF_MIN_VOICE_PROB) {
    const clefPenalty = Number(((CLEF_MIN_VOICE_PROB - clefProb) * 1.2).toFixed(2));
    score -= clefPenalty;
    findings.push(`Clef System One (P=${clefProb}): Tono impersonal o falto de convicción de fundador.`);
  }

  return { score: clampScore(score, 2.0), findings };
}

function evaluateLexicalOriginality(content: string, clefSyntheticProb: number) {
  const clicheScan = scanCliches(content);
  let score = clicheScan.cleanScore;
  const findings: string[] = [];

  const detectedBanned = clicheScan.detected.map((d) => ({
    phrase: d.phrase,
    count: d.count,
    penaltyApplied: d.penalty
  }));

  for (const d of clicheScan.detected) {
    findings.push(`Cliché de IA detectado: "${d.phrase}" (${d.count}x).`);
  }

  if (clefSyntheticProb > CLEF_MAX_SYNTHETIC_CLICHE_PROB) {
    const clefPenalty = Number(((clefSyntheticProb - CLEF_MAX_SYNTHETIC_CLICHE_PROB) * 1.5).toFixed(2));
    score = clampScore(score - clefPenalty, 2.0);
    findings.push(`Clef System One (P=${clefSyntheticProb}): Alta densidad de prosa sintética / clichés de IA detectada semánticamente.`);
  }

  return { score: clampScore(score, 2.0), findings, detectedBanned };
}

/**
 * Deterministic 4D text + Clef System One hybrid Adversarial Validator for RWA, Solana & YC deliverables
 */
export function auditDeliverableText(text: string, specData: Record<string, any> = {}): FullAuditReport {
  const content = text || '';
  const targetIcp = String(specData?.intent?.target_icp || specData?.icp || '');
  const acceptanceCriteria = Array.isArray(specData?.validation_contract?.acceptance_criteria)
    ? specData.validation_contract.acceptance_criteria
    : [];

  // Layer 1: Clef System One forward-pass decision (SHA-256 memoized for strict idempotence)
  const clefVerdict = evaluateWithClefSync(content, targetIcp, undefined, acceptanceCriteria);
  const probs = clefVerdict.probabilities;

  // Layer 0 + Layer 1 combined across the 4 dimensions
  const dim1 = evaluateGoalAndIcp(content, targetIcp, probs.goalIcp);
  const dim2 = evaluateTechnicalVeracity(content, probs.technicalVeracity);
  const dim3 = evaluateFounderVoice(content, probs.founderVoice);
  const dim4 = evaluateLexicalOriginality(content, probs.syntheticCliche);

  // Layer 2: Adversarial verification of StructuredHandoff pending items
  const handoffs = Array.isArray(specData?.worker_handoffs) ? specData.worker_handoffs : [];
  const latestHandoff = handoffs.length > 0 ? handoffs[handoffs.length - 1] : null;
  const unresolvedHandoffItems: string[] = Array.isArray(latestHandoff?.pending_items)
    ? latestHandoff.pending_items.filter(Boolean)
    : [];

  if (unresolvedHandoffItems.length > 0) {
    dim1.score = clampScore(dim1.score - 0.6, 2.5);
    dim1.findings.push(
      `Handoff incompleto del Worker (${latestHandoff.worker_id}): quedan ${unresolvedHandoffItems.length} ítem(s) pendientes (${unresolvedHandoffItems.join('; ')}).`
    );
  }

  const remediationDirectives: string[] = [];
  if (dim4.detectedBanned.length > 0) {
    remediationDirectives.push(
      `Eliminar inmediatamente las siguientes muletillas de IA: ${dim4.detectedBanned.map((d) => `"${d.phrase}"`).join(', ')}.`
    );
  }
  remediationDirectives.push(...dim1.findings, ...dim2.findings, ...dim3.findings);

  const rubricEval = evaluateDeliverable(
    {
      goalIcp: dim1.score,
      techRigor: dim2.score,
      founderVoice: dim3.score,
      originalityLexicon: dim4.score
    },
    0,
    remediationDirectives
  );

  const totalScore = Math.round(rubricEval.score * 10) / 10;
  const technicalQaPassed = rubricEval.dimensions.techRigor >= 2.2 && rubricEval.dimensions.originalityLexicon >= 1.8;
  const functionalIcpQaPassed = rubricEval.dimensions.goalIcp >= 2.0 && rubricEval.dimensions.founderVoice >= 1.7;
  const contractVerified = technicalQaPassed && functionalIcpQaPassed && unresolvedHandoffItems.length === 0;

  return {
    total_score: totalScore,
    scale_max: SCALE_MAX,
    passing_threshold: SDD_THRESHOLD,
    passed: totalScore >= SDD_THRESHOLD && unresolvedHandoffItems.length === 0,
    clef_decision: {
      engine: clefVerdict.engine,
      model: clefVerdict.model,
      cache_key: clefVerdict.cacheKey,
      cached: clefVerdict.cached,
      probabilities: probs
    },
    scoring_dimensions: {
      '1_goal_and_icp': {
        name: 'Cumplimiento del Objetivo & ICP',
        score: rubricEval.dimensions.goalIcp,
        max_score: 2.5,
        passed: rubricEval.dimensions.goalIcp >= 2.0,
        clef_probability: probs.goalIcp,
        findings: dim1.findings
      },
      '2_technical_veracity': {
        name: 'Veracidad Técnica & Fuentes',
        score: rubricEval.dimensions.techRigor,
        max_score: 2.5,
        passed: rubricEval.dimensions.techRigor >= 2.2,
        clef_probability: probs.technicalVeracity,
        findings: dim2.findings
      },
      '3_founder_voice': {
        name: 'Voz Fundadora vs Tono Robot',
        score: rubricEval.dimensions.founderVoice,
        max_score: 2.0,
        passed: rubricEval.dimensions.founderVoice >= 1.7,
        clef_probability: probs.founderVoice,
        findings: dim3.findings
      },
      '4_lexical_originality': {
        name: 'Originalidad Léxica & Cero Clichés',
        score: rubricEval.dimensions.originalityLexicon,
        max_score: 2.0,
        passed: rubricEval.dimensions.originalityLexicon >= 1.8,
        clef_probability: Number((1 - probs.syntheticCliche).toFixed(4)),
        banned_phrases_found: dim4.detectedBanned,
        findings: dim4.findings
      }
    },
    banned_phrases_detected: dim4.detectedBanned,
    remediation_directives: remediationDirectives,
    adversarial_validation: {
      validator_role: 'sdd-reviewer',
      zero_creator_bias: true,
      technical_qa_passed: technicalQaPassed,
      functional_icp_qa_passed: functionalIcpQaPassed,
      contract_verified: contractVerified,
      unresolved_handoff_items: unresolvedHandoffItems
    }
  };
}

// Discovers the most relevant skills from BRIDS-Engine/skills/<skill>/SKILL.md, maps recommended subagents,
// and recommends execution engine ('native_squad' vs 'teamwork_preview' + scale mode) for HITL-0 approval.
export function discoverSkillsForTask(
  query: string,
  targetFolder: string = '',
  limit: number = 4,
  skillsDir: string = DEFAULT_SKILLS_DIR,
  agentsDir: string = DEFAULT_AGENTS_DIR
): {
  skills: SkillRecommendation[];
  recommendedSubagents: string[];
  recommendedExecutionEngine: ExecutionEngineType;
  recommendedTeamworkScale?: TeamworkScaleMode;
} {
  const tokens = `${query} ${targetFolder}`
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñ\s-]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  const agentAffinities = new Map<string, number>();
  const agentSkillBoost = new Map<string, string>();

  if (fs.existsSync(agentsDir)) {
    for (const file of fs.readdirSync(agentsDir).filter((f) => f.endsWith('.yaml'))) {
      const agentId = file.replace(/\.yaml$/, '');
      const raw = fs.readFileSync(path.join(agentsDir, file), 'utf8');
      const descMatch = raw.match(/^description:\s*"?([^"\n]+)"?/m);
      const desc = (descMatch?.[1] || '').toLowerCase();
      let agentScore = 0;
      for (const t of tokens) {
        if (agentId.includes(t) || desc.includes(t)) agentScore += 2;
      }
      if (targetFolder && raw.toLowerCase().includes(targetFolder.toLowerCase())) {
        agentScore += 5;
      }
      if (agentScore > 0) {
        agentAffinities.set(agentId, agentScore);
      }

      const skillsBlock = raw.match(/^skills:\r?\n((?:\s+-\s+[^\r\n]+\r?\n?)+)/m);
      if (skillsBlock?.[1] && agentScore > 0) {
        for (const line of skillsBlock[1].split(/\r?\n/)) {
          const s = line.replace(/^\s*-\s*/, '').trim();
          if (s) agentSkillBoost.set(s, agentId);
        }
      }
    }
  }

  const recommendations: SkillRecommendation[] = [];
  if (fs.existsSync(skillsDir)) {
    for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillMdPath = path.join(skillsDir, entry.name, 'SKILL.md');
      if (!fs.existsSync(skillMdPath)) continue;

      const raw = fs.readFileSync(skillMdPath, 'utf8');
      const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const fm = fmMatch?.[1] || '';
      const name = (fm.match(/^name:\s*(.+)$/m)?.[1] || entry.name).trim().replace(/^["']|["']$/g, '');
      const description = (fm.match(/^description:\s*(.+)$/m)?.[1] || '').trim().replace(/^["']|["']$/g, '');

      const searchable = `${entry.name} ${name} ${description}`.toLowerCase();
      let score = 0;
      const matchedTokens: string[] = [];

      for (const token of tokens) {
        if (entry.name.toLowerCase().includes(token)) {
          score += 3;
          matchedTokens.push(token);
        } else if (searchable.includes(token)) {
          score += 1.5;
          matchedTokens.push(token);
        }
      }

      const boostedByAgent = agentSkillBoost.get(entry.name);
      if (boostedByAgent) {
        score += 3.5;
      }

      if (score > 0) {
        const uniqueMatches = Array.from(new Set(matchedTokens)).slice(0, 4);
        const reasonParts: string[] = [];
        if (uniqueMatches.length > 0) {
          reasonParts.push(`Coincidencia directa con [${uniqueMatches.join(', ')}]`);
        }
        if (boostedByAgent) {
          reasonParts.push(`skill canónica del subagente ${boostedByAgent}`);
        }
        recommendations.push({
          skillId: entry.name,
          name,
          description,
          skillMdPath,
          relevanceScore: Number(score.toFixed(2)),
          reason: reasonParts.join(' + ') || 'Relevancia de dominio',
        });
      }
    }
  }

  recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore || a.skillId.localeCompare(b.skillId));
  const topSkills = recommendations.slice(0, limit);

  if (topSkills.length === 0 && fs.existsSync(path.join(skillsDir, 'yc-insight-driven-bp', 'SKILL.md'))) {
    topSkills.push({
      skillId: 'yc-insight-driven-bp',
      name: 'yc-insight-driven-bp',
      description: 'Structure a minimalist 5-8 slide pitch deck or memo centered on a non-consensus insight for Y Combinator.',
      skillMdPath: path.join(skillsDir, 'yc-insight-driven-bp', 'SKILL.md'),
      relevanceScore: 1.0,
      reason: 'Skill fundacional por defecto para entregables estratégicos YC/BRIDS',
    });
  }

  const sortedAgents = Array.from(agentAffinities.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, 2);

  const qLower = query.toLowerCase();
  const isCrossDomainOrSwarm =
    /(suite completa|multi-artefacto|paquete completo|auditar todos|revisar todos|data room completo|teamwork|enjambre|proof|teorema|demostrar invariante)/i.test(
      qLower
    ) || agentAffinities.size >= 4;

  let recommendedExecutionEngine: ExecutionEngineType = isCrossDomainOrSwarm
    ? 'teamwork_preview'
    : 'native_squad';
  let recommendedTeamworkScale: TeamworkScaleMode | undefined = undefined;

  if (recommendedExecutionEngine === 'teamwork_preview') {
    if (/(auditar|revisar|review|data room)/i.test(qLower) && !/(construir|crear|generar suite)/i.test(qLower)) {
      recommendedTeamworkScale = 'review';
    } else if (/(proof|teorema|invariante|matem[aá]tic)/i.test(qLower)) {
      recommendedTeamworkScale = 'proof';
    } else if (/(quir[uú]rgico|peque[ñn]o|single|acotado)/i.test(qLower)) {
      recommendedTeamworkScale = 'small';
    } else {
      recommendedTeamworkScale = 'full';
    }
  }

  return {
    skills: topSkills,
    recommendedSubagents: sortedAgents.length > 0 ? sortedAgents : ['business-consultant', 'founder-ghostwriter'],
    recommendedExecutionEngine,
    ...(recommendedTeamworkScale ? { recommendedTeamworkScale } : {}),
  };
}

// Adversarial Spec Critic (Pre-HITL-1):
// Audits the Spec Markdown and TaskSpecData across 4 dimensions (0 to 9.0, threshold >= 8.5)
// before presenting the Spec artifact to the user in HITL-1.
export function auditSpecDocument(
  specMdContent: string,
  specData: Record<string, any> = {},
  cycle: number = 1
): SpecAdversarialReport {
  const content = specMdContent || '';
  const defects: string[] = [];
  const directives: string[] = [];

  // Dimension 1: Skill Integration (Max 2.5)
  let d1 = 2.5;
  const approvedSkills: string[] = Array.isArray(specData.approved_skills) ? specData.approved_skills : [];
  if (approvedSkills.length === 0) {
    d1 -= 1.2;
    defects.push('El Spec no declara approved_skills validadas en HITL-0.');
    directives.push('Ejecutar descubrimiento de skills y registrar approved_skills en el Spec.');
  } else {
    const missingInMd = approvedSkills.filter((s) => !content.toLowerCase().includes(s.toLowerCase()));
    if (missingInMd.length > 0) {
      d1 -= 0.8;
      defects.push(`Skills aprobadas no integradas en el cuerpo/outline del Spec: ${missingInMd.join(', ')}.`);
      directives.push(`Incorporar los frameworks de [${missingInMd.join(', ')}] en el Desglose Estructural del Spec.`);
    }
  }
  if (!/(outline|desglose estructural|criterios de aceptaci[oó]n|requirements)/i.test(content)) {
    d1 -= 0.7;
    defects.push('El Spec carece de sección de Desglose Estructural (Outline) o Criterios de Aceptación.');
    directives.push('Añadir sección de Desglose Estructural (Outline) con capítulos verificables.');
  }

  // Dimension 2: Vault Grounding & Zero Unresolved Placeholders (Max 2.5)
  let d2 = 2.5;
  const unresolvedPlaceholders = content.match(/\{\{[A-Z0-9_]+\}\}/g) || [];
  if (unresolvedPlaceholders.length > 0) {
    d2 -= 1.5;
    defects.push(`Quedan placeholders sin resolver en el Spec: ${Array.from(new Set(unresolvedPlaceholders)).join(', ')}.`);
    directives.push('Reemplazar todos los placeholders {{...}} con datos concretos del caso de negocio.');
  }
  if (!SOLANA_RWA_GROUNDING_PATTERN.test(content)) {
    d2 -= 1.0;
    defects.push('El Spec no incluye anclas técnicas verificables (Solana, Metaplex Core, Delaware SPV).');
    directives.push('Anclar el Spec a la arquitectura técnica y legal de BRIDS (Solana, Metaplex Core, Delaware SPV).');
  }
  if (SPECULATIVE_PROMISE_PATTERN.test(content) || MAINNET_FABRICATION_PATTERN.test(content)) {
    d2 -= 1.5;
    defects.push('El Spec contiene afirmaciones prohibidas (retornos garantizados o falso despliegue en mainnet-beta).');
    directives.push('Eliminar cualquier afirmación prohibida del Spec.');
  }

  // Dimension 3: ValidationContract Specificity (Max 2.0)
  let d3 = 2.0;
  const criteria: string[] = Array.isArray(specData?.validation_contract?.acceptance_criteria)
    ? specData.validation_contract.acceptance_criteria
    : [];
  const anchors: string[] = Array.isArray(specData?.validation_contract?.required_technical_anchors)
    ? specData.validation_contract.required_technical_anchors
    : [];
  if (criteria.length < 3) {
    d3 -= 1.0;
    defects.push(`ValidationContract débil: solo tiene ${criteria.length} criterio(s) de aceptación (mínimo requerido: 3).`);
    directives.push('Definir al menos 3 acceptance_criteria verificables en el ValidationContract.');
  }
  if (anchors.length < 2) {
    d3 -= 0.5;
    defects.push(`ValidationContract tiene menos de 2 required_technical_anchors (${anchors.length}).`);
    directives.push('Especificar al menos 2 anclas técnicas obligatorias en validation_contract.required_technical_anchors.');
  }

  // Dimension 4: Dual Rubric — Worker Handoff Clarity (native_squad) OR ForcingFunctionClarity (teamwork_preview) (Max 2.0)
  let d4 = 2.0;
  if (specData.execution_engine === 'teamwork_preview') {
    const hasForcingFunction =
      /(sdd-orchestrator\.ts\s+evaluate|engine\.ts\s+test|audit-runner\.ts)/i.test(content);
    if (!hasForcingFunction) {
      d4 -= 1.2;
      defects.push(
        'El Spec de Teamwork carece de Verification Resources / Forcing Function objetiva (comando CLI verificable).'
      );
      directives.push(
        'Incluir sección Verification Resources con comando objetivo de BRIDS-Engine (ej. sdd-orchestrator.ts evaluate).'
      );
    }
  } else {
    const subagents: string[] = Array.isArray(specData.subagents) ? specData.subagents : [];
    if (subagents.length === 0) {
      d4 -= 1.0;
      defects.push('No hay subagentes asignados al Spec.');
      directives.push('Asignar al menos un subagente del squad al Spec.');
    } else {
      const missingAgents = subagents.filter((a) => !content.toLowerCase().includes(a.toLowerCase()));
      if (missingAgents.length > 0) {
        d4 -= 0.8;
        defects.push(`Subagentes asignados no documentados en el Spec: ${missingAgents.join(', ')}.`);
        directives.push(`Detallar las responsabilidades de [${missingAgents.join(', ')}] en el Spec.`);
      }
    }
  }

  const clefVerdict = evaluateWithClefSync(
    content,
    String(specData?.icp || 'Real Estate Sponsors & YC Investors'),
    undefined,
    criteria
  );

  const clampedD1 = clampScore(d1, 2.5);
  const clampedD2 = clampScore(d2, 2.5);
  const clampedD3 = clampScore(d3, 2.0);
  const clampedD4 = clampScore(d4, 2.0);
  const totalScore = clampScore(clampedD1 + clampedD2 + clampedD3 + clampedD4, SCALE_MAX);

  return {
    score: totalScore,
    passed: totalScore >= SDD_THRESHOLD && defects.length === 0,
    cycle,
    engine: clefVerdict.engine,
    dimensions: {
      skillIntegration: clampedD1,
      vaultGrounding: clampedD2,
      contractSpecificity: clampedD3,
      workerHandoffClarity: clampedD4,
    },
    defects,
    remediation_directives: directives,
    timestamp: new Date().toISOString(),
  };
}

