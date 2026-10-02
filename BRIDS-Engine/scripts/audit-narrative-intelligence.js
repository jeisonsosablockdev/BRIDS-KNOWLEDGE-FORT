#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🛡️ AUDITORÍA DETERMINISTA DE INTELIGENCIA NARRATIVA & PROCEDENCIA
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SPEC Reference: agent-reach-brids-integration-protocol.md
 * Requirements Enforced:
 *   - REQ-AR-304: Registro de Auditoría de Consultas (Provenance Log con enlaces navegables)
 *   - REQ-AR-306: Archivo Persistente de Datos Crudos (raw/*.json inmutable)
 *   - REQ-AR-307: 100% Cobertura de Enlaces Directos (Cero asunciones sin URL)
 *   - REQ-AR-308: Principio de Cero-Juicios & Formulación Inductiva
 * 
 * Zero LLM Prompt Dependency | Pure Deterministic Code Enforcement
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const NARRATIVE_DIR = path.join(ROOT_DIR, 'BRIDS-Brain', '01 Negocio', '01 Estrategia & Modelo', 'narrative-intelligence');
const RAW_DIR = path.join(NARRATIVE_DIR, 'raw');

let totalAudited = 0;
let errorsFound = 0;

function auditBrief(filePath) {
  totalAudited++;
  const fileName = path.basename(filePath);
  console.log(`\n📄 Auditando brief: ${fileName}`);

  if (!fs.existsSync(filePath)) {
    console.error(`   ❌ Error: El archivo ${filePath} no existe.`);
    errorsFound++;
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let fileErrors = 0;

  // 1. REQ-AR-306: Verificar Sección 6 y Archivo de Datos Crudos JSON
  const hasRawSection = content.includes('## 6. 🗄️ Archivo de Datos Crudos Extraídos') ||
                        content.includes('## 6. Archivo de Datos Crudos Extraídos');
  if (!hasRawSection) {
    console.error(`   ❌ [REQ-AR-306] Falta la sección obligatoria "## 6. 🗄️ Archivo de Datos Crudos Extraídos (Raw Data Archive)".`);
    fileErrors++;
  }

  // Buscar coincidencia de archivo JSON crudo
  const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    const briefDate = dateMatch[1];
    if (!fs.existsSync(RAW_DIR)) {
      console.error(`   ❌ [REQ-AR-306] No existe el directorio de datos crudos: ${RAW_DIR}`);
      fileErrors++;
    } else {
      const rawFiles = fs.readdirSync(RAW_DIR).filter(f => f.startsWith(briefDate) && f.endsWith('.json'));
      if (rawFiles.length === 0) {
        console.error(`   ❌ [REQ-AR-306] No se encontró ningún dataset crudo JSON para la fecha ${briefDate} en raw/.`);
        fileErrors++;
      } else {
        const rawPath = path.join(RAW_DIR, rawFiles[0]);
        try {
          const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
          if (!rawData.collected_at || !Array.isArray(rawData.records) || rawData.records.length === 0) {
            console.error(`   ❌ [REQ-AR-306] El dataset crudo ${rawFiles[0]} tiene un esquema inválido o está vacío.`);
            fileErrors++;
          } else {
            console.log(`   ✅ [REQ-AR-306] Dataset crudo verificado: ${rawFiles[0]} (${rawData.records.length} registros).`);
            
            // 2. REQ-AR-307 & REQ-AR-309: Verificar que 100% de los registros en el JSON tengan URL directa y canónica
            const invalidUrlsInRaw = rawData.records.filter(r => !r.url || (!r.url.startsWith('http://') && !r.url.startsWith('https://')));
            if (invalidUrlsInRaw.length > 0) {
              console.error(`   ❌ [REQ-AR-307] El dataset crudo tiene ${invalidUrlsInRaw.length} registro(s) sin URL válida (http/https).`);
              fileErrors++;
            } else {
              console.log(`   ✅ [REQ-AR-307] 100% de registros en dataset crudo contienen URLs válidas.`);
            }
            const nonCanonicalInRaw = rawData.records.filter(r => r.url && r.url.includes('x.com/i/status/'));
            if (nonCanonicalInRaw.length > 0) {
              console.error(`   ❌ [REQ-AR-309] El dataset crudo tiene ${nonCanonicalInRaw.length} registro(s) con URL no canónica (x.com/i/status/).`);
              fileErrors++;
            } else {
              console.log(`   ✅ [REQ-AR-309] 100% de registros de Twitter en dataset crudo usan URLs canónicas directas.`);
            }
          }
        } catch (e) {
          console.error(`   ❌ [REQ-AR-306] Error de sintaxis JSON en ${rawFiles[0]}: ${e.message}`);
          fileErrors++;
        }
      }
    }
  }

  // 3. REQ-AR-304: Verificar Tabla de Procedencia (Provenance Log)
  const hasProvenanceLog = content.includes('## 5. 🔗 Registro de Auditoría de Consultas & Fuentes Consultadas') ||
                           content.includes('## 5. Registro de Auditoría de Consultas');
  if (!hasProvenanceLog) {
    console.error(`   ❌ [REQ-AR-304] Falta la sección obligatoria "## 5. 🔗 Registro de Auditoría de Consultas & Fuentes Consultadas (Provenance Log)".`);
    fileErrors++;
  } else {
    // Extraer enlaces directos en el informe
    const linkMatches = content.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g) || [];
    if (linkMatches.length < 3) {
      console.error(`   ❌ [REQ-AR-307] Cobertura insuficiente de enlaces directos. Se encontraron solo ${linkMatches.length} enlace(s). Mínimo requerido: 3.`);
      fileErrors++;
    } else {
      console.log(`   ✅ [REQ-AR-307] Cobertura de enlaces confirmada: ${linkMatches.length} enlace(s) directos trazables.`);
      
      // REQ-AR-309: Canonical URL Check (No /i/status/ redirects)
      const nonCanonical = linkMatches.filter(l => l.includes('x.com/i/status/'));
      if (nonCanonical.length > 0) {
        console.error(`   ❌ [REQ-AR-309] Se detectaron ${nonCanonical.length} enlace(s) no canónicos de Twitter con /i/status/. Deben ser https://x.com/<autor>/status/<id>.`);
        fileErrors++;
      } else {
        console.log(`   ✅ [REQ-AR-309] 100% de enlaces de Twitter son URLs canónicas directas.`);
      }
    }
  }

  // 4. REQ-AR-308: Principio de Cero-Juicios & Formulación Inductiva
  const hasTags = content.includes('[FACT: VERIFIED]') ||
                  content.includes('[RUMOR: HYPOTHESIS]') ||
                  content.includes('[EMERGING_PARADOX: CONDITIONAL_HYPOTHESIS]') ||
                  content.includes('CONDITIONAL_THESIS') ||
                  content.includes('IMMINENT_THESIS');
  if (!hasTags) {
    console.error(`   ❌ [REQ-AR-308] El brief no incluye etiquetas canónicas de segregación fáctica/inductiva.`);
    fileErrors++;
  } else {
    console.log(`   ✅ [REQ-AR-308] Segregación inductiva y etiquetado de veracidad presente.`);
  }

  // 5. Verificar estructura de 5 vectores
  const has5Vectors = content.includes('Vector 1:') &&
                      content.includes('Vector 2:') &&
                      content.includes('Vector 3:') &&
                      content.includes('Vector 4:') &&
                      content.includes('Vector 5:');
  if (!has5Vectors) {
    console.error(`   ❌ Falta una o más de las secciones de los 5 vectores canónicos.`);
    fileErrors++;
  } else {
    console.log(`   ✅ Estructura de 5 vectores deconstruida correctamente.`);
  }

  if (fileErrors === 0) {
    console.log(`   ✨ Brief ${fileName} 100% CONFORME con las especificaciones deterministas.`);
    return true;
  } else {
    console.error(`   ⚠️ Brief ${fileName} falló con ${fileErrors} error(es) crítico(s).`);
    errorsFound += fileErrors;
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EJECUCIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
console.log('═'.repeat(75));
console.log('🛡️ AUDITORÍA DE INTELIGENCIA NARRATIVA & PROCEDENCIA (SCRIPT RUNNER)');
console.log('═'.repeat(75));

const targetArg = process.argv[2];

if (targetArg) {
  const resolved = path.isAbsolute(targetArg) ? targetArg : path.join(process.cwd(), targetArg);
  auditBrief(resolved);
} else {
  if (!fs.existsSync(NARRATIVE_DIR)) {
    console.log('ℹ️ No existe el directorio de inteligencia narrativa en el vault. Nada que auditar.');
    process.exit(0);
  }

  const allFiles = fs.readdirSync(NARRATIVE_DIR).filter(f => f.endsWith('.md') && f !== 'index.md' && f !== 'social-bookmarks-log.md');
  if (allFiles.length === 0) {
    console.log('ℹ️ No se encontraron briefs de inteligencia narrativa en la carpeta.');
    process.exit(0);
  }

  console.log(`Encontrados ${allFiles.length} brief(s) de inteligencia narrativa para auditar:`);
  for (const f of allFiles) {
    auditBrief(path.join(NARRATIVE_DIR, f));
  }
}

console.log('\n' + '─'.repeat(75));
if (errorsFound === 0) {
  console.log(`🎉 AUDITORÍA COMPLETADA CON ÉXITO: ${totalAudited} brief(s) auditados, 0 errores.`);
  process.exit(0);
} else {
  console.error(`❌ AUDITORÍA FALLIDA: ${errorsFound} error(es) detectados en ${totalAudited} brief(s).`);
  process.exit(1);
}
