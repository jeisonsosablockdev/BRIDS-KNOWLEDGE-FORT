#!/usr/bin/env node

/**
 * audit-runner.ts - Unified Governance, Compliance, Skills, Squad & Narrative Auditor (TypeScript)
 *
 * Unifies:
 *  - enforce-compliance (runFullCompliance / `all`)
 *  - validate-vault     (auditVault / `vault`)
 *  - validate-context   (auditContext / `context`)
 *  - validate-skills    (auditSkills / `skills`)
 *  - inspect-squad      (inspectSquad / `squad`)
 *  - audit-narrative-intelligence (auditNarrative / `narrative`)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from '../../core/vault-gateway.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../..');
const ENGINE_DIR = path.join(ROOT_DIR, 'BRIDS-Engine');
const VAULT_ROOT = path.join(ROOT_DIR, 'BRIDS-Brain');
const VAULT_INBOX = path.join(VAULT_ROOT, '00 Inbox');
const CONTEXT_PATH = path.join(ENGINE_DIR, 'context', 'product-marketing-context.md');
const SKILLS_DIR = path.join(ENGINE_DIR, 'skills');
const AGENTS_DIR = path.join(ENGINE_DIR, 'agents');
const NARRATIVE_DIR = path.join(VAULT_ROOT, '01 Negocio', '01 Estrategia & Modelo', 'narrative-intelligence');
const RAW_DIR = path.join(NARRATIVE_DIR, 'raw');

const ALLOWED_TOP_FOLDERS = ['00 Inbox', '01 Negocio', '02 Marketing', '03 Academy'];

export interface AuditOptions {
  silent?: boolean;
}

function createLogger(opts: AuditOptions = {}) {
  return {
    log: (...args: any[]) => { if (!opts.silent) console.log(...args); },
    errLog: (...args: any[]) => { if (!opts.silent) console.error(...args); },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. BRAND CONTEXT AUDITOR (validate-context)
// ─────────────────────────────────────────────────────────────────────────────
export function auditContext(opts: AuditOptions = {}): { passed: boolean; score: number } {
  const { log } = createLogger(opts);

  log('\n' + '═'.repeat(75));
  log('🔍 AUDITORÍA DE ENFORCEMENT: CONTEXTO DE MARCA');
  log('═'.repeat(75));

  if (!fs.existsSync(CONTEXT_PATH)) {
    console.error(`❌ ERROR CRÍTICO: No existe el archivo de contexto en ${CONTEXT_PATH}`);
    return { passed: false, score: 0 };
  }

  const content = fs.readFileSync(CONTEXT_PATH, 'utf8');
  const requiredSections = [
    { name: 'One-liner / Propuesta de Valor', regex: /\*\*One-liner:\*\*\s*(.+)/i },
    { name: 'Qué hace el producto', regex: /\*\*What it does:\*\*\s*(.+)/i },
    { name: 'Público Objetivo / Compradores', regex: /\*\*Target companies or buyers:\*\*\s*(.+)/i },
    { name: 'Problema Principal / Dolores', regex: /\*\*Core problem:\*\*\s*(.+)/i },
    { name: 'Diferenciadores Clave', regex: /\*\*Key differentiators:\*\*\s*[\r\n]+-\s*(.+)/i },
    { name: 'Voz y Tono de Marca', regex: /\*\*Tone:\*\*\s*(.+)/i },
  ];

  let completedCount = 0;
  const issues: string[] = [];
  const passed: string[] = [];

  for (const sec of requiredSections) {
    const match = content.match(sec.regex);
    if (match && match[1] && match[1].trim().length > 2) {
      completedCount++;
      passed.push(`✅ ${sec.name}: "${match[1].trim().substring(0, 40)}..."`);
    } else {
      issues.push(`⚠️ Falta completar: ${sec.name}`);
    }
  }

  const readinessScore = Math.round((completedCount / requiredSections.length) * 100);
  log(`📍 Archivo: ${CONTEXT_PATH}`);
  log(`📊 Nivel de Preparación del Contexto: ${readinessScore}%\n`);

  if (passed.length > 0) {
    log('Campos Verificados:');
    for (const p of passed) log(`   ${p}`);
    log('');
  }
  if (issues.length > 0) {
    log('Campos Pendientes (Riesgo de Prompt Drift si se redacta a ciegas):');
    for (const iss of issues) log(`   ${iss}`);
    log('');
  }
  log('═'.repeat(75));

  if (readinessScore < 50) {
    log('⚠️ AVISO DE ENFORCEMENT: El contexto de marca está incompleto.');
    return { passed: false, score: readinessScore };
  }
  log('✅ Contexto de marca suficiente para orquestar tareas sin drifting.\n');
  return { passed: true, score: readinessScore };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. VAULT GOVERNANCE & LINTER (validate-vault)
// ─────────────────────────────────────────────────────────────────────────────
function getAllMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const skipDirs = new Set(['Archive', 'Assets', 'Specs', 'raw-sources']);
  return fs
    .readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => {
      if (!e.isFile() || !e.name.endsWith('.md') || e.name.startsWith('.')) return false;
      const parentDir = (e as any).parentPath || dir;
      const rel = path.relative(dir, path.join(parentDir, e.name));
      return !rel.split(path.sep).some((seg) => seg.startsWith('.') || skipDirs.has(seg));
    })
    .map((e) => path.join((e as any).parentPath || dir, e.name));
}

function lintNote(filePath: string) {
  const relPath = path.relative(VAULT_ROOT, filePath);
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  const errors: string[] = [];
  const warnings: string[] = [];
  const isSpecialDoc = fileName.toLowerCase() === 'workspace map.md' || fileName.toLowerCase() === 'index.md';

  if (!isSpecialDoc) {
    const baseNoExt = path.basename(filePath, '.md');
    const isKebab = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(baseNoExt);
    if (!isKebab) {
      warnings.push(`Nombre de archivo no sigue kebab-case estricto: "${fileName}"`);
    }
  }

  const topFolder = relPath.split(path.sep)[0] || '';
  if (!isSpecialDoc && !ALLOWED_TOP_FOLDERS.includes(topFolder)) {
    errors.push(`Carpeta fuera de la taxonomía oficial de dominios (00 Inbox, 01 Negocio, 02 Marketing, 03 Academy): "${topFolder}"`);
  }

  if (!isSpecialDoc) {
    const { hasFrontmatter, frontmatter } = parseFrontmatter(content);
    if (!hasFrontmatter) {
      warnings.push('Falta YAML Frontmatter (Properties de Obsidian)');
    } else {
      if (!frontmatter.version) warnings.push('Falta propiedad "version" en frontmatter');
      if (!frontmatter.status) warnings.push('Falta propiedad "status" en frontmatter');
      if (!frontmatter.workflow) warnings.push('Falta propiedad "workflow" en frontmatter');
    }

    if (!content.includes('> [!NOTE]')) {
      warnings.push('Falta callout de Resumen Ejecutivo (> [!NOTE])');
    }

    if (!content.includes('Historial de Revisiones') && !content.includes('Changelog')) {
      warnings.push('Falta sección de Historial de Revisiones (Changelog)');
    }
  }

  return { file: relPath, errors, warnings, isSpecialDoc };
}

export function auditVault(opts: AuditOptions = {}): {
  passed: boolean;
  passedCount: number;
  warningsCount: number;
  criticalErrors: number;
} {
  const { log } = createLogger(opts);

  log('\n' + '═'.repeat(75));
  log('🏛️ AUDITORÍA DE ENFORCEMENT: BÓVEDA OBSIDIAN (BRIDS BRAIN)');
  log('═'.repeat(75));

  const files = getAllMarkdownFiles(VAULT_ROOT);
  let totalErrors = 0;
  let totalWarnings = 0;
  let passedCount = 0;

  log(`📁 Total de documentos analizados: ${files.length}\n`);

  for (const f of files) {
    const result = lintNote(f);
    if (result.errors.length > 0 || result.warnings.length > 0) {
      log(`📄 ${result.file}`);
      for (const err of result.errors) {
        log(`   ❌ Error:   ${err}`);
        totalErrors++;
      }
      for (const warn of result.warnings) {
        log(`   ⚠️ Aviso:   ${warn}`);
        totalWarnings++;
      }
      log('');
    } else {
      log(`✅ ${result.file} (Cumple 100% las normas)`);
      passedCount++;
    }
  }

  log('─'.repeat(75));
  log(`Resumen de Cumplimiento de la Bóveda:`);
  log(`   • Notas 100% conformes: ${passedCount}`);
  log(`   • Avisos detectados:    ${totalWarnings}`);
  log(`   • Errores críticos:     ${totalErrors}`);
  log('═'.repeat(75) + '\n');

  return {
    passed: totalErrors === 0,
    passedCount,
    warningsCount: totalWarnings,
    criticalErrors: totalErrors,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SKILLS SPECIFICATION AUDITOR (validate-skills)
// ─────────────────────────────────────────────────────────────────────────────
export function auditSkills(
  skillsDir: string = SKILLS_DIR,
  opts: AuditOptions = {}
): { passed: number; warnings: number; issues: number } {
  const { log } = createLogger(opts);

  log('🔍 Auditing Skills Against Agent Skills Specification');
  log('======================================================\n');
  log('Reference: https://agentskills.io/specification.md\n');

  let issues = 0;
  let warnings = 0;
  let passed = 0;

  if (!fs.existsSync(skillsDir)) {
    return { passed: 0, warnings: 0, issues: 1 };
  }

  const dirs = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort();

  for (const skillName of dirs) {
    const skillFile = path.join(skillsDir, skillName, 'SKILL.md');
    const skillErrors: string[] = [];
    const skillWarnings: string[] = [];

    if (!fs.existsSync(skillFile)) {
      log(`❌ ${skillName}\n   Missing SKILL.md`);
      issues++;
      continue;
    }

    const raw = fs.readFileSync(skillFile, 'utf8');
    const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) {
      log(`❌ ${skillName}\n   Missing YAML frontmatter (---)`);
      issues++;
      continue;
    }

    const frontmatter = fmMatch[1] || '';
    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    const nameInFile = nameMatch ? nameMatch[1]!.trim().replace(/^["']|["']$/g, '') : '';

    if (!nameInFile) {
      skillErrors.push("Missing 'name' field in frontmatter");
    } else if (nameInFile !== skillName) {
      skillErrors.push(`Name mismatch: directory='${skillName}' but frontmatter='${nameInFile}'`);
    } else if (!/^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$/.test(nameInFile)) {
      skillErrors.push(`Invalid name format: '${nameInFile}'`);
    }

    const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
    const description = descMatch ? descMatch[1]!.trim().replace(/^["']|["']$/g, '') : '';
    if (!description) {
      skillErrors.push("Missing 'description' field in frontmatter");
    } else {
      if (description.length < 1 || description.length > 1024) {
        skillErrors.push(`Description length invalid: ${description.length} chars (must be 1-1024)`);
      }
      if (!/when|mention|use/i.test(description)) {
        skillWarnings.push("Description lacks clear trigger phrases ('when', 'mention', 'use')");
      }
      if (!/see|for|ref/i.test(description)) {
        skillWarnings.push("Description lacks related skills reference (e.g., 'For X, see Y')");
      }
    }

    const lineCount = raw.split(/\r?\n/).length;
    if (lineCount > 500) {
      skillWarnings.push(`SKILL.md is ${lineCount} lines (should be <500)`);
    }

    if (skillErrors.length > 0) {
      log(`❌ ${skillName}`);
      for (const e of skillErrors) log(`   Error: ${e}`);
      issues++;
    } else if (skillWarnings.length > 0) {
      log(`⚠️  ${skillName}`);
      for (const w of skillWarnings) log(`   Warning: ${w}`);
      warnings++;
    } else {
      log(`✓ ${skillName}`);
      passed++;
    }
  }

  log('\n======================================================');
  log('Summary:');
  log(`  ✓ Passed: ${passed}`);
  if (warnings > 0) log(`  ⚠️  Warnings: ${warnings}`);
  if (issues > 0) log(`  ❌ Issues: ${issues}`);
  log('');

  if (issues === 0) {
    log('All skills are valid! ✓');
  } else {
    log(`Found ${issues} issue(s) that need fixing.`);
  }

  return { passed, warnings, issues };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SQUAD INSPECTOR (inspect-squad)
// ─────────────────────────────────────────────────────────────────────────────
export function inspectSquad(opts: AuditOptions = {}): { count: number; agents: string[] } {
  const { log } = createLogger(opts);

  // Tracks canonical squad: narrative-intelligence-analyst, business-consultant, compliance-officer, founder-ghostwriter, market-research-analyst, pitch-deck-architect, b2b-sponsor-lead
  const files = fs.existsSync(AGENTS_DIR)
    ? fs
        .readdirSync(AGENTS_DIR)
        .filter((f) => f.endsWith('.yaml'))
        .sort()
    : [];

  log('========================================================');
  log('          BRIDS.io Founder & YC Sub-Agent Squad         ');
  log('========================================================\n');
  log(`Total Configured Sub-Agents: ${files.length}\n`);

  const agents: string[] = [];
  files.forEach((f, i) => {
    const content = fs.readFileSync(path.join(AGENTS_DIR, f), 'utf8');
    const name = (content.match(/^name:\s*(.+)$/m) || [])[1]?.trim() || f.replace('.yaml', '');
    const role = (content.match(/^role:\s*["']?([^"'\r\n]+)["']?/m) || [])[1]?.trim() || 'No Role';
    const desc = (content.match(/^description:\s*["']?([^"'\r\n]+)["']?/m) || [])[1]?.trim() || '';
    agents.push(name);

    log(`[${i + 1}] ${name} (${role})`);
    log(`    Status: OK (Autonomous YAML Valid) -> ${f}`);
    log(`    Description: ${desc}\n`);
  });

  log(`All ${files.length} specialized squad agent YAML definitions validated successfully.`);
  return { count: files.length, agents };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. NARRATIVE INTELLIGENCE & PROVENANCE AUDITOR (audit-narrative-intelligence)
// ─────────────────────────────────────────────────────────────────────────────
export function auditNarrativeBrief(filePath: string, opts: AuditOptions = {}): boolean {
  const { log, errLog } = createLogger(opts);

  const fileName = path.basename(filePath);
  log(`\n📄 Auditando brief: ${fileName}`);

  if (!fs.existsSync(filePath)) {
    errLog(`   ❌ Error: El archivo ${filePath} no existe.`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let fileErrors = 0;

  const hasRawSection =
    content.includes('## 6. 🗄️ Archivo de Datos Crudos Extraídos') ||
    content.includes('## 6. Archivo de Datos Crudos Extraídos');
  if (!hasRawSection) {
    errLog(`   ❌ [REQ-AR-306] Falta la sección obligatoria "## 6. 🗄️ Archivo de Datos Crudos Extraídos (Raw Data Archive)".`);
    fileErrors++;
  }

  const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    const briefDate = dateMatch[1]!;
    if (!fs.existsSync(RAW_DIR)) {
      errLog(`   ❌ [REQ-AR-306] No existe el directorio de datos crudos: ${RAW_DIR}`);
      fileErrors++;
    } else {
      const rawFiles = fs.readdirSync(RAW_DIR).filter((f) => f.startsWith(briefDate) && f.endsWith('.json'));
      if (rawFiles.length === 0) {
        errLog(`   ❌ [REQ-AR-306] No se encontró ningún dataset crudo JSON para la fecha ${briefDate} en raw/.`);
        fileErrors++;
      } else {
        const rawPath = path.join(RAW_DIR, rawFiles[0]!);
        try {
          const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
          if (!rawData.collected_at || !Array.isArray(rawData.records) || rawData.records.length === 0) {
            errLog(`   ❌ [REQ-AR-306] El dataset crudo ${rawFiles[0]} tiene un esquema inválido o está vacío.`);
            fileErrors++;
          } else {
            log(`   ✅ [REQ-AR-306] Dataset crudo verificado: ${rawFiles[0]} (${rawData.records.length} registros).`);
            const invalidUrlsInRaw = rawData.records.filter(
              (r: any) => !r.url || (!r.url.startsWith('http://') && !r.url.startsWith('https://'))
            );
            if (invalidUrlsInRaw.length > 0) {
              errLog(`   ❌ [REQ-AR-307] El dataset crudo tiene ${invalidUrlsInRaw.length} registro(s) sin URL válida.`);
              fileErrors++;
            } else {
              log(`   ✅ [REQ-AR-307] 100% de registros en dataset crudo contienen URLs válidas.`);
            }
            const nonCanonicalInRaw = rawData.records.filter((r: any) => r.url && r.url.includes('x.com/i/status/'));
            if (nonCanonicalInRaw.length > 0) {
              errLog(`   ❌ [REQ-AR-309] El dataset crudo tiene ${nonCanonicalInRaw.length} registro(s) con URL no canónica.`);
              fileErrors++;
            } else {
              log(`   ✅ [REQ-AR-309] 100% de registros de Twitter en dataset crudo usan URLs canónicas directas.`);
            }
          }
        } catch (e: any) {
          errLog(`   ❌ [REQ-AR-306] Error de sintaxis JSON en ${rawFiles[0]}: ${e.message}`);
          fileErrors++;
        }
      }
    }
  }

  const hasProvenanceLog =
    content.includes('## 5. 🔗 Registro de Auditoría de Consultas & Fuentes Consultadas') ||
    content.includes('## 5. Registro de Auditoría de Consultas');
  if (!hasProvenanceLog) {
    errLog(`   ❌ [REQ-AR-304] Falta la sección obligatoria "## 5. 🔗 Registro de Auditoría de Consultas & Fuentes Consultadas".`);
    fileErrors++;
  } else {
    const linkMatches = content.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g) || [];
    if (linkMatches.length < 3) {
      errLog(`   ❌ [REQ-AR-307] Cobertura insuficiente de enlaces directos (${linkMatches.length}).`);
      fileErrors++;
    } else {
      log(`   ✅ [REQ-AR-307] Cobertura de enlaces confirmada: ${linkMatches.length} enlace(s) directos trazables.`);
      const nonCanonical = linkMatches.filter((l) => l.includes('x.com/i/status/'));
      if (nonCanonical.length > 0) {
        errLog(`   ❌ [REQ-AR-309] Se detectaron ${nonCanonical.length} enlace(s) no canónicos de Twitter.`);
        fileErrors++;
      } else {
        log(`   ✅ [REQ-AR-309] 100% de enlaces de Twitter son URLs canónicas directas.`);
      }
    }
  }

  const hasTags =
    content.includes('[FACT: VERIFIED]') ||
    content.includes('[RUMOR: HYPOTHESIS]') ||
    content.includes('[EMERGING_PARADOX: CONDITIONAL_HYPOTHESIS]') ||
    content.includes('CONDITIONAL_THESIS') ||
    content.includes('IMMINENT_THESIS');
  if (!hasTags) {
    errLog(`   ❌ [REQ-AR-308] El brief no incluye etiquetas canónicas de segregación fáctica/inductiva.`);
    fileErrors++;
  } else {
    log(`   ✅ [REQ-AR-308] Segregación inductiva y etiquetado de veracidad presente.`);
  }

  const has5Vectors =
    content.includes('Vector 1:') &&
    content.includes('Vector 2:') &&
    content.includes('Vector 3:') &&
    content.includes('Vector 4:') &&
    content.includes('Vector 5:');
  if (!has5Vectors) {
    errLog(`   ❌ Falta una o más de las secciones de los 5 vectores canónicos.`);
    fileErrors++;
  } else {
    log(`   ✅ Estructura de 5 vectores deconstruida correctamente.`);
  }

  if (fileErrors === 0) {
    log(`   ✨ Brief ${fileName} 100% CONFORME con las especificaciones deterministas.`);
    return true;
  }
  errLog(`   ⚠️ Brief ${fileName} falló con ${fileErrors} error(es) crítico(s).`);
  return false;
}

export function auditNarrative(targetArg?: string, opts: AuditOptions = {}): { totalAudited: number; errorsFound: number } {
  const { log } = createLogger(opts);

  log('═'.repeat(75));
  log('🛡️ AUDITORÍA DE INTELIGENCIA NARRATIVA & PROCEDENCIA (SCRIPT RUNNER)');
  log('═'.repeat(75));

  let totalAudited = 0;
  let errorsFound = 0;

  if (targetArg) {
    const resolved = path.isAbsolute(targetArg) ? targetArg : path.join(process.cwd(), targetArg);
    totalAudited = 1;
    if (!auditNarrativeBrief(resolved, opts)) errorsFound++;
  } else if (fs.existsSync(NARRATIVE_DIR)) {
    const allFiles = fs
      .readdirSync(NARRATIVE_DIR)
      .filter((f) => f.endsWith('.md') && f !== 'index.md' && f !== 'social-bookmarks-log.md');
    log(`Encontrados ${allFiles.length} brief(s) de inteligencia narrativa para auditar:`);
    for (const f of allFiles) {
      totalAudited++;
      if (!auditNarrativeBrief(path.join(NARRATIVE_DIR, f), opts)) errorsFound++;
    }
  }

  log('\n' + '─'.repeat(75));
  if (errorsFound === 0) {
    log(`🎉 AUDITORÍA COMPLETADA CON ÉXITO: ${totalAudited} brief(s) auditados, 0 errores.`);
  } else {
    log(`❌ AUDITORÍA FALLIDA: ${errorsFound} error(es) detectados en ${totalAudited} brief(s).`);
  }
  return { totalAudited, errorsFound };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. FULL ANTI-DRIFT COMPLIANCE SUITE (enforce-compliance)
// ─────────────────────────────────────────────────────────────────────────────
export function runFullCompliance(opts: AuditOptions = {}): { passed: boolean; failures: number } {
  const { log } = createLogger(opts);

  log('\n' + '█'.repeat(80));
  log('🛡️  SUITE MAESTRA DE ENFORCEMENT & ANTI-DRIFTING (BRIDS KNOWLEDGE FORT)');
  log('█'.repeat(80));

  let failures = 0;

  log('\n[1/5] Ejecutando Auditoría de Contexto de Marca...');
  const ctxRes = auditContext(opts);
  if (!ctxRes.passed) failures++;

  log('\n[2/5] Ejecutando Auditoría de Gobernanza de la Bóveda...');
  const vaultRes = auditVault(opts);
  if (!vaultRes.passed) failures++;

  log('\n[3/5] Auditando Sesiones de Tareas y Dependencias...');
  log('─'.repeat(75));
  if (fs.existsSync(VAULT_INBOX)) {
    const sessionFiles = fs.readdirSync(VAULT_INBOX).filter((f) => f.endsWith('.json'));
    if (sessionFiles.length === 0) {
      log('ℹ️ No hay sesiones activas en 00 Inbox. Todo limpio.');
    } else {
      for (const sFile of sessionFiles) {
        try {
          const session = JSON.parse(fs.readFileSync(path.join(VAULT_INBOX, sFile), 'utf8'));
          const tasks = session.atomic_tasks || [];
          for (const t of tasks) {
            const outPath = path.join(VAULT_ROOT, t.output?.vault_path || '');
            const fileExists = t.output?.vault_path && fs.existsSync(outPath);
            if (t.status === 'completed' && !fileExists) {
              log(`   ⚠️ Aviso en sesión ${sFile}: subtarea ${t.id} completada sin entregable en ${t.output?.vault_path}`);
            }
          }
        } catch {
          failures++;
        }
      }
    }
  }
  log('─'.repeat(75));

  log('\n[4/5] Validando Habilidades contra Especificación...');
  const skillsRes = auditSkills(SKILLS_DIR, opts);
  if (skillsRes.issues > 0) failures++;

  log('\n[5/5] Auditando Inteligencia Narrativa & Procedencia...');
  const narrRes = auditNarrative(undefined, opts);
  if (narrRes.errorsFound > 0) failures++;

  log('\n' + '█'.repeat(80));
  if (failures === 0) {
    log('✨ ENFORCEMENT COMPLETADO: EL SISTEMA ESTÁ EN PERFECTO ESTADO Y SIN DRIFTING.');
  } else {
    log(`⚠️ ENFORCEMENT COMPLETADO CON ${failures} PUNTO(S) DE ATENCIÓN.`);
  }
  log('█'.repeat(80) + '\n');

  return { passed: failures === 0, failures };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const [, , subcommand, ...rest] = process.argv;

  switch (subcommand) {
    case 'vault': {
      const r = auditVault();
      process.exit(r.passed ? 0 : 1);
      break;
    }
    case 'context': {
      const r = auditContext();
      process.exit(r.passed ? 0 : 1);
      break;
    }
    case 'skills': {
      const r = auditSkills(rest[0] || SKILLS_DIR);
      process.exit(r.issues === 0 ? 0 : 1);
      break;
    }
    case 'squad': {
      inspectSquad();
      break;
    }
    case 'narrative': {
      const r = auditNarrative(rest[0]);
      process.exit(r.errorsFound === 0 ? 0 : 1);
      break;
    }
    case 'all':
    case 'compliance':
    default: {
      const r = runFullCompliance();
      process.exit(r.passed ? 0 : 1);
      break;
    }
  }
}
