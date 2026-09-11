# MarketingAgentCore

Este directorio contiene la logica separada del vault de Obsidian y es la fuente de verdad de las skills portadas.

## Estructura

- `imported-skills/`: copia completa del repo upstream `marketingskills` sin adaptar
- `skills/`: versiones portadas de skills de marketing para tu proyecto
- `context/`: contexto base de marca y producto
- `outputs/`: entregables Markdown reutilizables
- `docs/`: notas operativas del sistema

## Regla de ubicacion

Las skills quedan dentro de este mismo proyecto.

- No se consideran instaladas globalmente como fuente principal
- Cualquier integracion futura con Codex u Obsidian debe apuntar a estas rutas locales

## Modelo de trabajo

- `imported-skills/` conserva los 36 skills originales importados desde `coreyhaines31/marketingskills`
- `skills/` contiene las variantes locales que vayamos adaptando para tu flujo real
- cuando necesitemos personalizar un skill, partimos del original importado y lo promovemos a una variante local

## Skills portadas

- `mas-product-marketing-context`
- `mas-copywriting`
- `mas-copy-editing`
- `mas-content-strategy`
- `mas-social-content`
- `mas-seo-audit`
- `mas-ai-seo`

## Ruta de contexto

Las skills MAS leen y escriben:

- `MarketingAgentCore/context/product-marketing-context.md`

## Uso esperado

1. Completar o refinar `product-marketing-context.md`
2. Generar entregables en `MarketingAgentCore/outputs/`
3. En el siguiente paso, conectar esos outputs con Obsidian sin mezclar la logica dentro del vault

## Fuente upstream

Basado en:

- `https://github.com/coreyhaines31/marketingskills`

Las versiones de este proyecto fueron renombradas y adaptadas para el workspace `MarketingAgentStudio`.
