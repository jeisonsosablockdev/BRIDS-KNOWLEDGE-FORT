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

  it('@spec REQ-003-3ROLE should enforce ValidationContract, Serial Worker StructuredHandoffs, and AdversarialValidator QA', () => {
    const slug = 'test-three-role-architecture';

    // 1. Orchestrator initializes spec via CreateSpecRequest DTO (no positional parameter pollution)
    const ctx = orchestrator.initSpec({
      slug,
      title: 'Arquitectura 3 Roles RWA en Solana',
      targetFolder: '01 Negocio/01 Estrategia & Modelo',
      subagents: ['market-research-analyst', 'business-consultant', 'compliance-officer'],
      icp: 'Real Estate Sponsors & YC Partners',
      goal: 'Validar contratos en serie con handoffs estructurados',
    });
    assert.strictEqual(ctx.state, 'spec_review');

    const loadedInitial = vault.loadSpec(slug).data;
    assert.ok(loadedInitial.validation_contract, 'ValidationContract must be established before writing');
    assert.ok(loadedInitial.execution_topology, 'ExecutionTopologyPlan must be generated');
    assert.strictEqual(
      loadedInitial.execution_topology?.parallelReadGatherers.length,
      1,
      'market-research-analyst routed as parallel_read (flash)'
    );
    assert.strictEqual(
      loadedInitial.execution_topology?.serialWriteWorkers.length,
      2,
      'business-consultant and compliance-officer routed as serial_write (pro)'
    );

    // 2. Worker handoff before HITL-1 must be blocked
    assert.throws(
      () =>
        orchestrator.recordWorkerHandoff(slug, {
          worker_id: 'business-consultant',
          completed_items: ['Modelo SaaS fee'],
        }),
      /HITL-1 Violation/i,
      'Must block Worker handoffs before HITL-1 approval'
    );

    // 3. Approve Spec (HITL-1)
    orchestrator.approveSpec(slug);

    // 4. Serial Worker #1 records handoff leaving a pending item for Serial Worker #2
    const handoff1 = orchestrator.recordWorkerHandoff(slug, {
      worker_id: 'business-consultant',
      completed_items: ['Estructura de fees SaaS ($2,500) y procesamiento (1%)'],
      pending_items: ['Definir cláusula Delaware Series LLC SPV y Metaplex Core Recovery'],
      decisions_made: ['Ticket mínimo fijado en $100 USD sobre Solana'],
    });
    assert.strictEqual(handoff1.step_index, 1);

    const pristineText =
      'Construimos en BRIDS la infraestructura de sindicación inmobiliaria institucional sobre Solana utilizando contratos ' +
      'inteligentes con el estándar Metaplex Core y plugins nativos de Freeze y Recovery para cada Delaware Series LLC (SPV) ' +
      'segregada, integrando verificación biométrica con Stripe Identity para Real Estate Sponsors e inversores institucionales ' +
      'que buscan liquidez secundaria transparente y cumplimiento regulatorio automatizado sin fricción bancaria tradicional. ' +
      'Este modelo elimina intermediarios costosos, optimiza la distribución programática de flujos de renta en USDC directamente ' +
      'a las billeteras verificadas, protege la tabla de capitalización ante pérdida de llaves privadas mediante gobernanza multisig ' +
      'y permite a cualquier desarrollador inmobiliario estructurar su activo comercial con trazabilidad on-chain completa. ' +
      'Agenda una demo técnica hoy mismo con nuestro equipo de estructuración.';

    // 5. Adversarial Validator rejects if the latest Worker handoff still has unresolved pending_items
    const prematureValidation = orchestrator.auditAndEvaluateDraft(slug, pristineText, 1);
    assert.strictEqual(
      prematureValidation.passed,
      false,
      'Adversarial Validator must reject deliverable when latest Worker handoff has unresolved pending_items'
    );
    assert.strictEqual(
      prematureValidation.report.adversarial_validation?.unresolved_handoff_items.length,
      1
    );

    // 6. Serial Worker #2 (compliance-officer) completes pending items in fresh context and submits clean handoff
    const handoff2 = orchestrator.recordWorkerHandoff(slug, {
      worker_id: 'compliance-officer',
      completed_items: ['Cláusula Delaware Series LLC SPV y Metaplex Core Recovery verificadas'],
      pending_items: [],
      decisions_made: ['Aislamiento legal C-Corp vs SPV confirmado'],
    });
    assert.strictEqual(handoff2.step_index, 2);

    // 7. Adversarial Validator now approves both Technical QA and Functional ICP QA
    const finalValidation = orchestrator.auditAndEvaluateDraft(slug, pristineText, 2);
    assert.strictEqual(finalValidation.passed, true, 'Deliverable must pass once all handoff items are resolved');
    assert.strictEqual(finalValidation.report.adversarial_validation?.contract_verified, true);
  });

  it('@spec REQ-004-HITL0-ADVERSARIAL-SPEC should discover skills (HITL-0), audit Spec adversarially (>= 8.5/9.0), and block HITL-1 on defective specs', () => {
    // 1. HITL-0 Skill Discovery
    const discovery = orchestrator.discoverSkills(
      'Crear pitch deck para inversores YC sobre sindicación RWA en Solana',
      '01 Negocio/04 Finanzas & YC Investors'
    );
    assert.ok(discovery.skills.length >= 2, 'Should discover at least 2 relevant skills');
    assert.ok(
      discovery.skills.some((s) => s.skillId.includes('pitch') || s.skillId.includes('yc') || s.skillId.includes('investor')),
      'Should discover pitch/YC/investor skills'
    );
    assert.ok(discovery.recommendedSubagents.length >= 1, 'Should recommend at least 1 subagent');

    // 2. Initialize Spec with HITL-0 approved skills
    const slug = 'test-adversarial-spec-critic';
    const approvedSkills = discovery.skills.slice(0, 2).map((s) => s.skillId);
    orchestrator.initSpec({
      slug,
      title: 'Pitch Deck Semilla YC W26 Solana RWA',
      targetFolder: '01 Negocio/04 Finanzas & YC Investors',
      subagents: ['pitch-deck-architect', 'business-consultant'],
      icp: 'Socios de Y Combinator & Fondos Pre-Seed',
      goal: 'Estructurar deck de 10 slides con tesis Delaware SPV + Metaplex Core',
      approvedSkills,
    });
    const specData = vault.loadSpec(slug).data;
    assert.strictEqual(specData.spec_evaluation?.passed, true, 'Default rendered Spec with approved skills must pass >= 8.5');
    assert.ok((specData.spec_evaluation?.score ?? 0) >= 8.5, 'Spec score must be >= 8.5/9.0');

    // 3. Corrupt Spec Markdown (missing skills & anchors) -> Adversarial Spec Critic rejects and blocks HITL-1
    const defectiveEval = orchestrator.evaluateAndRefineSpec(
      slug,
      '# Spec Incompleto\nSin skills ni anclas técnicas ni subagentes.'
    );
    assert.strictEqual(defectiveEval.passed, false, 'Defective Spec must be rejected by Adversarial Spec Critic');
    assert.ok(defectiveEval.defects.length > 0, 'Must report specific remediation defects');

    const blockedApproval = orchestrator.approveSpec(slug);
    assert.strictEqual(blockedApproval.success, false, 'Must block HITL-1 approveSpec when Spec audit failed');
    assert.match(blockedApproval.error || '', /Adversarial Spec Critic bloqueó HITL-1/i);

    // 4. Refine Spec back to valid state -> Adversarial Spec Critic passes -> HITL-1 approval succeeds
    orchestrator.refineSpec(slug, 'Incluir métricas auditables de CAC/LTV y flujo USDC');
    const validApproval = orchestrator.approveSpec(slug);
    assert.strictEqual(validApproval.success, true, 'approveSpec must succeed once Spec passes >= 8.5/9.0');
  });

});


