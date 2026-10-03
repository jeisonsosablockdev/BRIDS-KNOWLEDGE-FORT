"""
SPEC-01: Skill Router Hook for Antigravity.
Fast probabilistic skill selection (< 50ms) using Cloudflare Clef (System One API).
Prevents context window bloat by activating only the necessary skill.
"""

import os
import sys
import httpx
from typing import Dict, Any

OLLAMA_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL_NAME = os.environ.get("CLEF_MODEL", "clef-flash")


async def route_skill_for_prompt(
    prompt: str,
    skills_catalog: Dict[str, str],
    model: str = MODEL_NAME,
) -> Dict[str, Any]:
    """
    Selects the most suitable skill for a given user prompt from the available catalog.
    Uses Clef System One choice classification.
    """
    payload = {
        "model": model,
        "state": prompt,
        "questions": {
            "skill_selection": {
                "type": "choice",
                "instructions": "Select the single most relevant specialized skill required to fulfill this developer prompt.",
                "criteria": skills_catalog,
            }
        },
    }

    url = f"{OLLAMA_URL.rstrip('/')}/v1/systemone"
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()

    answers = data.get("answers", {})
    choice_data = answers.get("skill_selection", {})
    chosen = choice_data.get("choice")
    probabilities = choice_data.get("probabilities", {})
    confidence = float(choice_data.get("confidence", 0.0))

    return {
        "chosen": chosen,
        "probabilities": probabilities,
        "confidence": confidence,
        "model": model,
        "prompt": prompt,
        "raw_answer": choice_data,
    }


if __name__ == "__main__":
    import asyncio
    import json

    if len(sys.argv) < 2:
        print("Usage: python clef_skill_router.py '<user_prompt>' [skills_json_path]")
        sys.exit(1)

    user_prompt = sys.argv[1]
    default_catalog = {
        "solana-dev": "Solana smart contracts, Anchor, PDAs, Web3 tokens, Metaplex",
        "copywriting": "Marketing copy, landing pages, email conversion, headlines",
        "clean-code": "Refactoring principles, SOLID patterns, code smells, readability",
        "tdd-primal": "Test-driven development, failing tests, test suites, coverage",
        "general-assistant": "General conversation, questions, standard programming tasks",
    }

    res = asyncio.run(route_skill_for_prompt(user_prompt, default_catalog))
    print(f"Chosen Skill: {res['chosen']} (Confidence: {res['confidence']:.4f})")
    print(json.dumps(res["probabilities"], indent=2))
    sys.exit(0)
