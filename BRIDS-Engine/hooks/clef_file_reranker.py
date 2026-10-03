"""
SPEC-04: File Search Reranker Hook for Antigravity.
Reranks file matches using Cloudflare Clef's System One 'score' criteria in a single forward pass.
Ensures the agent only opens the most relevant 2-3 files instead of polluting the context.
"""

import os
import sys
import httpx
from typing import List, Dict, Any

OLLAMA_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL_NAME = os.environ.get("CLEF_MODEL", "clef-flash")

RELEVANCE_CRITERIA = [
    "Completely irrelevant, build artifact, lockfile, or unrelated topic",
    "Tangential keyword match without direct conceptual relevance",
    "Secondary context, background notes, or generic reference",
    "Directly related documentation, specification, or adjacent module",
    "Exact primary target file required to accomplish the task goal",
]


async def rerank_file_candidates(
    task_goal: str,
    candidates: List[Dict[str, str]],
    top_k: int = 3,
    model: str = MODEL_NAME,
) -> List[Dict[str, Any]]:
    """
    Reranks file candidates against task_goal in a single forward pass using Clef score questions.
    """
    if not candidates:
        return []

    # Build batch questions for each candidate (up to 64)
    questions = {}
    for idx, cand in enumerate(candidates[:64]):
        q_id = f"cand_{idx}"
        snippet_preview = cand.get("snippet", "")[:300].replace("\n", " ")
        questions[q_id] = {
            "type": "score",
            "instructions": (
                f"Rate the relevance of file '{cand.get('path', '')}' "
                f"with content preview: '{snippet_preview}' for the goal."
            ),
            "criteria": RELEVANCE_CRITERIA,
        }

    payload = {
        "model": model,
        "state": f"Developer Task Goal: {task_goal}",
        "questions": questions,
    }

    url = f"{OLLAMA_URL.rstrip('/')}/v1/systemone"
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()

    answers = data.get("answers", {})
    scored_candidates = []

    for idx, cand in enumerate(candidates[:64]):
        q_id = f"cand_{idx}"
        q_eval = answers.get(q_id, {})
        weighted_score = float(q_eval.get("score", 0.0))
        scored_candidates.append({
            **cand,
            "score": round(weighted_score, 2),
            "probabilities": q_eval.get("probabilities", {}),
            "confidence": float(q_eval.get("confidence", 0.0)),
        })

    # Sort descending by score
    scored_candidates.sort(key=lambda x: x["score"], reverse=True)
    return scored_candidates[:top_k]


if __name__ == "__main__":
    import asyncio
    import json

    if len(sys.argv) < 3:
        print("Usage: python clef_file_reranker.py '<task_goal>' '<json_candidates_array>' [top_k]")
        sys.exit(1)

    goal = sys.argv[1]
    cands = json.loads(sys.argv[2])
    k = int(sys.argv[3]) if len(sys.argv) > 3 else 3

    results = asyncio.run(rerank_file_candidates(goal, cands, top_k=k))
    print(json.dumps(results, indent=2))
