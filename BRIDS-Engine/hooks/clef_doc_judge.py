"""
SPEC-05: Documentation Judge & TDD Gap Detector Hook for Antigravity.
Audits documentation requirements against test suites in a single forward pass of Cloudflare Clef.
Identifies untested specification gaps before production code is written or merged.
"""

import os
import sys
import httpx
from typing import List, Dict, Any

OLLAMA_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL_NAME = os.environ.get("CLEF_MODEL", "clef-flash")


async def audit_spec_test_coverage(
    requirements: List[str],
    test_suite_content: str,
    coverage_threshold: float = 0.70,
    model: str = MODEL_NAME,
) -> Dict[str, Any]:
    """
    Evaluates whether each requirement in a list is covered by the provided test suite.
    Executes in a single forward pass using Clef System One noul questions.
    """
    if not requirements:
        return {
            "model": model,
            "total_requirements": 0,
            "covered_requirements": [],
            "missing_gaps": [],
            "coverage_percentage": 100.0,
            "ready_for_implementation": True,
        }

    questions = {}
    for idx, req in enumerate(requirements[:64]):
        q_id = f"req_{idx}"
        questions[q_id] = {
            "type": "noul",
            "instructions": f"Does this test suite contain explicit automated test cases or assertions verifying this requirement: '{req}'?",
        }

    payload = {
        "model": model,
        "state": f"Existing Test Suite Code:\n{test_suite_content}",
        "questions": questions,
    }

    url = f"{OLLAMA_URL.rstrip('/')}/v1/systemone"
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()

    answers = data.get("answers", {})
    covered: List[Dict[str, Any]] = []
    gaps: List[Dict[str, Any]] = []

    for idx, req in enumerate(requirements[:64]):
        q_id = f"req_{idx}"
        q_eval = answers.get(q_id, {})
        prob = float(q_eval.get("noul", 0.0))

        item = {
            "index": idx,
            "requirement": req,
            "probability": round(prob, 4),
        }

        if prob >= coverage_threshold:
            covered.append(item)
        elif prob < 0.50:
            gaps.append(item)

    coverage_pct = (len(covered) / len(requirements)) * 100.0

    return {
        "model": model,
        "total_requirements": len(requirements),
        "covered_requirements": covered,
        "missing_gaps": gaps,
        "coverage_percentage": round(coverage_pct, 1),
        "ready_for_implementation": len(gaps) == 0,
        "raw_answers": answers,
    }


if __name__ == "__main__":
    import asyncio
    import json

    if len(sys.argv) < 3:
        print("Usage: python clef_doc_judge.py '<spec_or_requirements_json>' '<test_file_path>'")
        sys.exit(1)

    spec_arg = sys.argv[1]
    test_path = sys.argv[2]

    if os.path.exists(spec_arg):
        with open(spec_arg, "r") as f:
            content = f.read()
            reqs = [line.strip("- ") for line in content.splitlines() if line.strip().startswith(("-", "*", "1.", "2."))]
    else:
        reqs = json.loads(spec_arg)

    with open(test_path, "r") as f:
        tests = f.read()

    result = asyncio.run(audit_spec_test_coverage(reqs, tests))
    print(f"Coverage: {result['coverage_percentage']}% (Ready: {result['ready_for_implementation']})")
    if result["missing_gaps"]:
        print("Missing Test Gaps Detected:")
        for g in result["missing_gaps"]:
            print(f"  - [{g['probability']:.2f}] {g['requirement']}")
    sys.exit(0 if result["ready_for_implementation"] else 1)
