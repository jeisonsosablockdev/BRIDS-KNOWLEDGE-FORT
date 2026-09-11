# Obsidian Agent Client Integration

This workspace uses [obsidian-agent-client](https://github.com/RAIT-09/obsidian-agent-client) to expose Codex directly inside the Obsidian vault.

## Source

- plugin source clone: `obsidian-agent-client/`
- installed plugin: `MarketingAgentStudio/.obsidian/plugins/agent-client/`

## Current Configuration

- plugin id: `agent-client`
- default agent: `codex-acp`
- Node path: `/Users/jaymusicmachine/.nvm/versions/node/v24.10.0/bin/node`
- Codex ACP path: `/Users/jaymusicmachine/.nvm/versions/node/v24.10.0/bin/codex-acp`
- auth mode: Codex CLI login
- chat export folder: `MarketingAgentStudio/00 Inbox/Agent Client Chats/`

## Why This Setup

- keeps project logic outside the vault
- lets Codex read notes from `MarketingAgentStudio/`
- keeps chat exports separate from final marketing deliverables
- uses Codex account login instead of storing an API key in the plugin

## Rebuild / Reinstall

```bash
cd obsidian-agent-client
npm install
npm run build
cp main.js manifest.json styles.css "../MarketingAgentStudio/.obsidian/plugins/agent-client/"
```

## Vault Files

- enabled community plugins list: `MarketingAgentStudio/.obsidian/community-plugins.json`
- plugin settings: `MarketingAgentStudio/.obsidian/plugins/agent-client/data.json`

## Notes

- If Obsidian does not pick up the plugin immediately, reload the app or toggle Community Plugins once.
- On Windows, the same plugin can be used, but the paths in `data.json` must be replaced with Windows paths or configured through the Obsidian settings UI.
