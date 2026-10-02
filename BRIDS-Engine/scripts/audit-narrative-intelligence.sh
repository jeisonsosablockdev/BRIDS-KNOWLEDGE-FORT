#!/usr/bin/env bash
# audit-narrative-intelligence.sh - Launcher de auditoría determinista de inteligencia narrativa
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "${SCRIPT_DIR}/audit-narrative-intelligence.js" "$@"
