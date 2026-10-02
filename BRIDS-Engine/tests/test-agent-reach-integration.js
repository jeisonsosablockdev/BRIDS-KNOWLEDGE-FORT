#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🛡️ TDD PRIMAL MASTER TEST SUITE: AGENT-REACH INTEGRATION & SQUAD EXTENSION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SPEC Reference: agent-reach-brids-integration-protocol.md
 * Traceability:
 *   - SPEC-AR-001 (REQ-AR-101, REQ-AR-102, REQ-AR-103)
 *   - SPEC-AR-002 (REQ-AR-201, REQ-AR-202, REQ-AR-203)
 *   - SPEC-AR-003 (REQ-AR-301, REQ-AR-302, REQ-AR-303)
 *   - SPEC-AR-004 (REQ-AR-401, REQ-AR-402, REQ-AR-403)
 * 
 * F.I.R.S.T. Compliant | Zero SUT Mocking | Pure Node.js Standard Library
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '../..');
const ENGINE_DIR = path.join(ROOT_DIR, 'BRIDS-Engine');
const BRAIN_DIR = path.join(ROOT_DIR, 'BRIDS-Brain');
const AGENTS_DIR = path.join(ENGINE_DIR, 'agents');
const SCRIPTS_DIR = path.join(ENGINE_DIR, 'scripts');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureLog = [];

function assertTest(condition, testName, specId, details = '') {
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

function parseSimpleYaml(content) {
  const result = {};
  const lines = content.split('\n');
  for (const line of lines) {
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
console.log('🚀 TDD PRIMAL: MASTER SUITE EXECUTION - AGENT-REACH INTEGRATION');
console.log('═'.repeat(78));

// ─────────────────────────────────────────────────────────────────────────────
// SPEC-AR-001: Sub-Agente 'narrative-intelligence-analyst' (El Vigía)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[SUITE 1] SPEC-AR-001: Sub-Agente narrative-intelligence-analyst Contract');

// Test 1.1: REQ-AR-101 - YAML Contract File Existence and Structure
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
    if (!validContent) {
      reason = 'YAML structure does not match canonical spec (missing name, role, write, mcp, or output path)';
    }
  }

  assertTest(
    exists && validContent,
    'should validate YAML agent contract for narrative-intelligence-analyst',
    'REQ-AR-101',
    reason
  );
})();

// Test 1.2: REQ-AR-102 - Squad Registry inspect-squad.sh Verification
(() => {
  const inspectScript = path.join(SCRIPTS_DIR, 'inspect-squad.sh');
  const scriptExists = fs.existsSync(inspectScript);
  let inspects7 = false;
  let reason = 'inspect-squad.sh does not recognize narrative-intelligence-analyst as the 7th squad agent';

  if (scriptExists) {
    const scriptContent = fs.readFileSync(inspectScript, 'utf8');
    inspects7 = scriptContent.includes('narrative-intelligence-analyst');
  }

  assertTest(
    scriptExists && inspects7,
    'should verify inspect-squad.sh tracks all 7 specialized sub-agents',
    'REQ-AR-102',
    reason
  );
})();

// Test 1.3: REQ-AR-103 - Canonical Vault Taxonomy Directory and Index
(() => {
  const targetDir = path.join(BRAIN_DIR, '01 Negocio', '01 Estrategia & Modelo', 'narrative-intelligence');
  const dirExists = fs.existsSync(targetDir);
  const indexExists = dirExists && fs.existsSync(path.join(targetDir, 'index.md'));
  let reason = 'Directory 01 Negocio/01 Estrategia & Modelo/narrative-intelligence/ or index.md missing in vault';

  assertTest(
    dirExists && indexExists,
    'should ensure narrative-intelligence directory and index.md exist in canonical vault',
    'REQ-AR-103',
    reason
  );
})();

// ─────────────────────────────────────────────────────────────────────────────
// SPEC-AR-002: Motor CLI de Filtrado y Fallback (narrative-radar.sh)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[SUITE 2] SPEC-AR-002: Motor CLI de Filtrado y Fallback Ladder');

// Test 2.1: REQ-AR-201 - Boolean Whisper Query Formulation & Script Presence
(() => {
  const radarScript = path.join(SCRIPTS_DIR, 'narrative-radar.sh');
  const exists = fs.existsSync(radarScript);
  let handlesRumorScan = false;
  let reason = 'Script narrative-radar.sh does not exist in BRIDS-Engine/scripts/';

  if (exists) {
    const content = fs.readFileSync(radarScript, 'utf8');
    handlesRumorScan = content.includes('--rumor-scan') && content.includes('hearing that');
    if (!handlesRumorScan) {
      reason = 'narrative-radar.sh does not implement --rumor-scan boolean query sanitization';
    }
  }

  assertTest(
    exists && handlesRumorScan,
    'should provide boolean whisper search queries with sanitized operators',
    'REQ-AR-201',
    reason
  );
})();

// Test 2.2: REQ-AR-202 - 3-Tier Fallback Ladder (Jina -> Exa -> DevTools)
(() => {
  const radarScript = path.join(SCRIPTS_DIR, 'narrative-radar.sh');
  let hasFallbackLadder = false;
  let reason = 'narrative-radar.sh missing 3-tier fallback ladder implementation (Jina -> Exa -> Chrome DevTools)';

  if (fs.existsSync(radarScript)) {
    const content = fs.readFileSync(radarScript, 'utf8');
    hasFallbackLadder = content.includes('r.jina.ai') && content.includes('exa') && content.includes('--extract-url');
  }

  assertTest(
    hasFallbackLadder,
    'should implement 3-tier fallback ladder without unhandled crashes',
    'REQ-AR-202',
    reason
  );
})();

// Test 2.3: REQ-AR-203 - Audio Chunking & Long-Form Map-Reduce Protection
(() => {
  const radarScript = path.join(SCRIPTS_DIR, 'narrative-radar.sh');
  let hasChunkingLogic = false;
  let reason = 'narrative-radar.sh missing audio chunking / chapter map-reduce for files > 25min';

  if (fs.existsSync(radarScript)) {
    const content = fs.readFileSync(radarScript, 'utf8');
    hasChunkingLogic = content.includes('--transcribe-audio') && (content.includes('split-chapters') || content.includes('MAX_AUDIO_MINUTES'));
  }

  assertTest(
    hasChunkingLogic,
    'should enforce audio chunking or chapter splitting on long-form podcasts',
    'REQ-AR-203',
    reason
  );
})();

// ─────────────────────────────────────────────────────────────────────────────
// SPEC-AR-003: Bifurcación Fáctica vs. Narrativa (CL-06 Compliance)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[SUITE 3] SPEC-AR-003: Bifurcación Fáctica vs. Narrativa');

// Test 3.1: REQ-AR-301 - Tagging [FACT: VERIFIED] vs [RUMOR: HYPOTHESIS]
(() => {
  const parserScript = path.join(SCRIPTS_DIR, 'narrative-radar.sh');
  let enforcesTagging = false;
  let reason = 'Engine does not enforce [FACT: VERIFIED] vs [RUMOR: HYPOTHESIS] segregation tags';

  if (fs.existsSync(parserScript)) {
    const content = fs.readFileSync(parserScript, 'utf8');
    enforcesTagging = content.includes('[FACT: VERIFIED]') && content.includes('[RUMOR: HYPOTHESIS]');
  }

  assertTest(
    enforcesTagging,
    'should enforce strict segregation tags between ground truth and unverified rumors',
    'REQ-AR-301',
    reason
  );
})();

// Test 3.2: REQ-AR-302 - 2x2 Probability vs. Impact Quadrant Calculation
(() => {
  const parserScript = path.join(SCRIPTS_DIR, 'narrative-radar.sh');
  let calculatesMatrix = false;
  let reason = 'Matrix calculation logic for 4 quadrants (Black Swan, Imminent Thesis, Cycle FUD, Micro Event) not found';

  if (fs.existsSync(parserScript)) {
    const content = fs.readFileSync(parserScript, 'utf8');
    calculatesMatrix = content.includes('BLACK_SWAN') && content.includes('IMMINENT_THESIS');
  }

  assertTest(
    calculatesMatrix,
    'should calculate 2x2 Probability vs. Impact matrix quadrants deterministically',
    'REQ-AR-302',
    reason
  );
})();

// Test 3.3: REQ-AR-303 - 5-Vector Narrative Deconstruction Contract
(() => {
  const templatePath = path.join(ENGINE_DIR, 'templates', 'narrative-brief-template.md');
  const exists = fs.existsSync(templatePath);
  let has5Vectors = false;
  let reason = 'Template narrative-brief-template.md does not exist or lacks the 5 mandatory narrative vectors';

  if (exists) {
    const content = fs.readFileSync(templatePath, 'utf8');
    has5Vectors = content.includes('Tesis Central') &&
                  content.includes('Vector de Difusión') &&
                  content.includes('Subtexto Emocional') &&
                  content.includes('Velocidad de Propagación') &&
                  content.includes('Contranarrativa');
  }

  assertTest(
    exists && has5Vectors,
    'should validate 5-vector narrative deconstruction schema in brief template',
    'REQ-AR-303',
    reason
  );
})();

// Test 3.4: REQ-AR-304 - Consultation Provenance Log & Direct Source URLs
(() => {
  const templatePath = path.join(ENGINE_DIR, 'templates', 'narrative-brief-template.md');
  const syncScript = path.join(SCRIPTS_DIR, 'sync-narrative-intelligence.sh');
  let validLog = false;
  let reason = 'Brief template or sync script lacks mandatory consultation provenance log with direct URLs';

  const templateHasSection = fs.existsSync(templatePath) &&
    fs.readFileSync(templatePath, 'utf8').includes('Registro de Auditoría de Consultas & Fuentes Consultadas') &&
    fs.readFileSync(templatePath, 'utf8').includes('URL Directa');

  const scriptHasLogic = fs.existsSync(syncScript) &&
    fs.readFileSync(syncScript, 'utf8').includes('Registro de Auditoría de Consultas') &&
    fs.readFileSync(syncScript, 'utf8').includes('https://');

  validLog = templateHasSection && scriptHasLogic;
  if (!validLog) {
    reason = `templateHasSection: ${templateHasSection}, scriptHasLogic: ${scriptHasLogic}`;
  }

  assertTest(
    validLog,
    'should enforce Consultation Provenance Log with clickable source URLs',
    'REQ-AR-304',
    reason
  );
})();

// Test 3.5: REQ-AR-305 - Social Bookmark Action (--bookmark-tweet / --save-ig)
(() => {
  const radarScript = path.join(SCRIPTS_DIR, 'narrative-radar.sh');
  let hasBookmarkCommands = false;
  let reason = 'narrative-radar.sh lacks --bookmark-tweet and --save-ig bookmarking functionality';

  if (fs.existsSync(radarScript)) {
    const content = fs.readFileSync(radarScript, 'utf8');
    hasBookmarkCommands = content.includes('--bookmark-tweet') &&
                          content.includes('--save-ig') &&
                          content.includes('log_social_bookmark');
  }

  assertTest(
    hasBookmarkCommands,
    'should implement --bookmark-tweet and --save-ig social saving actions',
    'REQ-AR-305',
    reason
  );
})();

// Test 3.6: REQ-AR-306 - Persistent Raw Data Archival
(() => {
  const rawDir = path.join(BRAIN_DIR, '01 Negocio', '01 Estrategia & Modelo', 'narrative-intelligence', 'raw');
  let hasValidRawArchive = false;
  let reason = 'Directory raw/ does not exist or lacks valid raw intelligence JSON files';

  if (fs.existsSync(rawDir)) {
    const jsonFiles = fs.readdirSync(rawDir).filter(f => f.endsWith('.json'));
    if (jsonFiles.length > 0) {
      const rawContent = JSON.parse(fs.readFileSync(path.join(rawDir, jsonFiles[0]), 'utf8'));
      const hasCollectedAt = !!rawContent.collected_at;
      const hasQueries = Array.isArray(rawContent.search_queries) && rawContent.search_queries.length > 0;
      const hasRecords = Array.isArray(rawContent.records) && rawContent.records.length > 0;
      const hasTotal = typeof rawContent.total_records === 'number' && rawContent.total_records > 0;

      hasValidRawArchive = hasCollectedAt && hasQueries && hasRecords && hasTotal;
      if (!hasValidRawArchive) {
        reason = 'Raw JSON file schema is invalid (missing collected_at, search_queries, records, or total_records)';
      }
    } else {
      reason = 'No .json files found in raw/ directory';
    }
  }

  assertTest(
    hasValidRawArchive,
    'should persistently store unedited raw extracted data in JSON format',
    'REQ-AR-306',
    reason
  );
})();

// Test 3.7: REQ-AR-307 - 100% Clickable Source URLs Coverage
(() => {
  const rawDir = path.join(BRAIN_DIR, '01 Negocio', '01 Estrategia & Modelo', 'narrative-intelligence', 'raw');
  let allUrlsValid = false;
  let reason = 'Raw dataset contains items without valid http/https URLs';

  if (fs.existsSync(rawDir)) {
    const jsonFiles = fs.readdirSync(rawDir).filter(f => f.endsWith('.json'));
    if (jsonFiles.length > 0) {
      const rawContent = JSON.parse(fs.readFileSync(path.join(rawDir, jsonFiles[0]), 'utf8'));
      if (rawContent.records && rawContent.records.length > 0) {
        allUrlsValid = rawContent.records.every(r => r.url && (r.url.startsWith('https://') || r.url.startsWith('http://')));
        if (!allUrlsValid) {
          reason = 'One or more raw records have missing or non-HTTP/HTTPS URLs';
        }
      }
    }
  }

  assertTest(
    allUrlsValid,
    'should enforce direct clickable source URLs across 100% of extracted items',
    'REQ-AR-307',
    reason
  );
})();

// Test 3.8: REQ-AR-308 - Zero-Judgments & Inductive Formulation Contract
(() => {
  const agentPath = path.join(AGENTS_DIR, 'narrative-intelligence-analyst.yaml');
  const templatePath = path.join(ENGINE_DIR, 'templates', 'narrative-brief-template.md');
  const agentsMdPath = path.join(ROOT_DIR, 'AGENTS.md');
  let enforcesZeroJudgments = false;
  let reason = 'Agent contract, brief template, or AGENTS.md missing zero-judgments policy';

  const agentHasRule = fs.existsSync(agentPath) &&
    fs.readFileSync(agentPath, 'utf8').includes('Zero-Judgments & Inductive Neutrality') &&
    fs.readFileSync(agentPath, 'utf8').includes('Never emit subjective judgments');

  const templateHasSection = fs.existsSync(templatePath) &&
    fs.readFileSync(templatePath, 'utf8').includes('Archivo de Datos Crudos Extraídos') &&
    fs.readFileSync(templatePath, 'utf8').includes('Garantía Anti-Juicios');

  const agentsMdHasRule = fs.existsSync(agentsMdPath) &&
    fs.readFileSync(agentsMdPath, 'utf8').includes('Strict zero-judgments policy');

  enforcesZeroJudgments = agentHasRule && templateHasSection && agentsMdHasRule;
  if (!enforcesZeroJudgments) {
    reason = `agentHasRule: ${agentHasRule}, templateHasSection: ${templateHasSection}, agentsMdHasRule: ${agentsMdHasRule}`;
  }

  assertTest(
    enforcesZeroJudgments,
    'should strictly enforce zero-judgments inductive formulation and raw data archive contract',
    'REQ-AR-308',
    reason
  );
})();

// ─────────────────────────────────────────────────────────────────────────────
// SPEC-AR-004: Anti-Drift Compliance & SDD Integration
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[SUITE 4] SPEC-AR-004: Anti-Drift Compliance & SDD Integration');

// Test 4.1: REQ-AR-401 - System Skills Integrity
(() => {
  let passedSkillCheck = false;
  let reason = 'validate-skills.sh failed or was not found';
  try {
    const output = execSync('bash BRIDS-Engine/scripts/validate-skills.sh', {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    passedSkillCheck = output.includes('Passed: 58') && output.includes('All skills are valid');
  } catch (err) {
    reason = `validate-skills.sh execution error: ${err.message}`;
  }

  assertTest(
    passedSkillCheck,
    'should guarantee 100% compliance across all 58 workspace skills',
    'REQ-AR-401',
    reason
  );
})();

// Test 4.2: REQ-AR-402 - Vault Governance & Zero Critical Errors
(() => {
  let zeroCritical = false;
  let reason = 'enforce-compliance.sh reported critical errors or drift';
  try {
    const output = execSync('bash BRIDS-Engine/scripts/enforce-compliance.sh', {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    zeroCritical = output.includes('Errores críticos:     0') && output.includes('EL SISTEMA ESTÁ EN PERFECTO ESTADO');
  } catch (err) {
    reason = `enforce-compliance.sh execution error: ${err.message}`;
  }

  assertTest(
    zeroCritical,
    'should pass vault governance with 0 critical errors',
    'REQ-AR-402',
    reason
  );
})();

// Test 4.3: REQ-AR-403 - Anti-PII & Privacy Quarantine Filter
(() => {
  const radarScript = path.join(SCRIPTS_DIR, 'narrative-radar.sh');
  let hasPiiSanitizer = false;
  let reason = 'narrative-radar.sh lacks regex PII filter (emails/phones/private personal identifiers)';

  if (fs.existsSync(radarScript)) {
    const content = fs.readFileSync(radarScript, 'utf8');
    hasPiiSanitizer = content.includes('sanitize_pii') || content.includes('PII_FILTER');
  }

  assertTest(
    hasPiiSanitizer,
    'should quarantine and strip PII from social and web intelligence streams',
    'REQ-AR-403',
    reason
  );
})();

// ─────────────────────────────────────────────────────────────────────────────
// RESUMEN FINAL
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(78));
console.log(`📊 RESULTADOS TDD PRIMAL: ${passedTests}/${totalTests} Pruebas Pasadas | ${failedTests} Pruebas Falladas`);
console.log('═'.repeat(78));

if (failedTests > 0) {
  console.log('⚠️ ESTADO RED VERIFICADO: Las pruebas fallan legítimamente debido a componentes aún no implementados.');
  console.log(`Detalle de ${failedTests} pruebas pendientes de implementación:\n`);
  failureLog.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  process.exit(1); // Exit 1 strictly confirms RED phase
} else {
  console.log('🎉 ESTADO GREEN: Todas las pruebas pasaron.');
  process.exit(0);
}
