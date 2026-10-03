# /// script
# dependencies = [
#   "mcp",
#   "httpx",
# ]
# ///
"""
clef-decision-mcp: Model Context Protocol Server for Local Decision Models.
Specialized for Cloudflare Clef & Clef-flash (System One Architecture) via Ollama.
"""

import os
import sys
import json
from typing import Dict, Any, Optional
import httpx
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP Server
mcp = FastMCP("clef-decision-mcp")

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
DEFAULT_MODEL = os.environ.get("CLEF_DEFAULT_MODEL", "clef-flash")


async def _execute_systemone(payload: dict) -> dict:
    """
    Executes a System One request against Ollama's /v1/systemone endpoint,
    with an automatic structured fallback to /api/generate if System One endpoint
    is unavailable or if a non-Clef model is queried.
    """
    url = f"{OLLAMA_BASE_URL.rstrip('/')}/v1/systemone"
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                return resp.json()
        except Exception as e:
            sys.stderr.write(f"[clef-decision-mcp] /v1/systemone direct request failed: {e}\n")

        # Fallback to standard Ollama generate endpoint with structured JSON
        sys.stderr.write("[clef-decision-mcp] Falling back to Ollama /api/generate structured emulation...\n")
        fallback_url = f"{OLLAMA_BASE_URL.rstrip('/')}/api/generate"
        prompt = (
            f"You are a System One decision engine. Given this state and questions, evaluate probabilities:\n"
            f"State: {payload.get('state')}\n"
            f"Questions: {json.dumps(payload.get('questions'), indent=2)}\n\n"
            f"Respond ONLY with a JSON object with key 'answers' matching the System One schema: "
            f"each question must have either a 'noul' probability float (0.0 to 1.0) or a 'choice' string with 'probabilities' and 'confidence'."
        )
        fallback_payload = {
            "model": payload.get("model", DEFAULT_MODEL),
            "prompt": prompt,
            "format": "json",
            "stream": False,
        }
        fallback_resp = await client.post(fallback_url, json=fallback_payload)
        fallback_resp.raise_for_status()
        raw_text = fallback_resp.json().get("response", "{}")
        parsed = json.loads(raw_text)
        return parsed


@mcp.tool()
async def clef_decide_choice(
    state: str,
    question_id: str,
    instructions: str,
    criteria: Dict[str, str],
    model: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Evaluates a multiple-choice question against a defined state using Cloudflare Clef.
    Returns the chosen option, probability per option, and confidence value.
    
    Args:
        state: The context, code, logs, or input state to evaluate.
        question_id: Identifier for this question (e.g. 'routing_target', 'security_classification').
        instructions: What to decide (e.g. 'Which module should handle this request?').
        criteria: Key-value map of available choices and their descriptions/criteria.
        model: Optional model name ('clef-flash', 'clef', or other Ollama model). Defaults to clef-flash.
    """
    chosen_model = model or DEFAULT_MODEL
    payload = {
        "model": chosen_model,
        "state": state,
        "questions": {
            question_id: {
                "type": "choice",
                "instructions": instructions,
                "criteria": criteria,
            }
        },
    }
    
    result = await _execute_systemone(payload)
    answers = result.get("answers", {})
    decision = answers.get(question_id, {})
    return {
        "model": chosen_model,
        "question_id": question_id,
        "chosen": decision.get("choice"),
        "confidence": decision.get("confidence"),
        "probabilities": decision.get("probabilities", {}),
        "raw_answer": decision,
    }


@mcp.tool()
async def clef_guardrail_check(
    action_or_state: str,
    policy_instruction: str,
    threshold: float = 0.5,
    model: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Evaluates whether an action or state complies with a safety/governance policy (noul question).
    Returns the probability (0.0 to 1.0) and a boolean pass/block decision.
    
    Args:
        action_or_state: The proposed action, tool call, or code change to verify.
        policy_instruction: The yes/no question (e.g. 'Is this action safe to execute without human review?').
        threshold: Minimum probability to consider an affirmative verdict (default 0.5).
        model: Optional model name. Defaults to clef-flash.
    """
    chosen_model = model or DEFAULT_MODEL
    payload = {
        "model": chosen_model,
        "state": action_or_state,
        "questions": {
            "guardrail": {
                "type": "noul",
                "instructions": policy_instruction,
            }
        },
    }
    
    result = await _execute_systemone(payload)
    answers = result.get("answers", {})
    guardrail = answers.get("guardrail", {})
    prob = guardrail.get("noul", 0.0)
    if isinstance(prob, (int, float)):
        passed = prob >= threshold
    else:
        passed = False
        prob = 0.0
        
    return {
        "model": chosen_model,
        "passed": passed,
        "probability": prob,
        "threshold": threshold,
        "policy": policy_instruction,
        "raw_answer": guardrail,
    }


@mcp.tool()
async def clef_score_rubric(
    target_content: str,
    instructions: str,
    rubric_levels: Dict[str, str],
    model: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Scores target content against an ordered rubric using Cloudflare Clef.
    Returns a probability-weighted score and probabilities per rubric level.
    
    Args:
        target_content: The text, code, or data to evaluate.
        instructions: Scoring question (e.g. 'Rate the architectural stability of this implementation').
        rubric_levels: Ordered rubric map (e.g. {'1': 'Poor', '2': 'Adequate', '3': 'Good', '4': 'Exemplary'}).
        model: Optional model name. Defaults to clef-flash.
    """
    chosen_model = model or DEFAULT_MODEL
    payload = {
        "model": chosen_model,
        "state": target_content,
        "questions": {
            "score_eval": {
                "type": "score",
                "instructions": instructions,
                "rubric": rubric_levels,
            }
        },
    }
    
    result = await _execute_systemone(payload)
    answers = result.get("answers", {})
    score_eval = answers.get("score_eval", {})
    return {
        "model": chosen_model,
        "weighted_score": score_eval.get("score"),
        "level_probabilities": score_eval.get("probabilities", {}),
        "raw_answer": score_eval,
    }


@mcp.tool()
async def clef_batch_decision(
    state: str,
    questions: Dict[str, Dict[str, Any]],
    model: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Executes multiple simultaneous decisions (up to 64) in a single ultra-fast forward pass.
    
    Args:
        state: The common state/context to evaluate.
        questions: Dictionary of question definitions adhering to System One schema (noul, choice, score).
        model: Optional model name. Defaults to clef-flash.
    """
    chosen_model = model or DEFAULT_MODEL
    payload = {
        "model": chosen_model,
        "state": state,
        "questions": questions,
    }
    
    result = await _execute_systemone(payload)
    return {
        "model": chosen_model,
        "answers": result.get("answers", {}),
        "raw_result": result,
    }


if __name__ == "__main__":
    mcp.run()
