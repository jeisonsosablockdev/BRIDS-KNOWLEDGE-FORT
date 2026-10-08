/**
 * Vault Gateway: Pure abstraction for BRIDS-Brain filesystem operations.
 * Enforces non-destructive safety backups, spec lifecycle storage, structured worker handoffs,
 * and atomic deliverable commitments.
 *
 * @spec SPEC-BRIDS-001 (BRIDS-Engine Clean Architecture — Solana RWA & YC Venture)
 */

import fs from 'node:fs';
import path from 'node:path';
import type {
  TaskSpecData,
  StructuredHandoff,
  ValidationContract,
  CreateSpecRequest,
} from './contracts.ts';

export type {
  TaskSpecData,
  StructuredHandoff,
  ValidationContract,
  CreateSpecRequest,
};

export interface SpecPaths {
  slug: string;
  specId: string;
  specMdPath: string;
  specJsonPath: string;
  workDir: string;
  approvedSpecPath: string;
  approvedDraftPath: string;
}

export interface ParsedMarkdown {
  frontmatter: Record<string, string>;
  rawFrontmatter: string;
  body: string;
  hasFrontmatter: boolean;
}

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function parseFrontmatter(content: string): ParsedMarkdown {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, rawFrontmatter: '', body: content, hasFrontmatter: false };
  }
  const rawFrontmatter = match[1] ?? '';
  const body = match[2] ?? '';
  const frontmatter: Record<string, string> = {};
  for (const line of rawFrontmatter.split(/\r?\n/)) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0 && !line.trim().startsWith('-')) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = val;
    }
  }
  return { frontmatter, rawFrontmatter, body, hasFrontmatter: true };
}

export class VaultGateway {
  private vaultDir: string;
  private specsDir: string;
  private archiveDir: string;
  private templatesDir: string;

  constructor(vaultDir?: string, templatesDir?: string) {
    const scriptDir = typeof import.meta !== 'undefined' && import.meta.dirname ? import.meta.dirname : __dirname;
    const rootDir = path.resolve(scriptDir, '../..');
    this.vaultDir = vaultDir || path.join(rootDir, 'BRIDS-Brain');
    this.specsDir = path.join(this.vaultDir, '00 Inbox', 'Specs');
    this.archiveDir = path.join(this.vaultDir, '00 Inbox', 'Archive');
    this.templatesDir = templatesDir || path.join(rootDir, 'BRIDS-Engine', 'templates');

    this.ensureDir(this.specsDir);
    this.ensureDir(this.archiveDir);
  }

  ensureDir(dirPath: string): void {
    ensureDir(dirPath);
  }

  getVaultDir(): string {
    return this.vaultDir;
  }

  getSpecsDir(): string {
    return this.specsDir;
  }

  getArchiveDir(): string {
    return this.archiveDir;
  }

  getTemplatesDir(): string {
    return this.templatesDir;
  }

  sanitizeSlug(slug: string): string {
    return (slug || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  getSpecPaths(slug: string): SpecPaths {
    const cleanSlug = this.sanitizeSlug(slug);
    this.ensureDir(this.specsDir);
    return {
      slug: cleanSlug,
      specId: `SPEC-${cleanSlug.toUpperCase()}`,
      specMdPath: path.join(this.specsDir, `${cleanSlug}.spec.md`),
      specJsonPath: path.join(this.specsDir, `${cleanSlug}.spec.json`),
      workDir: path.join(this.specsDir, `${cleanSlug}-work`),
      approvedSpecPath: path.join(this.specsDir, `${cleanSlug}-work`, 'approved_spec.md'),
      approvedDraftPath: path.join(this.specsDir, `${cleanSlug}-work`, 'approved_draft.md'),
    };
  }

  specExists(slug: string): boolean {
    const paths = this.getSpecPaths(slug);
    return fs.existsSync(paths.specJsonPath);
  }

  loadSpec(slug: string): { data: TaskSpecData; paths: SpecPaths } {
    const paths = this.getSpecPaths(slug);
    if (!fs.existsSync(paths.specJsonPath)) {
      throw new Error(`Spec not found: "${slug}" at ${paths.specJsonPath}`);
    }
    const raw = fs.readFileSync(paths.specJsonPath, 'utf8');
    const data: TaskSpecData = JSON.parse(raw);

    // Normalize legacy dual-field aliases on load
    data.spec_id = data.spec_id || data.id || paths.specId;
    data.id = data.id || data.spec_id;
    data.target_vault_folder = data.target_vault_folder || data.target_folder || '01 Negocio/01 Estrategia & Modelo';
    data.target_folder = data.target_folder || data.target_vault_folder;
    data.subagents_involved = data.subagents_involved || data.subagents || ['founder-ghostwriter'];
    data.subagents = data.subagents || data.subagents_involved;

    return { data, paths };
  }

  saveSpec(slug: string, data: TaskSpecData, markdownContent?: string): void {
    const paths = this.getSpecPaths(slug);
    this.ensureDir(path.dirname(paths.specJsonPath));
    this.ensureDir(paths.workDir);

    data.slug = paths.slug;
    data.updated_at = new Date().toISOString();
    if (!data.created_at) {
      data.created_at = data.updated_at;
    }

    fs.writeFileSync(paths.specJsonPath, JSON.stringify(data, null, 2), 'utf8');

    if (markdownContent !== undefined) {
      fs.writeFileSync(paths.specMdPath, markdownContent, 'utf8');
    }
  }

  /**
   * Renders canonical Spec Markdown from template (if available) or structured fallback
   */
  renderSpecMarkdown(params: {
    slug: string;
    title: string;
    targetFolder: string;
    subagents: string[];
    approvedSkills?: string[];
    icp: string;
    goal: string;
    dateStr: string;
    state: string;
    executionEngine?: 'native_squad' | 'teamwork_preview';
    verificationCommand?: string;
  }): string {
    const skillsList =
      params.approvedSkills && params.approvedSkills.length > 0
        ? params.approvedSkills
        : ['yc-insight-driven-bp'];
    const teamworkSection =
      params.executionEngine === 'teamwork_preview'
        ? `\n\n## 10. Verification Resources (Teamwork Forcing Function)\n- **Motor de Ejecución:** \`teamwork_preview\` (*Specify What, Not How*)\n- **Oráculo Programático Obligatorio:** \`${params.verificationCommand || `node BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts evaluate ${params.slug} "BRIDS-Brain/00 Inbox/Specs/${params.slug}-work/draft_cycle_1.md"`}\`\n`
        : '';
    const templatePath = path.join(this.templatesDir, 'deliverable-spec-template.md');
    if (fs.existsSync(templatePath)) {
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const primaryAgent = params.subagents[0] || 'founder-ghostwriter';
      const secondaryAgent = params.subagents.slice(1).join(', ') || 'business-consultant';
      const rendered = templateContent
        .replace(/\{\{SLUG\}\}/g, params.slug)
        .replace(/\{\{TITLE\}\}/g, params.title)
        .replace(/\{\{CATEGORY_FOLDER\}\}/g, params.targetFolder)
        .replace(/\{\{FILENAME\}\}/g, params.slug)
        .replace(/\{\{PRIMARY_AGENT\}\}/g, primaryAgent)
        .replace(/\{\{SECONDARY_AGENT\}\}/g, secondaryAgent)
        .replace(/\{\{DATE\}\}/g, params.dateStr)
        .replace(/\{\{EXECUTIVE_SUMMARY\}\}/g, params.goal || `Especificación formal para ${params.title}`)
        .replace(/\{\{BUSINESS_GOAL\}\}/g, params.goal || `Consolidar ${params.title} con rigurosidad técnica y tracción medible.`)
        .replace(/\{\{TARGET_ICP\}\}/g, params.icp || 'Real Estate Sponsors, Institutional LPs, YC Partners')
        .replace(/\{\{PRIMARY_CTA\}\}/g, 'Agendar sesión técnica de estructuración / Revisar Data Room')
        .replace(/\{\{PRIMARY_KPI\}\}/g, 'Tasa de respuesta calificada >= 20%')
        .replace(/\{\{REFERENCE_DOC_1\}\}/g, `Skills Aprobadas (HITL-0): ${skillsList.join(', ')}`)
        .replace(/\{\{REFERENCE_DOC_2\}\}/g, 'Estructura Legal Delaware C-Corp vs SPV LLC & Metaplex Core')
        .replace(/\{\{WORD_COUNT_RANGE\}\}/g, '400 - 800');
      return `${rendered}\n\n## 9. Skills Aprobadas (HITL-0) e Integradas en el Spec\n${skillsList.map((s) => `- \`${s}\``).join('\n')}${teamworkSection}\n`;
    }

    return (
      `# Spec: ${params.title}\n\n` +
      `- **Slug:** ${params.slug}\n` +
      `- **Objetivo:** ${params.goal || params.title}\n` +
      `- **Público Objetivo (ICP):** ${params.icp}\n` +
      `- **Subagentes Asignados:** ${params.subagents.join(', ')}\n` +
      `- **Skills Aprobadas (HITL-0):** ${skillsList.join(', ')}\n` +
      `- **Destino Canónico:** ${params.targetFolder}/${params.slug}.md\n` +
      `- **Estado:** ${params.state}\n\n` +
      `## Desglose Estructural (Outline) & Criterios de Aceptación Verificables\n` +
      `1. Cobertura completa de la propuesta de valor y economía unitaria aplicando ${skillsList.join(', ')}.\n` +
      `2. Veracidad técnica con anclas on-chain (Solana, Metaplex Core, Delaware SPV).\n` +
      `3. Cero clichés de LLM y tono directo de fundador YC.` +
      `${teamworkSection}\n`
    );
  }

  /**
   * Saves the canonical Teamwork prompt_draft.md inside the Spec work directory
   */
  saveTeamworkPromptDraft(slug: string, promptContent: string): string {
    const paths = this.getSpecPaths(slug);
    this.ensureDir(paths.workDir);
    const draftPath = path.join(paths.workDir, 'prompt_draft.md');
    fs.writeFileSync(draftPath, promptContent, 'utf8');
    return draftPath;
  }

  /**
   * Snapshots the approved specification in the work directory (HITL-1)
   */
  snapshotApprovedSpec(slug: string): string {
    const paths = this.getSpecPaths(slug);
    this.ensureDir(paths.workDir);
    let currentMd = '';
    if (fs.existsSync(paths.specMdPath)) {
      currentMd = fs.readFileSync(paths.specMdPath, 'utf8');
      currentMd = currentMd.replace(/^status:\s*[a-z_]+/m, 'status: spec_approved');
      currentMd = currentMd.replace(/- \[ \] \*\*STEP-01/, '- [x] **STEP-01');
      fs.writeFileSync(paths.specMdPath, currentMd, 'utf8');
    }
    fs.writeFileSync(paths.approvedSpecPath, currentMd, 'utf8');
    return paths.approvedSpecPath;
  }

  /**
   * Appends user refinement feedback to the Spec Markdown
   */
  appendSpecFeedback(slug: string, dateStr: string, userFeedback: string): void {
    const paths = this.getSpecPaths(slug);
    if (!fs.existsSync(paths.specMdPath)) return;
    let md = fs.readFileSync(paths.specMdPath, 'utf8');
    const adjustmentBlock = `\n\n### 📝 Ajustes Solicitados por el Usuario (${dateStr})\n- ${userFeedback}\n`;
    if (md.includes('## 5. Desglose Estructural (Outline)')) {
      md = md.replace('## 5. Desglose Estructural (Outline)', `${adjustmentBlock}\n## 5. Desglose Estructural (Outline)`);
    } else {
      md += adjustmentBlock;
    }
    fs.writeFileSync(paths.specMdPath, md, 'utf8');
  }

  /**
   * Saves a draft cycle in the work directory and optionally promotes it to approved_draft.md
   */
  saveDraftCycle(
    slug: string,
    cycle: number,
    draftContent: string,
    isApproved: boolean = false,
    finalScore?: number
  ): { draftPath: string; approvedDraftPath?: string } {
    const paths = this.getSpecPaths(slug);
    this.ensureDir(paths.workDir);
    const draftPath = path.join(paths.workDir, `draft_cycle_${cycle}.md`);
    fs.writeFileSync(draftPath, draftContent, 'utf8');

    if (isApproved) {
      fs.writeFileSync(paths.approvedDraftPath, draftContent, 'utf8');
      if (fs.existsSync(paths.specMdPath)) {
        let md = fs.readFileSync(paths.specMdPath, 'utf8');
        md = md.replace(/^status:\s*[a-z_]+/m, 'status: deliverable_review');
        if (finalScore !== undefined) {
          md = md.replace(/final_score:\s*.*/m, `final_score: ${finalScore}`);
        }
        md = md.replace(/- \[ \] \*\*STEP-02/, '- [x] **STEP-02');
        md = md.replace(/- \[ \] \*\*STEP-03/, '- [x] **STEP-03');
        fs.writeFileSync(paths.specMdPath, md, 'utf8');
      }
      return { draftPath, approvedDraftPath: paths.approvedDraftPath };
    }

    return { draftPath };
  }

  /**
   * Saves the adversarial validator's JSON report for a specific cycle
   */
  saveCriticismReport(slug: string, cycle: number, report: unknown): string {
    const paths = this.getSpecPaths(slug);
    this.ensureDir(paths.workDir);
    const reportFile = path.join(paths.workDir, `criticism_cycle_${cycle}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf8');
    return reportFile;
  }

  /**
   * Loads the approved draft or falls back to the latest cycle draft
   */
  loadLatestDraft(slug: string, fallbackCycle: number = 1): string | null {
    const paths = this.getSpecPaths(slug);
    if (fs.existsSync(paths.approvedDraftPath)) {
      return fs.readFileSync(paths.approvedDraftPath, 'utf8');
    }
    const cycleFile = path.join(paths.workDir, `draft_cycle_${fallbackCycle}.md`);
    if (fs.existsSync(cycleFile)) {
      return fs.readFileSync(cycleFile, 'utf8');
    }
    return null;
  }

  /**
   * Marks the Spec Markdown as completed upon HITL-2 approval
   */
  markSpecMarkdownCompleted(slug: string): void {
    const paths = this.getSpecPaths(slug);
    if (fs.existsSync(paths.specMdPath)) {
      let md = fs.readFileSync(paths.specMdPath, 'utf8');
      md = md.replace(/^status:\s*[a-z_]+/m, 'status: completed');
      md = md.replace(/- \[ \] \*\*STEP-04/, '- [x] **STEP-04');
      md = md.replace(/- \[ \] \*\*STEP-05/, '- [x] **STEP-05');
      fs.writeFileSync(paths.specMdPath, md, 'utf8');
    }
  }

  /**
   * Saves a Structured Handoff artifact from a Serial Worker in <slug>-work/
   */
  saveWorkerHandoff(slug: string, handoff: StructuredHandoff): string {
    const paths = this.getSpecPaths(slug);
    this.ensureDir(paths.workDir);
    const safeWorker = this.sanitizeSlug(handoff.worker_id);
    const handoffFile = path.join(paths.workDir, `handoff_step_${handoff.step_index}_${safeWorker}.json`);
    fs.writeFileSync(handoffFile, JSON.stringify(handoff, null, 2), 'utf8');
    return handoffFile;
  }

  /**
   * Creates a timestamped safety backup in 00 Inbox/Archive before modifying a note.
   * Enforces the non-destructive content refinement rule.
   */
  createSafetyBackup(targetPath: string): string | null {
    if (!fs.existsSync(targetPath)) {
      return null;
    }

    this.ensureDir(this.archiveDir);
    const parsed = path.parse(targetPath);
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const backupFileName = `${parsed.name}-bak-${timestamp}${parsed.ext}`;
    const backupPath = path.join(this.archiveDir, backupFileName);

    fs.copyFileSync(targetPath, backupPath);
    return backupPath;
  }

  /**
   * Restores a file from its most recent safety backup in 00 Inbox/Archive.
   */
  rollbackLatestBackup(targetPath: string): string | null {
    this.ensureDir(this.archiveDir);
    const parsed = path.parse(targetPath);
    const baseName = path.basename(targetPath);
    const backups = fs
      .readdirSync(this.archiveDir)
      .filter(
        (f) =>
          (f.startsWith(`${parsed.name}-bak-`) && f.endsWith(parsed.ext)) ||
          (f.startsWith(baseName) && f.endsWith('.bak.md'))
      )
      .sort()
      .reverse();

    if (backups.length === 0) {
      return null;
    }

    const latestBackup = path.join(this.archiveDir, backups[0]!);
    fs.copyFileSync(latestBackup, targetPath);
    return latestBackup;
  }

  /**
   * Commits deliverable to canonical production folder in BRIDS-Brain
   */
  commitDeliverable(
    slug: string,
    content: string,
    targetFolder?: string
  ): { targetPath: string; backupPath: string | null } {
    const cleanSlug = this.sanitizeSlug(slug);
    let folder = targetFolder;
    if (!folder && this.specExists(cleanSlug)) {
      const loaded = this.loadSpec(cleanSlug);
      folder = loaded.data.target_folder || loaded.data.target_vault_folder;
    }
    const resolvedFolder = folder || '01 Negocio/01 Estrategia & Modelo';
    const destDir = path.join(this.vaultDir, resolvedFolder);
    this.ensureDir(destDir);

    const fileName = `${cleanSlug}.md`;
    const targetPath = path.join(destDir, fileName);

    const backupPath = this.createSafetyBackup(targetPath);
    fs.writeFileSync(targetPath, content, 'utf8');

    return { targetPath, backupPath };
  }

  /**
   * Formats a finalized deliverable note with canonical Obsidian YAML frontmatter, SDD/HITL seals, and changelog
   */
  formatFinalVaultNote(
    specData: Partial<TaskSpecData> & Record<string, unknown>,
    rawDraft: string,
    report: { total_score: number | null; passing_threshold: number }
  ): string {
    const now = new Date().toISOString().split('T')[0]!;
    const agents = specData.subagents_involved || specData.subagents || ['founder-ghostwriter'];
    const category = specData.target_vault_folder || specData.target_folder || '01 Negocio/01 Estrategia & Modelo';
    const h1At = specData.hitl_checkpoints?.hitl_1_spec_approval?.approved_at || now;
    const h2At = specData.hitl_checkpoints?.hitl_2_deliverable_approval?.approved_at || now;
    const cycles = specData.evaluation?.current_cycle || specData.iteration || 1;

    return `---
title: "${specData.title}"
spec_id: "${specData.spec_id || specData.id}"
category: "${category}"
author_agents:
${agents.map((a: string) => `  - "${a}"`).join('\n')}
reviewer_agent: "sdd-reviewer"
quality_score: ${report.total_score}
quality_threshold: ${report.passing_threshold}
hitl_1_approved_at: "${h1At}"
hitl_2_approved_at: "${h2At}"
status: approved
version: "1.0"
created_at: ${now}
updated_at: ${now}
tags:
  - brids
  - sdd-approved
  - hitl-validated
  - deliverable
---

# ${specData.title}

> [!NOTE]
> **Aprobación Integral SDD + HITL:** Validado por el motor Evaluador-Optimizador (**${report.total_score}/9.0**) y con doble aprobación humana (**HITL-1 Spec** y **HITL-2 Deliverable**).
> **Sub-Agentes Autores:** ${agents.map((a: string) => `\`${a}\``).join(', ')} | **Revisor:** \`sdd-reviewer\`

${rawDraft.replace(/^---[\s\S]*?---\s*/, '')}

## 🔄 Historial de Revisiones SDD (Changelog)
- **v1.0 (${now}):** Aprobado por el usuario e integrado en el vault tras ${cycles} ciclos de optimización con nota de ${report.total_score}/9.0.

## 🔗 Trazabilidad
- Artefacto de Especificación: [[00 Inbox/Specs/${specData.slug}.spec.md]]
- Contexto de Marca: [[01 Brand Context/product-marketing-context.md]]
`;
  }

  /**
   * Lists all active specifications in 00 Inbox/Specs
   */
  listSpecs(): Array<{ slug: string; title: string; status: string; data: TaskSpecData }> {
    this.ensureDir(this.specsDir);
    const entries = fs.readdirSync(this.specsDir).filter((f) => f.endsWith('.spec.json'));
    const results: Array<{ slug: string; title: string; status: string; data: TaskSpecData }> = [];

    for (const file of entries) {
      try {
        const fullPath = path.join(this.specsDir, file);
        const data: TaskSpecData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        results.push({
          slug: data.slug || path.basename(file, '.spec.json'),
          title: data.title || '',
          status: data.status || 'unknown',
          data,
        });
      } catch {
        // Ignore malformed JSON files
      }
    }
    return results;
  }
}
