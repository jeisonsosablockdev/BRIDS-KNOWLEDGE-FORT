#!/usr/bin/env node

/**
 * ingest-yc-academy.ts
 * YouTube-to-Markdown & Web-to-Markdown Ingestion Engine for BRIDS-Brain/03 Academy/
 *
 * Capabilities:
 *  1. YouTube Video -> Markdown (--youtube <url>):
 *     Uses yt-dlp to extract metadata, chapters, and subtitles (VTT), deduplicating
 *     rolling auto-captions and formatting them by chapter/timestamp into clean Markdown.
 *  2. Web Page -> Markdown (--web <url>):
 *     Uses a 3-tier extraction ladder:
 *       Tier 1: Jina Reader Markdown extraction (https://r.jina.ai/<url>)
 *       Tier 2: Direct HTML fetch + native HTML-to-Markdown parser
 *       Tier 3: Chrome DevTools MCP / Local file fallback (--file <path>)
 *  3. Scaffolds/updates `BRIDS-Brain/03 Academy/Clases/<class-slug>/` with:
 *       - datos-de-la-clase.md
 *       - conceptos.md
 *       - aplicacion-en-brids.md
 *       - raw-sources/ (full unedited transcripts & web captures)
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ensureDir } from '../../core/vault-gateway.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../..');
const VAULT_DIR = path.join(ROOT_DIR, 'BRIDS-Brain');
const ACADEMY_DIR = path.join(VAULT_DIR, '03 Academy');
const CLASES_DIR = path.join(ACADEMY_DIR, 'Clases');
const CLASES_INDEX = path.join(CLASES_DIR, 'index.md');

export interface YouTubeChapter {
  title: string;
  start_time: number;
  end_time: number;
}

export interface YouTubeExtractionResult {
  url: string;
  title: string;
  channel: string;
  durationSeconds: number;
  uploadDate: string;
  description: string;
  chapters: YouTubeChapter[];
  transcriptMarkdown: string;
  rawSegmentsCount: number;
}

export interface WebExtractionResult {
  url: string;
  title: string;
  tierUsed: 'jina_reader' | 'native_html' | 'devtools_fallback';
  markdownContent: string;
}

export interface VttCue {
  startSeconds: number;
  endSeconds: number;
  text: string;
}

export interface IngestClassOptions {
  classSlug: string;
  title?: string;
  speaker?: string;
  youtubeUrl?: string;
  webUrl?: string;
  localFilePath?: string;
  vaultRoot?: string;
}

export function resolveYtDlpBinary(): string {
  const candidates = [
    '/Users/jaymusicmachine/.local/bin/yt-dlp',
    '/opt/homebrew/bin/yt-dlp',
    '/usr/local/bin/yt-dlp',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  try {
    return execSync('which yt-dlp', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim() || 'yt-dlp';
  } catch {
    return 'yt-dlp';
  }
}

export function formatTimestamp(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function parseTimestampToSeconds(ts: string): number {
  const clean = ts.trim().replace(',', '.');
  const parts = clean.split(':').map(Number);
  if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  }
  return 0;
}

/**
 * Parses WebVTT content into deduplicated cues and cleans inline tags (<c>, <00:00:00.000>, HTML entities).
 */
export function parseVttToCues(vttContent: string): VttCue[] {
  const lines = (vttContent || '').split(/\r?\n/);
  const cues: VttCue[] = [];
  let currentStart = 0;
  let currentEnd = 0;
  let inCue = false;
  let buffer: string[] = [];

  const flushCue = () => {
    if (!inCue || buffer.length === 0) return;
    const cleanedLines = buffer
      .map((l) =>
        l
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      )
      .filter(Boolean);

    for (const line of cleanedLines) {
      const prev = cues[cues.length - 1];
      if (!prev || prev.text !== line) {
        if (prev && line.startsWith(prev.text) && line.length > prev.text.length) {
          prev.text = line;
          prev.endSeconds = currentEnd;
        } else if (!prev || !prev.text.includes(line)) {
          cues.push({
            startSeconds: currentStart,
            endSeconds: currentEnd,
            text: line,
          });
        }
      }
    }
    buffer = [];
    inCue = false;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushCue();
      continue;
    }
    if (
      line.startsWith('WEBVTT') ||
      line.startsWith('Kind:') ||
      line.startsWith('Language:') ||
      line.startsWith('NOTE') ||
      /^\d+$/.test(line)
    ) {
      continue;
    }
    const timeMatch = line.match(
      /^((?:\d{2}:)?\d{2}:\d{2}[.,]\d{3})\s*-->\s*((?:\d{2}:)?\d{2}:\d{2}[.,]\d{3})/
    );
    if (timeMatch) {
      flushCue();
      currentStart = parseTimestampToSeconds(timeMatch[1]!);
      currentEnd = parseTimestampToSeconds(timeMatch[2]!);
      inCue = true;
      continue;
    }
    if (inCue) {
      buffer.push(line);
    }
  }
  flushCue();
  return cues;
}

/**
 * Formats deduplicated VTT cues into readable Markdown grouped by chapters or 2-minute intervals.
 */
export function formatCuesToMarkdown(cues: VttCue[], chapters: YouTubeChapter[] = []): string {
  if (cues.length === 0) {
    return '_No se encontraron subtítulos automáticos ni manuales disponibles en el video._';
  }

  if (chapters.length > 0) {
    const sections: string[] = [];
    for (const ch of chapters) {
      const chCues = cues.filter(
        (c) => c.startSeconds >= ch.start_time && (ch.end_time ? c.startSeconds < ch.end_time : true)
      );
      if (chCues.length === 0) continue;
      const paragraph = chCues.map((c) => c.text).join(' ').replace(/\s+/g, ' ').trim();
      sections.push(`#### [${formatTimestamp(ch.start_time)}] ${ch.title}\n\n${paragraph}`);
    }
    if (sections.length > 0) {
      return sections.join('\n\n');
    }
  }

  // Group into ~120 second blocks for readability
  const blocks: string[] = [];
  let blockStart = cues[0]!.startSeconds;
  let currentWords: string[] = [];

  for (const cue of cues) {
    if (cue.startSeconds - blockStart >= 120 && currentWords.length > 0) {
      blocks.push(`**[${formatTimestamp(blockStart)}]** ${currentWords.join(' ').replace(/\s+/g, ' ').trim()}`);
      blockStart = cue.startSeconds;
      currentWords = [];
    }
    currentWords.push(cue.text);
  }
  if (currentWords.length > 0) {
    blocks.push(`**[${formatTimestamp(blockStart)}]** ${currentWords.join(' ').replace(/\s+/g, ' ').trim()}`);
  }

  return blocks.join('\n\n');
}

/**
 * Converts HTML into clean Markdown (Tier 2 fallback when Jina Reader is unavailable).
 */
export function htmlToMarkdown(html: string): { title: string; markdown: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = (titleMatch?.[1] || 'Artículo Web Importado')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract main/article content if present
  const mainMatch =
    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
    html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
    html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  let body = mainMatch?.[1] || html;

  body = body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n')
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n')
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n\n> $1\n\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    .replace(/<(?:p|div|section|br)[^>]*>/gi, '\n\n')
    .replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**')
    .replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*')
    .replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { title, markdown: body };
}

/**
 * Extracts a webpage into clean Markdown using a 3-tier ladder.
 */
export function extractWebToMarkdown(url: string): WebExtractionResult {
  // Tier 1: Jina Reader
  try {
    const jinaOut = execFileSync(
      'curl',
      ['-s', '-L', '--max-time', '15', `https://r.jina.ai/${url}`],
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim();

    if (jinaOut.length > 200 && !jinaOut.includes('Warning: Target URL returned error')) {
      const titleLine = jinaOut.match(/^Title:\s*(.+)$/m);
      const title = titleLine?.[1]?.trim() || 'Lectura Web YC Academy';
      const cleaned = jinaOut
        .replace(/^Title:.*$/m, '')
        .replace(/^URL Source:.*$/m, '')
        .replace(/^Markdown Content:\s*/m, '')
        .trim();
      return {
        url,
        title,
        tierUsed: 'jina_reader',
        markdownContent: cleaned,
      };
    }
  } catch {
    // Fallback to Tier 2
  }

  // Tier 2: Direct HTML fetch + native HTML-to-Markdown parser
  try {
    const rawHtml = execFileSync(
      'curl',
      [
        '-s',
        '-L',
        '--max-time',
        '15',
        '-A',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        url,
      ],
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    if (rawHtml && rawHtml.length > 100) {
      const parsed = htmlToMarkdown(rawHtml);
      if (parsed.markdown.length > 80) {
        return {
          url,
          title: parsed.title,
          tierUsed: 'native_html',
          markdownContent: parsed.markdown,
        };
      }
    }
  } catch {
    // Fallback to Tier 3
  }

  return {
    url,
    title: 'Página Web Protegida / Requiere Sesión',
    tierUsed: 'devtools_fallback',
    markdownContent: `> [!TIP]\n> La URL (${url}) requiere sesión activa en el navegador. Puedes extraerla directamente desde tu pestaña abierta con \`chrome-devtools-mcp\` o pasar un archivo local con \`--file\`.`,
  };
}

/**
 * Extracts YouTube video metadata, chapters, and subtitles into clean Markdown using yt-dlp.
 */
export function extractYouTubeToMarkdown(url: string): YouTubeExtractionResult {
  const ytDlp = resolveYtDlpBinary();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'brids-yc-yt-'));

  try {
    const jsonRaw = execFileSync(
      ytDlp,
      ['--dump-json', '--no-download', '--no-warnings', url],
      { encoding: 'utf8', maxBuffer: 25 * 1024 * 1024 }
    );
    const meta = JSON.parse(jsonRaw.split(/\r?\n/)[0] || '{}');
    const title = String(meta.title || 'Clase de YC Academy');
    const channel = String(meta.uploader || meta.channel || 'Y Combinator');
    const durationSeconds = Number(meta.duration || 0);
    const rawDate = String(meta.upload_date || '');
    const uploadDate =
      rawDate.length === 8
        ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
        : new Date().toISOString().split('T')[0]!;
    const description = String(meta.description || '').trim();
    const chapters: YouTubeChapter[] = Array.isArray(meta.chapters)
      ? meta.chapters.map((c: any) => ({
          title: String(c.title || 'Sección'),
          start_time: Number(c.start_time || 0),
          end_time: Number(c.end_time || 0),
        }))
      : [];

    // Download subtitles (prefer Spanish or English manual/auto VTT)
    try {
      execFileSync(
        ytDlp,
        [
          '--write-subs',
          '--write-auto-subs',
          '--sub-langs',
          'es.*,en.*',
          '--sub-format',
          'vtt',
          '--skip-download',
          '--no-warnings',
          '-o',
          path.join(tmpDir, 'transcript.%(ext)s'),
          url,
        ],
        { stdio: 'pipe' }
      );
    } catch {
      // Subtitles may partially fail for one language while succeeding for another
    }

    const vttFiles = fs
      .readdirSync(tmpDir)
      .filter((f) => f.endsWith('.vtt'))
      .sort((a, b) => {
        // Prefer Spanish if available, otherwise English
        const aEs = a.includes('.es');
        const bEs = b.includes('.es');
        if (aEs && !bEs) return -1;
        if (!aEs && bEs) return 1;
        return a.localeCompare(b);
      });

    let cues: VttCue[] = [];
    if (vttFiles.length > 0) {
      const vttContent = fs.readFileSync(path.join(tmpDir, vttFiles[0]!), 'utf8');
      cues = parseVttToCues(vttContent);
    }

    const transcriptMarkdown = formatCuesToMarkdown(cues, chapters);

    return {
      url,
      title,
      channel,
      durationSeconds,
      uploadDate,
      description,
      chapters,
      transcriptMarkdown,
      rawSegmentsCount: cues.length,
    };
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}

export function sanitizeFolderSlug(input: string): string {
  return (input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Main orchestrator: creates or updates the class folder in `03 Academy/Clases/<classSlug>/`
 * with `datos-de-la-clase.md`, `conceptos.md`, and `aplicacion-en-brids.md`.
 */
export function ingestYcAcademyClass(options: IngestClassOptions): {
  classDir: string;
  datosPath: string;
  conceptosPath: string;
  aplicacionPath: string;
} {
  const vaultRoot = options.vaultRoot || VAULT_DIR;
  const clasesRoot = path.join(vaultRoot, '03 Academy', 'Clases');
  const slug = sanitizeFolderSlug(options.classSlug);
  if (!slug) {
    throw new Error('❌ Debes especificar un identificador de clase válido con --class <slug>.');
  }

  const classDir = path.join(clasesRoot, slug);
  const rawSourcesDir = path.join(classDir, 'raw-sources');
  ensureDir(classDir);
  ensureDir(rawSourcesDir);

  const today = new Date().toISOString().split('T')[0]!;
  let ytData: YouTubeExtractionResult | undefined;
  let webData: WebExtractionResult | undefined;
  let localContent: string | undefined;

  if (options.youtubeUrl) {
    console.log(`🎬 Extrayendo video de YouTube con yt-dlp: ${options.youtubeUrl}`);
    ytData = extractYouTubeToMarkdown(options.youtubeUrl);
    fs.writeFileSync(
      path.join(rawSourcesDir, 'youtube-transcript.md'),
      `# ${ytData.title}\n\n- **URL:** ${ytData.url}\n- **Canal:** ${ytData.channel}\n- **Duración:** ${formatTimestamp(ytData.durationSeconds)}\n\n## Descripción\n\n${ytData.description}\n\n## Transcripción Completa\n\n${ytData.transcriptMarkdown}\n`,
      'utf8'
    );
  }

  if (options.webUrl) {
    console.log(`🌐 Importando página web a Markdown: ${options.webUrl}`);
    webData = extractWebToMarkdown(options.webUrl);
    fs.writeFileSync(
      path.join(rawSourcesDir, 'web-article.md'),
      `# ${webData.title}\n\n- **URL:** ${webData.url}\n- **Método de Extracción:** ${webData.tierUsed}\n\n---\n\n${webData.markdownContent}\n`,
      'utf8'
    );
  }

  if (options.localFilePath && fs.existsSync(options.localFilePath)) {
    const rawFile = fs.readFileSync(options.localFilePath, 'utf8');
    if (options.localFilePath.endsWith('.html') || options.localFilePath.endsWith('.htm')) {
      localContent = htmlToMarkdown(rawFile).markdown;
    } else if (options.localFilePath.endsWith('.vtt')) {
      localContent = formatCuesToMarkdown(parseVttToCues(rawFile));
    } else {
      localContent = rawFile;
    }
  }

  const resolvedTitle =
    options.title || ytData?.title || webData?.title || `Clase YC Academy: ${slug}`;
  const resolvedSpeaker = options.speaker || ytData?.channel || 'Y Combinator';

  const datosPath = path.join(classDir, 'datos-de-la-clase.md');
  const conceptosPath = path.join(classDir, 'conceptos.md');
  const aplicacionPath = path.join(classDir, 'aplicacion-en-brids.md');

  const chaptersListMd =
    ytData && ytData.chapters.length > 0
      ? ytData.chapters.map((c) => `- **[${formatTimestamp(c.start_time)}]** ${c.title}`).join('\n')
      : '- _Sin capítulos predefinidos; transcripción organizada por bloques de tiempo._';

  const youtubeSectionMd = ytData
    ? `## 🎬 Contenido Extraído de YouTube

- **Título Original:** ${ytData.title}
- **Ponente / Canal:** ${ytData.channel}
- **Duración:** ${formatTimestamp(ytData.durationSeconds)}
- **Enlace Directo:** [Ver en YouTube](${ytData.url})

### Índice de Capítulos del Video
${chaptersListMd}

### Descripción de la Clase
${ytData.description || '_Sin descripción adicional._'}

### Transcripción Limpia en Markdown
${ytData.transcriptMarkdown}
`
    : '';

  const webSectionMd = webData
    ? `## 🌐 Contenido Importado desde Página Web

- **Título de la Página:** ${webData.title}
- **Fuente Original:** [${webData.url}](${webData.url})
- **Nivel de Extracción:** \`${webData.tierUsed}\`

### Texto Extraído en Markdown
${webData.markdownContent}
`
    : '';

  const localSectionMd = localContent
    ? `## 📄 Contenido Importado desde Archivo Local

${localContent}
`
    : '';

  const datosContent = `---
title: "Datos de la Clase — ${resolvedTitle.replace(/"/g, "'")}"
version: "1.0"
status: "sdd-approved"
workflow: "yc-academy-ingest"
created: "${today}"
updated: "${today}"
domain: "03 Academy"
subdomain: "Clases/${slug}"
speaker: "${resolvedSpeaker.replace(/"/g, "'")}"
${ytData ? `youtube_url: "${ytData.url}"\n` : ''}${webData ? `web_url: "${webData.url}"\n` : ''}tags:
  - "yc-academy"
  - "datos-de-la-clase"
  - "${slug}"
---

# 🎓 Datos de la Clase: ${resolvedTitle}

> [!NOTE]
> **Resumen Ejecutivo:** Fuente documental primaria de la clase **${resolvedTitle}** (${resolvedSpeaker}) en YC Academy. Conecta directamente con tus conceptos en [[03 Academy/Clases/${slug}/conceptos.md|conceptos.md]] y su aterrizaje estratégico en [[03 Academy/Clases/${slug}/aplicacion-en-brids.md|aplicacion-en-brids.md]].

---

## 📋 Ficha de la Sesión

| Campo | Detalle |
|---|---|
| **Clase / Carpeta** | \`${slug}\` |
| **Título** | ${resolvedTitle} |
| **Ponente / Fuente** | ${resolvedSpeaker} |
| **Video YouTube** | ${ytData ? `[${ytData.url}](${ytData.url}) (${formatTimestamp(ytData.durationSeconds)})` : '—'} |
| **Lectura Web** | ${webData ? `[${webData.url}](${webData.url})` : '—'} |
| **Notas Relacionadas** | [[03 Academy/Clases/${slug}/conceptos.md|🧠 Conceptos]] · [[03 Academy/Clases/${slug}/aplicacion-en-brids.md|🚀 Aplicación en BRIDS]] |

---

## 🎯 Puntos Clave de YC en esta Clase

- **Principio Central de YC:** *(Destilar aquí la tesis principal del ponente)*
- **Errores Comunes que YC Advierte:** *(Señales de alerta o trampas frecuentes en fundadores)*
- **Métrica o Regla de Oro:** *(Heurística accionable enseñada en la sesión)*

---

${youtubeSectionMd}
${webSectionMd}
${localSectionMd}

---

## Historial de Revisiones (Changelog)

| Versión | Fecha | Resumen de Cambios |
|---|---|---|
| \`1.0\` | ${today} | Ingesta inicial de la clase en \`03 Academy/Clases/${slug}/\`. |
`;

  fs.writeFileSync(datosPath, datosContent, 'utf8');

  if (!fs.existsSync(conceptosPath)) {
    const conceptosContent = `---
title: "Conceptos — ${resolvedTitle.replace(/"/g, "'")}"
version: "1.0"
status: "sdd-approved"
workflow: "yc-academy-ingest"
created: "${today}"
updated: "${today}"
domain: "03 Academy"
subdomain: "Clases/${slug}"
tags:
  - "yc-academy"
  - "conceptos"
  - "${slug}"
---

# 🧠 Conceptos: ${resolvedTitle}

> [!NOTE]
> **Resumen Ejecutivo:** Espacio para registrar tus propios conceptos, definiciones y modelos mentales derivados de la clase **[[03 Academy/Clases/${slug}/datos-de-la-clase.md|${resolvedTitle}]]**, listos para conectarse con tu biblioteca general en [[03 Academy/Mis Conceptos/index.md|Mis Conceptos]] y aplicarse en [[03 Academy/Clases/${slug}/aplicacion-en-brids.md|aplicacion-en-brids.md]].

---

## 💡 Mis Conceptos y Definiciones de la Clase

### 1. [Nombre del Concepto]
- **En mis propias palabras:** 
- **Por qué importa:** 
- **Cómo se relaciona con otros conceptos:** [[03 Academy/Mis Conceptos/index.md|Ver Mis Conceptos]]

---

## 🧭 Modelos Mentales y Reglas para Recordar

- 

---

## Historial de Revisiones (Changelog)

| Versión | Fecha | Resumen de Cambios |
|---|---|---|
| \`1.0\` | ${today} | Creación de la plantilla de conceptos propios para la clase \`${slug}\`. |
`;
    fs.writeFileSync(conceptosPath, conceptosContent, 'utf8');
  }

  if (!fs.existsSync(aplicacionPath)) {
    const aplicacionContent = `---
title: "Aplicación en BRIDS — ${resolvedTitle.replace(/"/g, "'")}"
version: "1.0"
status: "sdd-approved"
workflow: "yc-academy-ingest"
created: "${today}"
updated: "${today}"
domain: "03 Academy"
subdomain: "Clases/${slug}"
tags:
  - "yc-academy"
  - "aplicacion-brids"
  - "${slug}"
---

# 🚀 Aplicación en BRIDS: ${resolvedTitle}

> [!NOTE]
> **Resumen Ejecutivo:** Aterrizaje directo de la clase **[[03 Academy/Clases/${slug}/datos-de-la-clase.md|${resolvedTitle}]]** y de tus **[[03 Academy/Clases/${slug}/conceptos.md|Conceptos]]** al desarrollo de la idea de negocio de **BRIDS.io** (infraestructura RWA en Solana, Sponsors B2B inmobiliarios e inversionistas).

---

## 🔍 1. Diagnóstico: ¿Cómo se ve BRIDS a la luz de esta clase?

- **Lo que esta clase valida en nuestra idea de negocio:**
- **Lo que esta clase cuestiona o nos obliga a simplificar en BRIDS:**

---

## 🏗️ 2. Aplicación Directa a los Pilares de BRIDS.io

### A. Lado B2B (Desarrolladores Inmobiliarios / Sponsors)
- 

### B. Lado Producto & MVP (Solana / Metaplex Core / Experiencia de Usuario)
- 

### C. Lado Inversores & Modelo de Negocio
- 

---

## 🧪 3. Decisiones e Hipótesis para BRIDS

- **Decisión clave adoptada tras esta clase:**
- **Hipótesis principal a validar:**

---

## Historial de Revisiones (Changelog)

| Versión | Fecha | Resumen de Cambios |
|---|---|---|
| \`1.0\` | ${today} | Creación del documento de aplicación en BRIDS para la clase \`${slug}\`. |
`;
    fs.writeFileSync(aplicacionPath, aplicacionContent, 'utf8');
  }

  // Update 03 Academy/Clases/index.md if it exists
  const indexFile = path.join(clasesRoot, 'index.md');
  if (fs.existsSync(indexFile)) {
    let idxContent = fs.readFileSync(indexFile, 'utf8');
    const rowLink = `[[03 Academy/Clases/${slug}/datos-de-la-clase.md|📄 Datos]]`;
    if (!idxContent.includes(`03 Academy/Clases/${slug}/`)) {
      // Remove placeholder row if present
      idxContent = idxContent.replace(
        /\|\s*`01`\s*\|\s*\*Pendiente de iniciar primera clase\*[^\r\n]*\r?\n?/,
        ''
      );
      const numMatch = slug.match(/^(\d+)/);
      const classNum = numMatch?.[1] || '•';
      const newRow = `| \`${classNum}\` | **${resolvedTitle.replace(/\|/g, '-')}** | ${rowLink} | [[03 Academy/Clases/${slug}/conceptos.md|🧠 Conceptos]] | [[03 Academy/Clases/${slug}/aplicacion-en-brids.md|🚀 Aplicación BRIDS]] | ✅ Activa |\n`;
      idxContent = idxContent.trimEnd() + '\n' + newRow;
      fs.writeFileSync(indexFile, idxContent, 'utf8');
    }
  }

  return {
    classDir,
    datosPath,
    conceptosPath,
    aplicacionPath,
  };
}

// CLI Entrypoint
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  const argv = process.argv.slice(2);
  const getFlag = (flag: string): string | undefined => {
    const idx = argv.indexOf(flag);
    return idx >= 0 && idx + 1 < argv.length ? argv[idx + 1] : undefined;
  };

  const classSlug = getFlag('--class') || getFlag('-c');
  const youtubeUrl = getFlag('--youtube') || getFlag('--yt');
  const webUrl = getFlag('--web') || getFlag('--url');
  const localFilePath = getFlag('--file') || getFlag('-f');
  const title = getFlag('--title') || getFlag('-t');
  const speaker = getFlag('--speaker') || getFlag('-s');

  if (!classSlug || (!youtubeUrl && !webUrl && !localFilePath && !title)) {
    console.log(`
🎓 BRIDS YC Academy Ingestor (YouTube a MD & Web a MD)
Uso:
  node BRIDS-Engine/scripts/ingest/ingest-yc-academy.ts --class <slug-clase> [opciones]

Opciones:
  --class, -c <slug>      Nombre de la subcarpeta en 03 Academy/Clases/ (ej. "01-how-to-get-startup-ideas")
  --youtube, --yt <url>   URL de YouTube para extraer metadatos, capítulos y transcripción a Markdown
  --web, --url <url>      URL de página web (ensayo YC, artículo, guía) para importar su texto a Markdown
  --file, -f <ruta>       Archivo local (.vtt, .html, .txt, .md) para importar a la clase
  --title, -t "<título>"  Título personalizado de la clase (opcional; se autodetecta de YouTube/Web)
  --speaker, -s "<autor>" Ponente de YC (opcional; se autodetecta del canal/página)
`);
    process.exit(classSlug ? 0 : 1);
  }

  const result = ingestYcAcademyClass({
    classSlug,
    youtubeUrl,
    webUrl,
    localFilePath,
    title,
    speaker,
  });

  console.log(`\n✅ Clase creada/actualizada en 03 Academy:`);
  console.log(`   📁 Carpeta:     ${result.classDir}`);
  console.log(`   📄 Datos Clase: ${result.datosPath}`);
  console.log(`   🧠 Conceptos:   ${result.conceptosPath}`);
  console.log(`   🚀 Aplicación:  ${result.aplicacionPath}\n`);
}
