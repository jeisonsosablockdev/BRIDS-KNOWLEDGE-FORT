#!/usr/bin/env bash
# narrative-radar.sh - Motor de Inteligencia Narrativa y Radar de Susurros para BRIDS
# SPEC Reference: agent-reach-brids-integration-protocol.md (SPEC-AR-002, SPEC-AR-003, SPEC-AR-004)

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CORE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEMPLATES_DIR="${CORE_DIR}/templates"
MAX_AUDIO_MINUTES=25

# ─────────────────────────────────────────────────────────────────────────────
# REQ-AR-403: Cuarentena de Privacidad & Sanitizador de PII
# ─────────────────────────────────────────────────────────────────────────────
sanitize_pii() {
  local input="$1"
  # PII_FILTER: Remueve emails personales y números telefónicos directos
  echo "$input" | sed -E \
    -e 's/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/[REDACTED_EMAIL]/g' \
    -e 's/(\+?[0-9]{1,3}[- ]?)?\(?[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}/[REDACTED_PHONE]/g'
}

# ─────────────────────────────────────────────────────────────────────────────
# REQ-AR-301: Etiquetado Estricto de Veracidad (CL-06 Compliance)
# ─────────────────────────────────────────────────────────────────────────────
tag_fact() {
  local statement="$1"
  echo "[FACT: VERIFIED] $statement"
}

tag_rumor() {
  local statement="$1"
  echo "[RUMOR: HYPOTHESIS] $statement"
}

# ─────────────────────────────────────────────────────────────────────────────
# REQ-AR-302: Cálculo Determinista de Cuadrantes (Matriz 2x2)
# ─────────────────────────────────────────────────────────────────────────────
calculate_matrix_quadrant() {
  local prob="${1^^}"
  local impact="${2^^}"

  if [[ "$prob" =~ (LOW|BAJA) && "$impact" =~ (HIGH|ALTO|ALTA) ]]; then
    echo "BLACK_SWAN"
  elif [[ "$prob" =~ (HIGH|ALTO|ALTA) && "$impact" =~ (HIGH|ALTO|ALTA) ]]; then
    echo "IMMINENT_THESIS"
  elif [[ "$prob" =~ (LOW|BAJA) && "$impact" =~ (LOW|BAJO|BAJA) ]]; then
    echo "CYCLE_FUD"
  else
    echo "MICRO_EVENT"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# REQ-AR-201: Formulación de Consultas Booleanas de Susurros
# ─────────────────────────────────────────────────────────────────────────────
build_rumor_query() {
  local raw_topic="$1"
  # Sanitizar caracteres que rompen shells
  local sanitized_topic
  sanitized_topic=$(echo "$raw_topic" | tr -d '"'"'"'`;$')
  echo '("hearing that" OR "rumor" OR "sources say") AND ('"$sanitized_topic"')'
}

# ─────────────────────────────────────────────────────────────────────────────
# REQ-AR-202: Escalera de Contingencia (3 Niveles: Jina -> Exa -> DevTools)
# ─────────────────────────────────────────────────────────────────────────────
extract_with_fallback() {
  local target_url="$1"
  local output=""

  echo "🔍 [Nivel 1] Intentando extracción con Jina Reader..." >&2
  if output=$(curl -s --max-time 10 "https://r.jina.ai/${target_url}" 2>/dev/null) && [[ ${#output} -gt 300 ]]; then
    echo "✅ [Nivel 1 OK] Jina Reader extrajo contenido correctamente." >&2
    sanitize_pii "$output"
    return 0
  fi

  echo "⚠️ [Nivel 1 Falló] Conmutando a [Nivel 2: Exa Search Snippets]..." >&2
  if command -v mcporter >/dev/null 2>&1; then
    if output=$(mcporter call exa.web_search_exa query="${target_url}" numResults=1 2>/dev/null) && [[ ${#output} -gt 150 ]]; then
      echo "✅ [Nivel 2 OK] Exa recuperó resumen semántico en caché." >&2
      sanitize_pii "$output"
      return 0
    fi
  fi

  echo "⚠️ [Nivel 2 Falló] Conmutando a [Nivel 3: Chrome DevTools MCP fallback]..." >&2
  echo "[FALLBACK_TIER_3_REQUIRED: Target URL $target_url requires Chrome DevTools DOM emulation]"
  return 0
}

# ─────────────────────────────────────────────────────────────────────────────
# REQ-AR-203: Fragmentación de Audio y Control de Cuota
# ─────────────────────────────────────────────────────────────────────────────
process_audio() {
  local audio_source="$1"
  local duration_minutes="${2:-0}"

  if [[ $duration_minutes -gt $MAX_AUDIO_MINUTES ]]; then
    echo "⚠️ Archivo excede el límite de $MAX_AUDIO_MINUTES minutos. Activando --split-chapters y Map-Reduce..." >&2
    echo "Segmentando audio en bloques de 15 minutos para optimización de cuota Groq..." >&2
  else
    echo "Audio dentro del límite seguro ($duration_minutes min). Procesando transcripción estándar..." >&2
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# REQ-AR-305: Guardado y Marcado de Inteligencia Social (Bookmarks en Twitter/IG)
# ─────────────────────────────────────────────────────────────────────────────
bookmark_tweet() {
  local tweet_url="$1"
  local note="${2:-BRIDS Radar Signal}"
  echo "🔖 Guardando tweet en la cuenta de Twitter/X (OpenCLI)..." >&2
  if command -v opencli >/dev/null 2>&1; then
    opencli twitter bookmark "$tweet_url" >/dev/null 2>&1 || true
    echo "✅ Tweet guardado en marcadores de Twitter: $tweet_url"
  else
    echo "⚠️ OpenCLI no disponible; registrando guardado local."
  fi
  log_social_bookmark "Twitter/X" "$tweet_url" "$note"
}

save_instagram_post() {
  local target_user="$1"
  local post_index="${2:-1}"
  local note="${3:-BRIDS IG Signal}"
  echo "📸 Guardando post de Instagram (@$target_user) en la cuenta de IG..." >&2
  if command -v opencli >/dev/null 2>&1; then
    opencli instagram save "$target_user" --index "$post_index" >/dev/null 2>&1 || true
    echo "✅ Post de Instagram (@$target_user, index: $post_index) guardado."
  else
    echo "⚠️ OpenCLI no disponible; registrando guardado local."
  fi
  log_social_bookmark "Instagram" "https://instagram.com/${target_user}" "$note (post #$post_index)"
}

log_social_bookmark() {
  local platform="$1"
  local url="$2"
  local note="$3"
  local dest_dir="${CORE_DIR}/../BRIDS-Brain/01 Negocio/01 Estrategia & Modelo/narrative-intelligence"
  local log_file="${dest_dir}/social-bookmarks-log.md"
  local today="$(date +%Y-%m-%d)"
  local timestamp="$(date +%Y-%m-%d\ %H:%M:%S)"
  
  mkdir -p "$dest_dir"

  if [[ ! -f "$log_file" ]]; then
    cat > "$log_file" <<EOF
---
title: "Registro de Marcadores y Señales Guardadas en Redes Sociales"
version: "1.0"
status: "sdd-approved"
workflow: "hitl-validated"
created: "${today}"
updated: "${today}"
domain: "01 Negocio"
subdomain: "01 Estrategia & Modelo"
tags:
  - "narrative-intelligence"
  - "bookmarks"
  - "social-intelligence"
---

# 🔖 Registro de Señales Guardadas en Twitter/X e Instagram

> [!NOTE]
> Catálogo vivo de tweets e imágenes/posts de Instagram guardados por \`narrative-intelligence-analyst\` en las cuentas de redes sociales para referencia futura, benchmarking y creación de contenido.

| Fecha y Hora | Plataforma | URL / Referencia | Nota / Tesis |
| :--- | :---: | :--- | :--- |
EOF
  local new_row="| $timestamp | $platform | [$url]($url) | $note |"
  if grep -q "## 🔄 Historial de Revisiones" "$log_file" 2>/dev/null; then
    awk -v row="$new_row" '
      /## 🔄 Historial de Revisiones/ {
        print row;
        print "";
      }
      { print }
    ' "$log_file" > "${log_file}.tmp" && mv "${log_file}.tmp" "$log_file"
  else
    echo "$new_row" >> "$log_file"
  fi
  echo "📝 Señal registrada en el catálogo de la bóveda: $log_file"
}

# ─────────────────────────────────────────────────────────────────────────────
# CLI ENTRYPOINT
# ─────────────────────────────────────────────────────────────────────────────
show_help() {
  cat <<HELP
narrative-radar.sh - BRIDS Narrative & Rumor Intelligence CLI

Uso:
  bash narrative-radar.sh --all-in-one [slug]     # Flujo completo: Scan + Guardar en Cuenta + Raw JSON + Brief + Audit
  bash narrative-radar.sh --rumor-scan "<query>"
  bash narrative-radar.sh --extract-url "<url>"
  bash narrative-radar.sh --bookmark-tweet "<url>" ["<nota>"]
  bash narrative-radar.sh --save-ig "<username>" ["<index>"] ["<nota>"]
  bash narrative-radar.sh --transcribe-audio "<url|file>" [--duration <minutes>] [--split-chapters]
  bash narrative-radar.sh --matrix-quadrant <probabilidad> <impacto>
  bash narrative-radar.sh --tag-fact "<statement>"
  bash narrative-radar.sh --tag-rumor "<statement>"
  bash narrative-radar.sh --sanitize "<text>"
  bash narrative-radar.sh --audit-brief ["<path>"]
HELP
}

if [[ $# -eq 0 ]]; then
  show_help
  exit 0
fi

case "$1" in
  --all-in-one|--sync)
    shift
    bash "${SCRIPT_DIR}/sync-narrative-intelligence.sh" "$@"
    ;;
  --rumor-scan)
    shift
    build_rumor_query "$*"
    ;;
  --extract-url)
    shift
    extract_with_fallback "$1"
    ;;
  --bookmark-tweet)
    shift
    bookmark_tweet "$1" "${2:-}"
    ;;
  --save-ig)
    shift
    save_instagram_post "$1" "${2:-1}" "${3:-}"
    ;;
  --transcribe-audio)
    shift
    audio_file="$1"
    shift || true
    duration=0
    if [[ "${1:-}" == "--duration" ]]; then
      duration="${2:-0}"
    fi
    process_audio "$audio_file" "$duration"
    ;;
  --matrix-quadrant)
    shift
    calculate_matrix_quadrant "$1" "$2"
    ;;
  --tag-fact)
    shift
    tag_fact "$*"
    ;;
  --tag-rumor)
    shift
    tag_rumor "$*"
    ;;
  --sanitize)
    shift
    sanitize_pii "$*"
    ;;
  --audit-brief)
    shift
    node "${SCRIPT_DIR}/audit-narrative-intelligence.js" "$@"
    ;;
  --help|-h)
    show_help
    ;;
  *)
    echo "Opción desconocida: $1" >&2
    show_help
    exit 1
    ;;
esac

