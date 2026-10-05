#!/usr/bin/env node

/**
 * sync-workspace-context.ts
 * Unifies Brand Context Vault Symlink (`sync-brand-context`) and Project Skills Activation (`enable-project-skills`)
 * in pure cross-platform TypeScript.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../..');
const ENGINE_DIR = path.join(ROOT_DIR, 'BRIDS-Engine');
const BRAIN_DIR = path.join(ROOT_DIR, 'BRIDS-Brain');

export function syncBrandContext(): string {
  const targetDir = path.join(BRAIN_DIR, '02 Marketing', '01 Contexto de Marca');
  fs.mkdirSync(targetDir, { recursive: true });
  const target = path.join(targetDir, 'product-marketing-context.md');
  const relativeSource = '../../../BRIDS-Engine/context/product-marketing-context.md';

  try {
    const stat = fs.lstatSync(target);
    if (stat.isSymbolicLink() || stat.isFile()) {
      fs.unlinkSync(target);
    }
  } catch {
    // target does not exist yet
  }

  fs.symlinkSync(relativeSource, target);
  console.log('Linked brand context into vault:');
  console.log(`  ${target} -> ${relativeSource}`);
  return target;
}

export function enableProjectSkills(mode: string = 'safe'): { linked: number; skipped: number } {
  const codexSkillsDir = path.join(os.homedir(), '.codex', 'skills');
  const localSkillsDir = path.join(ENGINE_DIR, 'skills');

  fs.mkdirSync(codexSkillsDir, { recursive: true });

  console.log('Activating project skills from:');
  console.log(`  local: ${localSkillsDir}\n`);

  let linked = 0;
  let skipped = 0;

  if (fs.existsSync(localSkillsDir)) {
    const entries = fs.readdirSync(localSkillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillName = entry.name;
      const sourceDir = path.join(localSkillsDir, skillName);
      const target = path.join(codexSkillsDir, skillName);

      let exists = false;
      try {
        fs.lstatSync(target);
        exists = true;
      } catch {
        exists = false;
      }

      if (exists) {
        if (mode === '--force' || mode === 'force') {
          fs.rmSync(target, { recursive: true, force: true });
        } else {
          console.log(`skip  ${skillName} (already exists in ~/.codex/skills)`);
          skipped++;
          continue;
        }
      }

      fs.symlinkSync(sourceDir, target, 'dir');
      console.log(`link  ${skillName} -> ${sourceDir}`);
      linked++;
    }
  }

  console.log('\nDone.');
  console.log("Use '--force' to replace existing ~/.codex/skills entries with the project versions.");
  return { linked, skipped };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const [, , subcommand, flag] = process.argv;
  if (subcommand === 'brand') {
    syncBrandContext();
  } else if (subcommand === 'skills') {
    enableProjectSkills(flag || 'safe');
  } else if (subcommand === '--force') {
    syncBrandContext();
    enableProjectSkills('--force');
  } else {
    syncBrandContext();
    if (subcommand === 'all') {
      enableProjectSkills(flag || 'safe');
    }
  }
}
