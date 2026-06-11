# Changelog

All notable changes to `pilot-mcp` documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Scaffold of the `pilot-mcp` package.
- 6 MCP tools: `pilot_send`, `pilot_inbox`, `pilot_handshake`, `pilot_find`, `pilot_peers`, `pilot_approve`.
- 4 MCP resources: `pilot://inbox`, `pilot://trust`, `pilot://peers`, `pilot://identity`.
- 3 MCP prompts: `pilot-3-command-pattern`, `pilot-a2a-message`, `pilot-handshake-first-contact`.
- `pilot-mcp setup` auto-detect/auto-config wizard for 11 harnesses (Claude Code, Cursor, Cline, Continue.dev, OpenClaw, Hermes, PicoClaw, OpenHands, Codex CLI, Junie, GitHub Copilot).
- Manifests for marketplace submissions: `.claude-plugin/plugin.json`, `server.json`, `server.yaml`, `tools.json`, `smithery.yaml`, `.well-known/mcp/server-card.json`.
- GitHub Actions workflow for tag-driven publish to npm + Official MCP Registry + Docker.

### Pending (not yet implemented)
- Per-platform subpackages with Go binaries.
- Streamable HTTP transport (`pilot-mcp serve --http`).
- `pilot-mcp doctor` diagnostic.
- `pilot-mcp tour` first-run demo.
- Tarball download fallback in `install.js`.
- Daemon service install + load (currently delegates to `pilotctl daemon start`).
- Per-turn heartbeat hooks (Claude Code, OpenHands paths sketched).
