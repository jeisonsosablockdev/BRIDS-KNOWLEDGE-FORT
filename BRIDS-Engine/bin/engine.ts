#!/usr/bin/env node

/**
 * BRIDS-Engine Unified CLI (TypeScript Domain Architecture)
 * Single, type-safe entrypoint for SDD, Ingest, Vault, Audit, Social, and Test domains.
 *
 * Usage:
 *   node BRIDS-Engine/bin/engine.ts <command> [args]
 *
 * @spec SPEC-BRIDS-001 & SPEC-SCRIPTS-005
 */

import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { TaskOrchestrator } from '../core/orchestrator.ts';
import { VaultGateway } from '../core/vault-gateway.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const orchestrator = new TaskOrchestrator();
const vault: VaultGateway = orchestrator.getVault();

const args = process.argv.slice(2);
const command = args[0] || 'help';

function printHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║               🏛️  BRIDS-ENGINE CLI RUNNER  v2.0                   ║
║           Harness Modular para RWA, Venture & YC Preparation      ║
╚═══════════════════════════════════════════════════════════════════╝

Dominios Principales (BRIDS-Engine/scripts/):
  1. sdd / task <init|preview|approve-spec|evaluate|loop-task|review-deliverable|approve-deliverable|status|list>
     Orquestador del ciclo de vida SDD con doble guardrail HITL y sesiones de tareas.

  2. ingest <docs|narrative|context> [args]
     Ingesta de documentación técnica (OKF), inteligencia narrativa y sincronización de contexto/skills.

  3. vault <search|refine|export|specs|validate> [args]
     Operaciones de bóveda: búsqueda in-memory, refinamiento no destructivo y exportación a PDF.

  4. audit [compliance|vault|context|skills|squad|narrative]
     Suite unificada de gobernanza, cumplimiento anti-deriva y validación de 58 skills.

  5. social <grid|post|carousel|assets> [args]
     Generación de posts, carruseles de 4 slides, sincronización de parrilla y prompts visuales.

  6. promote <feature [feat/nombre]|main> [--push]
     Promoción jerárquica con guardrails deterministas: feat/<feature> -> develop -> main.

  7. test [unit|smoke|idempotency|agent-reach|all]
     Ejecuta las suites de pruebas en TypeScript puro.
`);
}

function runTsScript(relPath: string, scriptArgs: string[]) {
  const scriptPath = path.join(__dirname, relPath);
  const quoted = scriptArgs.map(a => `"${a}"`).join(' ');
  try {
    execSync(`node "${scriptPath}" ${quoted}`, { stdio: 'inherit' });
  } catch (err: any) {
    process.exit(err.status || 1);
  }
}

switch (command) {
  case 'promote': {
    runTsScript('../scripts/sdd/sdd-orchestrator.ts', ['promote', ...args.slice(1)]);
    break;
  }
  case 'task':
  case 'sdd': {
    if (args.length <= 1) {
      printHelp();
      process.exit(1);
    }
    runTsScript('../scripts/sdd/sdd-orchestrator.ts', args.slice(1));
    break;
  }
  case 'ingest': {
    const sub = args[1] || 'context';
    const rest = args.slice(2);
    if (sub === 'docs') {
      runTsScript('../scripts/ingest/sync-technical-docs.ts', rest);
    } else if (sub === 'narrative') {
      runTsScript('../scripts/ingest/sync-narrative-intelligence.ts', rest);
    } else {
      runTsScript('../scripts/ingest/sync-workspace-context.ts', rest);
    }
    break;
  }
  case 'vault': {
    const sub = args[1];
    const rest = args.slice(2);
    if (sub === 'search') {
      runTsScript('../scripts/vault/vault-search.ts', rest);
    } else if (sub === 'refine') {
      runTsScript('../scripts/vault/refine-note.ts', rest);
    } else if (sub === 'export') {
      runTsScript('../scripts/vault/export-pdf.ts', rest);
    } else if (sub === 'specs') {
      const specs = vault.listSpecs();
      console.log(`\n📋 Especificaciones Activas en BRIDS-Brain (${specs.length}):`);
      for (const spec of specs) {
        console.log(`   • [${spec.status.padEnd(18)}] ${spec.slug.padEnd(25)} : ${spec.title}`);
      }
      console.log('');
    } else if (sub === 'validate') {
      runTsScript('../scripts/audit/audit-runner.ts', ['vault']);
    } else {
      console.log('Uso: engine vault <search|refine|export|specs|validate> [args]');
    }
    break;
  }
  case 'audit': {
    runTsScript('../scripts/audit/audit-runner.ts', args.slice(1));
    break;
  }
  case 'social': {
    runTsScript('../scripts/social/social-generator.ts', args.slice(1));
    break;
  }
  case 'export': {
    const sub = args[1];
    const rest = args.slice(2);
    if (sub === 'pdf') {
      runTsScript('../scripts/vault/export-pdf.ts', rest);
    } else {
      console.log('Uso: engine export pdf <archivo.md|archivo.tex> [out.pdf]');
    }
    break;
  }
  case 'skills': {
    const sub = args[1] || 'validate';
    if (sub === 'validate') {
      runTsScript('../scripts/audit/audit-runner.ts', ['skills']);
    } else if (sub === 'enable') {
      runTsScript('../scripts/ingest/sync-workspace-context.ts', ['skills']);
    } else {
      console.log('Uso: engine skills <validate|enable>');
    }
    break;
  }
  case 'test': {
    const sub = args[1] || 'unit';
    const unitDir = path.join(__dirname, '../tests/unit');
    if (sub === 'unit') {
      execSync(`node --test "${unitDir}"/*.test.ts`, { stdio: 'inherit' });
    } else if (sub === 'smoke') {
      runTsScript('../tests/smoke-test.ts', []);
    } else if (sub === 'idempotency') {
      runTsScript('../tests/test-idempotency.ts', []);
    } else if (sub === 'agent-reach') {
      runTsScript('../tests/test-agent-reach-integration.ts', []);
    } else if (sub === 'all') {
      execSync(`node --test "${unitDir}"/*.test.ts`, { stdio: 'inherit' });
      runTsScript('../tests/smoke-test.ts', []);
      runTsScript('../tests/test-idempotency.ts', []);
      runTsScript('../tests/test-agent-reach-integration.ts', []);
    } else {
      console.log('Uso: engine test [unit|smoke|idempotency|agent-reach|all]');
    }
    break;
  }
  case 'help':
  default:
    printHelp();
    break;
}
