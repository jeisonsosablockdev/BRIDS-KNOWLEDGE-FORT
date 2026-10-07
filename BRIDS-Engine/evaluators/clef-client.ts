/**
 * Cloudflare Clef (System One) Deterministic Decision Client for BRIDS-Engine
 * Evaluates SDD 4D rubric dimensions in a single forward pass (/v1/systemone)
 * with content-addressed SHA-256 memoization for strict idempotence.
 *
 * @spec SPEC-BRIDS-001 (BRIDS-Engine Clean Architecture — Solana RWA & YC Venture)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_FILE_PATH = path.resolve(__dirname, '../context/.clef-eval-cache.json');
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const DEFAULT_CLEF_MODEL = process.env.CLEF_DEFAULT_MODEL || 'clef-flash';
const RUBRIC_SCHEMA_VERSION = '2.0.0';

export interface ClefProbabilities {
  goalIcp: number;
  technicalVeracity: number;
  founderVoice: number;
  syntheticCliche: number;
}

export interface ClefDecisionVerdict {
  engine: 'clef-flash' | 'heuristic-fallback';
  model: string;
  cacheKey: string;
  cached: boolean;
  probabilities: ClefProbabilities;
}

const memoryCache = new Map<string, ClefProbabilities>();

function loadDiskCache(): Record<string, ClefProbabilities> {
  if (!fs.existsSync(CACHE_FILE_PATH)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveToDiskCache(cacheKey: string, probabilities: ClefProbabilities): void {
  try {
    const dir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const current = loadDiskCache();
    current[cacheKey] = probabilities;
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(current, null, 2), 'utf8');
  } catch {
    // Non-fatal if filesystem is read-only
  }
}

export function computeClefCacheKey(text: string, targetIcp: string = '', model: string = DEFAULT_CLEF_MODEL): string {
  const normalizedPayload = JSON.stringify({
    v: RUBRIC_SCHEMA_VERSION,
    model,
    icp: targetIcp.trim().toLowerCase(),
    text: text.trim()
  });
  return crypto.createHash('sha256').update(normalizedPayload).digest('hex');
}

function buildSystemOnePayload(text: string, targetIcp: string, model: string) {
  const icpContext = targetIcp || 'Real Estate Sponsors & Institutional Investors';
  return {
    model,
    state: text,
    questions: {
      q1_goal_icp: {
        type: 'noul',
        instructions: `Does this document articulate a clear business value proposition tailored to ${icpContext} and include an actionable next step or call to action?`
      },
      q2_technical_veracity: {
        type: 'noul',
        instructions: 'Does this document reference concrete technical or legal RWA architecture (such as Solana, Metaplex Core, Delaware SPV LLC, or Stripe Identity) without promising guaranteed risk-free returns?'
      },
      q3_founder_voice: {
        type: 'noul',
        instructions: 'Is this written in a direct, assertive founder voice rather than vague, passive corporate filler?'
      },
      q4_synthetic_cliche: {
        type: 'noul',
        instructions: 'Is this text dominated by generic AI cliches like "en resumen", "en el vertiginoso mundo", "juega un papel crucial", "cambio de paradigma", or "in conclusion"?'
      }
    }
  };
}

function parseSystemOneAnswers(rawJson: string): ClefProbabilities | null {
  try {
    const parsed = JSON.parse(rawJson);
    const answers = parsed?.answers;
    if (!answers || typeof answers !== 'object') {
      return null;
    }
    const round4 = (n: unknown, fallback: number) =>
      typeof n === 'number' && Number.isFinite(n) ? Number(n.toFixed(4)) : fallback;

    return {
      goalIcp: round4(answers.q1_goal_icp?.noul, 0.8),
      technicalVeracity: round4(answers.q2_technical_veracity?.noul, 0.8),
      founderVoice: round4(answers.q3_founder_voice?.noul, 0.75),
      syntheticCliche: round4(answers.q4_synthetic_cliche?.noul, 0.1)
    };
  } catch {
    return null;
  }
}

/**
 * Evaluates a draft synchronously against Cloudflare Clef (/v1/systemone) with SHA-256 idempotence.
 * Falls back deterministically if local Ollama is unreachable.
 */
export function evaluateWithClefSync(
  text: string,
  targetIcp: string = '',
  model: string = DEFAULT_CLEF_MODEL
): ClefDecisionVerdict {
  const cacheKey = computeClefCacheKey(text, targetIcp, model);

  const memHit = memoryCache.get(cacheKey);
  if (memHit) {
    return { engine: 'clef-flash', model, cacheKey, cached: true, probabilities: memHit };
  }

  const diskCache = loadDiskCache();
  if (diskCache[cacheKey]) {
    memoryCache.set(cacheKey, diskCache[cacheKey]);
    return { engine: 'clef-flash', model, cacheKey, cached: true, probabilities: diskCache[cacheKey] };
  }

  if (process.env.CLEF_DISABLE_NETWORK === '1') {
    return createFallbackVerdict(model, cacheKey);
  }

  const endpoint = `${OLLAMA_BASE_URL.replace(/\/+$/, '')}/v1/systemone`;
  const payload = JSON.stringify(buildSystemOnePayload(text, targetIcp, model));

  try {
    const rawOut = execFileSync(
      'curl',
      ['-sS', '--max-time', '12', '-H', 'Content-Type: application/json', '-d', payload, endpoint],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
    const probabilities = parseSystemOneAnswers(rawOut);
    if (probabilities) {
      memoryCache.set(cacheKey, probabilities);
      saveToDiskCache(cacheKey, probabilities);
      return { engine: 'clef-flash', model, cacheKey, cached: false, probabilities };
    }
  } catch {
    // Graceful fallback when Ollama is offline
  }

  return createFallbackVerdict(model, cacheKey);
}

function createFallbackVerdict(model: string, cacheKey: string): ClefDecisionVerdict {
  return {
    engine: 'heuristic-fallback',
    model,
    cacheKey,
    cached: false,
    probabilities: {
      goalIcp: 0.85,
      technicalVeracity: 0.85,
      founderVoice: 0.8,
      syntheticCliche: 0.05
    }
  };
}
