import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENGINE_DIR = path.resolve(__dirname, '../..');
const ROOT_DIR = path.resolve(ENGINE_DIR, '..');
const SCRIPTS_DIR = path.join(ENGINE_DIR, 'scripts');
const TESTS_DIR = path.join(ENGINE_DIR, 'tests');
const BRAIN_DIR = path.join(ROOT_DIR, 'BRIDS-Brain');

describe('SPEC-SCRIPTS-005: TypeScript Domain Architecture for BRIDS-Engine/scripts', () => {
  it('@spec REQ-SCRIPTS-501: should organize scripts/ into 5 domain directories with only .ts files and zero .js/.sh/.ps1 wrappers', () => {
    const entries = fs.readdirSync(SCRIPTS_DIR, { withFileTypes: true }).filter((e) => !e.name.startsWith('.'));
    const dirNames = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
    const rootFiles = entries.filter((e) => e.isFile()).map((e) => e.name);

    assert.deepEqual(
      dirNames,
      ['audit', 'ingest', 'sdd', 'social', 'vault'],
      `Expected exactly 5 domain folders in scripts/, found directories: [${dirNames.join(', ')}]`
    );
    assert.deepEqual(
      rootFiles,
      [],
      `Expected zero loose files in scripts/ root, found: [${rootFiles.join(', ')}]`
    );

    const allScriptFiles = (fs.readdirSync(SCRIPTS_DIR, { recursive: true }) as string[])
      .filter((rel) => {
        const full = path.join(SCRIPTS_DIR, rel);
        return fs.existsSync(full) && fs.statSync(full).isFile() && !path.basename(rel).startsWith('.');
      })
      .map((rel) => rel.replace(/\\/g, '/'))
      .sort();

    const forbiddenWrappers = allScriptFiles.filter((f) => /\.(js|sh|ps1)$/i.test(f));
    assert.deepEqual(
      forbiddenWrappers,
      [],
      `Found forbidden .js/.sh/.ps1 files in scripts/: [${forbiddenWrappers.join(', ')}]`
    );

    const expectedCanonicalModules = [
      'audit/audit-runner.ts',
      'ingest/sync-narrative-intelligence.ts',
      'ingest/sync-technical-docs.ts',
      'ingest/sync-workspace-context.ts',
      'sdd/sdd-orchestrator.ts',
      'sdd/workflow-gate-hook.ts',
      'social/social-generator.ts',
      'vault/export-pdf.ts',
      'vault/refine-note.ts',
      'vault/vault-search.ts',
    ];
    assert.deepEqual(allScriptFiles, expectedCanonicalModules);
  });

  it('@spec REQ-SCRIPTS-502: should provide TypeScript vault domain tools (refine-note.ts, vault-search.ts, export-pdf.ts)', () => {
    const refinePath = path.join(SCRIPTS_DIR, 'vault', 'refine-note.ts');
    const searchPath = path.join(SCRIPTS_DIR, 'vault', 'vault-search.ts');
    const exportPath = path.join(SCRIPTS_DIR, 'vault', 'export-pdf.ts');

    assert.ok(fs.existsSync(refinePath), 'scripts/vault/refine-note.ts must exist');
    assert.ok(fs.existsSync(searchPath), 'scripts/vault/vault-search.ts must exist');
    assert.ok(fs.existsSync(exportPath), 'scripts/vault/export-pdf.ts must exist');

    const sampleNote = path.join(BRAIN_DIR, '02 Marketing', '01 Contexto de Marca', 'product-marketing-context.md');
    const inspectOut = execSync(`node "${refinePath}" inspect "${sampleNote}"`, { encoding: 'utf8' });
    assert.ok(inspectOut.includes('Título:') && inspectOut.includes('Versión:'), 'refine-note.ts inspect must parse YAML frontmatter');

    const searchOut = execSync(`node "${searchPath}" "Solana Metaplex" --limit 2`, { encoding: 'utf8' });
    assert.ok(searchOut.includes('Solana') || searchOut.includes('BRIDS'), 'vault-search.ts must return TF-IDF matches');
  });

  it('@spec REQ-SCRIPTS-503: should provide TypeScript ingest domain tools with deterministic narrative radar and context sync', async () => {
    const narrativePath = path.join(SCRIPTS_DIR, 'ingest', 'sync-narrative-intelligence.ts');
    const techPath = path.join(SCRIPTS_DIR, 'ingest', 'sync-technical-docs.ts');
    const contextPath = path.join(SCRIPTS_DIR, 'ingest', 'sync-workspace-context.ts');

    assert.ok(fs.existsSync(narrativePath), 'scripts/ingest/sync-narrative-intelligence.ts must exist');
    assert.ok(fs.existsSync(techPath), 'scripts/ingest/sync-technical-docs.ts must exist');
    assert.ok(fs.existsSync(contextPath), 'scripts/ingest/sync-workspace-context.ts must exist');

    const narrativeMod = await import(narrativePath);
    assert.equal(
      narrativeMod.sanitizePii('Contact john.doe@gmail.com or +1 (555) 234-5678 now'),
      'Contact [REDACTED_EMAIL] or [REDACTED_PHONE] now'
    );
    assert.equal(narrativeMod.calculateMatrixQuadrant('LOW', 'HIGH'), 'BLACK_SWAN');
    assert.equal(narrativeMod.calculateMatrixQuadrant('HIGH', 'HIGH'), 'IMMINENT_THESIS');
    assert.equal(narrativeMod.calculateMatrixQuadrant('LOW', 'LOW'), 'CYCLE_FUD');
    assert.equal(narrativeMod.calculateMatrixQuadrant('HIGH', 'LOW'), 'MICRO_EVENT');
    assert.ok(narrativeMod.buildRumorQuery('Solana RWA').includes('("hearing that" OR "rumor" OR "sources say")'));
    assert.equal(narrativeMod.tagFact('On-chain TVL'), '[FACT: VERIFIED] On-chain TVL');
    assert.equal(narrativeMod.tagRumor('Whisper signal'), '[RUMOR: HYPOTHESIS] Whisper signal');
  });

  it('@spec REQ-SCRIPTS-504: should unify SDD lifecycle and multi-agent task sessions in scripts/sdd/sdd-orchestrator.ts', async () => {
    const sddPath = path.join(SCRIPTS_DIR, 'sdd', 'sdd-orchestrator.ts');
    assert.ok(fs.existsSync(sddPath), 'scripts/sdd/sdd-orchestrator.ts must exist');

    const sddMod = await import(sddPath);
    assert.equal(typeof sddMod.initSpec, 'function');
    assert.equal(typeof sddMod.approveSpec, 'function');
    assert.equal(typeof sddMod.evaluateDraft, 'function');
    assert.equal(typeof sddMod.approveDeliverable, 'function');
    assert.equal(typeof sddMod.runTaskLoop, 'function');
    assert.equal(typeof sddMod.initSession, 'function');
    assert.equal(typeof sddMod.addSessionTask, 'function');
    assert.equal(typeof sddMod.updateSessionTask, 'function');
    assert.equal(typeof sddMod.closeSession, 'function');
  });

  it('@spec REQ-SCRIPTS-505: should unify all governance and compliance validators in scripts/audit/audit-runner.ts', async () => {
    const auditPath = path.join(SCRIPTS_DIR, 'audit', 'audit-runner.ts');
    assert.ok(fs.existsSync(auditPath), 'scripts/audit/audit-runner.ts must exist');

    const auditMod = await import(auditPath);
    const ctxRes = auditMod.auditContext({ silent: true });
    assert.equal(ctxRes.passed, true);
    assert.ok(ctxRes.score >= 80);

    const skillsRes = auditMod.auditSkills(undefined, { silent: true });
    assert.equal(skillsRes.issues, 0);
    assert.equal(skillsRes.passed, 58);

    const squadRes = auditMod.inspectSquad({ silent: true });
    assert.equal(squadRes.count, 7);

    const vaultRes = auditMod.auditVault({ silent: true });
    assert.equal(vaultRes.criticalErrors, 0);
  });

  it('@spec REQ-SCRIPTS-506: should unify social post, carousel, grid and asset generation in scripts/social/social-generator.ts', async () => {
    const socialPath = path.join(SCRIPTS_DIR, 'social', 'social-generator.ts');
    assert.ok(fs.existsSync(socialPath), 'scripts/social/social-generator.ts must exist');

    const socialMod = await import(socialPath);
    assert.equal(typeof socialMod.auditContentGrid, 'function');
    assert.equal(typeof socialMod.createSocialPost, 'function');
    assert.equal(typeof socialMod.createSocialCarousel, 'function');
    assert.equal(typeof socialMod.generatePublicationAssets, 'function');

    const gridAudit = socialMod.auditContentGrid({ silent: true });
    assert.equal(gridAudit.totalPlanned, 15);
  });

  it('@spec REQ-SCRIPTS-507: should migrate test suites to TypeScript (.ts) with zero .js/.sh/.ps1 wrappers in tests/', () => {
    const rootTestFiles = fs.readdirSync(TESTS_DIR, { withFileTypes: true })
      .filter((e) => e.isFile() && !e.name.startsWith('.'))
      .map((e) => e.name)
      .sort();

    assert.deepEqual(
      rootTestFiles,
      ['smoke-test.ts', 'test-agent-reach-integration.ts', 'test-idempotency.ts'],
      `Expected only .ts test suites in tests/, found: [${rootTestFiles.join(', ')}]`
    );
  });
});
