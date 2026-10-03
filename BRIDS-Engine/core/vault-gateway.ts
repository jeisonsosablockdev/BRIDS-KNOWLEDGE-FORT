/**
 * Vault Gateway: Pure abstraction for BRIDS-Brain filesystem operations.
 * Enforces non-destructive safety backups, spec lifecycle storage, and deliverable commitments.
 * 
 * @spec SPEC-001 (Ported & adapted from Academic-Engine architecture)
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

  private ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
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
   * Commits deliverable to canonical production folder in BRIDS-Brain
   */
  commitDeliverable(slug: string, content: string, targetFolder?: string): { targetPath: string; backupPath: string | null } {
    const loaded = this.loadSpec(slug);
    const folder = targetFolder || loaded.data.target_folder || '01 Negocio/01 Estrategia & Modelo';
    const destDir = path.join(this.vaultDir, folder);
    this.ensureDir(destDir);

    const fileName = `${loaded.paths.slug}.md`;
    const targetPath = path.join(destDir, fileName);

    const backupPath = this.createSafetyBackup(targetPath);
    fs.writeFileSync(targetPath, content, 'utf8');

    return { targetPath, backupPath };
  }
}
