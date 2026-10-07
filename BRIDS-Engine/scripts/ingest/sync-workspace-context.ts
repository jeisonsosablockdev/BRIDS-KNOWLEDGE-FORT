#!/usr/bin/env node

/**
 * sync-workspace-context.ts
 * Unifies Brand Context Vault Symlink (`sync-brand-context`) and Project Skills Activation (`enable-project-skills`)
 * in pure cross-platform TypeScript.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../..');
const ENGINE_DIR = path.join(ROOT_DIR, 'BRIDS-Engine');
const BRAIN_DIR = path.join(ROOT_DIR, 'BRIDS-Brain');
const AGENTS_CONFIG_DIR = path.join(ROOT_DIR, '.agents');

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

export function enableProjectSkills(_mode: string = 'safe'): { linked: number; skipped: number } {
  const localSkillsDir = path.join(ENGINE_DIR, 'skills');
  const skillsJsonPath = path.join(AGENTS_CONFIG_DIR, 'skills.json');

  fs.mkdirSync(AGENTS_CONFIG_DIR, { recursive: true });

  const canonicalConfig = {
    entries: [{ path: 'BRIDS-Engine/skills' }],
  };

  fs.writeFileSync(skillsJsonPath, JSON.stringify(canonicalConfig, null, 2) + '\n', 'utf8');

  let linked = 0;
  let skipped = 0;

  if (fs.existsSync(localSkillsDir)) {
    const entries = fs.readdirSync(localSkillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const skillMd = path.join(localSkillsDir, entry.name, 'SKILL.md');
      if (fs.existsSync(skillMd)) {
        linked++;
      } else {
        skipped++;
      }
    }
  }

  console.log(`Activated ${linked} project skills for Google Antigravity via .agents/skills.json:`);
  console.log(`  ${skillsJsonPath} -> BRIDS-Engine/skills`);
  console.log('Done.');
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
