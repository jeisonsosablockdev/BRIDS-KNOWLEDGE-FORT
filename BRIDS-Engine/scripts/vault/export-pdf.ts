#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📄 BRIDS KNOWLEDGE FORT - UNIFIED LATEX & PDF EXPORT ENGINE (TypeScript)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ensureDir } from '../../core/vault-gateway.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../..');
const ENGINE_DIR = path.join(ROOT_DIR, 'BRIDS-Engine');
const BRAND_DIR = path.join(ENGINE_DIR, 'brand');
const TEMPLATES_DIR = path.join(ENGINE_DIR, 'templates');
const OUTPUTS_PDF_DIR = path.join(ENGINE_DIR, 'outputs', 'pdfs');
const HEADER_TEMPLATE = path.join(TEMPLATES_DIR, 'brids-latex-header.tex');

function checkPrerequisites(): void {
  const errors: string[] = [];
  try {
    execSync('tectonic --version', { stdio: 'ignore' });
  } catch {
    errors.push('Tectonic no está instalado o no se encuentra en el PATH. Instala con: brew install tectonic');
  }

  try {
    execSync('pandoc --version', { stdio: 'ignore' });
  } catch {
    errors.push('Pandoc no está instalado o no se encuentra en el PATH. Instala con: brew install pandoc');
  }

  if (errors.length > 0) {
    console.error('\n❌ ERROR: Requisitos de software faltantes:');
    for (const err of errors) console.error(`   • ${err}`);
    process.exit(1);
  }
}

export function exportPdf(cliArgs: string[] = process.argv.slice(2)): void {
  if (cliArgs.length === 0 || cliArgs.includes('--help') || cliArgs.includes('-h')) {
    console.log(`
Uso:
  node BRIDS-Engine/scripts/vault/export-pdf.ts <archivo-entrada> [archivo-salida.pdf] [opciones]

Opciones:
  --staging      Exportar automáticamente a BRIDS-Engine/outputs/pdfs/<nombre>.pdf (por defecto)
  --in-place     Exportar junto al archivo de entrada original
  --raw          No inyectar la plantilla corporativa BRIDS (para .md)
  --open         Abrir el PDF resultante automáticamente al finalizar
`);
    process.exit(0);
  }

  checkPrerequisites();

  const isRaw = cliArgs.includes('--raw');
  const isInPlace = cliArgs.includes('--in-place');
  const shouldOpen = cliArgs.includes('--open');
  const positionalArgs = cliArgs.filter((a) => !a.startsWith('--'));

  const inputPath = path.resolve(process.cwd(), positionalArgs[0]!);
  if (!fs.existsSync(inputPath)) {
    console.error(`\n❌ Error: El archivo de entrada no existe: ${inputPath}`);
    process.exit(1);
  }

  const ext = path.extname(inputPath).toLowerCase();
  if (ext !== '.tex' && ext !== '.md') {
    console.error(`\n❌ Error: Formato no soportado (${ext}). El archivo debe ser .tex o .md`);
    process.exit(1);
  }

  const outputPath = positionalArgs[1]
    ? path.resolve(process.cwd(), positionalArgs[1])
    : isInPlace
      ? path.join(path.dirname(inputPath), `${path.basename(inputPath, ext)}.pdf`)
      : path.join(OUTPUTS_PDF_DIR, `${path.basename(inputPath, ext)}.pdf`);

  ensureDir(path.dirname(outputPath));

  console.log('\n' + '═'.repeat(75));
  console.log('🏛️ BRIDS KNOWLEDGE FORT - EXPORTADOR DE ALTA RESOLUCIÓN A PDF');
  console.log('═'.repeat(75));
  console.log(`   📄 Entrada:   ${path.relative(ROOT_DIR, inputPath)}`);
  console.log(`   📑 Salida:    ${path.relative(ROOT_DIR, outputPath)}`);
  console.log(`   ⚙️ Motor:     Tectonic + Pandoc`);

  const startTime = Date.now();

  try {
    if (ext === '.tex') {
      const workDir = path.dirname(inputPath);
      const searchPaths = [workDir, BRAND_DIR, TEMPLATES_DIR, ROOT_DIR]
        .map((p) => `-Z search-path="${p}"`)
        .join(' ');
      execSync(`tectonic ${searchPaths} "${inputPath}" -o "${path.dirname(outputPath)}"`, {
        cwd: workDir,
        stdio: 'inherit',
      });
      const defaultOut = path.join(path.dirname(outputPath), `${path.basename(inputPath, '.tex')}.pdf`);
      if (defaultOut !== outputPath && fs.existsSync(defaultOut)) {
        fs.renameSync(defaultOut, outputPath);
      }
    } else if (ext === '.md') {
      console.log(`   🚀 Procesando Markdown con soporte LaTeX ${isRaw ? '(Modo Raw)' : '(Plantilla Institucional BRIDS)'}...`);

      let headerArg = '';
      let tmpHeader: string | null = null;

      if (!isRaw && fs.existsSync(HEADER_TEMPLATE)) {
        const headerContent = fs.readFileSync(HEADER_TEMPLATE, 'utf8');
        const logoPath = path.join(BRAND_DIR, 'brids-logo-dark.pdf');
        const resolvedHeader = headerContent.replaceAll('brids-logo-dark.pdf', logoPath);
        tmpHeader = path.join(ENGINE_DIR, 'templates', '.tmp-brids-header.tex');
        fs.writeFileSync(tmpHeader, resolvedHeader, 'utf8');
        headerArg = ` -H "${tmpHeader}"`;
      }

      const resourcePaths = ['.', path.dirname(inputPath), BRAND_DIR, TEMPLATES_DIR, ROOT_DIR].join(':');
      const pandocCmd = `pandoc "${inputPath}" --pdf-engine=tectonic -o "${outputPath}" --resource-path="${resourcePaths}"${headerArg}`;

      try {
        execSync(pandocCmd, {
          cwd: path.dirname(inputPath),
          stdio: 'inherit',
        });
      } finally {
        if (tmpHeader && fs.existsSync(tmpHeader)) {
          fs.unlinkSync(tmpHeader);
        }
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const stats = fs.statSync(outputPath);
    const sizeKb = (stats.size / 1024).toFixed(1);

    console.log('═'.repeat(75));
    console.log(`   ✅ PDF exportado con éxito: ${path.relative(ROOT_DIR, outputPath)} (${sizeKb} KB)`);
    console.log(`   ⏱️ Tiempo de compilación: ${elapsed}s`);
    console.log('═'.repeat(75));

    if (shouldOpen) {
      const openCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      execSync(`${openCmd} "${outputPath}"`);
    }
  } catch (error: any) {
    console.error('\n❌ Fallo en la exportación a PDF:', error.message);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  exportPdf();
}
