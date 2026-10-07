import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { scanCliches } from '../../evaluators/anti-cliche-filter.ts';
import { evaluateDeliverable, auditDeliverableText, SDD_THRESHOLD } from '../../evaluators/sdd-4d-rubric.ts';

describe('Evaluator Engine & Anti-Cliché Filters (@spec SPEC-ARCH-002)', () => {

  it('@spec REQ-001-F should detect banned LLM clichés and calculate penalty', () => {
    const roboticText =
      'En resumen, esta solución juega un papel crucial en el vertiginoso mundo de la tecnología. ' +
      'En conclusión, es importante destacar que lideramos un cambio de paradigma sin duda alguna.';

    const result = scanCliches(roboticText);

    assert.strictEqual(result.hasCliches, true, 'Must detect presence of clichés');
    assert.ok(result.detected.length >= 4, `Expected at least 4 clichés, found ${result.detected.length}`);
    assert.ok(result.totalPenalty >= 1.5, `Total penalty should be >= 1.5, got ${result.totalPenalty}`);
    assert.ok(result.cleanScore < 1.0, `Clean score must be heavily penalized, got ${result.cleanScore}`);
  });

  it('@spec REQ-001-G should award full score (2.0) to authentic, clean technical prose', () => {
    const cleanText =
      'BRIDS estructura cada inmueble mediante una SPV LLC en Delaware independiente de la C-Corp tecnológica. ' +
      'Las participaciones se emiten sobre Solana usando Metaplex Core con plugins de Freeze y Recovery.';

    const result = scanCliches(cleanText);

    assert.strictEqual(result.hasCliches, false, 'Clean text must have no clichés');
    assert.strictEqual(result.detected.length, 0, 'No phrases should be flagged');
    assert.strictEqual(result.totalPenalty, 0, 'Penalty must be 0');
    assert.strictEqual(result.cleanScore, 2.0, 'Full originality score (2.0) must be awarded');
  });

  it('@spec REQ-001-H should mark deliverable as passed when score >= 8.5/9.0', () => {
    const dimensions = {
      goalIcp: 2.4,            // / 2.5
      techRigor: 2.4,          // / 2.5
      founderVoice: 1.9,       // / 2.0
      originalityLexicon: 1.9  // / 2.0
    };
    const penalty = 0.1; // 2.4 + 2.4 + 1.9 + 1.9 - 0.1 = 8.5

    const report = evaluateDeliverable(dimensions, penalty, ['Excelente rigor técnico RWA']);

    assert.strictEqual(report.score, 8.5, 'Final score must accurately reflect sum minus penalty');
    assert.strictEqual(report.passed, true, 'Score >= 8.5 must pass the quality gate');
    assert.strictEqual(report.threshold, SDD_THRESHOLD);
  });

  it('@spec REQ-001-H should reject deliverable when score < 8.5/9.0', () => {
    const dimensions = {
      goalIcp: 2.1,
      techRigor: 2.0,
      founderVoice: 1.6,
      originalityLexicon: 1.5
    }; // Total: 7.2

    const report = evaluateDeliverable(dimensions, 0, ['Faltan anclas on-chain de Solana']);

    assert.strictEqual(report.score, 7.2);
    assert.strictEqual(report.passed, false, 'Score < 8.5 must be rejected');
  });

  it('@spec REQ-001-CLEF should evaluate with Clef System One and guarantee SHA-256 idempotence', () => {
    const draft =
      'Eliminamos la intermediación en sindicaciones inmobiliarias mediante contratos inteligentes sobre Solana y Metaplex Core ' +
      'con plugins de Freeze y Recovery. Cada activo opera bajo una SPV LLC en Delaware con verificación KYC en Stripe Identity ' +
      'para Real Estate Sponsors que requieren liquidez y costos de estructuración predecibles. Agenda una demo técnica hoy.';
    const spec = { intent: { target_icp: 'Real Estate Sponsors' } };

    const firstEval = auditDeliverableText(draft, spec);
    const secondEval = auditDeliverableText(draft, spec);

    assert.ok(firstEval.clef_decision, 'Report must include clef_decision metadata');
    assert.match(firstEval.clef_decision.cache_key, /^[a-f0-9]{64}$/, 'Cache key must be a 64-char SHA-256 hex digest');
    assert.strictEqual(firstEval.clef_decision.cache_key, secondEval.clef_decision.cache_key, 'SHA-256 key must be identical');
    assert.deepEqual(firstEval.clef_decision.probabilities, secondEval.clef_decision.probabilities, 'Clef probabilities must be 100% idempotent');
    assert.strictEqual(firstEval.total_score, secondEval.total_score, 'Total 4D score must be 100% idempotent');
  });

});
