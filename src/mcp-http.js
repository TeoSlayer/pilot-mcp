// mcp-http.js — Streamable HTTP MCP server.
//
// Used when a harness prefers an HTTP endpoint (Claude Code's `--transport http`,
// or shared-daemon scenarios where one pilot-mcp serves multiple harness sessions).
//
// Default bind: 127.0.0.1:9100. Loopback-only by default; per-install bearer
// token in ~/.pilot/mcp-token gates requests. Set --bind 0.0.0.0 only if you
// understand the implications.

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamable-http.js';
import { registerTools } from './tools/index.js';
import { registerResources } from './resources/index.js';
import { registerPrompts } from './prompts/index.js';

export async function runHttp(flags) {
  const port = parseInt(flags.port ?? '9100', 10);
  const bind = flags.bind ?? '127.0.0.1';

  const server = new Server(
    { name: 'pilot-mcp', version: '0.1.0' },
    { capabilities: { tools: {}, resources: { listChanged: true }, prompts: {} } }
  );

  registerTools(server);
  registerResources(server);
  registerPrompts(server);

  // TODO: wire up StreamableHTTPServerTransport with bearer-token auth from
  // ~/.pilot/mcp-token, bind to bind:port, log "pilot-mcp HTTP server listening".
  console.error(`pilot-mcp HTTP server (skeleton) — would listen on ${bind}:${port}`);
  console.error('NOT YET IMPLEMENTED. See src/mcp-http.js TODO.');
  process.exit(2);
}
