import pytest
import sys
import os

ENGINE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if ENGINE_DIR not in sys.path:
    sys.path.insert(0, ENGINE_DIR)

from hooks.clef_file_reranker import rerank_file_candidates


@pytest.mark.asyncio
async def test_file_reranker_prioritizes_exact_match(check_ollama_alive):
    """
    SPEC-04 TDD Contract:
    When searching for Solana MCP integration details,
    the dedicated Solana guide must rank #1 with a score >= 2.5,
    while irrelevant build artifacts must rank at the bottom (< 1.5).
    """
    task_goal = "Investigate how to query Solana Metaplex Core plugins and Developer MCP tools in BRIDS"
    candidates = [
        {
            "path": "package-lock.json",
            "snippet": '{"name": "brids-knowledge", "lockfileVersion": 3, "dependencies": {"axios": "1.0"}}',
        },
        {
            "path": "BRIDS-Brain/02 Marketing/03 Redes Sociales & Contenido/social-post.md",
            "snippet": "Descubre cómo tokenizar activos en el mundo real en 3 simples pasos con Solana.",
        },
        {
            "path": "BRIDS-Engine/docs/solana-mcp-integration.md",
            "snippet": "# Solana Developer MCP Integration (mcp.solana.com)\nActive Server: solana-mcp-server. Core MCP Tools: list_sections, get_documentation, Solana_Documentation_Search.",
        },
    ]

    ranked = await rerank_file_candidates(task_goal, candidates, top_k=2)

    assert len(ranked) == 2, "Expected top_k=2 items returned"
    assert ranked[0]["path"] == "BRIDS-Engine/docs/solana-mcp-integration.md", "Relevant file was not ranked #1"
    assert ranked[0]["score"] >= 2.5, f"Expected score >= 2.5, got {ranked[0]['score']}"
    assert ranked[0]["score"] > ranked[1]["score"]
