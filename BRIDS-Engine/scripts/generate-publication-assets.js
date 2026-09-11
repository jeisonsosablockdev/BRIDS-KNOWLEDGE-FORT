#!/usr/bin/env node

/**
 * Context-Aware Publication Visual Engine for AndreArt Vestuario
 *
 * Capabilities:
 * - Reads and parses any publication note (Markdown frontmatter + content sections)
 * - Reads product marketing context (garment lore, ICP, PAS details, Bogotá tailoring)
 * - Reads brand visual style guide (palette #3E2356/#CBBAD9, line-art minimalism, negative tokens)
 * - Extracts specific slide hooks, micro-copys, and cultural narratives
 * - Generates high-fidelity contextual prompts tailored to the garment & story
 * - Updates/creates asset directories with generation-prompts.json and Obsidian embeds
 *
 * Usage:
 *   bash generate-publication-assets.sh <note-path-or-slug> [--input-image <path>] [--json] [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const VAULT_DIR = path.join(ROOT_DIR, 'BRIDS-Brain');
const SOCIAL_CONTENT_DIR = path.join(VAULT_DIR, '07 Paid, Social & Community', 'Social Content');
const ASSETS_ROOT = path.join(SOCIAL_CONTENT_DIR, 'Assets');
const BRAND_CONTEXT_PATH = path.join(ROOT_DIR, 'BRIDS-Engine', 'context', 'product-marketing-context.md');
const STYLE_GUIDE_PATH = path.join(ROOT_DIR, 'BRIDS-Engine', 'context', 'brand-visual-style-guide.md');
const BRAND_ASSETS_DIR = path.join(ROOT_DIR, 'BRIDS-Engine', 'context', 'brand-assets');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { frontmatter: {}, body: content };

  const rawYaml = match[1];
  const body = content.slice(match[0].length);
  const frontmatter = {};

  const lines = rawYaml.split(/\r?\n/);
  let currentKey = null;
  let isArray = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('- ') && currentKey && isArray) {
      frontmatter[currentKey].push(trimmed.slice(2).replace(/^["']|["']$/g, ''));
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx > -1) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();

      if (val === '') {
        currentKey = key;
        isArray = true;
        frontmatter[key] = [];
      } else {
        isArray = false;
        currentKey = key;
        val = val.replace(/^["']|["']$/g, '');
        if (val === 'true') val = true;
        else if (val === 'false') val = false;
        frontmatter[key] = val;
      }
    }
  }

  return { frontmatter, body };
}

/**
 * Finds the matching publication note in the vault
 */
function resolvePublicationNote(query) {
  if (!query) throw new Error('Debes proporcionar el nombre, ruta o slug de la publicación.');

  // Direct path
  let targetPath = path.isAbsolute(query) ? query : path.join(process.cwd(), query);
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
    return targetPath;
  }

  // Look in Social Content folder
  targetPath = path.join(SOCIAL_CONTENT_DIR, query);
  if (fs.existsSync(targetPath)) return targetPath;
  if (fs.existsSync(`${targetPath}.md`)) return `${targetPath}.md`;

  // Search by slug substring
  const files = fs.readdirSync(SOCIAL_CONTENT_DIR).filter(f => f.endsWith('.md'));
  const cleanQuery = query.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const matched = files.find(f => f.toLowerCase().includes(cleanQuery));

  if (matched) return path.join(SOCIAL_CONTENT_DIR, matched);

  throw new Error(`No se encontró ninguna publicación que coincida con "${query}" en Social Content.`);
}

/**
 * Extracts lore and context details about a garment from product-marketing-context.md
 */
function extractGarmentContext(garmentName) {
  if (!fs.existsSync(BRAND_CONTEXT_PATH)) return {};

  const content = fs.readFileSync(BRAND_CONTEXT_PATH, 'utf8');
  const cleanName = (garmentName || '').toLowerCase();

  const lore = {
    brand_slogan: "Sé tu propio héroe",
    atelier_location: "Bogotá, Colombia",
    sizing: "Moldería inteligente XS a XL adaptable",
    pas_comfort: "Marquilla estampada ultrasuave cero picazón y alta densidad táctil",
    textiles: "Textiles pesados de alta densidad y caída estructurada",
    garment_specifics: ""
  };

  if (cleanName.includes('hakama')) {
    lore.garment_specifics = "Pantalón Hakama unisex con pliegues arquitectónicos, pretina adaptable multiposición e inspiración samurái urbana chic.";
  } else if (cleanName.includes('hanbok')) {
    lore.garment_specifics = "Hanbok reinterpretado con cruce frontal contemporáneo, lazos fluidos y caída noble para eventos K-pop o porte elegante.";
  } else if (cleanName.includes('haori')) {
    lore.garment_specifics = "Haori de corte recto oriental urbano, mangas estructuradas y estilo alternativo vanguardista para nightlife.";
  } else if (cleanName.includes('capa') || cleanName.includes('mago')) {
    lore.garment_specifics = "Capa de autor con capucha envolvente de media estación, caída pesada y corte de mago contemporáneo.";
  } else if (cleanName.includes('piloto') || cleanName.includes('star wars')) {
    lore.garment_specifics = "Chaqueta de piloto galáctico con cortes limpios de abrigo y presencia escénica inspirada en la ciencia ficción.";
  } else if (cleanName.includes('sacerdotisa')) {
    lore.garment_specifics = "Silueta ceremonial sintoísta deconstruida en dos piezas con cortes geométricos y mística oriental.";
  } else {
    lore.garment_specifics = "Indumentaria conceptual de autor con patronaje deconstruido y estética Urban Fantasy.";
  }

  return lore;
}

/**
 * Parses Slide Details from Note Body
 */
function extractSlideDetails(body, garment, culturalRef) {
  const slides = {
    slide_1: {
      headline: "No naciste para vestir ropa aburrida.",
      microcopy: `${garment} de Autor • Confección en Bogotá`
    },
    slide_2: {
      headline: "Arquitectura Textil de Autor",
      microcopy: "Moldería inteligente multitalla adaptativa XS-XL • Patrón original por Andrea"
    },
    slide_3: {
      headline: "Cero Roces. Cero Etiquetas que Pican.",
      microcopy: "Marquilla estampada ultrasuave • Telas pesadas con caída dramática"
    },
    slide_4: {
      headline: "Elige tu Silueta. Sé tu Propio Héroe.",
      microcopy: "Envíos a todo Colombia • Pide al WhatsApp o enlace en bio"
    }
  };

  // Attempt regex extraction from markdown note
  const s1 = body.match(/### Slide 1:[^\n]*\n(?:!\[\[.*?\]\]\n)?\*Titular en Imagen:\* \*\*"?(.*?)"?\*\*(?:\s*\n\*Micro-copy:\* (.*?))?/);
  if (s1 && s1[1]) slides.slide_1.headline = s1[1];
  if (s1 && s1[2]) slides.slide_1.microcopy = s1[2].trim();

  const s2 = body.match(/### Slide 2:[^\n]*\n(?:!\[\[.*?\]\]\n)?\*Titular en Imagen:\* \*\*"?(.*?)"?\*\*(?:\s*\n\*Micro-copy:\* (.*?))?/);
  if (s2 && s2[1]) slides.slide_2.headline = s2[1];
  if (s2 && s2[2]) slides.slide_2.microcopy = s2[2].trim();

  const s3 = body.match(/### Slide 3:[^\n]*\n(?:!\[\[.*?\]\]\n)?\*Titular en Imagen:\* \*\*"?(.*?)"?\*\*(?:\s*\n\*Micro-copy:\* (.*?))?/);
  if (s3 && s3[1]) slides.slide_3.headline = s3[1];
  if (s3 && s3[2]) slides.slide_3.microcopy = s3[2].trim();

  const s4 = body.match(/### Slide 4:[^\n]*\n(?:!\[\[.*?\]\]\n)?\*Titular en Imagen:\* \*\*"?(.*?)"?\*\*(?:\s*\n\*Micro-copy:\* (.*?))?/);
  if (s4 && s4[1]) slides.slide_4.headline = s4[1];
  if (s4 && s4[2]) slides.slide_4.microcopy = s4[2].trim();

  return slides;
}

/**
 * Builds Full Context-Aware Prompts Manifest for the Publication
 */
function buildContextualManifest(notePath, inputImagePath = null) {
  const fileContent = fs.readFileSync(notePath, 'utf8');
  const { frontmatter, body } = parseYamlFrontmatter(fileContent);

  const noteFileName = path.basename(notePath);
  const isCarousel = frontmatter.content_type === 'carrusel-4-slides' || noteFileName.includes('carrusel');
  const garment = frontmatter.garment || 'Prenda de Autor Urban Fantasy';
  const culturalRef = frontmatter.cultural_reference || 'Anime & Fantasía Urbana';
  const platform = frontmatter.platform || 'instagram';
  const aspectRatio = frontmatter.aspect_ratio || (isCarousel ? '4:5' : '9:16');

  // Derive Folder Name
  const slugMatch = noteFileName.replace(/\.md$/, '').match(/\d{4}-\d{2}-\d{2}-(?:instagram|tiktok|facebook)-(?:carrusel-)?(.*)/);
  const slug = slugMatch ? slugMatch[1] : noteFileName.replace(/\.md$/, '');
  const dateMatch = noteFileName.match(/^\d{4}-\d{2}-\d{2}/);
  const dateStr = dateMatch ? dateMatch[0] : new Date().toISOString().slice(0, 10);

  const folderName = isCarousel ? `${dateStr}-carrusel-${slug}` : `${dateStr}-assets-${slug}`;
  const assetDir = path.join(ASSETS_ROOT, folderName);
  ensureDir(assetDir);

  const garmentLore = extractGarmentContext(garment);
  const slideDetails = extractSlideDetails(body, garment, culturalRef);

  // If input image was provided, copy it to assetDir as 01-portada-hero.png and extract faithful Line-Art & CAD
  let heroImageCopied = false;
  if (inputImagePath && fs.existsSync(inputImagePath)) {
    const heroTarget = path.join(assetDir, '01-portada-hero.png');
    fs.copyFileSync(inputImagePath, heroTarget);
    heroImageCopied = true;

    try {
      const { execSync } = require('child_process');
      const extractorScript = path.join(__dirname, 'extract_photo_lineart.py');
      const cmd = `/Users/jaymusicmachine/.local/bin/uv run --with opencv-python-headless --with pillow --with numpy python "${extractorScript}" --input "${inputImagePath}" --output-dir "${assetDir}" --mode all --garment "${garment}"`;
      execSync(cmd, { stdio: 'pipe' });
      // Link generated files to standard slide positions
      const cadGenerated = path.join(assetDir, 'cad_blueprint.png');
      const lineartGenerated = path.join(assetDir, 'lineart_figure.png');
      if (fs.existsSync(cadGenerated)) {
        fs.copyFileSync(cadGenerated, path.join(assetDir, '02-figurin-lineas-tecnico.png'));
        fs.copyFileSync(cadGenerated, path.join(assetDir, '06-patron-2-cad-plano-tecnico.png'));
      }
      if (fs.existsSync(lineartGenerated)) {
        fs.copyFileSync(lineartGenerated, path.join(assetDir, '07-patron-3-figurin-lineas.png'));
      }
    } catch (err) {
      console.warn(`[Aviso] No se pudo ejecutar el extractor local de lineart: ${err.message}`);
    }
  }

  const manifest = {
    source_publication_note: path.relative(ROOT_DIR, notePath),
    publication_title: frontmatter.title || path.basename(notePath, '.md'),
    garment: garment,
    cultural_reference: culturalRef,
    aspect_ratio: `${aspectRatio} (${aspectRatio === '4:5' ? '1080x1350 px' : '1080x1920 px'})`,
    context_alignment: {
      brand: "Andreart Vestuario",
      slogan: garmentLore.brand_slogan,
      atelier: garmentLore.atelier_location,
      garment_lore: garmentLore.garment_specifics,
      tactile_comfort: garmentLore.pas_comfort,
      sizing_system: garmentLore.sizing
    },
    brand_visual_tokens: {
      palette: {
        deep_violet_primary: "#3E2356",
        soft_lilac_accent: "#CBBAD9",
        atelier_ivory_canvas: "#F6F4EE",
        obsidian_charcoal_line: "#1E1B24",
        pure_white_logo: "#FFFFFF"
      },
      positive_tokens: "andreart brand visual style, ultra-minimalist, ample negative space, clean uncluttered composition, airy elegance, loose delicate fluid linework, zero clutter, spacious clean background, haute couture minimalism, simple and breathable layout",
      negative_tokens: "cluttered, overcrowded, busy composition, excessive annotations, floating objects, saturated details, messy lines, text clutter, heavy textures, overly dense, visually noisy, cheap cosplay, bright neon party colors, childish cartoon, muddy colors"
    },
    slides: {
      slide_1_hero: {
        file: "01-portada-hero.png",
        type: "Fotografía Editorial / Hero",
        overlay_headline: slideDetails.slide_1.headline,
        overlay_microcopy: slideDetails.slide_1.microcopy,
        context_prompt: `High-fashion editorial vertical ${aspectRatio} portrait of a model wearing avant-garde ${garment}, inspired by ${culturalRef}, deep violet atmospheric studio lighting (#3E2356), soft lavender rim light (#CBBAD9), moody cinematic depth, uncluttered clean background, sharp focus, haute couture styling, photorealistic.`
      },
      slide_2_line_art_figurine: {
        file: "02-figurin-lineas-tecnico.png",
        type: "Ficha Técnica CAD de Patronaje (Figurín & Plano Técnico)",
        overlay_headline: slideDetails.slide_2.headline,
        overlay_microcopy: slideDetails.slide_2.microcopy,
        context_prompt: `Professional fashion technical flat drawing and specification sheet of avant-garde ${garment} (${garmentLore.garment_specifics}), pure white background, crisp black vector line art. Left side shows a minimalist mannequin fashion figure wearing the ensemble. Right side shows the detailed technical flat drawing of the garment with seam lines, fabric drape arrows, and neat uppercase technical callout annotations with leader lines, and 'DESIGN NO. 042' at bottom right. High contrast, precise tailoring blueprints.`
      },
      slide_3_pas_detail: {
        file: "03-plano-detalle-pas.png",
        type: "Planos Macro Detalle & Confort PAS",
        overlay_headline: slideDetails.slide_3.headline,
        overlay_microcopy: slideDetails.slide_3.microcopy,
        context_prompt: `Professional macro photography of dark heavyweight luxury textile weave of ${garment} with soft lavender undertones (#CBBAD9), clean reinforced tailoring stitches, seamless printed tagless label, tactile comfort PAS, clean studio lighting, shallow depth of field, minimalist composition.`
      },
      slide_4_conversion_cta: {
        file: "04-conversion-cta.png",
        type: "Slide de Cierre Comercial (CTA)",
        overlay_headline: slideDetails.slide_4.headline,
        overlay_microcopy: slideDetails.slide_4.microcopy,
        context_prompt: `Ultra-minimalist haute couture Instagram slide for Andreart, seamless flat solid deep royal violet background (#3E2356), vast empty negative space, perfectly centered clean white geometric Andreart logo monogram, minimal single-line elegant typography 'SÉ TU PROPIO HÉROE', clean refined luxury aesthetic, zero clutter, breathable and simple.`
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

// -------------------------------------------------------------
// CLI INTERFACE
// -------------------------------------------------------------
function runCli() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║         SISTEMA DE REFERENCIA DE PUBLICACIÓN & GENERADOR DE CONTEXTO VISUAL           ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝

DESCRIPCIÓN:
  Toma como referencia cualquier nota de publicación existente en Obsidian, extrae
  automáticamente su frontmatter, hook, micro-copys y referencia cultural, los cruza con
  el Marketing Context y la Guía Visual de Andreart, y genera los prompts contextualizados
  y la carpeta de activos lista para producción de imágenes.

USO:
  bash BRIDS-Engine/scripts/generate-publication-assets.sh <nota-o-slug> [opciones]

EJEMPLOS:
  # Referenciar por nombre de archivo:
  bash BRIDS-Engine/scripts/generate-publication-assets.sh "2026-08-13-instagram-carrusel-hanbok-reinterpretado-concierto-bts.md"

  # Referenciar por slug o palabra clave:
  bash BRIDS-Engine/scripts/generate-publication-assets.sh "hanbok"

  # Referenciar y suministrar la foto de entrada de la prenda:
  bash BRIDS-Engine/scripts/generate-publication-assets.sh "sacerdotisa" --input-image ./foto-prenda.jpg

  # Salida en JSON para automatizaciones / agentes:
  bash BRIDS-Engine/scripts/generate-publication-assets.sh "choso" --json

OPCIONES:
  --input-image <path>   Copia la fotografía de entrada como 01-portada-hero.png
  --json                 Devuelve la respuesta completa en formato JSON
  --help, -h             Muestra esta ayuda
`);
    process.exit(0);
  }

  let query = '';
  let inputImage = null;
  let jsonOutput = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--input-image' && args[i + 1]) {
      inputImage = args[++i];
    } else if (arg === '--json') {
      jsonOutput = true;
    } else if (!arg.startsWith('-') && !query) {
      query = arg;
    }
  }

  try {
    const notePath = resolvePublicationNote(query);
    const result = buildContextualManifest(notePath, inputImage);

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('\n' + '═'.repeat(85));
      console.log('🎨 SISTEMA DE REFERENCIA DE PUBLICACIÓN & CONTEXTO VISUAL');
      console.log('═'.repeat(85));
      console.log(`\n📄 Publicación Referenciada:  ${result.noteFileName}`);
      console.log(`👗 Prenda Extraída:           ${result.manifest.garment}`);
      console.log(`⛩️  Referencia Cultural:       ${result.manifest.cultural_reference}`);
      console.log(`📁 Carpeta de Activos:        ${result.assetDir}`);
      console.log(`📜 Manifiesto de Prompts:     ${result.manifestPath}`);
      console.log(`🖼️ Foto Hero de Entrada:      ${result.heroImageCopied ? 'Procesada ✅' : 'Colocar en la carpeta de activos ⏳'}\n`);

      console.log('✨ PROMPTS CONTEXTUALES GENERADOS (LISTOS PARA IA):');
      console.log('─'.repeat(85));
      console.log(`[Slide 1 - Hero]:\n${result.manifest.slides.slide_1_hero.context_prompt}\n`);
      console.log(`[Slide 2 - Figurín Minimalista]:\n${result.manifest.slides.slide_2_line_art_figurine.context_prompt}\n`);
      console.log(`[Slide 3 - Detalle PAS]:\n${result.manifest.slides.slide_3_pas_detail.context_prompt}\n`);
      console.log(`[Slide 4 - Cierre CTA Monograma]:\n${result.manifest.slides.slide_4_conversion_cta.context_prompt}\n`);
      console.log('═'.repeat(85) + '\n');
    }
  } catch (err) {
    if (jsonOutput) {
      console.error(JSON.stringify({ success: false, error: err.message }));
    } else {
      console.error(`\n❌ ERROR: ${err.message}\n`);
    }
    process.exit(1);
  }
}

module.exports = {
  resolvePublicationNote,
  extractGarmentContext,
  buildContextualManifest
};

if (require.main === module) {
  runCli();
}
