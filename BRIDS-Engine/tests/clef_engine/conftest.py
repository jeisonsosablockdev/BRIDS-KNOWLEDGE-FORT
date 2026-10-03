import pytest
import httpx

OLLAMA_URL = "http://localhost:11434"

@pytest.fixture(scope="session")
def check_ollama_alive():
    try:
        resp = httpx.get(f"{OLLAMA_URL}/api/version", timeout=3.0)
        assert resp.status_code == 200, f"Ollama not returning 200: {resp.text}"
    except Exception as e:
        pytest.fail(f"Ollama server is not running at {OLLAMA_URL}: {e}")
