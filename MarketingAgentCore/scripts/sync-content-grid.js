#!/usr/bin/env node

/**
 * Master Content Alignment & Synchronization Tool for AndreArt Vestuario
 *
 * Ensures 1-to-1 alignment between:
 * 1. La Parrilla de Publicaciones Estratégica (15 Días)
 * 2. Las Notas Entregables en Obsidian (Social Content/*.md)
 * 3. Las Carpetas de Activos Visuales (Social Content/Assets/*)
 */

const fs = require('fs');
const path = require('path');
const { createCarousel } = require('./create-social-carousel');

const ROOT_DIR = path.resolve(__dirname, '../..');
const VAULT_SOCIAL_DIR = path.join(ROOT_DIR, 'BRIDS Brain', '07 Paid, Social & Community', 'Social Content');
const ASSETS_ROOT = path.join(VAULT_SOCIAL_DIR, 'Assets');
const DEFAULT_PLAN_PATH = path.join(ROOT_DIR, 'MarketingAgentCore', 'templates', 'content-grid-plan.json');
const PARRILLA_DOC_PATH = path.join(VAULT_SOCIAL_DIR, 'Parrilla de Publicaciones Instagram 15 Dias.md');
const CREATE_POST_SCRIPT = path.join(ROOT_DIR, 'MarketingAgentCore', 'scripts', 'create-social-post.js');

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

function loadPlan(planPath = DEFAULT_PLAN_PATH) {
  if (!fs.existsSync(planPath)) {
    throw new Error(`No se encontró el plan de contenido en: ${planPath}`);
  }
  return JSON.parse(fs.readFileSync(planPath, 'utf8'));
}

/**
 * Scans the vault to assess the alignment status of each post in the plan
 */
function auditAlignment(plan) {
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

    report.push({
      postNumber: post.post_number,
      date: post.date,
      slug: post.slug,
      format: post.format,
      pillar: post.pillar,
      garment: post.garment,
      culturalRef: post.cultural_reference,
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

/**
 * Automatically creates all missing notes and asset folders for the entire grid
 */
function scaffoldAllMissing(plan) {
  const audit = auditAlignment(plan);
  console.log(`\n🚀 Sincronizando y generando entregables faltantes de la parrilla...\n`);

  let createdCount = 0;

  for (const item of audit) {
    const isCarousel = item.format === 'carrusel';

    if (!item.matchedNote) {
      if (isCarousel) {
        // Create 4-slide carousel
        try {
          createCarousel({
            idea: item.slug,
            garment: item.garment,
            culturalRef: item.culturalRef,
            platform: 'instagram',
            date: item.date
          });
          createdCount++;
          console.log(`✅ [Post ${item.postNumber} - ${item.date}] Carrusel generado: ${item.slug}`);
        } catch (e) {
          console.error(`❌ Error al crear carrusel ${item.slug}: ${e.message}`);
        }
      } else {
        // Create standard Reel / Post
        const noteFileName = `${item.date}-instagram-${item.slug}.md`;
        const notePath = path.join(VAULT_SOCIAL_DIR, noteFileName);

        const reelContent = `---
title: "[INSTAGRAM REEL] ${item.slug.replace(/-/g, ' ')}"
category: "07 Paid, Social & Community"
workflow: "W5_CONTENT_SOCIAL"
skills_used:
  - "mas-social-content"
  - "mas-ad-creative"
  - "mas-copywriting"
platform: "instagram"
content_type: "reel-vertical"
pillar: "${item.pillar}"
cultural_reference: "${item.culturalRef}"
garment: "${item.garment}"
status: draft
version: "1.0"
created_at: ${item.date}
updated_at: ${item.date}
tags:
  - marketing
  - social-content
  - reel
  - instagram
  - ${item.slug}
---

# [INSTAGRAM REEL] ${item.slug.replace(/-/g, ' ').toUpperCase()}

> [!NOTE]
> **Resumen Ejecutivo:** Video vertical Reel 9:16 para Instagram enfocado en ${item.garment} (${item.culturalRef}). Formato dinámico 15-25s aplicando la Guía Directorial SOP de 4 Escenas.

---

## 🎯 Contexto y Objetivo
- **Plataforma:** Instagram Reels (\`@andreartvestuario\`)
- **Pilar de Contenido:** ${item.pillar}
- **Prenda Protagonista:** ${item.garment}
- **Referencia Cultural:** *${item.culturalRef}*
- **Gancho Visual / Hook:** *"${item.hook}"*
- **Eslogan Oficial:** *"Sé tu propio héroe"*

---

## 🎬 1. Especificaciones Técnicas (Guía Directorial SOP)
- **Formato:** 9:16 Vertical (1080p @ 60fps)
- **Duración:** 15 a 25 segundos
- **Audio:** Captura de sonido directo a 10-15 cm (ASMR) + música rítmica de fondo

---

## ⏱️ 2. Guión de Grabación & Edición (4 Escenas)

| Tiempo | Escena | Ángulo & Tomas | Acción en Pantalla | Audio / Texto |
|---|---|---|---|---|
| **00:00 - 00:03** | **Escena 1 (Hook)** | Macro / Super Close-up (10-15 cm) | Raspado de tiza o tijera cortando tela en seco. | *"${item.hook}"* |
| **00:03 - 00:10** | **Escena 2 (Desarrollo)** | Cenital a 90° sobre mesón | Trazado de moldería y confección en taller Bogotá. | *"Diseño de autor en Bogotá. Tallas XS a XL."* |
| **00:10 - 00:18** | **Escena 3 (Densidad PAS)** | Slow-Motion 60fps + Macro | Caída pesada de tela y marquilla estampada suave. | *"Cero roces. Telas de alto gramaje."* |
| **00:18 - 00:25** | **Escena 4 (Cierre CTA)** | Contrapicado leve a 15° | Prenda en movimiento con porte heroico. | *"Pide el tuyo en el link de la bio. Sé tu propio héroe. 🛡️"* |

---

## ✍️ 3. Copy Comercial para el Caption (4 Reglas de Oro)

\`\`\`text
${item.hook}

${item.garment} confeccionado en Bogotá con silueta deconstruida, moldería inteligente que abraza desde la talla XS a la XL y confort sensorial PAS con marquilla estampada (cero picazón).

Inspirado en la mística de ${item.culturalRef}.

👉 Pide el tuyo hoy mismo en el enlace de la bio o al WhatsApp oficial antes de agotar la tanda del taller.

Sé tu propio héroe. 🛡️

#Andreart #ModaDeAutor #UrbanFantasy #BogotaModa #${item.slug.replace(/-/g, '')} #SeTuPropioHeroe
\`\`\`

---

## 📋 4. Checklist Técnico de Verificación
- [ ] Cámara en modo 1080p 60fps vertical 9:16.
- [ ] Escena 1 (Hook macro ASMR) grabada con audio limpio.
- [ ] Subtítulos centrados dentro del área segura de Instagram.
- [ ] Copy verificado con llamado a la acción comercial.

---

## 🔄 Historial de Revisiones (Changelog)
- **v1.0 (${item.date}):** Creación del guión de Reel alineado con la Parrilla Estratégica de 15 Días.

---

## 🔗 Referencias Cruzadas
- Parrilla Estratégica: [[07 Paid, Social & Community/Social Content/Parrilla de Publicaciones Instagram 15 Dias.md]]
- Guía Técnica SOP: [[07 Paid, Social & Community/Social Content/Guia Tecnica de Produccion de Contenido.md]]
- Contexto de Marca: [[01 Brand Context/product-marketing-context.md]]
`;

        fs.writeFileSync(notePath, reelContent, 'utf8');
        createdCount++;
        console.log(`✅ [Post ${item.postNumber} - ${item.date}] Reel generado: ${item.slug}`);
      }
    }
  }

  console.log(`\n✨ Sincronización completada. Se generaron ${createdCount} nuevos entregables alineados.`);
}

/**
 * Updates the master Parrilla Markdown document with aligned dashboard table and wikilinks
 */
function updateParrillaDocument(plan) {
  const audit = auditAlignment(plan);
  console.log(`\n📝 Actualizando documento maestro: ${path.basename(PARRILLA_DOC_PATH)}...`);

  let tableRows = '';
  for (const item of audit) {
    const noteLink = item.matchedNote
      ? `[[07 Paid, Social & Community/Social Content/${item.matchedNote}|📄 Ver Nota]]`
      : `*(Pendiente)*`;

    const assetLink = item.matchedAsset
      ? `[[07 Paid, Social & Community/Social Content/Assets/${item.matchedAsset}|📁 Assets]]`
      : (item.format === 'carrusel' ? `*(Sin assets)*` : `*(Video directo)*`);

    const formatBadge = item.format === 'carrusel' ? '🖼️ Carrusel (4:5)' : '🎬 Reel (9:16)';

    const publishedBox = item.published ? '[x]' : '[ ]';
    const fullCopy = `${item.hook}<br><br>${item.cta}<br><br>Sé tu propio héroe. 🛡️<br><br>${item.hashtags}`;
    tableRows += `| **${item.postNumber}** | \`${item.date}\` | **${item.garment}** | *${item.culturalRef}* | *"${item.hook}"* | ${item.cta} | *${item.altText}* | \`${item.hashtags}\` | \`${fullCopy}\` | ${formatBadge} | ${item.statusEmoji} ${item.status} | ${publishedBox} | *(Sin link)* | ${noteLink} | ${assetLink} |\n`;
  }

  const updatedContent = `---
title: "Parrilla Estratégica de Publicaciones para Instagram (15 Días)"
category: "07 Paid, Social & Community"
workflow: "W5_CONTENT_SOCIAL"
skills_used:
  - "mas-social-content"
  - "mas-ad-creative"
  - "mas-content-strategy"
status: in_progress
version: "2.5"
protected: true
created_at: 2026-08-08
updated_at: ${getTodayString()}
tags:
  - marketing
  - social-content
  - instagram-grid
  - content-calendar
---

# Parrilla Estratégica de Publicaciones para Instagram (15 Días)

*Matriz Maestra Intercalada y Sincronizada para @andreartvestuario*  
*Folder: 07 Paid, Social & Community / Social Content*  
*Last updated: ${getTodayString()}*

> 🛡️ **Eslogan Oficial de Marca:** *"Sé tu propio héroe"*

---

## 📊 TABLA MAESTRA DE ALINEACIÓN & ESTADO (15 DÍAS)

Esta tabla mantiene la **alineación 1-a-1** entre la planificación estratégica, los ganchos comerciales, los llamados a la acción (CTA), los textos alternativos accesibles (Alt Text), los hashtags de posicionamiento, las notas de contenido en Obsidian y las carpetas de activos visuales:

| # | Fecha | Prenda / Concepto | Referencia Cultural | Gancho Principal (Hook) | Subtexto (CTA) | Texto Alt (SEO & Accesibilidad) | Hashtags | Copy Completo (Listo para Copiar) | Formato | Estado | ¿Publicado? | Link Publicación | Nota Entregable | Activos Visuales |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${tableRows}
---

## 📌 Inventario de Productos Clave Incorporados

1. 🌸 **Hanbok Reinterpretado** (Conexión especial con el próximo concierto de BTS / Eventos K-pop).
2. 🩸 **Jujutsu Kaisen — Choso** (Silueta con carácter y mística de personaje de culto).
3. ⛩️ **Sacerdotisa Sintoísta** (Deconstrucción de indumentaria tradicional oriental en moda urbana de autor).
4. 🕶️ **Jujutsu Kaisen — Suguru Geto** (Arquetipo de hechicero oscuro urbano con presencia imponente).
5. 🚀 **Star Wars — Chaqueta de Piloto** (Chaqueta de abrigo galáctico para la vida urbana).

---

## 🗓️ MATRIZ DE 15 PUBLICACIONES INTERCALADAS (DIAGRAMA DE FLUJO)

\`\`\`mermaid
graph TD
    P1["Post 1: Geto (Jujutsu Kaisen)"] --> P2["Post 2: Estilismo Hakama Oficina"]
    P2 --> P3["Post 3: Confort PAS (Marquillas)"]
    P3 --> P4["Post 4: Hanbok (Concierto BTS)"]
    P4 --> P5["Post 5: ASMR Taller Bogotá"]
    P5 --> P6["Post 6: Chaqueta Piloto (Star Wars)"]
    P6 --> P7["Post 7: Nightlife Haori"]
    P7 --> P8["Post 8: Test Caída Pesada"]
    P8 --> P9["Post 9: Choso (Jujutsu Kaisen)"]
    P9 --> P10["Post 10: Entrada Stand SOFA"]
    P10 --> P11["Post 11: Sacerdotisa Sintoísta"]
    P11 --> P12["Post 12: Estilismo Capa Mago"]
    P12 --> P13["Post 13: Moldería XS-XL"]
    P13 --> P14["Post 14: Colección Disponible"]
    P14 --> P15["Post 15: Firma de Andrea"]
\`\`\`

---

## 🔄 Historial de Revisiones (Changelog)
- **v2.0 (${getTodayString()}):** Sincronización completa con el Sistema de Alineación Programática: tabla maestra interactiva con enlaces bidireccionales a cada nota entregable y carpeta de activos.
- **v1.0 (2026-08-08):** Creación inicial de la parrilla intercalada de 15 publicaciones.

---

## 🔗 Referencias Cruzadas
- Guía Técnica SOP: [[07 Paid, Social & Community/Social Content/Guia Tecnica de Produccion de Contenido.md]]
- Manual de Identidad Visual: [[01 Brand Context/Brand Visual Style Guide.md]]
- Estrategia Maestra de Contenidos: [[02 Strategy & Research/Content Strategy/Master Content Strategy.md]]
- Contexto de Marca: [[01 Brand Context/product-marketing-context.md]]
`;

  fs.writeFileSync(PARRILLA_DOC_PATH, updatedContent, 'utf8');
  console.log(`✅ Documento de Parrilla actualizado con enlaces bidireccionales interactivos.`);
}

/**
 * Prints terminal alignment status
 */
function printAlignmentStatus(plan) {
  const audit = auditAlignment(plan);
  console.log('\n' + '═'.repeat(85));
  console.log('📊 AUDITORÍA DE ALINEACIÓN DE CONTENIDOS (PARRILLA ↔ NOTAS ↔ ASSETS)');
  console.log('═'.repeat(85));

  console.log(`\nTotal de publicaciones planificadas: ${audit.length}\n`);

  let completeCount = 0;
  for (const item of audit) {
    const noteText = item.matchedNote ? `📄 ${item.matchedNote}` : '❌ (Falta Nota)';
    const assetText = item.matchedAsset ? `📁 ${item.matchedAsset}` : (item.format === 'carrusel' ? '⚠️ (Faltan Assets)' : '🎬 (Video)');

    console.log(`Post #${String(item.postNumber).padStart(2, '0')} [${item.date}] [${item.format.toUpperCase().padEnd(8)}] ${item.statusEmoji} ${item.garment}`);
    console.log(`   ${noteText}`);
    if (item.format === 'carrusel') console.log(`   ${assetText}`);
    console.log('');

    if (item.status === 'LISTO') completeCount++;
  }

  const percent = Math.round((completeCount / audit.length) * 100);
  console.log('─'.repeat(85));
  console.log(`Resumen de Alineación: ${completeCount}/${audit.length} publicaciones listas (${percent}%)\n`);
  console.log('═'.repeat(85) + '\n');
}

// -------------------------------------------------------------
// CLI ROUTER
// -------------------------------------------------------------
function run() {
  const args = process.argv.slice(2);
  const plan = loadPlan();

  if (args.includes('--scaffold') || args.includes('-s') || args.includes('scaffold') || args.includes('sync')) {
    scaffoldAllMissing(plan);
    updateParrillaDocument(plan);
    printAlignmentStatus(plan);
  } else if (args.includes('--update-doc') || args.includes('update')) {
    updateParrillaDocument(plan);
    printAlignmentStatus(plan);
  } else {
    printAlignmentStatus(plan);
  }
}

if (require.main === module) {
  run();
}

module.exports = {
  auditAlignment,
  scaffoldAllMissing,
  updateParrillaDocument
};
