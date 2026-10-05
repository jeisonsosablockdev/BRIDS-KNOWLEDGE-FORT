/**
 * Vault Gateway: Pure abstraction for BRIDS-Brain filesystem operations.
 * Enforces non-destructive safety backups, spec lifecycle storage, and deliverable commitments.
 * 
 * @spec SPEC-BRIDS-001 (BRIDS-Engine Clean Architecture — Solana RWA & YC Venture)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface SpecPaths {
  slug: string;
  specId: string;
  specMdPath: string;
  specJsonPath: string;
  workDir: string;
  approvedSpecPath: string;
  approvedDraftPath: string;
}

export interface TaskSpecData {
  slug: string;
  title: string;
  target_folder: string;
  subagents: string[];
  icp: string;
  goal: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  iteration?: number;
  evaluation?: {
    current_cycle: number;
    max_cycles: number;
    passing_threshold: number;
    history: any[];
  };
  evaluations?: any[];
  [key: string]: any;
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
      approvedDraftPath: path.join(this.specsDir, `${cleanSlug}-work`, 'approved_draft.md')
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
    return { data, paths };
  }

  saveSpec(slug: string, data: TaskSpecData, markdownContent?: string): void {
    const paths = this.getSpecPaths(slug);
    this.ensureDir(path.dirname(paths.specJsonPath));

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
    const backups = fs.readdirSync(this.archiveDir)
      .filter(f =>
        (f.startsWith(`${parsed.name}-bak-`) && f.endsWith(parsed.ext)) ||
        (f.startsWith(baseName) && f.endsWith('.bak.md'))
      )
      .sort()
      .reverse();

    if (backups.length === 0) {
      return null;
    }

    const latestBackup = path.join(this.archiveDir, backups[0]);
    fs.copyFileSync(latestBackup, targetPath);
    return latestBackup;
  }

  /**
   * Commits deliverable to canonical production folder in BRIDS-Brain
   */
  commitDeliverable(slug: string, content: string, targetFolder?: string): { targetPath: string; backupPath: string | null } {
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
  formatFinalVaultNote(specData: any, rawDraft: string, report: { total_score: number | null; passing_threshold: number }): string {
    const now = new Date().toISOString().split('T')[0];
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
    const entries = fs.readdirSync(this.specsDir).filter(f => f.endsWith('.spec.json'));
    const results: Array<{ slug: string; title: string; status: string; data: TaskSpecData }> = [];

    for (const file of entries) {
      try {
        const fullPath = path.join(this.specsDir, file);
        const data: TaskSpecData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        results.push({
          slug: data.slug || path.basename(file, '.spec.json'),
          title: data.title || '',
          status: data.status || 'unknown',
          data
        });
      } catch {
        // Ignore malformed JSON files
      }
    }
    return results;
  }
}

