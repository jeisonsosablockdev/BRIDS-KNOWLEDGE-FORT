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

import { scanCliches } from './anti-cliche-filter.ts';
import { evaluateWithClefSync, computeClefCacheKey } from './clef-client.ts';
import type { ClefDecisionVerdict, ClefProbabilities } from './clef-client.ts';

export { evaluateWithClefSync, computeClefCacheKey };
export type { ClefDecisionVerdict, ClefProbabilities };

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
 * Deterministic 4D text + Clef System One hybrid auditor for RWA, Solana & YC deliverables
 */
export function auditDeliverableText(text: string, specData: Record<string, any> = {}): FullAuditReport {
  const content = text || '';
  const targetIcp = String(specData?.intent?.target_icp || specData?.icp || '');

  // Layer 1: Clef System One forward-pass decision (SHA-256 memoized for strict idempotence)
  const clefVerdict = evaluateWithClefSync(content, targetIcp);
  const probs = clefVerdict.probabilities;

  // Layer 0 + Layer 1 combined across the 4 dimensions
  const dim1 = evaluateGoalAndIcp(content, targetIcp, probs.goalIcp);
  const dim2 = evaluateTechnicalVeracity(content, probs.technicalVeracity);
  const dim3 = evaluateFounderVoice(content, probs.founderVoice);
  const dim4 = evaluateLexicalOriginality(content, probs.syntheticCliche);

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

  return {
    total_score: totalScore,
    scale_max: SCALE_MAX,
    passing_threshold: SDD_THRESHOLD,
    passed: totalScore >= SDD_THRESHOLD,
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
    remediation_directives: remediationDirectives
  };
}
