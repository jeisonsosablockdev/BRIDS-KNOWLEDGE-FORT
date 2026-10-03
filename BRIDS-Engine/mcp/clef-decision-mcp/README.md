# Cloudflare Clef Decision MCP Server (`clef-decision-mcp`)

Servidor **Model Context Protocol (MCP)** ultraligero y de alta velocidad diseñado para conectar **Antigravity** con modelos locales de toma de decisiones, enfocado en **Cloudflare Clef** y **Clef-flash** (arquitectura *System One*).

## Capacidades

A diferencia de los LLMs tradicionales orientados a generación de texto libre, este servidor expone herramientas para evaluación probabilística y tipada con latencias mínimas (~38.8 ms en `clef-flash`):

1. **`clef_decide_choice`**:
   - Resuelve preguntas de selección múltiple sobre un estado (contexto, logs, código, propuestas).
   - Retorna: opción ganadora, probabilidad individual y nivel de confianza.
2. **`clef_guardrail_check`**:
   - Evalúa preguntas `noul` (sí/no) con probabilidad (0.0 - 1.0) para guardrails de seguridad antes de ejecutar herramientas o comandos destructivos.
3. **`clef_score_rubric`**:
   - Califica un estado frente a una rúbrica estructurada y progresiva devolviendo una puntuación ponderada.
4. **`clef_batch_decision`**:
   - Ejecuta hasta 64 preguntas simultáneas en un único paso de inferencia (forward pass).

## Requisitos

- **Ollama** $\ge$ v0.35.1 con soporte nativo de `/v1/systemone`.
- Modelo descargado: `clef-flash` (9B) o `clef` (27B).
- `uv` (Fast Python Package Installer & Runner).

## Ejecución Manual / Pruebas

```bash
# Correr el servidor stdio
uv run --with mcp --with httpx server.py

# Correr el test suite de integración
uv run --with httpx test_client.py
```

## Registro en Antigravity

El servidor se registra automáticamente en `~/.gemini/config/mcp_config.json`:

```json
{
  "mcpServers": {
    "clef-decision-mcp": {
      "command": "/Users/jaymusicmachine/.local/bin/uv",
      "args": [
        "run",
        "--with", "mcp",
        "--with", "httpx",
        "/Users/jaymusicmachine/Library/CloudStorage/GoogleDrive-goodacrematas498@gmail.com/My Drive/01 Primal Code Lab/BRIDS/Business/BRIDS KNOWLEDGE FORT/BRIDS-Engine/mcp/clef-decision-mcp/server.py"
      ]
    }
  }
}
```
