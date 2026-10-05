/**
 * SDD 4-Dimensional Quality Rubric Engine for BRIDS Knowledge Fort
 * Evaluates deliverables on 0 to 9.0 scale against a strict >= 8.5 approval threshold.
 * 
 * Dimensions:
 * 1. Goal & ICP Alignment (Sponsors B2B / YC Investors): 0 - 2.5 pts
 * 2. Technical Rigor & Verifiable Anchors (Solana, Metaplex Core, Delaware SPV): 0 - 2.5 pts
 * 3. Founder Voice & Visual Structure: 0 - 2.0 pts
 * 4. Lexical Originality & Zero AI Clichés: 0 - 2.0 pts
 * 
 * @spec SPEC-BRIDS-001 (BRIDS-Engine Clean Architecture — Solana RWA & YC Venture)
 */

import { scanCliches } from './anti-cliche-filter.ts';

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

export const SDD_THRESHOLD = 8.5;

export function evaluateDeliverable(
  dimensions: RubricDimensions,
  clichePenalty: number = 0,
  observations: string[] = []
): EvaluationReport {
  const clamped: RubricDimensions = {
    goalIcp: Math.max(0, Math.min(2.5, dimensions.goalIcp)),
    techRigor: Math.max(0, Math.min(2.5, dimensions.techRigor)),
    founderVoice: Math.max(0, Math.min(2.0, dimensions.founderVoice)),
    originalityLexicon: Math.max(0, Math.min(2.0, dimensions.originalityLexicon))
  };

  const rawSum = clamped.goalIcp + clamped.techRigor + clamped.founderVoice + clamped.originalityLexicon;
  const netScore = Math.max(0, Math.min(9.0, Number((rawSum - clichePenalty).toFixed(2))));
  const passed = netScore >= SDD_THRESHOLD;

  return {
    score: netScore,
    passed,
    threshold: SDD_THRESHOLD,
    dimensions: clamped,
    clichesPenalty: Number(clichePenalty.toFixed(2)),
    observations
  };
}

/**
 * Deterministic 4D text heuristic auditor for RWA, Solana & YC deliverables
 */
export function auditDeliverableText(text: string, specData: any = {}) {
  const content = text || '';
  const findings: Record<string, string[]> = {
    goal_and_icp: [],
    technical_veracity: [],
    founder_voice: [],
    lexical_originality: []
  };

  // --- Dimension 1: Cumplimiento del Objetivo & ICP (Max 2.5 pts) ---
  let scoreGoal = 2.5;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 100) {
    scoreGoal -= 1.0;
    findings.goal_and_icp.push(`Extensión insuficiente (${wordCount} palabras; mínimo recomendado 100 palabras).`);
  }
  const hasCTA = /(agenda|contacto|demo|invers|descarga|participa|comienza|empieza|hablemos|call to action|cta|sindicaci[oó]n)/i.test(content);
  if (!hasCTA) {
    scoreGoal -= 0.5;
    findings.goal_and_icp.push('Falta un Llamado a la Acción (CTA) directo o próximo paso accionable.');
  }
  if (specData.intent && specData.intent.target_icp) {
    const icpKeywords = String(specData.intent.target_icp).toLowerCase().split(/\s+/).filter((w: string) => w.length > 4);
    const matchedIcp = icpKeywords.some((k: string) => content.toLowerCase().includes(k));
    if (!matchedIcp && icpKeywords.length > 0) {
      scoreGoal -= 0.3;
      findings.goal_and_icp.push(`No se encontraron referencias explícitas al perfil ICP (${specData.intent.target_icp}).`);
    }
  }
  scoreGoal = Math.max(0, Math.min(2.5, scoreGoal));

  // --- Dimension 2: Veracidad Técnica & Fuentes (Max 2.5 pts) ---
  let scoreTech = 2.5;
  const solanaGrounding = /(solana|metaplex|delaware|spv|llc|smart contract|on-chain|tokeniz|inmueble|rwa|real estate|stripe identity)/i.test(content);
  if (!solanaGrounding) {
    scoreTech -= 1.0;
    findings.technical_veracity.push('Faltan anclas técnicas verificables (Solana, Metaplex Core, Delaware SPV, RWA).');
  }
  const speculativePromises = /(retorno garantizado 100%|cero riesgo absoluto|duplica tu dinero|sin riesgo legal)/i.test(content);
  if (speculativePromises) {
    scoreTech -= 1.5;
    findings.technical_veracity.push('Alerta regulatoria: contiene promesas especulativas o garantías de retorno irrealistas.');
  }
  const mainnetFabrication = /(live on solana mainnet-beta|desplegado en mainnet de solana|operando en mainnet|production on solana mainnet)/i.test(content);
  if (mainnetFabrication) {
    scoreTech -= 1.0;
    findings.technical_veracity.push('Alerta de veracidad técnica: El producto opera en devnet / staging con contratos Metaplex Core; no afirmar despliegue en mainnet-beta.');
  }
  scoreTech = Math.max(0, Math.min(2.5, scoreTech));

  // --- Dimension 3: Voz Fundadora vs Tono Robot (Max 2.0 pts) ---
  let scoreVoice = 2.0;
  const passiveCorporateFillers = /(se podr[ií]a argumentar que|es menester se[ñn]alar|podemos colegir|a modo de introducci[oó]n|el presente documento pretende)/gi;
  const fillerMatches = (content.match(passiveCorporateFillers) || []).length;
  if (fillerMatches > 0) {
    scoreVoice -= fillerMatches * 0.4;
    findings.founder_voice.push(`Se detectó prosa corporativa pasiva/impersonal (${fillerMatches} ocurrencias).`);
  }
  const hasConviction = /(construimos|eliminamos|resolvemos|brids|nuestro|optimizamos|directo|desarrollador|inversor|liquidez)/i.test(content);
  if (!hasConviction) {
    scoreVoice -= 0.4;
    findings.founder_voice.push('Falta asertividad y convicción de fundador en la resolución del problema.');
  }
  scoreVoice = Math.max(0, Math.min(2.0, scoreVoice));

  // --- Dimension 4: Originalidad Léxica & Cero Clichés ---
  const clicheScan = scanCliches(content);
  const scoreLexical = clicheScan.cleanScore;
  const detectedBanned = clicheScan.detected.map(d => ({
    phrase: d.phrase,
    count: d.count,
    penaltyApplied: d.penalty
  }));
  for (const d of clicheScan.detected) {
    findings.lexical_originality.push(`Cliché de IA detectado: "${d.phrase}" (${d.count}x).`);
  }

  const remediationDirectives: string[] = [];
  if (detectedBanned.length > 0) {
    remediationDirectives.push(`Eliminar inmediatamente las siguientes muletillas de IA: ${detectedBanned.map(d => `"${d.phrase}"`).join(', ')}.`);
  }
  remediationDirectives.push(...findings.goal_and_icp, ...findings.technical_veracity, ...findings.founder_voice);

  const rubricEval = evaluateDeliverable(
    {
      goalIcp: scoreGoal,
      techRigor: scoreTech,
      founderVoice: scoreVoice,
      originalityLexicon: scoreLexical
    },
    0,
    remediationDirectives
  );
  const totalScore = Math.round(rubricEval.score * 10) / 10;
  const passed = totalScore >= SDD_THRESHOLD;

  return {
    total_score: totalScore,
    scale_max: 9.0,
    passing_threshold: SDD_THRESHOLD,
    passed,
    scoring_dimensions: {
      "1_goal_and_icp": {
        name: "Cumplimiento del Objetivo & ICP",
        score: rubricEval.dimensions.goalIcp,
        max_score: 2.5,
        passed: rubricEval.dimensions.goalIcp >= 2.0,
        findings: findings.goal_and_icp
      },
      "2_technical_veracity": {
        name: "Veracidad Técnica & Fuentes",
        score: rubricEval.dimensions.techRigor,
        max_score: 2.5,
        passed: rubricEval.dimensions.techRigor >= 2.2,
        findings: findings.technical_veracity
      },
      "3_founder_voice": {
        name: "Voz Fundadora vs Tono Robot",
        score: rubricEval.dimensions.founderVoice,
        max_score: 2.0,
        passed: rubricEval.dimensions.founderVoice >= 1.7,
        findings: findings.founder_voice
      },
      "4_lexical_originality": {
        name: "Originalidad Léxica & Cero Clichés",
        score: rubricEval.dimensions.originalityLexicon,
        max_score: 2.0,
        passed: rubricEval.dimensions.originalityLexicon >= 1.8,
        banned_phrases_found: detectedBanned,
        findings: findings.lexical_originality
      }
    },
    banned_phrases_detected: detectedBanned,
    remediation_directives: remediationDirectives
  };
}
