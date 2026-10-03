"""
SPEC-03: Fast Pre-Review Batch Filter for Code Diffs.
Evaluates 7 boolean dimensions in a single forward pass of Cloudflare Clef (System One API).
Routes trivial/safe changes to 'fast_track' and risky/breaking changes to 'full_audit_required'.
"""

import os
import sys
import time
import httpx
from typing import Dict, Any, List

OLLAMA_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL_NAME = os.environ.get("CLEF_MODEL", "clef-flash")

PRE_REVIEW_QUESTIONS = {
    "touches_critical_core": {
        "type": "noul",
        "instructions": "Does this code diff modify critical security, authentication, credentials, cryptography, or core configuration files?",
    },
    "removes_established_code": {
        "type": "noul",
        "instructions": "Does this code diff delete significant existing implementation code or remove established tests?",
    },
    "introduces_new_dependencies": {
        "type": "noul",
        "instructions": "Does this diff add new external third-party package dependencies, system binaries, or external imports?",
    },
    "modifies_public_api": {
        "type": "noul",
        "instructions": "Does this diff alter public API signatures, REST endpoints, RPC methods, or schema interfaces?",
    },
    "has_syntax_or_type_risks": {
        "type": "noul",
        "instructions": "Does this change introduce obvious runtime risks, unhandled exceptions, or syntax/type hazards?",
    },
    "breaks_backward_compatibility": {
        "type": "noul",
        "instructions": "Is this change likely to break backwards compatibility for existing callers or saved state?",
    },
    "exceeds_complexity_threshold": {
        "type": "noul",
        "instructions": "Is this code diff unusually large, intricate, or complex to verify trivially?",
    },
}


async def evaluate_batch_prereview(
    diff_content: str,
    model: str = MODEL_NAME,
    risk_threshold: float = 0.50,
) -> Dict[str, Any]:
    """
    Submits a diff against the 7-question pre-review batch in a single forward pass.
    """
    payload = {
        "model": model,
        "state": f"Code Diff to review:\n{diff_content}",
        "questions": PRE_REVIEW_QUESTIONS,
    }

    url = f"{OLLAMA_URL.rstrip('/')}/v1/systemone"
    t0 = time.perf_counter()
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()
    duration_ms = (time.perf_counter() - t0) * 1000.0

    answers = data.get("answers", {})
    flagged_risks: List[str] = []

    for q_id, q_data in answers.items():
        prob = float(q_data.get("noul", 0.0))
        if prob >= risk_threshold:
            flagged_risks.append(f"{q_id} ({prob:.2f})")

    route = "full_audit_required" if len(flagged_risks) > 0 else "fast_track"

    return {
        "route": route,
        "model": model,
        "flagged_risks": flagged_risks,
        "latency_ms": round(duration_ms, 2),
        "answers": answers,
        "raw_response": data,
    }


if __name__ == "__main__":
    import asyncio
    import json

    if len(sys.argv) < 2:
        print("Usage: python clef_batch_prereview.py '<diff_text_or_path>'")
        sys.exit(1)

    arg = sys.argv[1]
    if os.path.exists(arg):
        with open(arg, "r") as f:
            diff_text = f.read()
    else:
        diff_text = arg

    res = asyncio.run(evaluate_batch_prereview(diff_text))
    print(f"Routing Decision: {res['route']} (evaluated in {res['latency_ms']} ms)")
    if res["flagged_risks"]:
        print("Flagged Risks:", ", ".join(res["flagged_risks"]))
    sys.exit(0 if res["route"] == "fast_track" else 1)
