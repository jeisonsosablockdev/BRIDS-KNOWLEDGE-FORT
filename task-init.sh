#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$DIR/BRIDS-Engine/scripts/sdd/sdd-orchestrator.ts" "$@"
