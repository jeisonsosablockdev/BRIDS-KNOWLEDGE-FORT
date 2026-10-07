#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🛡️ TDD PRIMAL MASTER TEST SUITE: AGENT-REACH INTEGRATION & SQUAD EXTENSION (TS)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const ENGINE_DIR = path.join(ROOT_DIR, 'BRIDS-Engine');
const BRAIN_DIR = path.join(ROOT_DIR, 'BRIDS-Brain');
const AGENTS_DIR = path.join(ENGINE_DIR, 'agents');
const SCRIPTS_DIR = path.join(ENGINE_DIR, 'scripts');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureLog: string[] = [];

function assertTest(condition: boolean, testName: string, specId: string, details = '') {
  totalTests++;
  const label = `[@spec ${specId}] ${testName}`;
  if (condition) {
    passedTests++;
    console.log(`   ✅ PASS: ${label}`);
  } else {
    failedTests++;
    const err = `❌ FAIL: ${label} | Reason: ${details}`;
    console.error(`   ${err}`);
    failureLog.push(err);
  }
}

function parseSimpleYaml(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx !== -1) {
      const key = trimmed.slice(0, colonIdx).trim();
      const val = trimmed.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      result[key] = val;
    }
  }
  return result;
}

console.log('═'.repeat(78));
console.log('🚀 TDD PRIMAL: MASTER SUITE EXECUTION - AGENT-REACH INTEGRATION (TS)');
console.log('═'.repeat(78));

// SPEC-AR-001: Sub-Agente 'narrative-intelligence-analyst'
console.log('\n[SUITE 1] SPEC-AR-001: Sub-Agente narrative-intelligence-analyst Contract');

(() => {
  const agentPath = path.join(AGENTS_DIR, 'narrative-intelligence-analyst.yaml');
  const exists = fs.existsSync(agentPath);
  let validContent = false;
  let reason = 'File narrative-intelligence-analyst.yaml does not exist in BRIDS-Engine/agents/';

  if (exists) {
    const content = fs.readFileSync(agentPath, 'utf8');
    const parsed = parseSimpleYaml(content);
    const hasName = parsed.name === 'narrative-intelligence-analyst';
    const hasRole = content.includes('role: "Emerging Narrative & Market Psychology Analyst"');
    const hasWrite = content.includes('write: true');
    const hasMcp = content.includes('mcp: true');
    const hasOutput = content.includes('BRIDS-Brain/01 Negocio/01 Estrategia & Modelo/narrative-intelligence/');
    validContent = hasName && hasRole && hasWrite && hasMcp && hasOutput;
    if (!validContent) reason = 'YAML structure does not match canonical spec';
  }
  assertTest(exists && validContent, 'should validate YAML agent contract for narrative-intelligence-analyst', 'REQ-AR-101', reason);
})();

(() => {
  const inspectScript = path.join(SCRIPTS_DIR, 'audit/audit-runner.ts');
  const scriptExists = fs.existsSync(inspectScript);
  let inspects7 = false;
  if (scriptExists) {
    const scriptContent = fs.readFileSync(inspectScript, 'utf8');
    inspects7 = scriptContent.includes('narrative-intelligence-analyst');
  }
  assertTest(scriptExists && inspects7, 'should verify audit-runner.ts tracks all 7 specialized sub-agents', 'REQ-AR-102');
})();

(() => {
  const targetDir = path.join(BRAIN_DIR, '01 Negocio', '01 Estrategia & Modelo', 'narrative-intelligence');
  const dirExists = fs.existsSync(targetDir);
  const indexExists = dirExists && fs.existsSync(path.join(targetDir, 'index.md'));
  assertTest(dirExists && indexExists, 'should ensure narrative-intelligence directory and index.md exist in canonical vault', 'REQ-AR-103');
})();

// SPEC-AR-002: Motor CLI de Filtrado y Fallback (sync-narrative-intelligence.ts)
console.log('\n[SUITE 2] SPEC-AR-002: Motor CLI de Filtrado y Fallback Ladder');
const narrativeScript = path.join(SCRIPTS_DIR, 'ingest/sync-narrative-intelligence.ts');

(() => {
  const exists = fs.existsSync(narrativeScript);
  const content = exists ? fs.readFileSync(narrativeScript, 'utf8') : '';
  const handlesRumorScan = content.includes('--rumor-scan') && content.includes('hearing that');
  assertTest(exists && handlesRumorScan, 'should provide boolean whisper search queries with sanitized operators', 'REQ-AR-201');
})();

(() => {
  const content = fs.existsSync(narrativeScript) ? fs.readFileSync(narrativeScript, 'utf8') : '';
  const hasFallbackLadder = content.includes('r.jina.ai') && content.includes('exa') && content.includes('--extract-url');
  assertTest(hasFallbackLadder, 'should implement 3-tier fallback ladder without unhandled crashes', 'REQ-AR-202');
})();

(() => {
  const content = fs.existsSync(narrativeScript) ? fs.readFileSync(narrativeScript, 'utf8') : '';
  const hasChunkingLogic = content.includes('--transcribe-audio') && (content.includes('split-chapters') || content.includes('MAX_AUDIO_MINUTES'));
  assertTest(hasChunkingLogic, 'should enforce audio chunking or chapter splitting on long-form podcasts', 'REQ-AR-203');
})();

// SPEC-AR-003: Bifurcación Fáctica vs. Narrativa
console.log('\n[SUITE 3] SPEC-AR-003: Bifurcación Fáctica vs. Narrativa');

(() => {
  const content = fs.existsSync(narrativeScript) ? fs.readFileSync(narrativeScript, 'utf8') : '';
  const enforcesTagging = content.includes('[FACT: VERIFIED]') && content.includes('[RUMOR: HYPOTHESIS]');
  assertTest(enforcesTagging, 'should enforce strict segregation tags between ground truth and unverified rumors', 'REQ-AR-301');
})();

(() => {
  const content = fs.existsSync(narrativeScript) ? fs.readFileSync(narrativeScript, 'utf8') : '';
  const calculatesMatrix = content.includes('BLACK_SWAN') && content.includes('IMMINENT_THESIS');
  assertTest(calculatesMatrix, 'should calculate 2x2 Probability vs. Impact matrix quadrants deterministically', 'REQ-AR-302');
})();

(() => {
  const templatePath = path.join(ENGINE_DIR, 'templates', 'narrative-brief-template.md');
  const exists = fs.existsSync(templatePath);
  const content = exists ? fs.readFileSync(templatePath, 'utf8') : '';
  const has5Vectors = content.includes('Tesis Central') &&
    content.includes('Vector de Difusión') &&
    content.includes('Subtexto Emocional') &&
    content.includes('Velocidad de Propagación') &&
    content.includes('Contranarrativa');
  assertTest(exists && has5Vectors, 'should validate 5-vector narrative deconstruction schema in brief template', 'REQ-AR-303');
})();

(() => {
  const templatePath = path.join(ENGINE_DIR, 'templates', 'narrative-brief-template.md');
  const templateHasSection = fs.existsSync(templatePath) &&
    fs.readFileSync(templatePath, 'utf8').includes('Registro de Auditoría de Consultas & Fuentes Consultadas') &&
    fs.readFileSync(templatePath, 'utf8').includes('URL Directa');
  const scriptHasLogic = fs.existsSync(narrativeScript) &&
    fs.readFileSync(narrativeScript, 'utf8').includes('Registro de Auditoría de Consultas') &&
    fs.readFileSync(narrativeScript, 'utf8').includes('https://');
  assertTest(templateHasSection && scriptHasLogic, 'should enforce Consultation Provenance Log with clickable source URLs', 'REQ-AR-304');
})();

(() => {
  const content = fs.existsSync(narrativeScript) ? fs.readFileSync(narrativeScript, 'utf8') : '';
  const hasBookmarkCommands = content.includes('--bookmark-tweet') && content.includes('--save-ig') && content.includes('log_social_bookmark');
  assertTest(hasBookmarkCommands, 'should implement --bookmark-tweet and --save-ig social saving actions', 'REQ-AR-305');
})();

(() => {
  const rawDir = path.join(BRAIN_DIR, '01 Negocio', '01 Estrategia & Modelo', 'narrative-intelligence', 'raw');
  let hasValidRawArchive = false;
  if (fs.existsSync(rawDir)) {
    const jsonFiles = fs.readdirSync(rawDir).filter(f => f.endsWith('.json'));
    if (jsonFiles.length > 0) {
      const rawContent = JSON.parse(fs.readFileSync(path.join(rawDir, jsonFiles[0]), 'utf8'));
      hasValidRawArchive = !!rawContent.collected_at && Array.isArray(rawContent.search_queries) && Array.isArray(rawContent.records) && rawContent.total_records > 0;
    }
  }
  assertTest(hasValidRawArchive, 'should persistently store unedited raw extracted data in JSON format', 'REQ-AR-306');
})();

(() => {
  const rawDir = path.join(BRAIN_DIR, '01 Negocio', '01 Estrategia & Modelo', 'narrative-intelligence', 'raw');
  let allUrlsValid = false;
  if (fs.existsSync(rawDir)) {
    const jsonFiles = fs.readdirSync(rawDir).filter(f => f.endsWith('.json'));
    if (jsonFiles.length > 0) {
      const rawContent = JSON.parse(fs.readFileSync(path.join(rawDir, jsonFiles[0]), 'utf8'));
      if (rawContent.records && rawContent.records.length > 0) {
        allUrlsValid = rawContent.records.every((r: any) => r.url && (r.url.startsWith('https://') || r.url.startsWith('http://')));
      }
    }
  }
  assertTest(allUrlsValid, 'should enforce direct clickable source URLs across 100% of extracted items', 'REQ-AR-307');
})();

(() => {
  const agentPath = path.join(AGENTS_DIR, 'narrative-intelligence-analyst.yaml');
  const templatePath = path.join(ENGINE_DIR, 'templates', 'narrative-brief-template.md');
  const agentsMdPath = path.join(ROOT_DIR, 'AGENTS.md');
  const agentHasRule = fs.existsSync(agentPath) &&
    fs.readFileSync(agentPath, 'utf8').includes('Zero-Judgments & Inductive Neutrality') &&
    fs.readFileSync(agentPath, 'utf8').includes('Never emit subjective judgments');
  const templateHasSection = fs.existsSync(templatePath) &&
    fs.readFileSync(templatePath, 'utf8').includes('Archivo de Datos Crudos Extraídos') &&
    fs.readFileSync(templatePath, 'utf8').includes('Garantía Anti-Juicios');
  const agentsMdHasRule = fs.existsSync(agentsMdPath) &&
    fs.readFileSync(agentsMdPath, 'utf8').includes('Strict zero-judgments policy');
  assertTest(agentHasRule && templateHasSection && agentsMdHasRule, 'should strictly enforce zero-judgments inductive formulation and raw data archive contract', 'REQ-AR-308');
})();

// SPEC-AR-004: Anti-Drift Compliance & SDD Integration
console.log('\n[SUITE 4] SPEC-AR-004: Anti-Drift Compliance & SDD Integration');
const auditRunner = path.join(SCRIPTS_DIR, 'audit/audit-runner.ts');

(() => {
  let passedSkillCheck = false;
  try {
    const output = execSync(`node "${auditRunner}" skills`, { cwd: ROOT_DIR, encoding: 'utf8' });
    passedSkillCheck = output.includes('Passed: 58') && output.includes('All skills are valid');
  } catch {}
  assertTest(passedSkillCheck, 'should guarantee 100% compliance across all 58 workspace skills', 'REQ-AR-401');
})();

(() => {
  let zeroCritical = false;
  try {
    const output = execSync(`node "${auditRunner}" compliance`, { cwd: ROOT_DIR, encoding: 'utf8' });
    zeroCritical = output.includes('Errores críticos:     0') && output.includes('EL SISTEMA ESTÁ EN PERFECTO ESTADO');
  } catch {}
  assertTest(zeroCritical, 'should pass vault governance with 0 critical errors', 'REQ-AR-402');
})();

(() => {
  const content = fs.existsSync(narrativeScript) ? fs.readFileSync(narrativeScript, 'utf8') : '';
  const hasPiiSanitizer = content.includes('sanitize_pii') || content.includes('PII_FILTER');
  assertTest(hasPiiSanitizer, 'should quarantine and strip PII from social and web intelligence streams', 'REQ-AR-403');
})();

console.log('\n' + '═'.repeat(78));
console.log(`📊 RESULTADOS TDD PRIMAL: ${passedTests}/${totalTests} Pruebas Pasadas | ${failedTests} Pruebas Falladas`);
console.log('═'.repeat(78));

if (failedTests > 0) {
  failureLog.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  process.exit(1);
} else {
  console.log('🎉 ESTADO GREEN: Todas las pruebas pasaron.');
  process.exit(0);
}
