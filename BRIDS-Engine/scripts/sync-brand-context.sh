#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SOURCE="$ROOT/BRIDS-Engine/context/product-marketing-context.md"

TARGET_DIR="$ROOT/BRIDS-Brain/02 Marketing/01 Contexto de Marca"
mkdir -p "$TARGET_DIR"
TARGET="$TARGET_DIR/product-marketing-context.md"

# Use relative symlink to keep repository clean and portable across environments
ln -sf "../../../BRIDS-Engine/context/product-marketing-context.md" "$TARGET"
echo "Linked brand context into vault:"
echo "  $TARGET -> ../../../BRIDS-Engine/context/product-marketing-context.md"

