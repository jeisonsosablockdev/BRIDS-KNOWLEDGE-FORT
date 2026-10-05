import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TaskOrchestrator } from '../../core/orchestrator.ts';
import { VaultGateway } from '../../core/vault-gateway.ts';

const SCRIPT_DIR = import.meta.dirname ?? path.resolve();
const FIXTURES_DIR = path.join(SCRIPT_DIR, 'fixtures', 'orch-test');

describe('TaskOrchestrator End-to-End Coordination (@spec SPEC-ARCH-002)', () => {
  let orchestrator: TaskOrchestrator;
  let vault: VaultGateway;

  before(() => {
    if (fs.existsSync(FIXTURES_DIR)) {
      fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(path.join(FIXTURES_DIR, '00 Inbox', 'Specs'), { recursive: true });
    fs.mkdirSync(path.join(FIXTURES_DIR, '00 Inbox', 'Archive'), { recursive: true });
    fs.mkdirSync(path.join(FIXTURES_DIR, '01 Negocio', '01 Estrategia & Modelo'), { recursive: true });

    vault = new VaultGateway(FIXTURES_DIR);
    orchestrator = new TaskOrchestrator(vault);
  });

  after(() => {
    if (fs.existsSync(FIXTURES_DIR)) {
      fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
    }
  });

  it('@spec REQ-001-LOOP should execute full lifecycle with dual HITL guardrails', () => {
    const slug = 'test-e2e-rwa-deliverable';
    const title = 'Tesis de Inversión RWA sobre Solana';

    // 1. Init Spec
    const initialCtx = orchestrator.initSpec(
      slug,
      title,
      '01 Negocio/01 Estrategia & Modelo',
      ['business-consultant', 'compliance-officer'],
      'Sponsors Inmobiliarios & Inversores YC',
      'Demostrar separación legal Delaware SPV + Metaplex Core'
    );
    assert.strictEqual(initialCtx.state, 'spec_review', '1. Spec must be initialized in spec_review');
    assert.strictEqual(vault.specExists(slug), true, 'Spec file must exist on disk');

    // 2. HITL-1 Enforcement: Premature evaluation must fail
    const prematureDraft = 'Borrador prematuro sin aprobación de spec.';
    const prematureEval = orchestrator.evaluateDraft(slug, prematureDraft, {
      goalIcp: 2.5,
      techRigor: 2.5,
      founderVoice: 2.0,
      originalityLexicon: 2.0
    });
    assert.strictEqual(prematureEval.transition.success, false, '2. Must block evaluation before HITL-1');
    assert.match(prematureEval.transition.error || '', /spec_approved/i);

    // 3. HITL-1 Approval: Human approves specification
    const specApprovedResult = orchestrator.approveSpec(slug);
    assert.strictEqual(specApprovedResult.success, true, '3. Human spec approval must succeed');
    assert.strictEqual(specApprovedResult.context.state, 'spec_approved');

    // 4. Task Loop Cycle 1: Reviewer scores 7.0 (< 8.5) -> Rejected for rework
    const draftCycle1 = 'Borrador inicial sin anclas técnicas suficientes.';
    const cycle1Result = orchestrator.evaluateDraft(slug, draftCycle1, {
      goalIcp: 2.0,
      techRigor: 2.0,
      founderVoice: 1.5,
      originalityLexicon: 1.5
    });
    assert.strictEqual(cycle1Result.transition.success, true);
    assert.strictEqual(cycle1Result.report.passed, false, 'Score 7.0 must be rejected');
    assert.strictEqual(cycle1Result.transition.context.state, 'task_loop', 'Task remains in loop');
    assert.strictEqual(cycle1Result.transition.context.currentCycle, 1);

    // 5. Task Loop Cycle 2: Editor refines, Reviewer scores 8.8 (>= 8.5) -> Converges!
    const draftCycle2 =
      '# Tesis de Inversión RWA sobre Solana\n\n' +
      'Arquitectura con Delaware Series LLC, Metaplex Core Freeze/Recovery y Stripe Identity.';
    const cycle2Result = orchestrator.evaluateDraft(slug, draftCycle2, {
      goalIcp: 2.5,
      techRigor: 2.4,
      founderVoice: 1.9,
      originalityLexicon: 2.0
    });
    assert.strictEqual(cycle2Result.report.passed, true, 'Score 8.8 meets threshold >= 8.5');
    assert.strictEqual(cycle2Result.transition.context.state, 'deliverable_review', 'Ready for HITL-2 human review');

    // 6. HITL-2 Approval: Human approves deliverable -> Committed to BRIDS-Brain
    const deliverableApproval = orchestrator.approveDeliverable(slug);
    assert.strictEqual(deliverableApproval.success, true, '6. HITL-2 approval must succeed');
    assert.ok(deliverableApproval.deliverablePath, 'Deliverable path must be provided');
    assert.strictEqual(fs.existsSync(deliverableApproval.deliverablePath!), true, 'Committed file must exist in target folder');

    const finalSpec = vault.loadSpec(slug);
    assert.strictEqual(finalSpec.data.status, 'completed', 'Final spec status on disk must be completed');
  });

  it('@spec REQ-002-AUTOLOOP should auto-remediate and converge via runTaskLoop', () => {
    const slug = 'test-autoloop-rwa';
    orchestrator.initSpec(
      slug,
      'Infraestructura RWA Solana',
      '01 Negocio/01 Estrategia & Modelo',
      ['business-consultant'],
      'Sponsors Inmobiliarios',
      'Sindicacion inmobiliaria con Delaware SPV'
    );
    orchestrator.approveSpec(slug);

    const noisyDraft =
      'En conclusión, en el vertiginoso mundo de las finanzas inmobiliarias, construimos en BRIDS la infraestructura ' +
      'de sindicación inmobiliaria institucional sobre Solana utilizando contratos inteligentes con el estándar Metaplex Core ' +
      'y plugins nativos de Freeze y Recovery para cada Delaware Series LLC (SPV) segregada, integrando verificación biométrica ' +
      'con Stripe Identity para desarrolladores e inversores institucionales que buscan liquidez secundaria transparente y ' +
      'cumplimiento regulatorio automatizado sin fricción bancaria tradicional. Este modelo elimina intermediarios costosos, ' +
      'optimiza la distribución programática de flujos de renta en USDC directamente a las billeteras verificadas, protege la ' +
      'tabla de capitalización ante pérdida de llaves privadas mediante gobernanza multisig y permite a cualquier desarrollador ' +
      'inmobiliario estructurar su activo comercial con trazabilidad on-chain completa y costos predecibles. Agenda una demo ' +
      'técnica hoy mismo con nuestro equipo de estructuración.';

    const loopRes = orchestrator.runTaskLoop(slug, noisyDraft, 5);
    assert.strictEqual(loopRes.passed, true, 'Auto-remediated draft must pass >= 8.5 threshold');
    assert.strictEqual(loopRes.cyclesRun, 2, 'Cycle 1 fails due to clichés, Cycle 2 passes after autoRemediateDraft');
    assert.strictEqual(loopRes.finalStatus, 'deliverable_review');
  });

});
