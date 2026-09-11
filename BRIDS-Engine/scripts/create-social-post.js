#!/usr/bin/env node

/**
 * Social Content Generator & Extractor for AndreArt Vestuario
 * Instantiates new social media posts based on the protected Content Production SOP (Guía Técnica).
 * Strictly follows the naming convention: YYYY-MM-DD-redsocial-idea.md
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const VAULT_SOCIAL_DIR = path.join(ROOT_DIR, 'BRIDS-Brain', '07 Paid, Social & Community', 'Social Content');
const SOP_TEMPLATE_PATH = path.join(ROOT_DIR, 'BRIDS-Engine', 'templates', 'content-production-sop-template.md');

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

// -------------------------------------------------------------
// CLI GENERATOR
// -------------------------------------------------------------

function generatePost(platformInput, ideaInput, typeInput, culturalRefInput, garmentInput) {
  if (!platformInput || !ideaInput) {
    console.log(`
Uso: create-social-post <redsocial> "<idea-o-concepto>" [tipo-video] [referencia-cultural] [prenda]

Parámetros:
  redsocial:            instagram | tiktok | youtube-shorts | linkedin | facebook
  idea-o-concepto:      Nombre o concepto en texto (ej. "capa-akatsuki", "hakama-oficina-tech")
  tipo-video:           corte-tela | estilismo | encargo-saga | montaje-sofa (opcional)
  referencia-cultural:  Anime / Película / Serie de culto (ej. "Jujutsu Kaisen", "Star Wars", "Dune")
  prenda:               Pantalón Hakama | Haori Urbano | Capa de Autor | Kimono Deconstruido

Ejemplo:
  bash BRIDS-Engine/scripts/create-social-post.sh instagram "capa-akatsuki-confeccion" encargo-saga "Naruto / Akatsuki" "Capa de Autor"
`);
    process.exit(1);
  }

  const platform = sanitizeSlug(platformInput);
  const idea = sanitizeSlug(ideaInput);
  const dateStr = getTodayString();
  const fileName = `${dateStr}-${platform}-${idea}.md`;
  const targetPath = path.join(VAULT_SOCIAL_DIR, fileName);

  ensureDir(VAULT_SOCIAL_DIR);

  if (fs.existsSync(targetPath)) {
    console.error(`\n⚠️ ERROR DE PROTECCIÓN: El archivo "${fileName}" ya existe en:`);
    console.error(`   ${targetPath}`);
    console.error(`   Para refinarlo de forma segura sin sobrescribir, utiliza:`);
    console.error(`   bash BRIDS-Engine/scripts/refine-note.sh refine "${path.relative(ROOT_DIR, targetPath)}" "Tu resumen"\n`);
    process.exit(1);
  }

  const videoType = (typeInput || 'estilismo').toLowerCase();
  const culturalRef = culturalRefInput || 'Jujutsu Kaisen / Star Wars / Cyberpunk';
  const garment = garmentInput || 'Prenda de Autor Urban Fantasy (Moldería XS-XL)';

  let typeEmoji = '👔';
  let typeTitle = 'Estilismo Urbano';
  let shotSpecifics = `
- **Toma A (Detalle):** Close-up al ajuste de pretina XS-XL, costuras reforzadas y marquilla estampada confort PAS.
- **Toma B (Acción):** Persona caminando con paso firme, movimiento dinámico y caída pesada de la tela.
- **Toma C (Cuerpo Entero):** Look completo combinando ${garment} con calzado urbano y prendas neutras.
- **Toma D (Detrás de Cámara):** Andrea explicando la versatilidad de la silueta en el taller.`;

  if (videoType.includes('corte') || videoType.includes('tela') || videoType.includes('confeccion')) {
    typeEmoji = '✂️';
    typeTitle = 'Corte de Tela & Confección (ASMR)';
    shotSpecifics = `
- **Toma A (Detalle):** Close-up a 15 cm de la tijera cortando tela pesada, tiza marcando el patrón.
- **Toma B (Acción):** Manos de Andrea doblando y sacudiendo el textil con sonido de impacto limpio.
- **Toma C (Plano Medio):** Ensamble en máquina de confección con sonido ambiente rítmico.
- **Toma D (Resultado):** Silueta terminada cayendo sobre la mesa de corte.`;
  } else if (videoType.includes('encargo') || videoType.includes('saga') || videoType.includes('akatsuki') || videoType.includes('capa')) {
    typeEmoji = '🛡️';
    typeTitle = 'Encargo de Saga & Edición Especial';
    shotSpecifics = `
- **Toma A (Detalle):** Despliegue de tela pesada de alta densidad sobre la mesa de taller.
- **Toma B (Acción):** Detalle de confección artesanal, forro interior y caída pesada de la prenda.
- **Toma C (Cuerpo Entero):** Modelo luciendo la silueta con iluminación de contraste y porte imponente.
- **Toma D (Detrás de Cámara):** Andrea firmando la pieza o empacando con tarjeta de autor.`;
  } else if (videoType.includes('sofa') || videoType.includes('stand') || videoType.includes('evento')) {
    typeEmoji = '🏛️';
    typeTitle = 'Montaje de Stand & Experiencia SOFA';
    shotSpecifics = `
- **Toma A (Detalle):** POV en primera persona organizando percheros con la colección.
- **Toma B (Acción):** Andrea ultimando detalles visuales y ambientación del stand.
- **Toma C (Cuerpo Entero):** Vista general del espacio listo para recibir a la comunidad.
- **Toma D (Comunidad):** Primeros visitantes probándose las prendas con asombro.`;
  }

  const postContent = `---
title: "[${platform.toUpperCase()}] ${idea.replace(/-/g, ' ')}"
category: "07 Paid, Social & Community"
workflow: "W5_CONTENT_SOCIAL"
skills_used:
  - "mas-social-content"
  - "mas-ad-creative"
  - "mas-copywriting"
platform: "${platform}"
content_type: "${videoType}"
cultural_reference: "${culturalRef}"
status: draft
version: "1.0"
created_at: ${dateStr}
updated_at: ${dateStr}
tags:
  - marketing
  - social-content
  - ${platform}
  - ${idea}
---

# [${platform.toUpperCase()}] ${idea.replace(/-/g, ' ').toUpperCase()}

> [!NOTE]
> **Resumen Ejecutivo:** Publicación para ${platform.toUpperCase()} orientada a ${typeTitle}. Enfoque en ${garment} con referencia cultural a *${culturalRef}*, destacando moldería XS-XL, confort PAS y llamado a compra directo.

---

## 🎯 Contexto y Objetivo
- **Plataforma:** ${platform.toUpperCase()}
- **Formato:** Video Vertical 9:16 (Reel / TikTok) - Duración: 15-25 segundos
- **Objetivo Comercial:** Tráfico calificado al WhatsApp / Tienda Web y posicionamiento de autor
- **Prenda Protagonista:** ${garment}
- **Referencia de Culto:** *${culturalRef}*
- **Eslogan Oficial:** *"Sé tu propio héroe"*

---

## 🎬 1. Especificaciones Técnicas (Basadas en SOP de Producción)
- **Formato de Grabación:** 9:16 Vertical (1080p @ 60fps ó 4K @ 60fps)
- **Iluminación:** Luz frontal natural o taller a 45° (sin sombras duras en negros)
- **Lente:** Limpieza previa obligatoria con paño de microfibra
- **Audio:** Captura directa a 15-20 cm para maximizar sonido textil/ASMR

---

## 📸 2. Lista de Tomas Requeridas (Matriz SOP: ${typeEmoji} ${typeTitle})
${shotSpecifics}

---

## ⏱️ 3. Guión & Estructura de Edición de Video (15 a 25s)

| Tiempo | Bloque Visual | Acción en Pantalla | Audio / Música | Texto en Pantalla |
| :--- | :--- | :--- | :--- | :--- |
| **00:00 - 00:03** | **HOOK VISUAL** | Toma de impacto rápido (corte de tela en seco / prenda volando en cámara lenta). | Sonido ASMR de tijera o beat drop de tendencia. | *"No naciste para vestir ropa aburrida."* |
| **00:03 - 00:10** | **DESARROLLO** | 2-3 tomas dinámicas mostrando confección en Bogotá, detalles y confort PAS. | Música rítmica envolvente. | *"Diseño de autor en Bogotá. Tallas XS a XL."* |
| **00:10 - 00:18** | **DEMOSTRACIÓN** | Prenda puesta en movimiento, silueta completa y caída pesada. | Audio continuo con energía alta. | *"Inspirado en ${culturalRef}."* |
| **00:18 - 00:25** | **CTA FINAL** | Andrea o modelo mirando a cámara con actitud firme y eslogan de marca. | Cierre musical contundente. | *"Pide el tuyo en el link de la bio. Sé tu propio héroe."* |

---

## ✍️ 4. Copy Comercial Asertivo (Aplicando las 4 Reglas de Oro)

\`\`\`text
Basta de uniformarte con lo que todos usan. 

${garment} confeccionado en Bogotá con silueta deconstruida, moldería inteligente que se adapta de la talla XS a la XL y confort PAS sin etiquetas molestas.

Inspirado en la mística de ${culturalRef}.

Pide el tuyo hoy mismo en el enlace de la biografía o al WhatsApp oficial antes de agotar la tanda del taller.

Sé tu propio héroe. 🛡️

#Andreart #ModaDeAutor #UrbanFantasy #BogotaModa #${idea.replace(/-/g, '')} #SeTuPropioHeroe
\`\`\`

---

## 📋 5. Checklist de Verificación Técnico

### Antes de Grabar:
- [ ] Lente del celular limpio con microfibra.
- [ ] Cámara configurada a 1080p 60fps o 4K 60fps.
- [ ] ${garment} planchada y lista en perchero.

### Durante el Rodaje:
- [ ] Grabadas al menos 2 tomas de detalle (marquilla PAS / costura).
- [ ] Grabada toma de movimiento completo con caída de tela.
- [ ] Capturado audio ASMR de corte/taller de cerca.

### Antes de Publicar:
- [ ] Subtítulos centrados (no tapados por botones de ${platform}).
- [ ] Copy incluye llamado directo a compra y eslogan *"Sé tu propio héroe"*.
- [ ] Portada seleccionada manualmente con frame de alto contraste.

---

## 🔄 Historial de Revisiones (Changelog)
- **v1.0 (${dateStr}):** Creación del post extraído a partir de la Guía Técnica y Manual de Producción de Contenido (SOP).

---

## 🔗 Referencias Cruzadas
- Guía Técnica SOP: [[07 Paid, Social & Community/Social Content/Guia Tecnica de Produccion de Contenido.md]]
- Estrategia Maestra de Contenidos: [[02 Strategy & Research/Content Strategy/Master Content Strategy.md]]
- Contexto de Marca: [[01 Brand Context/product-marketing-context.md]]
`;

  fs.writeFileSync(targetPath, postContent, 'utf8');

  console.log(`\n🎉 Publicación generada exitosamente según el Manual SOP:`);
  console.log(`   📄 Archivo:  ${fileName}`);
  console.log(`   📍 Ruta:     ${targetPath}`);
  console.log(`   📱 Red:      ${platform.toUpperCase()}`);
  console.log(`   💡 Concepto: ${idea}`);
  console.log(`   🛡️ Tipo:     ${typeTitle} (${culturalRef})\n`);
}

// -------------------------------------------------------------
// ROUTER
// -------------------------------------------------------------
const [,, platformArg, ideaArg, typeArg, culturalRefArg, garmentArg] = process.argv;
generatePost(platformArg, ideaArg, typeArg, culturalRefArg, garmentArg);
