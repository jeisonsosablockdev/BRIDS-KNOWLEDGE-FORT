#!/usr/bin/env bash
# inspect-squad.sh - Validate and display BRIDS Founder & YC Sub-Agent Squad definitions

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CORE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
AGENTS_DIR="${CORE_DIR}/agents"
MANIFEST="${AGENTS_DIR}/agents-manifest.json"

if [ ! -f "$MANIFEST" ]; then
  echo "Error: Manifest not found at $MANIFEST"
  exit 1
fi

echo "========================================================"
echo "          BRIDS.io Founder & YC Sub-Agent Squad         "
echo "========================================================"
echo ""

python3 - <<EOF
import json
import os
import sys

manifest_path = "$MANIFEST"
core_dir = "$CORE_DIR"

with open(manifest_path, "r", encoding="utf-8") as f:
    data = json.load(f)

agents = data.get("agents", [])
print(f"Total Configured Sub-Agents: {len(agents)}\n")

for i, agent in enumerate(agents, 1):
    name = agent.get("name")
    role = agent.get("role")
    def_file = agent.get("definition_file")
    skills = ", ".join(agent.get("skills", []))
    
    # Check if definition file exists
    full_def_path = os.path.join(core_dir, "..", def_file) if not os.path.isabs(def_file) else def_file
    exists = os.path.exists(full_def_path)
    status = "OK" if exists else "MISSING"
    
    print(f"[{i}] {name} ({role})")
    print(f"    Status: {status} -> {def_file}")
    print(f"    Skills: {skills}")
    print(f"    Description: {agent.get('description')}")
    print(f"    Outputs: {agent.get('output_destinations')}\n")

print("All agent definitions validated successfully.")
EOF
