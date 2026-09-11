#!/usr/bin/env node

/**
 * Spec-Driven Development (SDD) & Two-Agent Evaluator-Optimizer Engine
 * BRIDS Knowledge Fort
 * 
 * Orchestrates deliverable specifications, atomic step verification,
 * and the Two-Agent (Creator vs Reviewer) quality optimization loop.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '../..');
const VAULT_DIR = path.join(ROOT_DIR, 'BRIDS-Brain');
const SPECS_DIR = path.join(VAULT_DIR, '00 Inbox', 'Specs');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'BRIDS-Engine', 'templates');
const SPEC_TEMPLATE_PATH = path.join(TEMPLATES_DIR, 'deliverable-spec-template.md');
const CRITICISM_TEMPLATE_PATH = path.join(TEMPLATES_DIR, 'criticism-report-template.json');

const VALID_SUBAGENTS = [
  'business-consultant',
  'market-research-analyst',
  'pitch-deck-architect',
  'compliance-officer',
  'b2b-sponsor-lead',
  'founder-ghostwriter'
];

const VALID_VAULT_PREFIXES = [
  '00 Inbox',
  '01 Brand Context',
  '02 Strategy & Research',
  '03 Website & Copy',
  '04 Email & Lifecycle',
  '05 SEO & Discoverability',
  '06 CRO & Funnel',
  '07 Paid, Social & Community',
  '08 Analytics & Measurement',
  '09 Retention & Growth',
  '10 RevOps & Sales'
];

// Strict banned robot phrases & LLM clichés (Spanish & English)
const BANNED_PATTERNS = [
  { pattern: /\ben resumen\b/gi, phrase: 'en resumen', penalty: 0.5 },
  { pattern: /\ben conclusi[oó]n\b/gi, phrase: 'en conclusión', penalty: 0.5 },
  { pattern: /\bpara concluir\b/gi, phrase: 'para concluir', penalty: 0.5 },
  { pattern: /\ben definitiva\b/gi, phrase: 'en definitiva', penalty: 0.5 },
  { pattern: /\bes importante (destacar|mencionar|recalcar|señalar|notar)\b/gi, phrase: 'es importante destacar/mencionar', penalty: 0.5 },
  { pattern: /\bcabe (destacar|resaltar|mencionar|señalar)\b/gi, phrase: 'cabe destacar/resaltar', penalty: 0.5 },
  { pattern: /\bes crucial (destacar|mencionar|resaltar)\b/gi, phrase: 'es crucial destacar', penalty: 0.5 },
  { pattern: /\ben el (vertiginoso|cambiante|competitivo) mundo\b/gi, phrase: 'en el vertiginoso/cambiante mundo', penalty: 0.5 },
  { pattern: /\ben un mundo cada vez m[aá]s\b/gi, phrase: 'en un mundo cada vez más', penalty: 0.5 },
  { pattern: /\bun papel (crucial|fundamental|vital|clave)\b/gi, phrase: 'un papel crucial/fundamental', penalty: 0.5 },
  { pattern: /\bjuega un (papel|rol) (crucial|fundamental|vital|clave)\b/gi, phrase: 'juega un papel/rol crucial', penalty: 0.5 },
  { pattern: /\ba la vanguardia\b/gi, phrase: 'a la vanguardia', penalty: 0.4 },
  { pattern: /\bcambio de paradigma\b/gi, phrase: 'cambio de paradigma', penalty: 0.4 },
  { pattern: /\bsumerg[ií]rse en\b/gi, phrase: 'sumergirse en', penalty: 0.4 },
  { pattern: /\badentr[eé]monos en\b/gi, phrase: 'adentrémonos en', penalty: 0.4 },
  { pattern: /\ben este art[ií]culo\b/gi, phrase: 'en este artículo', penalty: 0.3 },
  { pattern: /\ben este post\b/gi, phrase: 'en este post', penalty: 0.3 },
  { pattern: /\ba lo largo de este\b/gi, phrase: 'a lo largo de este', penalty: 0.3 },
  { pattern: /\bsin duda alguna\b/gi, phrase: 'sin duda alguna', penalty: 0.4 },
  { pattern: /\bno cabe duda\b/gi, phrase: 'no cabe duda', penalty: 0.4 },
  { pattern: /\bcomo hemos visto\b/gi, phrase: 'como hemos visto', penalty: 0.3 },
  { pattern: /\bcomo se mencion[oó] anteriormente\b/gi, phrase: 'como se mencionó anteriormente', penalty: 0.3 },
  // English equivalents
  { pattern: /\bin conclusion\b/gi, phrase: 'in conclusion', penalty: 0.5 },
  { pattern: /\bit is important to note\b/gi, phrase: 'it is important to note', penalty: 0.5 },
  { pattern: /\bit is worth noting\b/gi, phrase: 'it is worth noting', penalty: 0.5 },
  { pattern: /\bin today's (fast-paced|dynamic) world\b/gi, phrase: "in today's fast-paced world", penalty: 0.5 },
  { pattern: /\bplays a (crucial|vital|pivotal) role\b/gi, phrase: 'plays a crucial role', penalty: 0.5 },
  { pattern: /\bdelve into\b/gi, phrase: 'delve into', penalty: 0.4 },
  { pattern: /\bdive deep into\b/gi, phrase: 'dive deep into', penalty: 0.4 }
];

function sanitizeSlug(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getSpecPaths(slug) {
  const cleanSlug = sanitizeSlug(slug);
  ensureDir(SPECS_DIR);
  return {
    slug: cleanSlug,
    specId: `SPEC-${cleanSlug.toUpperCase()}`,
    specMdPath: path.join(SPECS_DIR, `${cleanSlug}.spec.md`),
    specJsonPath: path.join(SPECS_DIR, `${cleanSlug}.spec.json`),
    workDir: path.join(SPECS_DIR, `${cleanSlug}-work`)
  };
}

function loadSpec(slug) {
  const paths = getSpecPaths(slug);
  if (!fs.existsSync(paths.specJsonPath)) {
    throw new Error(`No se encontró el spec "${slug}" en ${paths.specJsonPath}`);
  }
  const specData = JSON.parse(fs.readFileSync(paths.specJsonPath, 'utf8'));
  return { data: specData, paths };
}

function saveSpec(paths, specData) {
  specData.updated_at = new Date().toISOString();
  fs.writeFileSync(paths.specJsonPath, JSON.stringify(specData, null, 2), 'utf8');
}

// -------------------------------------------------------------
// AUDIT & RUBRIC ENGINE (0 to 9 Scale, 8.5 Threshold)
// -------------------------------------------------------------

function auditText(text, specData = {}) {
  const content = text || '';
  const findings = {
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
    const icpKeywords = specData.intent.target_icp.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const matchedIcp = icpKeywords.some(k => content.toLowerCase().includes(k));
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
  // Check for false speculative promises
  const speculativePromises = /(retorno garantizado 100%|cero riesgo absoluto|duplica tu dinero|sin riesgo legal)/i.test(content);
  if (speculativePromises) {
    scoreTech -= 1.5;
    findings.technical_veracity.push('Alerta regulatoria: contiene promesas especulativas o garantías de retorno irrealistas.');
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

  // --- Dimension 4: Originalidad Léxica & Cero Clichés (Max 2.0 pts) ---
  let scoreLexical = 2.0;
  const detectedBanned = [];
  for (const item of BANNED_PATTERNS) {
    const matches = content.match(item.pattern);
    if (matches && matches.length > 0) {
      detectedBanned.push({
        phrase: item.phrase,
        count: matches.length,
        penaltyApplied: item.penalty
      });
      scoreLexical -= item.penalty * matches.length;
      findings.lexical_originality.push(`Cliché de IA detectado: "${item.phrase}" (${matches.length}x).`);
    }
  }
  scoreLexical = Math.max(0, Math.min(2.0, scoreLexical));

  // --- Total Calculation (Scale 0 to 9.0) ---
  const totalScore = Math.round((scoreGoal + scoreTech + scoreVoice + scoreLexical) * 10) / 10;
  const passed = totalScore >= 8.5;

  const remediationDirectives = [];
  if (detectedBanned.length > 0) {
    remediationDirectives.push(`Eliminar inmediatamente las siguientes muletillas de IA: ${detectedBanned.map(d => `"${d.phrase}"`).join(', ')}.`);
  }
  if (findings.goal_and_icp.length > 0) {
    remediationDirectives.push(...findings.goal_and_icp);
  }
  if (findings.technical_veracity.length > 0) {
    remediationDirectives.push(...findings.technical_veracity);
  }
  if (findings.founder_voice.length > 0) {
    remediationDirectives.push(...findings.founder_voice);
  }

  return {
    total_score: totalScore,
    scale_max: 9.0,
    passing_threshold: 8.5,
    passed,
    scoring_dimensions: {
      "1_goal_and_icp": {
        name: "Cumplimiento del Objetivo & ICP",
        score: scoreGoal,
        max_score: 2.5,
        passed: scoreGoal >= 2.0,
        findings: findings.goal_and_icp
      },
      "2_technical_veracity": {
        name: "Veracidad Técnica & Fuentes",
        score: scoreTech,
        max_score: 2.5,
        passed: scoreTech >= 2.2,
        findings: findings.technical_veracity
      },
      "3_founder_voice": {
        name: "Voz Fundadora vs Tono Robot",
        score: scoreVoice,
        max_score: 2.0,
        passed: scoreVoice >= 1.7,
        findings: findings.founder_voice
      },
      "4_lexical_originality": {
        name: "Originalidad Léxica & Cero Clichés",
        score: scoreLexical,
        max_score: 2.0,
        passed: scoreLexical >= 1.8,
        banned_phrases_found: detectedBanned,
        findings: findings.lexical_originality
      }
    },
    banned_phrases_detected: detectedBanned,
    remediation_directives: remediationDirectives
  };
}

// -------------------------------------------------------------
// CORE SDD COMMANDS
// -------------------------------------------------------------

function initSpec(slug, title, targetFolder, subagentsStr, icp, goal) {
  if (!slug || !title || !targetFolder) {
    console.error('❌ Uso: sdd-orchestrator init <slug> "<titulo>" "<target-folder>" "<subagents>" "[icp]" "[goal]"');
    process.exit(1);
  }

  const cleanSlug = sanitizeSlug(slug);
  const paths = getSpecPaths(cleanSlug);

  // Validate target vault folder
  const normalizedTarget = targetFolder.replace(/^\/+|\/+$/g, '');
  const isValidVaultFolder = VALID_VAULT_PREFIXES.some(prefix => 
    normalizedTarget === prefix || normalizedTarget.startsWith(`${prefix}/`)
  );

  if (!isValidVaultFolder) {
    console.error(`❌ Carpeta de destino inválida: "${targetFolder}".`);
    console.error(`   Debe ser una categoría numerada estándar de BRIDS-Brain (ej. "02 Strategy & Research", "10 RevOps & Sales").`);
    process.exit(1);
  }

  // Parse and validate subagents
  const rawAgents = (subagentsStr || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  
  const subagents = rawAgents.length > 0 ? rawAgents : ['founder-ghostwriter'];
  const unknownAgents = subagents.filter(a => !VALID_SUBAGENTS.includes(a));
  if (unknownAgents.length > 0) {
    console.warn(`⚠️ Advertencia: Los siguientes agentes no pertenecen al squad estándar: ${unknownAgents.join(', ')}`);
  }

  // Idempotency check: if spec already exists, return deterministic output
  if (fs.existsSync(paths.specJsonPath) && fs.existsSync(paths.specMdPath)) {
    console.log(`ℹ️ El spec "${cleanSlug}" ya existe en ${paths.specJsonPath}.`);
    console.log(`   Estado actual: ${JSON.parse(fs.readFileSync(paths.specJsonPath, 'utf8')).status}`);
    return paths;
  }

  ensureDir(SPECS_DIR);
  ensureDir(paths.workDir);

  const now = new Date().toISOString();
  const dateStr = now.split('T')[0];
  const targetFileName = `${cleanSlug}.md`;
  const canonicalVaultFile = path.join(targetFolder, targetFileName);

  // Read deliverable spec template or fallback
  let templateContent = '';
  if (fs.existsSync(SPEC_TEMPLATE_PATH)) {
    templateContent = fs.readFileSync(SPEC_TEMPLATE_PATH, 'utf8');
  }

  const primaryAgent = subagents[0] || 'founder-ghostwriter';
  const secondaryAgent = subagents[1] || 'business-consultant';

  const specMd = templateContent
    .replace(/\{\{SLUG\}\}/g, cleanSlug)
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{CATEGORY_FOLDER\}\}/g, normalizedTarget)
    .replace(/\{\{FILENAME\}\}/g, cleanSlug)
    .replace(/\{\{PRIMARY_AGENT\}\}/g, primaryAgent)
    .replace(/\{\{SECONDARY_AGENT\}\}/g, secondaryAgent)
    .replace(/\{\{DATE\}\}/g, dateStr)
    .replace(/\{\{EXECUTIVE_SUMMARY\}\}/g, goal || `Especificación formal para ${title}`)
    .replace(/\{\{BUSINESS_GOAL\}\}/g, goal || `Consolidar ${title} con rigurosidad técnica y tracción medible.`)
    .replace(/\{\{TARGET_ICP\}\}/g, icp || 'Real Estate Sponsors, Institutional LPs, YC Partners')
    .replace(/\{\{PRIMARY_CTA\}\}/g, 'Agendar sesión técnica de estructuración / Revisar Data Room')
    .replace(/\{\{PRIMARY_KPI\}\}/g, 'Tasa de respuesta calificada >= 20%')
    .replace(/\{\{REFERENCE_DOC_1\}\}/g, 'Whitepaper de Tokenización Metaplex Core')
    .replace(/\{\{REFERENCE_DOC_2\}\}/g, 'Estructura Legal Delaware C-Corp vs SPV LLC')
    .replace(/\{\{WORD_COUNT_RANGE\}\}/g, '400 - 800');

  fs.writeFileSync(paths.specMdPath, specMd, 'utf8');

  // Generate machine-readable JSON state
  const specJsonData = {
    spec_id: paths.specId,
    slug: cleanSlug,
    title,
    target_vault_folder: normalizedTarget,
    target_file: canonicalVaultFile,
    subagents_involved: subagents,
    status: 'proposed',
    created_at: now,
    updated_at: now,
    intent: {
      business_goal: goal || `Consolidar ${title}`,
      target_icp: icp || 'Real Estate Sponsors & LPs',
      constraints: ['Cero clichés de IA', 'Solana & Metaplex grounding', 'Estilo fundador']
    },
    evaluation: {
      target_score: 8.5,
      scale_max: 9.0,
      max_cycles: 5,
      current_cycle: 0,
      final_score: null,
      criticism_history: []
    },
    execution_steps: [
      { id: 'STEP-01', name: 'Spec Approval', status: 'pending', depends_on: [] },
      { id: 'STEP-02', name: 'Initial Draft Generation', status: 'pending', depends_on: ['STEP-01'] },
      { id: 'STEP-03', name: 'Evaluator-Optimizer Loop', status: 'pending', depends_on: ['STEP-02'] },
      { id: 'STEP-04', name: 'Vault Promotion', status: 'pending', depends_on: ['STEP-03'] }
    ]
  };

  saveSpec(paths, specJsonData);

  console.log(`✅ Spec inicializado con éxito: ${paths.specId}`);
  console.log(`   📄 Documento Spec: ${paths.specMdPath}`);
  console.log(`   ⚙️ Estado JSON:   ${paths.specJsonPath}`);
  console.log(`   🎯 Destino Final:  BRIDS-Brain/${canonicalVaultFile}`);
  console.log(`   🤖 Subagentes:     ${subagents.join(', ')}`);
  return paths;
}

function previewSpec(slug) {
  const { data, paths } = loadSpec(slug);
  console.log('\n' + '═'.repeat(70));
  console.log(`📋 ESPECIFICACIÓN: ${data.spec_id} - ${data.title}`);
  console.log('═'.repeat(70));
  console.log(`Estado:             ${data.status.toUpperCase()}`);
  console.log(`Destino en Vault:   BRIDS-Brain/${data.target_file}`);
  console.log(`Subagentes Squad:   ${data.subagents_involved.join(', ')}`);
  console.log(`Público (ICP):      ${data.intent.target_icp}`);
  console.log(`Objetivo Comercial: ${data.intent.business_goal}`);
  console.log(`Umbral Aprobación:  >= ${data.evaluation.target_score} / ${data.evaluation.scale_max}`);
  console.log(`Ciclo Actual:       ${data.evaluation.current_cycle} / ${data.evaluation.max_cycles}`);
  if (data.evaluation.final_score !== null) {
    console.log(`Puntaje Final:      ${data.evaluation.final_score} / ${data.evaluation.scale_max}`);
  }
  console.log('-'.repeat(70));
  console.log('Pasos de Ejecución Atómica:');
  for (const step of data.execution_steps) {
    const icon = step.status === 'completed' ? '✅' : step.status === 'in_progress' ? '🔄' : '⏳';
    console.log(`  ${icon} [${step.id}] ${step.name.padEnd(28)} (${step.status})`);
  }
  console.log('═'.repeat(70) + '\n');
}

function approveSpec(slug) {
  const { data, paths } = loadSpec(slug);
  if (data.status === 'completed') {
    console.log(`ℹ️ El spec "${slug}" ya fue completado previamente.`);
    return data;
  }
  if (data.status === 'approved' || data.status === 'in_progress') {
    console.log(`ℹ️ El spec "${slug}" ya se encuentra aprobado y listo para ejecución.`);
    return data;
  }

  data.status = 'approved';
  data.execution_steps[0].status = 'completed'; // STEP-01 completed
  data.execution_steps[1].status = 'in_progress';
  saveSpec(paths, data);

  // Also update markdown frontmatter status
  if (fs.existsSync(paths.specMdPath)) {
    let md = fs.readFileSync(paths.specMdPath, 'utf8');
    md = md.replace(/^status:\s*[a-z_]+/m, 'status: approved');
    md = md.replace(/- \[ \] \*\*STEP-01/, '- [x] **STEP-01');
    fs.writeFileSync(paths.specMdPath, md, 'utf8');
  }

  console.log(`✅ Spec "${data.spec_id}" aprobado formalmente.`);
  console.log('   El bucle de ejecución programático Creador vs Revisor queda habilitado.');
  return data;
}

function evaluateDraft(slug, draftContent, cycleOverride = null) {
  const { data, paths } = loadSpec(slug);

  if (data.status !== 'approved' && data.status !== 'in_progress') {
    throw new Error(`El spec "${slug}" debe estar en estado 'approved' o 'in_progress' para evaluarse (estado actual: ${data.status}). Ejecute 'approve' primero.`);
  }

  data.status = 'in_progress';
  const cycle = cycleOverride !== null ? cycleOverride : data.evaluation.current_cycle + 1;
  data.evaluation.current_cycle = cycle;

  ensureDir(paths.workDir);
  const draftFile = path.join(paths.workDir, `draft_cycle_${cycle}.md`);
  fs.writeFileSync(draftFile, draftContent, 'utf8');

  // Run audit through rubric engine
  const report = auditText(draftContent, data);
  report.spec_id = data.spec_id;
  report.cycle = cycle;
  report.target_file = data.target_file;
  report.timestamp = new Date().toISOString();

  const reportFile = path.join(paths.workDir, `criticism_cycle_${cycle}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf8');

  data.evaluation.criticism_history.push({
    cycle,
    total_score: report.total_score,
    passed: report.passed,
    timestamp: report.timestamp,
    banned_phrases_count: report.banned_phrases_detected.length,
    report_file: path.relative(ROOT_DIR, reportFile)
  });

  data.evaluation.final_score = report.total_score;

  console.log(`\n🔍 AUDITORÍA DE CICLO ${cycle}/${data.evaluation.max_cycles}: ${data.spec_id}`);
  console.log(`   Puntaje Total:   ${report.total_score} / ${report.scale_max} (Umbral: ${report.passing_threshold})`);
  console.log(`   Objetivo & ICP:  ${report.scoring_dimensions["1_goal_and_icp"].score} / 2.5`);
  console.log(`   Técnica/Fuentes: ${report.scoring_dimensions["2_technical_veracity"].score} / 2.5`);
  console.log(`   Voz Fundadora:   ${report.scoring_dimensions["3_founder_voice"].score} / 2.0`);
  console.log(`   Originalidad:    ${report.scoring_dimensions["4_lexical_originality"].score} / 2.0`);

  if (report.passed) {
    console.log(`   🎉 ¡APROBADO CON DISTINCIÓN! Nota >= ${report.passing_threshold}`);
    data.status = 'completed';
    data.execution_steps[1].status = 'completed'; // Draft
    data.execution_steps[2].status = 'completed'; // Loop
    data.execution_steps[3].status = 'completed'; // Promotion

    // Promote to Vault atomically
    const fullTargetVaultPath = path.join(VAULT_DIR, data.target_file);
    ensureDir(path.dirname(fullTargetVaultPath));

    // Construct final note with YAML frontmatter & changelog
    const finalNoteContent = formatFinalVaultNote(data, draftContent, report);
    fs.writeFileSync(fullTargetVaultPath, finalNoteContent, 'utf8');

    // Update spec markdown frontmatter
    if (fs.existsSync(paths.specMdPath)) {
      let md = fs.readFileSync(paths.specMdPath, 'utf8');
      md = md.replace(/^status:\s*[a-z_]+/m, 'status: completed');
      md = md.replace(/final_score:\s*.*/m, `final_score: ${report.total_score}`);
      md = md.replace(/- \[ \] \*\*STEP-02/, '- [x] **STEP-02');
      md = md.replace(/- \[ \] \*\*STEP-03/, '- [x] **STEP-03');
      md = md.replace(/- \[ \] \*\*STEP-04/, '- [x] **STEP-04');
      md = md.replace(/- \[ \] \*\*STEP-05/, '- [x] **STEP-05');
      fs.writeFileSync(paths.specMdPath, md, 'utf8');
    }

    saveSpec(paths, data);
    console.log(`   🚀 Entregable final promovido a: ${fullTargetVaultPath}`);
    return { passed: true, report, data };
  } else {
    console.log(`   ⚠️ NO APROBADO: Calificación insuficiente (${report.total_score} < ${report.passing_threshold})`);
    if (report.banned_phrases_detected.length > 0) {
      console.log(`   🚫 Clichés detectados: ${report.banned_phrases_detected.map(b => `"${b.phrase}" (${b.count}x)`).join(', ')}`);
    }
    for (const dir of report.remediation_directives) {
      console.log(`      • ${dir}`);
    }

    if (cycle >= data.evaluation.max_cycles) {
      console.log(`\n🛑 LÍMITE DE SEGURIDAD ALCANZADO (5 Ciclos).`);
      console.log(`   El documento no se promoverá a producción y queda congelado para arbitraje humano.`);
      data.status = 'frozen_for_arbitration';
      saveSpec(paths, data);
      return { passed: false, frozen: true, report, data };
    } else {
      saveSpec(paths, data);
      return { passed: false, frozen: false, report, data };
    }
  }
}

function formatFinalVaultNote(specData, rawDraft, report) {
  const now = new Date().toISOString().split('T')[0];
  const primaryAgent = specData.subagents_involved[0] || 'founder-ghostwriter';

  return `---
title: "${specData.title}"
spec_id: "${specData.spec_id}"
category: "${specData.target_vault_folder}"
author_agents:
${specData.subagents_involved.map(a => `  - "${a}"`).join('\n')}
reviewer_agent: "sdd-reviewer"
quality_score: ${report.total_score}
quality_threshold: ${report.passing_threshold}
status: approved
version: "1.0"
created_at: ${now}
updated_at: ${now}
tags:
  - brids
  - sdd-approved
  - deliverable
---

# ${specData.title}

> [!NOTE]
> **Aprobación de Calidad SDD:** Validado por el motor Evaluador-Optimizador con nota **${report.total_score}/9.0** (Supera el umbral de 8.5).
> **Sub-Agentes Autores:** ${specData.subagents_involved.map(a => `\`${a}\``).join(', ')} | **Revisor:** \`sdd-reviewer\`

${rawDraft.replace(/^---[\s\S]*?---\s*/, '')}

## 🔄 Historial de Revisiones SDD (Changelog)
- **v1.0 (${now}):** Aprobado y promovido tras ${specData.evaluation.current_cycle} ciclos de optimización con puntaje de ${report.total_score}/9.0.

## 🔗 Trazabilidad
- Artefacto de Especificación: [[00 Inbox/Specs/${specData.slug}.spec.md]]
- Contexto de Marca: [[01 Brand Context/product-marketing-context.md]]
`;
}

// -------------------------------------------------------------
// TWO-AGENT OPTIMIZER SIMULATION / TEST RUNNER
// -------------------------------------------------------------

function runFullLoop(slug, initialDraft, customRefinerFn = null, maxCycles = 5, threshold = 8.5) {
  const { data } = loadSpec(slug);
  approveSpec(slug);

  let currentDraft = initialDraft;
  let cycle = 1;

  while (cycle <= maxCycles) {
    const result = evaluateDraft(slug, currentDraft, cycle);
    if (result.passed) {
      return result;
    }
    if (result.frozen) {
      return result;
    }

    // Refinement step: Creator cleans up directives
    if (customRefinerFn) {
      currentDraft = customRefinerFn(currentDraft, result.report);
    } else {
      // Default built-in refiner: purge banned phrases and augment conviction
      currentDraft = autoRemediateDraft(currentDraft, result.report);
    }

    cycle++;
  }

  return { passed: false, cycle };
}

function autoRemediateDraft(text, report) {
  let refined = text;

  // 1. Purge all detected banned phrases
  for (const banned of BANNED_PATTERNS) {
    refined = refined.replace(banned.pattern, '');
  }

  // 2. Clean up double spaces or awkward leftover punctuation
  refined = refined
    .replace(/\s{2,}/g, ' ')
    .replace(/,\s*,/g, ',')
    .replace(/\.\s*\./g, '.');

  // 3. Ensure CTA and tech grounding if flagged
  if (!/(agenda|demo|contacto|sindicaci[oó]n|hablemos)/i.test(refined)) {
    refined += '\n\n### Próximos Pasos\nAgenda una sesión técnica con el equipo de estructuración en `sponsors@brids.io` para evaluar la viabilidad de tu inmueble.';
  }

  if (!/(solana|metaplex)/i.test(refined)) {
    refined += '\n\n**Infraestructura:** Respaldado sobre Solana con estándar Metaplex Core y plugins de Freeze/Recovery regulatorio.';
  }

  return refined;
}

function testRun() {
  console.log('🧪 Iniciando prueba sintética del ciclo SDD (Creador vs Revisor)...');
  const testSlug = 'test-sdd-synthetic';
  const testPaths = getSpecPaths(testSlug);

  // Clean up previous test artifacts if any
  if (fs.existsSync(testPaths.specJsonPath)) fs.unlinkSync(testPaths.specJsonPath);
  if (fs.existsSync(testPaths.specMdPath)) fs.unlinkSync(testPaths.specMdPath);
  if (fs.existsSync(testPaths.workDir)) fs.rmSync(testPaths.workDir, { recursive: true, force: true });

  const targetVaultFile = path.join(VAULT_DIR, '02 Strategy & Research', `${testSlug}.md`);
  if (fs.existsSync(targetVaultFile)) fs.unlinkSync(targetVaultFile);

  // 1. Init
  initSpec(
    testSlug,
    'Sintético: Tokenización de Activos Inmobiliarios en Solana',
    '02 Strategy & Research',
    'business-consultant,founder-ghostwriter',
    'Institutional Real Estate Sponsors',
    'Demostrar reducción de costos de sindicación del 80%'
  );

  // 2. Approve
  approveSpec(testSlug);

  // 3. Flawed draft full of robot clichés
  const flawedDraft = `
En resumen, en el vertiginoso mundo de la tokenización inmobiliaria, BRIDS juega un papel crucial a la vanguardia tecnológica.
Es importante destacar que ofrecemos un cambio de paradigma para desarrolladores.
Como hemos visto, la infraestructura permite digitalizar inmuebles. Sin duda alguna, esto democratiza el capital.
En conclusión, sumergirse en este nuevo modelo es una oportunidad revolucionaria.
  `;

  console.log('\n--- Ronda 1: Borrador deficiente con clichés robóticos ---');
  const round1 = evaluateDraft(testSlug, flawedDraft, 1);
  if (round1.passed) {
    throw new Error('FALLO: El borrador con clichés no debió pasar la auditoría!');
  }
  console.log('✅ El revisor identificó y penalizó correctamente los clichés robóticos.');

  // 4. Refined draft: pure founder voice, zero clichés, high technical veracity
  const pristineDraft = `
## Arquitectura de Sindicación Inmobiliaria en Solana

Los métodos tradicionales de sindicación inmobiliaria consumen entre el 8% y el 12% del capital levantado en costos de intermediación, auditoría y gestoría legal. En BRIDS eliminamos esa fricción sustituyendo capas burocráticas por infraestructura auditable on-chain.

### Desacoplamiento Legal y Tecnológico
Cada activo se estructura mediante una SPV (Special Purpose Vehicle) constituida como LLC en Delaware. La LLC retiene la titularidad legal física de la propiedad y emite las participaciones tokenizadas. BRIDS actúa exclusivamente como proveedor de software SaaS e infraestructura técnica, garantizando el aislamiento de responsabilidad patrimonial.

### Estándar Metaplex Core y Cumplimiento Regulatorio
A diferencia de los tokens ERC-20 o SPL tradicionales que carecen de controles de cumplimiento nativos, implementamos Metaplex Core con plugins de Freeze y Recovery. Esto permite:
1. **Acreditación KYC/AML:** Verificación de identidad vinculada vía Stripe Identity antes de la transferencia.
2. **Capacidad de Restitución (Asset Recovery):** Recuperación de activos ante pérdida de credenciales probada judicialmente, sin alterar el ledger histórico.
3. **Liquidación Instantánea:** Transferencias peer-to-peer sobre Solana con comisiones inferiores a $0.001 y finalidad en sub-segundos.

### Llamado a la Acción y Próximos Pasos
Si gestionas un portafolio superior a $10M en activos multifamiliares o comerciales, hablemos. Agenda una demo técnica de sindicación directamente con nuestros ingenieros de producto para estructurar tu primer activo piloto.
  `;

  console.log('\n--- Ronda 2: Borrador optimizado por el Creador ---');
  const round2 = evaluateDraft(testSlug, pristineDraft, 2);
  if (!round2.passed) {
    throw new Error(`FALLO: El borrador de alta calidad debió superar el umbral de 8.5! (Obtuvo: ${round2.report.total_score})`);
  }
  console.log(`✅ Aprobado con puntaje de ${round2.report.total_score}/9.0. Entregable promovido.`);

  // Verify promotion file exists in vault
  if (!fs.existsSync(targetVaultFile)) {
    throw new Error(`FALLO: El archivo final no se encontró en ${targetVaultFile}`);
  }
  console.log('✅ Archivo final verificado exitosamente en BRIDS-Brain/02 Strategy & Research/');

  // Cleanup test artifacts
  fs.unlinkSync(targetVaultFile);
  fs.unlinkSync(testPaths.specJsonPath);
  fs.unlinkSync(testPaths.specMdPath);
  fs.rmSync(testPaths.workDir, { recursive: true, force: true });
  console.log('🎉 Prueba sintética completada al 100% con éxito.');
}

function listSpecs() {
  ensureDir(SPECS_DIR);
  const files = fs.readdirSync(SPECS_DIR).filter(f => f.endsWith('.spec.json'));
  console.log('\n' + '═'.repeat(80));
  console.log('📁 CATÁLOGO DE ESPECIFICACIONES SDD (BRIDS-BRAIN/00 INBOX/SPECS)');
  console.log('═'.repeat(80));

  if (files.length === 0) {
    console.log('  (No hay especificaciones registradas. Ejecute "sdd-manager init <slug>" para crear una).');
  }

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(SPECS_DIR, file), 'utf8'));
      const statusIcon = data.status === 'completed' ? '✅' : data.status === 'approved' ? '🟢' : data.status === 'in_progress' ? '🔄' : '⏳';
      const scoreStr = data.evaluation.final_score !== null ? `${data.evaluation.final_score}/9.0` : 'Pendiente';
      console.log(`${statusIcon} ${data.spec_id.padEnd(25)} | Estado: ${data.status.padEnd(12)} | Nota: ${scoreStr.padEnd(10)} | ${data.title}`);
      console.log(`   └─ Destino: BRIDS-Brain/${data.target_file} | Agentes: ${data.subagents_involved.join(', ')}`);
    } catch (e) {
      // ignore corrupted file
    }
  }
  console.log('═'.repeat(80) + '\n');
}

// -------------------------------------------------------------
// CLI DISPATCHER
// -------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  switch (cmd) {
    case 'init':
      initSpec(args[1], args[2], args[3], args[4], args[5], args[6]);
      break;
    case 'preview':
      previewSpec(args[1]);
      break;
    case 'approve':
      approveSpec(args[1]);
      break;
    case 'status':
      previewSpec(args[1]);
      break;
    case 'list':
      listSpecs();
      break;
    case 'evaluate': {
      const slug = args[1];
      const filePath = args[2];
      if (!slug || !filePath || !fs.existsSync(filePath)) {
        console.error('Uso: sdd-orchestrator evaluate <slug> <draft-file>');
        process.exit(1);
      }
      const draftText = fs.readFileSync(filePath, 'utf8');
      const res = evaluateDraft(slug, draftText);
      process.exit(res.passed ? 0 : 2);
      break;
    }
    case 'audit-text': {
      const filePath = args[1];
      if (!filePath || !fs.existsSync(filePath)) {
        console.error('Uso: sdd-orchestrator audit-text <file.md>');
        process.exit(1);
      }
      const text = fs.readFileSync(filePath, 'utf8');
      const report = auditText(text);
      console.log(JSON.stringify(report, null, 2));
      process.exit(report.passed ? 0 : 1);
      break;
    }
    case 'test-run':
      testRun();
      break;
    default:
      console.log(`
Spec-Driven Development (SDD) Engine - BRIDS.io

Comandos disponibles:
  init <slug> "<titulo>" "<target-folder>" "<subagents>" "[icp]" "[goal]"
  preview <slug>
  approve <slug>
  evaluate <slug> <draft-file>
  status <slug>
  list
  audit-text <file.md>
  test-run
      `);
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  initSpec,
  previewSpec,
  approveSpec,
  evaluateDraft,
  auditText,
  runFullLoop,
  autoRemediateDraft,
  listSpecs,
  getSpecPaths,
  loadSpec,
  BANNED_PATTERNS
};
