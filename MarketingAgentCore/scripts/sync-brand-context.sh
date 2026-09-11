#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SOURCE="$ROOT/MarketingAgentCore/context/product-marketing-context.md"

# Support both BRIDS Brain and MarketingAgentStudio
if [[ -d "$ROOT/BRIDS Brain/01 Brand Context" ]]; then
  TARGET="$ROOT/BRIDS Brain/01 Brand Context/product-marketing-context.md"
elif [[ -d "$ROOT/MarketingAgentStudio/01 Brand Context" ]]; then
  TARGET="$ROOT/MarketingAgentStudio/01 Brand Context/product-marketing-context.md"
else
  mkdir -p "$ROOT/BRIDS Brain/01 Brand Context"
  TARGET="$ROOT/BRIDS Brain/01 Brand Context/product-marketing-context.md"
fi

ln -sf "$SOURCE" "$TARGET"
echo "Linked brand context into vault:"
echo "  $TARGET -> $SOURCE"

