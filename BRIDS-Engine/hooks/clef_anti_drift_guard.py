"""
SPEC-02: Anti-Drift Guardrail Hook for Antigravity.
Enforces the Non-Destructive Content Refinement Rule using Cloudflare Clef (System One API).
"""

import os
import sys
import httpx
from typing import Dict, Any

OLLAMA_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL_NAME = os.environ.get("CLEF_MODEL", "clef-flash")


async def evaluate_file_action_guardrail(
    action_description: str,
    policy_instruction: str,
    threshold: float = 0.80,
    model: str = MODEL_NAME,
) -> Dict[str, Any]:
    """
    Evaluates whether a proposed file action complies with safety/non-destructive rules.
    Returns probabilistic verdict via Clef System One noul endpoint.
    """
    payload = {
        "model": model,
        "state": action_description,
        "questions": {
            "is_safe_and_compliant": {
                "type": "noul",
                "instructions": policy_instruction,
            }
        },
    }

    url = f"{OLLAMA_URL.rstrip('/')}/v1/systemone"
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()

    answers = data.get("answers", {})
    guardrail = answers.get("is_safe_and_compliant", {})
    prob = float(guardrail.get("noul", 0.0))
    passed = prob >= threshold

    return {
        "passed": passed,
        "probability": prob,
        "threshold": threshold,
        "model": model,
        "action": action_description,
        "policy": policy_instruction,
        "raw_answer": guardrail,
    }


if __name__ == "__main__":
    import asyncio

    if len(sys.argv) < 2:
        print("Usage: python clef_anti_drift_guard.py '<action_description>' [policy_instruction]")
        sys.exit(1)

    action = sys.argv[1]
    default_policy = (
        "Is this file operation non-destructive and compliant with incremental refinement rules?"
    )
    pol = sys.argv[2] if len(sys.argv) > 2 else default_policy

    res = asyncio.run(evaluate_file_action_guardrail(action, pol))
    print(f"Passed: {res['passed']} (Probability: {res['probability']:.4f})")
    if not res["passed"]:
        sys.exit(2)  # Non-zero exit code to block hook execution
    sys.exit(0)
