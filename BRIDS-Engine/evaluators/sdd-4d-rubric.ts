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
 * @spec SPEC-001 (Ported & adapted from Academic-Engine architecture)
 */

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
  // Clamp dimensions to their maximum allowed bounds
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
