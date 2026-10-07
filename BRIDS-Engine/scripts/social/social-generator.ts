#!/usr/bin/env node

/**
 * Unified Social Content, Carousel, Grid & Visual Assets Engine (Domain: social)
 * Consolidates create-social-post, create-social-carousel, sync-content-grid, and generate-publication-assets.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VaultGateway, ensureDir } from '../../core/vault-gateway.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../..');
const VAULT_DIR = path.join(ROOT_DIR, 'BRIDS-Brain');
const VAULT_SOCIAL_DIR = path.join(VAULT_DIR, '02 Marketing', '03 Redes Sociales & Contenido');
const ASSETS_ROOT = path.join(VAULT_SOCIAL_DIR, 'Assets');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'BRIDS-Engine', 'templates', 'carousel-post-template.md');
const DEFAULT_PLAN_PATH = path.join(ROOT_DIR, 'BRIDS-Engine', 'templates', 'content-grid-plan.json');
const PARRILLA_DOC_PATH = path.join(VAULT_DIR, '02 Marketing', '02 Estrategia & Parrilla', 'parrilla-publicaciones-redes-sociales.md');

const vaultGateway = new VaultGateway(VAULT_DIR);
const sanitizeSlug = (str: string) => vaultGateway.sanitizeSlug(str);
const getTodayString = () => new Date().toLocaleDateString('sv-SE');

// -------------------------------------------------------------
// 1. CREATE SOCIAL POST
// -------------------------------------------------------------
export function createSocialPost(
  platformInput: string,
  ideaInput: string,
  typeInput?: string,
  technicalRefInput?: string,
  assetClassInput?: string
) {
  if (!platformInput || !ideaInput) {
    throw new Error('Uso: social-generator.ts post <redsocial> "<idea-o-concepto>" [tipo-contenido] [referencia-tecnica] [clase-activo]');
  }

  const platform = sanitizeSlug(platformInput);
  const idea = sanitizeSlug(ideaInput);
  const dateStr = getTodayString();
  const fileName = `${dateStr}-${platform}-${idea}.md`;
  const targetPath = path.join(VAULT_SOCIAL_DIR, fileName);

  ensureDir(VAULT_SOCIAL_DIR);

  if (fs.existsSync(targetPath)) {
    throw new Error(`El archivo "${fileName}" ya existe en ${targetPath}`);
  }

  const contentType = (typeInput || 'rwa-tokenization').toLowerCase();
  const technicalRef = technicalRefInput || 'Solana Metaplex Core / Delaware SPV';
  const assetClass = assetClassInput || 'Commercial Real Estate RWA';

  let typeTitle = 'Tokenización de Real Estate RWA';
  let pillarFocus = 'Demostración de liquidez on-chain, estructuración jurídica dual SPV y reducción de intermediarios.';

  if (contentType.includes('gp') || contentType.includes('sponsor') || contentType.includes('institutional')) {
    typeTitle = 'Propuesta de Valor para B2B Sponsors / GPs';
    pillarFocus = 'Acceso a capital global minorista acreditado, sindicación sin fricción y dashboard de compliance unificado.';
  } else if (contentType.includes('yield') || contentType.includes('solana') || contentType.includes('defi')) {
    typeTitle = 'Rendimiento On-Chain & Ventaja Solana';
    pillarFocus = 'Liquidación sub-segundo, transacciones por menos de $0.001 y plugins nativos de freeze/recovery en Metaplex Core.';
  } else if (contentType.includes('founder') || contentType.includes('insight') || contentType.includes('thesis')) {
    typeTitle = 'Tesis Fundadora & Thought Leadership';
    pillarFocus = 'Por qué el 99% de las soluciones RWA en Ethereum fallan por costos de gas y rigidez regulatoria ERC-3643.';
  }

  const postContent = `---
title: "[${platform.toUpperCase()}] ${idea.replace(/-/g, ' ')}"
category: "02 Marketing"
workflow: "W5_CONTENT_SOCIAL"
skills_used:
  - "mas-social-content"
  - "mas-copywriting"
  - "founder-ghostwriter"
platform: "${platform}"
content_type: "${contentType}"
technical_reference: "${technicalRef}"
asset_class: "${assetClass}"
status: draft
version: "1.0"
created_at: ${dateStr}
updated_at: ${dateStr}
tags:
  - marketing
  - social-content
  - rwa
  - solana
  - ${platform}
  - ${idea}
---

# [${platform.toUpperCase()}] ${idea.replace(/-/g, ' ').toUpperCase()}

> [!NOTE]
> **Resumen Ejecutivo:** Publicación institucional para ${platform.toUpperCase()} orientada a ${typeTitle}. Enfoque en ${assetClass} con referencia técnica a *${technicalRef}*, destacando estructura de custodia, cumplimiento Delaware SPV y liquidación instantánea.

---

## 🎯 Contexto y Objetivo
- **Plataforma:** ${platform.toUpperCase()} (\`@brids_io\`)
- **Formato:** Publicación Institucional / Hilo de Liderazgo
- **Pilar Temático:** ${pillarFocus}
- **Activo Inmobiliario:** ${assetClass}
- **Ancla Técnica:** *${technicalRef}*

---

## 📋 Copy Oficial para ${platform.toUpperCase()}

\`\`\`markdown
La tokenización inmobiliaria tradicional intentó forcejear estándares lentos en redes con tarifas exorbitantes.

En BRIDS cambiamos las reglas del juego:
1. Infraestructura sobre Solana: Liquidación sub-segundo y costos inferiores a \$0.001 por transacción.
2. Cumplimiento Dual Delaware SPV: Cada propiedad vive en una entidad jurídica independiente segregada de pasivos.
3. Plugins Metaplex Core: Recuperación y congelamiento de activos ante incidentes o mandatos judiciales, sin perder descentralización.

El capital institucional no busca especulación; busca rendimientos reales garantizados por activos tangibles.

Conoce la arquitectura en brids.io

#BRIDS #RealWorldAssets #Solana #RealEstate #InstitutionalCrypto #Fintech #${idea.replace(/-/g, '')}
\`\`\`

---

## 🔄 Historial de Revisiones (Changelog)
- **v1.0 (${dateStr}):** Creación de publicación institucional mediante el generador de BRIDS.
`;

  fs.writeFileSync(targetPath, postContent, 'utf8');
  return { fileName, targetPath, platform, idea, typeTitle, technicalRef };
}

// -------------------------------------------------------------
// 2. CREATE SOCIAL CAROUSEL
// -------------------------------------------------------------
export interface CarouselOptions {
  idea: string;
  imagePath?: string;
  assetClass?: string;
  asset_class?: string;
  technicalRef?: string;
  technical_reference?: string;
  platform?: string;
  force?: boolean;
  date?: string;
}

export function createSocialCarousel(options: CarouselOptions) {
  const {
    idea,
    imagePath,
    assetClass = options.asset_class || 'Real Estate RWA Tokenization',
    technicalRef = options.technical_reference || 'Solana Metaplex Core / Delaware SPV',
    platform = 'linkedin',
    force = false,
    date = getTodayString()
  } = options;

  if (!idea) {
    throw new Error('El parámetro "idea" (slug o concepto) es obligatorio.');
  }

  const ideaSlug = sanitizeSlug(idea);
  const platformSlug = sanitizeSlug(platform);
  const folderName = `${date}-carrusel-${ideaSlug}`;
  const assetDir = path.join(ASSETS_ROOT, folderName);
  const noteFileName = `${date}-${platformSlug}-carrusel-${ideaSlug}.md`;
  const notePath = path.join(VAULT_SOCIAL_DIR, noteFileName);

  ensureDir(ASSETS_ROOT);
  ensureDir(assetDir);

  if (fs.existsSync(notePath) && !force) {
    const err: any = new Error(`El archivo de carrusel "${noteFileName}" ya existe.`);
    err.code = 'EEXIST';
    err.path = notePath;
    throw err;
  }

  const heroTarget = path.join(assetDir, '01-portada-hero.png');
  let hasInputImage = false;

  if (imagePath && fs.existsSync(imagePath)) {
    fs.copyFileSync(imagePath, heroTarget);
    hasInputImage = true;
  } else {
    const readmeContent = `# Activos del Carrusel: ${folderName}\n\n` +
      `Coloca la imagen principal como \`01-portada-hero.png\` en esta carpeta.\n\n` +
      `Los prompts para generar los slides 2, 3 y 4 se encuentran en \`generation-prompts.json\`.`;
    fs.writeFileSync(path.join(assetDir, 'README-ASSETS.md'), readmeContent, 'utf8');
  }

  const promptsManifest = {
    system_version: '2.0-brids-rwa',
    carousel_id: folderName,
    aspect_ratio: '4:5 (1080x1350 px)',
    asset_class: assetClass,
    technical_reference: technicalRef,
    brand_visual_identity: {
      palette: {
        deep_slate: '#0F172A',
        solana_green: '#14F195',
        institutional_gold: '#F59E0B',
        card_slate: '#1E293B',
        pure_white: '#FFFFFF'
      },
      positive_tokens: 'BRIDS institutional visual style, sleek modern architectural real estate, glass and steel facade, high-end fintech UI, clean Solana green glowing accents, ultra-minimalist',
      negative_tokens: 'cluttered, cartoon, low resolution, cheap cosplay, garment, anime, clothing, noisy textures, amateur composition, oversaturated neon'
    },
    slides: {
      slide_1_hero: {
        file: '01-portada-hero.png',
        type: 'Fotografía Arquitectónica / Hero',
        description: `Fotografía arquitectónica vertical 4:5 de activo inmobiliario institucional tokenizado (${assetClass}).`,
        prompt: `Architectural photography vertical 4:5 of premier modern commercial real estate, ${assetClass}, BRIDS brand style, clean deep slate facade (#0F172A) with subtle glowing Solana green accents (#14F195).`
      },
      slide_2_technical_architecture: {
        file: '02-arquitectura-tecnica.png',
        type: 'Diagrama Técnico On-Chain (Metaplex Core & SPV)',
        description: 'Infografía técnica y diagrama de flujo on-chain en Solana.',
        prompt: 'High-end fintech technical architecture diagram on deep dark slate background (#0F172A), Solana blockchain network nodes with glowing emerald green vector connections (#14F195), Delaware SPV legal flow box.'
      },
      slide_3_financial_metrics: {
        file: '03-metricas-financieras.png',
        type: 'Métricas Financieras & Dividendos',
        description: 'Dashboard financiero institucional mostrando APY proyectado y distribución en USDC.',
        prompt: 'Minimalist fintech dashboard card showing financial metrics, real estate yield graph, clean percentage APY metrics in glowing Solana green (#14F195).'
      },
      slide_4_conversion_cta: {
        file: '04-conversion-cta.png',
        type: 'Slide de Cierre Comercial (CTA)',
        description: 'Diseño gráfico institucional en formato 4:5.',
        prompt: "Ultra-minimalist institutional fintech slide for BRIDS, seamless flat solid deep slate background (#0F172A), centered clean geometric BRIDS logo in glowing Solana green (#14F195), elegant typography 'THE INSTITUTIONAL BRIDGE FOR RWA ON SOLANA'."
      }
    }
  };

  fs.writeFileSync(path.join(assetDir, 'generation-prompts.json'), JSON.stringify(promptsManifest, null, 2), 'utf8');

  const titleRaw = ideaSlug.replace(/-/g, ' ');
  const titleUpper = titleRaw.toUpperCase();

  let noteContent = '';
  if (fs.existsSync(TEMPLATE_PATH)) {
    let tpl = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    tpl = tpl.replace(/{{TITLE}}/g, titleRaw)
      .replace(/{{TITLE_UPPER}}/g, titleUpper)
      .replace(/{{ASSET_CLASS}}/g, assetClass)
      .replace(/{{GARMENT}}/g, assetClass)
      .replace(/{{TECHNICAL_REF}}/g, technicalRef)
      .replace(/{{CULTURAL_REF}}/g, technicalRef)
      .replace(/{{PLATFORM}}/g, platformSlug)
      .replace(/{{DATE}}/g, date)
      .replace(/{{FOLDER_NAME}}/g, folderName)
      .replace(/{{IDEA_SLUG}}/g, ideaSlug)
      .replace(/{{IDEA_SLUG_RAW}}/g, ideaSlug.replace(/-/g, ''));
    noteContent = tpl;
  } else {
    noteContent = `---
title: "[INSTAGRAM CARRUSEL] ${titleRaw}"
category: "02 Marketing"
workflow: "W5_CONTENT_SOCIAL"
skills_used:
  - "mas-social-content"
  - "mas-ad-creative"
  - "mas-copywriting"
platform: "${platformSlug}"
content_type: "carrusel-4-slides"
aspect_ratio: "4:5"
status: draft
version: "1.0"
created_at: ${date}
updated_at: ${date}
tags:
  - marketing
  - social-content
  - carrusel
  - instagram
  - ${ideaSlug}
---

# [INSTAGRAM CARRUSEL] ${titleUpper}

> [!NOTE]
> **Resumen Ejecutivo:** Carrusel de 4 slides en formato vertical 4:5 enfocado en ${assetClass} (${technicalRef}).
`;
  }

  fs.writeFileSync(notePath, noteContent, 'utf8');

  return {
    success: true,
    carouselId: folderName,
    noteFileName,
    notePath,
    assetDir,
    promptsManifestPath: path.join(assetDir, 'generation-prompts.json'),
    hasInputImage
  };
}

export const createCarousel = createSocialCarousel;

// -------------------------------------------------------------
// 3. CONTENT GRID AUDIT & SYNC
// -------------------------------------------------------------
export function loadPlan(planPath = DEFAULT_PLAN_PATH) {
  if (!fs.existsSync(planPath)) {
    throw new Error(`No se encontró el plan de contenido en: ${planPath}`);
  }
  return JSON.parse(fs.readFileSync(planPath, 'utf8'));
}

export function auditAlignment(plan = loadPlan()) {
  const posts = plan.posts || [];
  const report = [];

  const existingNotes = fs.existsSync(VAULT_SOCIAL_DIR)
    ? fs.readdirSync(VAULT_SOCIAL_DIR).filter(f => f.endsWith('.md'))
    : [];

  const existingAssets = fs.existsSync(ASSETS_ROOT)
    ? fs.readdirSync(ASSETS_ROOT).filter(f => fs.statSync(path.join(ASSETS_ROOT, f)).isDirectory())
    : [];

  for (const post of posts) {
    const expectedNotePattern = new RegExp(`${post.date}-.*${post.slug}`);
    const matchedNote = existingNotes.find(f => expectedNotePattern.test(f) || f.includes(post.slug));

    const expectedAssetPattern = new RegExp(`${post.date}-.*${post.slug}`);
    const matchedAsset = existingAssets.find(f => expectedAssetPattern.test(f) || f.includes(post.slug));

    let status = 'PLANIFICADO';
    let statusEmoji = '⚪';

    if (matchedNote && (matchedAsset || post.format === 'reel')) {
      status = 'LISTO';
      statusEmoji = '🟢';
    } else if (matchedNote) {
      status = 'NOTA CREADA';
      statusEmoji = '🟡';
    }

    const assetClass = post.asset_class || post.garment || 'Real Estate RWA';
    const technicalRef = post.technical_reference || post.cultural_reference || 'Solana Metaplex Core';

    report.push({
      postNumber: post.post_number,
      date: post.date,
      slug: post.slug,
      format: post.format,
      pillar: post.pillar,
      assetClass,
      technicalRef,
      hook: post.hook,
      cta: post.cta || '',
      altText: post.alt_text || '',
      hashtags: post.hashtags || '',
      published: post.published || false,
      matchedNote: matchedNote || null,
      matchedAsset: matchedAsset || null,
      status,
      statusEmoji
    });
  }

  return report;
}

export function auditContentGrid(options: { silent?: boolean; planPath?: string } = {}) {
  const plan = loadPlan(options.planPath);
  const items = auditAlignment(plan);
  const completeCount = items.filter(i => i.status === 'LISTO').length;
  if (!options.silent) {
    console.log(`\n📊 AUDITORÍA DE ALINEACIÓN DE CONTENIDOS: ${completeCount}/${items.length} listas\n`);
  }
  return {
    totalPlanned: items.length,
    completeCount,
    items
  };
}

export function scaffoldAllMissing(plan = loadPlan()) {
  const audit = auditAlignment(plan);
  let createdCount = 0;

  for (const item of audit) {
    const isCarousel = item.format === 'carrusel';
    if (!item.matchedNote) {
      if (isCarousel) {
        createSocialCarousel({
          idea: item.slug,
          assetClass: item.assetClass,
          technicalRef: item.technicalRef,
          platform: 'instagram',
          date: item.date
        });
        createdCount++;
      } else {
        const noteFileName = `${item.date}-instagram-${item.slug}.md`;
        const notePath = path.join(VAULT_SOCIAL_DIR, noteFileName);
        const reelContent = `---
title: "[INSTAGRAM REEL] ${item.slug.replace(/-/g, ' ')}"
category: "02 Marketing"
workflow: "W5_CONTENT_SOCIAL"
skills_used:
  - "mas-social-content"
  - "mas-ad-creative"
  - "mas-copywriting"
platform: "instagram"
content_type: "reel-vertical"
pillar: "${item.pillar}"
technical_reference: "${item.technicalRef}"
asset_class: "${item.assetClass}"
status: draft
version: "1.0"
created_at: ${item.date}
updated_at: ${item.date}
tags:
  - marketing
  - social-content
  - reel
  - instagram
  - rwa
  - solana
  - ${item.slug}
---

# [INSTAGRAM REEL] ${item.slug.replace(/-/g, ' ').toUpperCase()}

> [!NOTE]
> **Resumen Ejecutivo:** Video vertical Reel 9:16 para Instagram enfocado en ${item.assetClass} (${item.technicalRef}).
`;
        fs.writeFileSync(notePath, reelContent, 'utf8');
        createdCount++;
      }
    }
  }
  return createdCount;
}

export function updateParrillaDocument(plan = loadPlan()) {
  const audit = auditAlignment(plan);
  let tableRows = '';
  for (const item of audit) {
    const noteLink = item.matchedNote
      ? `[[02 Marketing/03 Redes Sociales & Contenido/${item.matchedNote}|📄 Ver Nota]]`
      : `*(Pendiente)*`;
    const assetLink = item.matchedAsset
      ? `[[02 Marketing/03 Redes Sociales & Contenido/Assets/${item.matchedAsset}/README-ASSETS.md|📁 Assets]]`
      : (item.format === 'carrusel' ? `*(Sin assets)*` : `*(Video directo)*`);
    const formatBadge = item.format === 'carrusel' ? '🖼️ Carrusel (4:5)' : '🎬 Reel (9:16)';
    const publishedBox = item.published ? '[x]' : '[ ]';
    const fullCopy = `${item.hook}<br><br>${item.cta}<br><br>${item.hashtags}`;
    tableRows += `| **${item.postNumber}** | \`${item.date}\` | **${item.assetClass}** | *${item.technicalRef}* | *"${item.hook}"* | ${item.cta} | *${item.altText}* | \`${item.hashtags}\` | \`${fullCopy}\` | ${formatBadge} | ${item.statusEmoji} ${item.status} | ${publishedBox} | *(Sin link)* | ${noteLink} | ${assetLink} |\n`;
  }

  const updatedContent = `---
title: "Parrilla Estratégica de Publicaciones (15 Días)"
category: "02 Marketing"
workflow: "W5_CONTENT_SOCIAL"
skills_used:
  - "mas-social-content"
  - "mas-ad-creative"
  - "mas-content-strategy"
status: in_progress
version: "2.0"
protected: true
created_at: 2026-08-08
updated_at: ${getTodayString()}
tags:
  - marketing
  - social-content
  - rwa
  - solana
  - content-grid
---

# Parrilla Estratégica de Publicaciones (15 Días)

*Matriz Maestra Intercalada y Sincronizada para @brids_io*  
*Folder: 02 Marketing / 03 Redes Sociales & Contenido*  
*Last updated: ${getTodayString()}*

> [!NOTE]
> **Resumen Ejecutivo:** Matriz maestra de sincronización editorial de BRIDS para LinkedIn, X y Telegram. Mantiene alineación 1-a-1 entre la planificación estratégica, las tesis RWA, las notas entregables en Obsidian y los activos visuales.

---

## 📊 TABLA MAESTRA DE ALINEACIÓN & ESTADO (15 DÍAS)

| # | Fecha | Tesis / Concepto | Ancla Técnica | Gancho Principal (Hook) | Subtexto (CTA) | Texto Alt (SEO & Accesibilidad) | Hashtags | Copy Completo (Listo para Copiar) | Formato | Estado | ¿Publicado? | Link Publicación | Nota Entregable | Activos Visuales |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${tableRows}
---

## 🔄 Historial de Revisiones (Changelog)
- **v1.0 (2026-08-08):** Creación inicial de la matriz editorial.
- **v2.0 (${getTodayString()}):** Migración a formato kebab-case institucional alineado con la arquitectura BRIDS.
`;

  fs.writeFileSync(PARRILLA_DOC_PATH, updatedContent, 'utf8');
}

// -------------------------------------------------------------
// 4. GENERATE PUBLICATION ASSETS
// -------------------------------------------------------------
export function resolvePublicationNote(query: string): string {
  if (!query) throw new Error('Debes proporcionar el nombre, ruta o slug de la publicación.');

  let targetPath = path.isAbsolute(query) ? query : path.join(process.cwd(), query);
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
    return targetPath;
  }

  targetPath = path.join(VAULT_SOCIAL_DIR, query);
  if (fs.existsSync(targetPath)) return targetPath;
  if (fs.existsSync(`${targetPath}.md`)) return `${targetPath}.md`;

  const files = fs.readdirSync(VAULT_SOCIAL_DIR).filter(f => f.endsWith('.md'));
  const cleanQuery = query.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const matched = files.find(f => f.toLowerCase().includes(cleanQuery));

  if (matched) return path.join(VAULT_SOCIAL_DIR, matched);

  throw new Error(`No se encontró ninguna publicación que coincida con "${query}" en Social Content.`);
}

export function extractAssetContext(topicName: string) {
  const cleanName = (topicName || '').toLowerCase();
  const lore = {
    brand_slogan: 'Infraestructura Web3 segura, accesible y trazable para invertir en bienes raíces estructurados desde $100 USD',
    platform_ecosystem: 'Solana RWA / Metaplex Core / Delaware SPVs',
    ticket_minimum: '$100 USD',
    settlement_currency: 'USDC',
    compliance_framework: 'Non-Broker-Dealer SaaS + Delaware Series LLC',
    asset_specifics: 'Activo inmobiliario de grado institucional estructurado en Delaware y tokenizado en Solana.'
  };

  if (cleanName.includes('solana') || cleanName.includes('tps') || cleanName.includes('gas')) {
    lore.asset_specifics = 'Infraestructura blockchain en Solana de alta velocidad (>2,000 TPS) y tarifas submilesimales (<$0.001) para distribución masiva de rentas.';
  } else if (cleanName.includes('spv') || cleanName.includes('delaware') || cleanName.includes('compliance')) {
    lore.asset_specifics = 'Estructuración dual con Delaware C-Corp operando el software y LLCs independientes (SPVs) como titulares jurídicos exclusivos del activo.';
  } else if (cleanName.includes('metaplex') || cleanName.includes('core') || cleanName.includes('freeze') || cleanName.includes('recovery')) {
    lore.asset_specifics = 'Plugins avanzados de Metaplex Core (Freeze y Authority/Recovery) que permiten congelar y reemitir NFTs tras verificación de identidad KYC sin violar derechos fiduciarios.';
  }
  return lore;
}

export function buildContextualManifest(notePath: string, inputImagePath: string | null = null) {
  const fileContent = fs.readFileSync(notePath, 'utf8');
  const noteFileName = path.basename(notePath);
  const isCarousel = noteFileName.includes('carrusel') || fileContent.includes('carrusel-4-slides');
  const assetTopic = 'Real Estate RWA Tokenization';
  const technicalRef = 'Solana Metaplex Core / Delaware SPV';
  const aspectRatio = isCarousel ? '4:5' : '9:16';

  const slugMatch = noteFileName.replace(/\.md$/, '').match(/\d{4}-\d{2}-\d{2}-(?:[a-z0-9]+)-(?:carrusel-)?(.*)/);
  const slug = slugMatch ? slugMatch[1] : noteFileName.replace(/\.md$/, '');
  const dateMatch = noteFileName.match(/^\d{4}-\d{2}-\d{2}/);
  const dateStr = dateMatch ? dateMatch[0] : new Date().toISOString().slice(0, 10);

  const folderName = isCarousel ? `${dateStr}-carrusel-${slug}` : `${dateStr}-assets-${slug}`;
  const assetDir = path.join(ASSETS_ROOT, folderName);
  ensureDir(assetDir);

  const assetContext = extractAssetContext(assetTopic);
  let heroImageCopied = false;
  if (inputImagePath && fs.existsSync(inputImagePath)) {
    fs.copyFileSync(inputImagePath, path.join(assetDir, '01-portada-hero.png'));
    heroImageCopied = true;
  }

  const manifest = {
    source_publication_note: path.relative(ROOT_DIR, notePath),
    publication_title: path.basename(notePath, '.md'),
    asset_topic: assetTopic,
    technical_reference: technicalRef,
    aspect_ratio: `${aspectRatio} (${aspectRatio === '4:5' ? '1080x1350 px' : '1080x1920 px'})`,
    context_alignment: {
      brand: 'BRIDS.io',
      slogan: assetContext.brand_slogan,
      ecosystem: assetContext.platform_ecosystem,
      asset_context: assetContext.asset_specifics,
      ticket_minimum: assetContext.ticket_minimum,
      settlement: assetContext.settlement_currency
    },
    slides: {
      slide_1_hero: {
        file: '01-portada-hero.png',
        context_prompt: `High-end architectural photography of modern luxury commercial real estate building representing ${assetTopic}.`
      },
      slide_2_tech_diagram: {
        file: '02-diagrama-arquitectura-tecnica.png',
        context_prompt: `Clean minimalist infographic technical diagram illustrating ${technicalRef} on deep navy background (#0B192C).`
      },
      slide_3_financial_breakdown: {
        file: '03-desglose-financiero-rendimiento.png',
        context_prompt: 'Sophisticated fintech dashboard metric visual showing fractional real estate yield and cash flow in USDC.'
      },
      slide_4_conversion_cta: {
        file: '04-conversion-cta.png',
        context_prompt: "Minimalist high-end fintech slide on dark solid slate blue canvas (#0B192C), centered modern white BRIDS logo emblem."
      }
    }
  };

  const manifestPath = path.join(assetDir, 'generation-prompts.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  return {
    success: true,
    notePath,
    noteFileName,
    assetDir,
    manifestPath,
    manifest,
    heroImageCopied
  };
}

export function generatePublicationAssets(query: string, inputImagePath: string | null = null) {
  const notePath = resolvePublicationNote(query);
  return buildContextualManifest(notePath, inputImagePath);
}

// -------------------------------------------------------------
// CLI ENTRYPOINT
// -------------------------------------------------------------
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const args = process.argv.slice(2);
  const sub = args[0] || 'grid';

  if (sub === 'post') {
    const [, platform, idea, type, ref, asset] = args;
    const res = createSocialPost(platform, idea, type, ref, asset);
    console.log(`🎉 Publicación generada exitosamente: ${res.fileName}`);
  } else if (sub === 'carousel') {
    const [, idea, imagePath, assetClass, technicalRef, platform] = args;
    const res = createSocialCarousel({ idea, imagePath, assetClass, technicalRef, platform });
    console.log(`🎉 Carrusel generado: ${res.noteFileName}`);
  } else if (sub === 'assets') {
    const query = args[1];
    const res = generatePublicationAssets(query);
    console.log(`🎨 Prompts contextuales generados en: ${res.manifestPath}`);
  } else {
    const plan = loadPlan();
    if (args.includes('sync') || args.includes('--scaffold')) {
      scaffoldAllMissing(plan);
      updateParrillaDocument(plan);
    } else if (args.includes('update') || args.includes('--update-doc')) {
      updateParrillaDocument(plan);
    }
    auditContentGrid({ silent: false });
  }
}
