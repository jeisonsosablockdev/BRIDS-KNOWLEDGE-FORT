#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
VAULT_INBOX="$ROOT/BRIDS-Brain/00 Inbox"
TEMPLATE_PATH="$ROOT/BRIDS-Engine/templates/task-tracking-template.json"

SESSION_NAME="${1:-}"
GOAL="${2:-}"
ICP="${3:-}"

if [[ -z "$SESSION_NAME" ]]; then
  echo "Uso: bash BRIDS-Engine/scripts/init-task.sh <session-name-kebab-case> [objetivo] [icp]"
  echo "Ejemplo: bash BRIDS-Engine/scripts/init-task.sh b2b-campaign-q3 '50 leads en 30 días' 'Directores de Marketing SaaS'"
  exit 1
fi

# Sanitizar nombre a kebab-case
SLUG=$(echo "$SESSION_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
TARGET_FILE="$VAULT_INBOX/${SLUG}.json"

mkdir -p "$VAULT_INBOX"

# Generar JSON a partir de la plantilla
node -e '
  const fs = require("fs");
  const templatePath = process.argv[1];
  const targetPath = process.argv[2];
  const slug = process.argv[3];
  const now = process.argv[4];
  const goal = process.argv[5] || "Objetivo comercial por definir";
  const icp = process.argv[6] || "Audiencia objetivo por definir";

  let data = JSON.parse(fs.readFileSync(templatePath, "utf8"));
  data.session_id = slug;
  data.created_at = now;
  data.updated_at = now;
  data.status = "in_progress";
  data.intent.raw_prompt = slug;
  data.intent.business_goal = goal;
  data.intent.target_icp = icp;

  fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), "utf8");
  console.log("✅ Sesión de tarea inicializada exitosamente en:");
  console.log("   " + targetPath);
' "$TEMPLATE_PATH" "$TARGET_FILE" "$SLUG" "$NOW" "$GOAL" "$ICP"
