#!/usr/bin/env node

/**
 * Non-Destructive Refinement & Content Governance CLI for BRIDS (TypeScript)
 * Ensures notes are never accidentally wiped, takes safety snapshots,
 * manages incremental versioning, and appends to the document Changelog.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VaultGateway, parseFrontmatter, type ParsedMarkdown } from '../../core/vault-gateway.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../..');
const VAULT_ROOT = path.join(ROOT_DIR, 'BRIDS-Brain');
const vaultGateway = new VaultGateway(VAULT_ROOT);

export function resolveVaultPath(inputPath: string): string {
  if (path.isAbsolute(inputPath)) {
    return inputPath;
  }
  const directPath = path.join(ROOT_DIR, inputPath);
  if (fs.existsSync(directPath)) return directPath;
  return path.join(VAULT_ROOT, inputPath);
}

export function createSnapshot(filePath: string): string {
  return vaultGateway.createSafetyBackup(filePath) || '';
}

export type { ParsedMarkdown };
export const parseMarkdown = parseFrontmatter;

export function bumpVersion(currentVersion?: string, bumpType: string = 'minor'): string {
  if (!currentVersion) return '1.1';
  const parts = String(currentVersion).split('.').map(Number);
  if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return '1.1';

  let [major, minor] = parts as [number, number];
  if (bumpType === 'major') {
    major += 1;
    minor = 0;
  } else {
    minor += 1;
  }
  return `${major}.${minor}`;
}

export function cmdInspect(targetInput?: string): void {
  if (!targetInput) {
    console.error('Uso: refine-note inspect <ruta-del-archivo>');
    process.exit(1);
  }
  const filePath = resolveVaultPath(targetInput);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: El archivo no existe en ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const { frontmatter, body, hasFrontmatter } = parseMarkdown(content);
  const headings = (body.match(/^#{1,3}\s+.+$/gm) || []).map((h) => h.trim());

  console.log('\n' + '═'.repeat(75));
  console.log(`📄 AUDITORÍA DE CONTENIDO: ${path.basename(filePath)}`);
  console.log('═'.repeat(75));
  console.log(`📍 Ruta:     ${filePath}`);
  console.log(`🏷️ Frontmatter: ${hasFrontmatter ? 'Presente' : 'Sin Frontmatter'}`);
  if (hasFrontmatter) {
    console.log(`   • Título:    ${frontmatter.title || 'N/A'}`);
    console.log(`   • Versión:   ${frontmatter.version || '1.0'}`);
    console.log(`   • Estado:    ${frontmatter.status || 'draft'}`);
    console.log(`   • Workflow:  ${frontmatter.workflow || 'N/A'}`);
  }
  console.log(`\n📑 Secciones y Encabezados Detectados (${headings.length}):`);
  for (const h of headings) {
    console.log(`   ${h}`);
  }
  console.log('═'.repeat(75) + '\n');
}

export function cmdBackup(targetInput?: string): void {
  if (!targetInput) {
    console.error('Uso: refine-note backup <ruta-del-archivo>');
    process.exit(1);
  }
  const filePath = resolveVaultPath(targetInput);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: El archivo no existe en ${filePath}`);
    process.exit(1);
  }

  const snapshotPath = createSnapshot(filePath);
  console.log(`\n🛡️ Snapshot de seguridad creado exitosamente:`);
  console.log(`   Origen:  ${filePath}`);
  console.log(`   Copia:   ${snapshotPath}\n`);
}

export function cmdRefine(targetInput?: string, changeSummary?: string, bumpType: string = 'minor'): void {
  if (!targetInput || !changeSummary) {
    console.error('Uso: refine-note refine <ruta-del-archivo> "<resumen-del-refinamiento>" [minor|major]');
    process.exit(1);
  }

  const filePath = resolveVaultPath(targetInput);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: El archivo no existe en ${filePath}`);
    process.exit(1);
  }

  const snapshotPath = createSnapshot(filePath);
  let content = fs.readFileSync(filePath, 'utf8');
  const { frontmatter, hasFrontmatter } = parseMarkdown(content);

  const currentVersion = frontmatter.version || '1.0';
  const newVersion = bumpVersion(currentVersion, bumpType);
  const now = new Date().toISOString().split('T')[0]!;

  if (hasFrontmatter) {
    content = content.replace(/^version:\s*.*$/m, `version: "${newVersion}"`);
    if (!content.includes('version:')) {
      content = content.replace(/^---\r?\n/, `---\nversion: "${newVersion}"\n`);
    }
    content = content.replace(/^updated_at:\s*.*$/m, `updated_at: ${now}`);
    if (!content.includes('updated_at:')) {
      content = content.replace(/^---\r?\n/, `---\nupdated_at: ${now}\n`);
    }
  }

  const changelogEntry = `- **v${newVersion} (${now}):** ${changeSummary.trim()}`;
  if (content.includes('## 🔄 Historial de Revisiones (Changelog)')) {
    content = content.replace(
      '## 🔄 Historial de Revisiones (Changelog)',
      `## 🔄 Historial de Revisiones (Changelog)\n${changelogEntry}`
    );
  } else if (content.includes('## Historial de Revisiones')) {
    content = content.replace(
      '## Historial de Revisiones',
      `## Historial de Revisiones\n${changelogEntry}`
    );
  } else if (content.includes('## 🔗 Referencias Cruzadas')) {
    content = content.replace(
      '## 🔗 Referencias Cruzadas',
      `## 🔄 Historial de Revisiones (Changelog)\n${changelogEntry}\n\n## 🔗 Referencias Cruzadas`
    );
  } else {
    content += `\n\n## 🔄 Historial de Revisiones (Changelog)\n${changelogEntry}\n`;
  }

  fs.writeFileSync(filePath, content, 'utf8');

  console.log(`\n✨ Documento refinado con éxito (No-Destructivo):`);
  console.log(`   Archivo:       ${filePath}`);
  console.log(`   Versión:       v${currentVersion} ➔ v${newVersion}`);
  console.log(`   Registro:      ${changelogEntry}`);
  console.log(`   Snapshot Prev: ${snapshotPath}\n`);
}

export function cmdBranchVersion(targetInput?: string, newVersionLabel?: string, purpose?: string): void {
  if (!targetInput || !newVersionLabel) {
    console.error('Uso: refine-note branch <ruta-del-archivo> <v2|v3|nueva-etiqueta> "[proposito]"');
    process.exit(1);
  }

  const filePath = resolveVaultPath(targetInput);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: El archivo no existe en ${filePath}`);
    process.exit(1);
  }

  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseNoExt = path.basename(filePath, ext).replace(/-v\d+.*$/, '');
  const now = new Date().toISOString().split('T')[0]!;
  const newFileName = `${baseNoExt}-${newVersionLabel}-${now}${ext}`;
  const newFilePath = path.join(dir, newFileName);

  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/^version:\s*.*$/m, `version: "2.0"`);
  content = content.replace(/^created_at:\s*.*$/m, `created_at: ${now}`);
  content = content.replace(/^updated_at:\s*.*$/m, `updated_at: ${now}`);

  const changelogEntry = `- **v2.0 (${now}):** Nueva ramificación independiente: ${purpose || 'Nueva versión'}`;
  if (content.includes('## 🔄 Historial de Revisiones (Changelog)')) {
    content = content.replace(
      '## 🔄 Historial de Revisiones (Changelog)',
      `## 🔄 Historial de Revisiones (Changelog)\n${changelogEntry}`
    );
  }

  fs.writeFileSync(newFilePath, content, 'utf8');
  console.log(`\n🌱 Nueva versión ramificada creada (Original preservado intacto):`);
  console.log(`   Original: ${filePath}`);
  console.log(`   Nuevo:    ${newFilePath}\n`);
}

export function cmdRollback(targetInput?: string): void {
  if (!targetInput) {
    console.error('Uso: refine-note rollback <ruta-del-archivo>');
    process.exit(1);
  }
  const filePath = resolveVaultPath(targetInput);
  const baseName = path.basename(filePath);

  const latestBackup = vaultGateway.rollbackLatestBackup(filePath);
  if (!latestBackup) {
    console.error(`❌ No se encontraron snapshots de respaldo para "${baseName}" en 00 Inbox/Archive.`);
    process.exit(1);
  }

  console.log(`\n⏪ Documento restaurado exitosamente desde el snapshot más reciente:`);
  console.log(`   Restaurado en: ${filePath}`);
  console.log(`   Desde backup:  ${latestBackup}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case 'inspect':
      cmdInspect(args[0]);
      break;
    case 'backup':
      cmdBackup(args[0]);
      break;
    case 'refine':
      cmdRefine(args[0], args[1], args[2]);
      break;
    case 'branch':
    case 'version':
      cmdBranchVersion(args[0], args[1], args[2]);
      break;
    case 'rollback':
    case 'restore':
      cmdRollback(args[0]);
      break;
    default:
      console.log(`
Non-Destructive Refinement & Content Governance CLI (BRIDS)

Comandos disponibles:
  inspect   <ruta>                            Audita el estado, frontmatter y secciones del archivo
  backup    <ruta>                            Crea un snapshot de seguridad en 00 Inbox/Archive/
  refine    <ruta> "<resumen>" [minor|major]  Actualiza versión, registra changelog y crea snapshot previo
  branch    <ruta> <v2|v3> "[proposito]"      Crea una nueva versión manteniendo el original intacto
  rollback  <ruta>                            Restaura el archivo al snapshot de seguridad más reciente
`);
      break;
  }
}
