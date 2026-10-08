import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { VaultGateway } from '../../core/vault-gateway.ts';
import type { TaskSpecData } from '../../core/vault-gateway.ts';

const SCRIPT_DIR = import.meta.dirname ?? path.resolve();
const FIXTURES_DIR = path.join(SCRIPT_DIR, 'fixtures', 'vault-test');

describe('VaultGateway BRIDS-Brain Abstraction (@spec SPEC-ARCH-002)', () => {
  let gateway: VaultGateway;

  before(() => {
    if (fs.existsSync(FIXTURES_DIR)) {
      fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(path.join(FIXTURES_DIR, '00 Inbox', 'Specs'), { recursive: true });
    fs.mkdirSync(path.join(FIXTURES_DIR, '00 Inbox', 'Archive'), { recursive: true });
    fs.mkdirSync(path.join(FIXTURES_DIR, '01 Negocio', '01 Estrategia & Modelo'), { recursive: true });

    gateway = new VaultGateway(FIXTURES_DIR);
  });

  after(() => {
    if (fs.existsSync(FIXTURES_DIR)) {
      fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
    }
  });

  it('@spec REQ-001-A should generate deterministic spec paths from slug', () => {
    const rawSlug = '  Modelo-Series-LLC #1  ';
    const paths = gateway.getSpecPaths(rawSlug);

    assert.strictEqual(paths.slug, 'modelo-series-llc-1', 'Slug must be lowercased and sanitized');
    assert.strictEqual(paths.specId, 'SPEC-MODELO-SERIES-LLC-1');
    assert.ok(paths.specJsonPath.endsWith('modelo-series-llc-1.spec.json'));
    assert.ok(paths.specMdPath.endsWith('modelo-series-llc-1.spec.md'));
  });

  it('@spec REQ-001-B should save and reload spec data and markdown cleanly', () => {
    const testSlug = 'test-spv-struct';
    const specData: TaskSpecData = {
      spec_version: '2.0.0',
      id: 'SPEC-TEST-SPV-STRUCT',
      slug: testSlug,
      title: 'Arquitectura Legal SPV LLC en Delaware',
      target_folder: '01 Negocio/01 Estrategia & Modelo',
      subagents: ['compliance-officer', 'business-consultant'],
      icp: 'Sponsors B2B & Inversores YC',
      goal: 'Separar SaaS C-Corp de activos inmobiliarios',
      status: 'spec_review',
      iteration: 1
    };
    const markdownContent = '# Spec: Arquitectura Legal SPV LLC\n\nContenido de especificación.';

    gateway.saveSpec(testSlug, specData, markdownContent);
    const exists = gateway.specExists(testSlug);
    const loaded = gateway.loadSpec(testSlug);

    assert.strictEqual(exists, true, 'Spec must exist after saving');
    assert.strictEqual(loaded.data.title, specData.title, 'Loaded title must match saved title');
    assert.strictEqual(loaded.data.status, 'spec_review', 'Status must match saved status');

    const mdContentOnDisk = fs.readFileSync(loaded.paths.specMdPath, 'utf8');
    assert.strictEqual(mdContentOnDisk, markdownContent, 'Markdown on disk must match saved content');
  });

  it('@spec REQ-001-C should create safety backup before modifying existing document (Non-Destructive)', () => {
    const docPath = path.join(FIXTURES_DIR, '01 Negocio', '01 Estrategia & Modelo', 'existing-note.md');
    fs.writeFileSync(docPath, '# Versión Original v1.0\nContenido valioso a preservar.', 'utf8');

    const backupPath = gateway.createSafetyBackup(docPath);

    assert.ok(backupPath, 'Safety backup path must be returned');
    assert.strictEqual(fs.existsSync(backupPath!), true, 'Backup file must exist on disk');
    assert.ok(backupPath!.includes('Archive'), 'Backup must live in Archive directory');

    const backupContent = fs.readFileSync(backupPath!, 'utf8');
    assert.strictEqual(backupContent, '# Versión Original v1.0\nContenido valioso a preservar.');
  });

  it('@spec REQ-001-D should commit deliverable to target folder with safety verification', () => {
    const slug = 'test-spv-struct';
    const content = '# Entregable: Arquitectura Legal SPV LLC\n\nRespaldado en Solana y Metaplex Core.';

    const { targetPath } = gateway.commitDeliverable(slug, content, '01 Negocio/01 Estrategia & Modelo');

    assert.strictEqual(fs.existsSync(targetPath), true, 'Committed deliverable must exist in target folder');
    assert.ok(targetPath.endsWith(path.join('01 Negocio', '01 Estrategia & Modelo', `${slug}.md`)));
    const savedText = fs.readFileSync(targetPath, 'utf8');
    assert.strictEqual(savedText, content);
  });

  it('@spec REQ-001-E should list all active specs in 00 Inbox/Specs', () => {
    const specs = gateway.listSpecs();

    assert.ok(specs.length >= 1, 'Should find at least 1 spec');
    const found = specs.find(s => s.slug === 'test-spv-struct');
    assert.ok(found, "Must find 'test-spv-struct' in the list");
    assert.strictEqual(found?.status, 'spec_review');
  });

});
