#!/usr/bin/env node

/**
 * Brand Context Enforcement Linter
 * Validates that product-marketing-context.md is complete and ready before generating deliverables.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const CONTEXT_PATH = path.join(ROOT_DIR, 'BRIDS-Engine', 'context', 'product-marketing-context.md');

function auditContext() {
  console.log('\n' + '═'.repeat(75));
  console.log('🔍 AUDITORÍA DE ENFORCEMENT: CONTEXTO DE MARCA');
  console.log('═'.repeat(75));

  if (!fs.existsSync(CONTEXT_PATH)) {
    console.error(`❌ ERROR CRÍTICO: No existe el archivo de contexto en ${CONTEXT_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(CONTEXT_PATH, 'utf8');

  const requiredSections = [
    { name: 'One-liner / Propuesta de Valor', regex: /\*\*One-liner:\*\*\s*(.+)/i },
    { name: 'Qué hace el producto', regex: /\*\*What it does:\*\*\s*(.+)/i },
    { name: 'Público Objetivo / Compradores', regex: /\*\*Target companies or buyers:\*\*\s*(.+)/i },
    { name: 'Problema Principal / Dolores', regex: /\*\*Core problem:\*\*\s*(.+)/i },
    { name: 'Diferenciadores Clave', regex: /\*\*Key differentiators:\*\*\s*[\r\n]+-\s*(.+)/i },
    { name: 'Voz y Tono de Marca', regex: /\*\*Tone:\*\*\s*(.+)/i }
  ];

  let completedCount = 0;
  const issues = [];
  const passed = [];

  for (const sec of requiredSections) {
    const match = content.match(sec.regex);
    if (match && match[1] && match[1].trim().length > 2) {
      completedCount++;
      passed.push(`✅ ${sec.name}: "${match[1].trim().substring(0, 40)}..."`);
    } else {
      issues.push(`⚠️ Falta completar: ${sec.name}`);
    }
  }

  const readinessScore = Math.round((completedCount / requiredSections.length) * 100);

  console.log(`📍 Archivo: ${CONTEXT_PATH}`);
  console.log(`📊 Nivel de Preparación del Contexto: ${readinessScore}%\n`);

  if (passed.length > 0) {
    console.log('Campos Verificados:');
    for (const p of passed) console.log(`   ${p}`);
    console.log('');
  }

  if (issues.length > 0) {
    console.log('Campos Pendientes (Riesgo de Prompt Drift si se redacta a ciegas):');
    for (const iss of issues) console.log(`   ${iss}`);
    console.log('');
  }

  console.log('═'.repeat(75));

  if (readinessScore < 50) {
    console.warn('⚠️ AVISO DE ENFORCEMENT: El contexto de marca está incompleto.');
    console.warn('   Se recomienda completar product-marketing-context.md antes de generar copys finales.');
    return { passed: false, score: readinessScore };
  } else {
    console.log('✅ Contexto de marca suficiente para orquestar tareas sin drifting.\n');
    return { passed: true, score: readinessScore };
  }
}

auditContext();
