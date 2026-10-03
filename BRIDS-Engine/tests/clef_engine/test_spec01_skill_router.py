import pytest
import sys
import os

ENGINE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if ENGINE_DIR not in sys.path:
    sys.path.insert(0, ENGINE_DIR)

from hooks.clef_skill_router import route_skill_for_prompt

SKILLS_CATALOG = {
    "solana-dev": "Solana programming, Anchor, PDAs, Web3 tokens, Metaplex, contracts",
    "copywriting": "Marketing copy, landing pages, email conversion, headlines, brand voice",
    "clean-code": "Refactoring principles, SOLID patterns, code smells, readability",
    "tdd-primal": "Test-driven development, failing tests, test suites, coverage contracts",
    "general-assistant": "General conversation, questions, standard everyday programming tasks",
}


@pytest.mark.asyncio
async def test_skill_router_routes_solana_prompt(check_ollama_alive):
    """
    SPEC-01 RED Contract:
    Prompt with Solana/Anchor keywords MUST route to 'solana-dev' with >0.80 probability.
    """
    prompt = "Escribe un programa de Anchor en Solana para crear una cuenta PDA y acuñar un token"
    result = await route_skill_for_prompt(prompt, SKILLS_CATALOG)

    assert result["chosen"] == "solana-dev"
    assert result["probabilities"]["solana-dev"] >= 0.80
    assert result["model"] == "clef-flash"


@pytest.mark.asyncio
async def test_skill_router_routes_copywriting_prompt(check_ollama_alive):
    """
    SPEC-01 RED Contract:
    Prompt with conversion/copywriting keywords MUST route to 'copywriting' with >0.75 probability.
    """
    prompt = "Redacta el titular y el hero section de alta conversión para la landing page"
    result = await route_skill_for_prompt(prompt, SKILLS_CATALOG)

    assert result["chosen"] == "copywriting"
    assert result["probabilities"]["copywriting"] >= 0.75
    assert result["model"] == "clef-flash"
