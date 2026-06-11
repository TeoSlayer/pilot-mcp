// Hermes: write mcp_servers block into ~/.hermes/config.yaml.
//
// Per-turn injection on Hermes requires a separate Python plugin (hermes-pilot)
// since Hermes deliberately injects pre_llm_call context into the user message
// (cache-preserving). MCP gets us tool surface; the plugin closes the gap.
// Gateway-mode Hermes (issue #26596) ignores SOUL.md, so per-turn hook is the
// only viable injection path there.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const HOME = homedir();
const CONFIG = join(HOME, '.hermes', 'config.yaml');

export async function configure() {
  if (!existsSync(CONFIG)) {
    // No config yet — write a minimal one with the pilot block.
    writeFileSync(
      CONFIG,
      `mcp_servers:\n  pilot:\n    command: npx\n    args:\n      - "-y"\n      - pilot-mcp\n`
    );
    return;
  }
  // Hermes uses YAML; we do a conservative string-level append rather than
  // depend on a YAML parser at install time. Idempotent: skip if already present.
  const current = readFileSync(CONFIG, 'utf8');
  if (current.includes('mcp_servers:') && current.includes('pilot:')) return;
  const insertion = `\nmcp_servers:\n  pilot:\n    command: npx\n    args:\n      - "-y"\n      - pilot-mcp\n`;
  writeFileSync(CONFIG, current + insertion);
}
