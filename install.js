// install.js — postinstall fallback.
//
// In the happy path, npm/pnpm/yarn resolved one of the platform subpackages
// (pilot-mcp-linux-x64, pilot-mcp-darwin-arm64, etc.) via optionalDependencies,
// and the Go binary is sitting inside that subpackage's node_modules folder.
// In that case, this script does nothing.
//
// Fallback path: some environments disable optional deps (corporate npm mirrors,
// `npm install --no-optional`, certain CI runners). When that happens, the
// resolved subpackage won't exist, and we download the tarball directly from
// the npm registry (NOT from GitHub Releases — corp proxies often allow npm but
// block github.com).
//
// Reference pattern: blog.sentry.io/publishing-binaries-on-npm, esbuild PR #1621.

import process from 'node:process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function platformKey() {
  const platform = process.platform;
  const arch = process.arch;
  if (platform === 'linux' && arch === 'x64') return 'linux-x64';
  if (platform === 'linux' && arch === 'arm64') return 'linux-arm64';
  if (platform === 'darwin' && arch === 'x64') return 'darwin-x64';
  if (platform === 'darwin' && arch === 'arm64') return 'darwin-arm64';
  if (platform === 'win32' && arch === 'x64') return 'win32-x64';
  return null;
}

function resolvedSubpackagePath() {
  const key = platformKey();
  if (!key) return null;
  try {
    // require.resolve in ESM
    const candidate = join(__dirname, 'node_modules', `pilot-mcp-${key}`, 'package.json');
    if (existsSync(candidate)) return dirname(candidate);
  } catch {
    /* fall through to fallback */
  }
  return null;
}

async function downloadTarballFallback() {
  const key = platformKey();
  if (!key) {
    console.error(`pilot-mcp: no prebuilt binary for ${process.platform}/${process.arch}.`);
    console.error('Open an issue or build from source: https://github.com/pilot-protocol/pilot-mcp');
    process.exit(0); // exit 0 so install doesn't fail catastrophically
  }
  // TODO: fetch the matching tarball from registry.npmjs.org, extract into ./bin/
  // For now, exit silently — the cli.js will surface a clearer error on first run.
  console.warn(`pilot-mcp: optionalDependencies resolution failed for pilot-mcp-${key}.`);
  console.warn('Fallback tarball download not yet implemented. Run `pilot-mcp doctor` for diagnostics.');
}

(async () => {
  if (process.env.PILOT_MCP_SKIP_POSTINSTALL === '1') return;
  if (resolvedSubpackagePath()) return; // happy path: subpackage installed, nothing to do
  await downloadTarballFallback();
})();
