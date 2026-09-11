#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_SCRIPT="$SCRIPT_DIR/extract_photo_lineart.py"

exec /Users/jaymusicmachine/.local/bin/uv run \
  --with opencv-python-headless \
  --with pillow \
  --with numpy \
  python "$PYTHON_SCRIPT" "$@"
