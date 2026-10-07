# 📦 BRIDS-Engine Outputs & Staging Area

Este directorio almacena artefactos compilados, presentaciones nativas y borradores reutilizables generados por `BRIDS-Engine` antes de su promoción formal a `BRIDS-Brain/` (tras superar el Guardrail **HITL-2**):

- **`decks/`**: Presentaciones nativas `.pptx` generadas por el subagente [`pitch-deck-architect`](../agents/pitch-deck-architect.yaml) mediante `python-pptx`.
- **`pdfs/`**: Documentos compilados a PDF de alta resolución generados por [`export-pdf.sh`](../scripts/export-pdf.sh) con el flag `--staging`.
- **Entregables MAS reutilizables**: Borradores generados por las skills de Marketing Agent Studio (`mas-copywriting`, `mas-copy-editing`, `mas-content-strategy`, `mas-seo-audit`, `mas-ai-seo`).
