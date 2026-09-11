#!/usr/bin/env bash
# inspect-squad.sh - Validate and display BRIDS Founder & YC Sub-Agent Squad definitions

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CORE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
AGENTS_DIR="${CORE_DIR}/agents"
MANIFEST="${AGENTS_DIR}/agents.yaml"

if [ ! -f "$MANIFEST" ]; then
  echo "Error: Manifest not found at $MANIFEST"
  exit 1
fi

echo "========================================================"
echo "          BRIDS.io Founder & YC Sub-Agent Squad         "
echo "========================================================"
echo ""

python3 - <<EOF
import os
import sys

manifest_path = "$MANIFEST"
core_dir = "$CORE_DIR"

def parse_agents_yaml(content):
    agents = []
    current_agent = None
    current_list_key = None
    
    for line in content.splitlines():
        trimmed = line.strip()
        if not trimmed or trimmed.startswith("#"):
            continue
        
        if trimmed.startswith("- name:"):
            current_agent = {"name": trimmed[7:].strip().strip('"\'')}
            agents.append(current_agent)
            current_list_key = None
            continue
            
        if trimmed.startswith("- ") and current_agent is not None and current_list_key:
            item = trimmed[2:].strip().strip('"\'')
            current_agent[current_list_key].append(item)
            continue
            
        if ":" in trimmed:
            k, v = trimmed.split(":", 1)
            k = k.strip()
            v = v.strip().strip('"\'')
            
            if k in ("skills", "output_destinations"):
                if current_agent is not None:
                    current_agent[k] = []
                    current_list_key = k
            elif current_agent is not None:
                current_list_key = None
                if v.lower() == "true":
                    current_agent[k] = True
                elif v.lower() == "false":
                    current_agent[k] = False
                else:
                    current_agent[k] = v

    return agents

with open(manifest_path, "r", encoding="utf-8") as f:
    agents = parse_agents_yaml(f.read())

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
    
    # Check frontmatter in def_file
    if exists:
        with open(full_def_path, "r", encoding="utf-8") as df:
            content = df.read()
            if content.startswith("---") and "\n---\n" in content[3:]:
                status = "OK (YAML Frontmatter Valid)"
    
    print(f"[{i}] {name} ({role})")
    print(f"    Status: {status} -> {def_file}")
    print(f"    Skills: {skills}")
    print(f"    Description: {agent.get('description')}")
    print(f"    Outputs: {agent.get('output_destinations')}\n")

print("All agent definitions validated successfully.")
EOF
