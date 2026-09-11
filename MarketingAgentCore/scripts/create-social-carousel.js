#!/usr/bin/env node

/**
 * Programmatic 4-Slide Social Carousel System & Asset Pipeline for AndreArt
 *
 * Capabilities:
 * - Single carousel creation via positional arguments or CLI flags (--idea, --image, --garment, --ref)
 * - Batch creation via JSON config (--batch <path>)
 * - Exportable Node.js module API for programmatic integration
 * - Ultra-minimalist prompt engine with 50%+ negative space and brand tokens (#3E2356, #CBBAD9)
 * - Direct asset management and Obsidian Markdown deliverable generation
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const VAULT_SOCIAL_DIR = path.join(ROOT_DIR, 'BRIDS Brain', '07 Paid, Social & Community', 'Social Content');
const ASSETS_ROOT = path.join(VAULT_SOCIAL_DIR, 'Assets');
const BRAND_ASSETS_DIR = path.join(ROOT_DIR, 'MarketingAgentCore', 'context', 'brand-assets');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'MarketingAgentCore', 'templates', 'carousel-post-template.md');

function sanitizeSlug(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Core Programmatic Carousel Creation Engine
 */
function createCarousel(options = {}) {
  const {
    idea,
    imagePath,
    garment = 'Prenda de Autor Urban Fantasy',
    culturalRef = 'Jujutsu Kaisen / Cyberpunk / Star Wars',
    platform = 'instagram',
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

  // Protection Guard
  if (fs.existsSync(notePath) && !force) {
    const err = new Error(`El archivo de carrusel "${noteFileName}" ya existe.`);
    err.code = 'EEXIST';
    err.path = notePath;
    throw err;
  }

  // 1. Process Input Image (Slide 1: Hero)
  const heroTarget = path.join(assetDir, '01-portada-hero.png');
  let hasInputImage = false;

  if (imagePath && fs.existsSync(imagePath)) {
    fs.copyFileSync(imagePath, heroTarget);
    hasInputImage = true;
  } else {
    const readmeContent = `# Activos del Carrusel: ${folderName}\n\n` +
      `Coloca tu fotografía principal como \`01-portada-hero.png\` en esta carpeta.\n\n` +
      `Los prompts para generar los slides 2, 3 y 4 se encuentran en \`generation-prompts.json\`.`;
    fs.writeFileSync(path.join(assetDir, 'README-ASSETS.md'), readmeContent, 'utf8');
  }

  // 2. Generate Structured Prompts Manifest with Strict Minimalism
  const promptsManifest = {
    system_version: "2.0-minimalist",
    carousel_id: folderName,
    aspect_ratio: "4:5 (1080x1350 px)",
    garment,
    cultural_reference: culturalRef,
    brand_visual_identity: {
      palette: {
        deep_violet: "#3E2356",
        soft_lilac: "#CBBAD9",
        atelier_ivory: "#F6F4EE",
        obsidian_charcoal: "#1E1B24",
        pure_white: "#FFFFFF"
      },
      positive_tokens: "andreart brand visual style, ultra-minimalist, ample negative space, clean uncluttered composition, airy elegance, loose delicate fluid linework, zero clutter, spacious clean background, haute couture minimalism, simple and breathable layout",
      negative_tokens: "cluttered, overcrowded, busy composition, excessive annotations, floating objects, saturated details, messy lines, text clutter, heavy textures, overly dense, visually noisy, cheap cosplay, bright neon party colors, childish cartoon, muddy colors"
    },
    slides: {
      slide_1_hero: {
        file: "01-portada-hero.png",
        type: "Fotografía Editorial / Hero",
        description: `Fotografía editorial vertical 4:5 de alta costura urbana. ${garment} luciendo en modelo con iluminación dramática de taller, atmósfera violeta profundo (#3E2356) y porte heroico inspirado en ${culturalRef}.`,
        prompt: `High-fashion editorial vertical 4:5 portrait of a model wearing avant-garde ${garment}, Andreart brand style, deep violet atmospheric studio lighting (#3E2356), soft lavender rim light (#CBBAD9), moody cinematic depth, uncluttered clean background, sharp focus, haute couture styling.`
      },
      slide_2_line_art_figurine: {
        file: "02-figurin-lineas-tecnico.png",
        type: "Ficha Técnica CAD de Patronaje (Figurín & Plano Técnico)",
        description: `Ilustración técnica de moda y plano CAD de patronaje. Maniquí estilizado vistiendo el conjunto a la izquierda y dibujo plano técnico con cotas, pliegues y anotaciones a la derecha sobre fondo blanco puro.`,
        prompt: `Professional fashion technical flat drawing and specification sheet of avant-garde ${garment}, in the exact artistic CAD style of the reference image, pure white background, crisp black vector line art. Left side shows a minimalist mannequin fashion figure wearing the ensemble. Right side shows the detailed technical flat drawing of the garment with seam lines, fabric drape arrows, and neat uppercase technical callout annotations with leader lines, and 'DESIGN NO. 042' at bottom right. High contrast, precise tailoring blueprints.`
      },
      slide_3_pas_detail: {
        file: "03-plano-detalle-pas.png",
        type: "Planos Macro Detalle & Confort PAS",
        description: `Fotografía macro a la textura textil de alto gramaje con matices lavanda (#CBBAD9), costuras reforzadas limpias y marquilla estampada suave imperceptible al tacto (confort PAS).`,
        prompt: `Professional macro photography of dark heavyweight luxury textile weave with soft lavender undertones (#CBBAD9), clean reinforced tailoring stitches, seamless printed tagless label, tactile comfort PAS, clean studio lighting, shallow depth of field, minimalist composition.`
      },
      slide_4_conversion_cta: {
        file: "04-conversion-cta.png",
        type: "Slide de Cierre Comercial (CTA)",
        description: `Diseño gráfico comercial ultra-minimalista para Instagram en formato 4:5. Fondo liso en morado real (#3E2356), monograma geométrico blanco de Andreart, tipografía fina 'SÉ TU PROPIO HÉROE'. Máxima limpieza visual.`,
        prompt: `Ultra-minimalist haute couture Instagram slide for Andreart, seamless flat solid deep royal violet background (#3E2356), vast empty negative space, perfectly centered clean white geometric Andreart logo monogram, minimal single-line elegant typography 'SÉ TU PROPIO HÉROE', clean refined luxury aesthetic, zero clutter, breathable and simple.`
      }
    }
  };

  fs.writeFileSync(
    path.join(assetDir, 'generation-prompts.json'),
    JSON.stringify(promptsManifest, null, 2),
    'utf8'
  );

  // 3. Build Obsidian Markdown Note
  const titleRaw = ideaSlug.replace(/-/g, ' ');
  const titleUpper = titleRaw.toUpperCase();

  let noteContent = '';
  if (fs.existsSync(TEMPLATE_PATH)) {
    let tpl = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    tpl = tpl.replace(/{{TITLE}}/g, titleRaw);
    tpl = tpl.replace(/{{TITLE_UPPER}}/g, titleUpper);
    tpl = tpl.replace(/{{GARMENT}}/g, garment);
    tpl = tpl.replace(/{{CULTURAL_REF}}/g, culturalRef);
    tpl = tpl.replace(/{{DATE}}/g, date);
    tpl = tpl.replace(/{{FOLDER_NAME}}/g, folderName);
    tpl = tpl.replace(/{{IDEA_SLUG}}/g, ideaSlug);
    tpl = tpl.replace(/{{IDEA_SLUG_RAW}}/g, ideaSlug.replace(/-/g, ''));
    noteContent = tpl;
  } else {
    noteContent = `---
title: "[INSTAGRAM CARRUSEL] ${titleRaw}"
category: "07 Paid, Social & Community"
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
> **Resumen Ejecutivo:** Carrusel de 4 slides en formato vertical 4:5 enfocado en ${garment} (${culturalRef}).

---

## 🖼️ Galería Visual del Carrusel (4 Slides)

### Slide 1: Portada Hero
![[07 Paid, Social & Community/Social Content/Assets/${folderName}/01-portada-hero.png]]

### Slide 2: Figurín Técnico en Líneas
![[07 Paid, Social & Community/Social Content/Assets/${folderName}/02-figurin-lineas-tecnico.png]]

### Slide 3: Planos Detalle & Confort PAS
![[07 Paid, Social & Community/Social Content/Assets/${folderName}/03-plano-detalle-pas.png]]

### Slide 4: Conversión & Actitud Heroica (CTA)
![[07 Paid, Social & Community/Social Content/Assets/${folderName}/04-conversion-cta.png]]

---

## 🔄 Historial de Revisiones (Changelog)
- **v1.0 (${date}):** Creación del carrusel de 4 slides.
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

/**
 * Batch Creation Engine
 */
function batchCreateCarousels(batchConfigPath) {
  if (!fs.existsSync(batchConfigPath)) {
    throw new Error(`No se encontró el archivo de configuración batch en: ${batchConfigPath}`);
  }

  const config = JSON.parse(fs.readFileSync(batchConfigPath, 'utf8'));
  const carousels = config.carousels || [];
  const results = [];

  console.log(`\n🚀 Ejecutando creación batch de ${carousels.length} carruseles...\n`);

  for (const item of carousels) {
    try {
      const res = createCarousel(item);
      results.push(res);
      console.log(`✅ [${res.carouselId}] Generado exitosamente -> ${res.noteFileName}`);
    } catch (e) {
      console.error(`❌ Error en "${item.idea || 'desconocido'}": ${e.message}`);
      results.push({ success: false, error: e.message, idea: item.idea });
    }
  }

  return results;
}

// -------------------------------------------------------------
// CLI INTERFACE & ARGS PARSING
// -------------------------------------------------------------
function parseArgs(args) {
  const options = {
    idea: '',
    imagePath: '',
    garment: 'Prenda de Autor Urban Fantasy',
    culturalRef: 'Jujutsu Kaisen / Cyberpunk / Star Wars',
    platform: 'instagram',
    force: false,
    batchPath: '',
    jsonOutput: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--idea' && args[i + 1]) {
      options.idea = args[++i];
    } else if (arg === '--image' && args[i + 1]) {
      options.imagePath = args[++i];
    } else if (arg === '--garment' && args[i + 1]) {
      options.garment = args[++i];
    } else if (arg === '--ref' && args[i + 1]) {
      options.culturalRef = args[++i];
    } else if (arg === '--platform' && args[i + 1]) {
      options.platform = args[++i];
    } else if (arg === '--batch' && args[i + 1]) {
      options.batchPath = args[++i];
    } else if (arg === '--force' || arg === '-f') {
      options.force = true;
    } else if (arg === '--json') {
      options.jsonOutput = true;
    } else if (!arg.startsWith('-')) {
      // Positional args fallback
      if (!options.idea) options.idea = arg;
      else if (!options.imagePath) options.imagePath = arg;
      else if (options.garment === 'Prenda de Autor Urban Fantasy') options.garment = arg;
      else if (options.culturalRef === 'Jujutsu Kaisen / Cyberpunk / Star Wars') options.culturalRef = arg;
      else if (options.platform === 'instagram') options.platform = arg;
    }
  }

  return options;
}

function runCli() {
  const rawArgs = process.argv.slice(2);

  if (rawArgs.length === 0 || rawArgs.includes('--help') || rawArgs.includes('-h')) {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║         SISTEMA PROGRAMÁTICO DE CARRUSELES VISUALES (ANDREART VESTUARIO)              ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝

USO BÁSICO (Argumentos Posicionales):
  bash MarketingAgentCore/scripts/create-social-carousel.sh "<idea>" [imagen] [prenda] [referencia] [red]

USO AVANZADO (Flags Nombradas):
  bash MarketingAgentCore/scripts/create-social-carousel.sh \\
    --idea "haori-cyberpunk-nightlife" \\
    --image ./foto-taller.jpg \\
    --garment "Haori Urbano de Autor" \\
    --ref "Cyberpunk Edgerunners" \\
    --platform instagram

USO POR LOTES (Batch Mode):
  bash MarketingAgentCore/scripts/create-social-carousel.sh --batch ./mi-plan-semanal.json

OPCIONES:
  --force, -f       Sobrescribe la nota si ya existe (usar con precaución)
  --json            Retorna la salida estructurada en JSON para consumo programático
  --help, -h        Muestra esta ayuda
`);
    process.exit(0);
  }

  const options = parseArgs(rawArgs);

  try {
    if (options.batchPath) {
      const results = batchCreateCarousels(options.batchPath);
      if (options.jsonOutput) {
        console.log(JSON.stringify(results, null, 2));
      }
    } else {
      const result = createCarousel(options);
      if (options.jsonOutput) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`\n🎉 Carrusel Generado Programáticamente:`);
        console.log(`   📄 Nota en Obsidian: ${result.noteFileName}`);
        console.log(`   📍 Ruta Completa:    ${result.notePath}`);
        console.log(`   📁 Carpeta Activos:  ${result.assetDir}`);
        console.log(`   🎨 Prompts JSON:     ${result.promptsManifestPath}`);
        console.log(`   🖼️ Foto de Entrada:  ${result.hasInputImage ? 'Procesada ✅' : 'Pendiente (ver README-ASSETS.md) ⏳'}\n`);
      }
    }
  } catch (err) {
    if (options.jsonOutput) {
      console.error(JSON.stringify({ success: false, error: err.message, code: err.code }));
    } else {
      console.error(`\n❌ ERROR EN EL SISTEMA DE CARRUSELES: ${err.message}\n`);
    }
    process.exit(1);
  }
}

// Export for programmatic Node.js require() and execute CLI if called directly
module.exports = {
  createCarousel,
  batchCreateCarousels
};

if (require.main === module) {
  runCli();
}
