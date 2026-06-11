// setup/index.js — the one-command install flow.
//
// What `pilot-mcp setup` does, end-to-end:
//   1. Capture email + hostname (interactive prompts OR PILOT_EMAIL/PILOT_HOSTNAME env).
//   2. Extract pilot-daemon + pilotctl binaries from the platform subpackage to ~/.pilot/bin/.
//   3. Write ~/.pilot/config.json.
//   4. Probe UDP transport to beacon; fall back to compat mode if blocked.
//   5. Install AND load the daemon service (launchd plist / systemd unit).
//   6. Start daemon, wait for rendezvous registration, fetch pilot address.
//   7. Auto-detect installed harnesses.
//   8. For each detected harness: write MCP config + drop SKILL.md/AGENTS.md heartbeat.
//   9. Print summary with pilot address and which harnesses were configured.
//
// Replaces the current ~16-step new-user journey with one command.

import process from 'node:process';
import { detectHarnesses } from './detect.js';
import { installDaemon } from './daemon.js';
import { writeIdentity } from './identity.js';
import { probeTransport } from './transport.js';
import harnesses from './harnesses/index.js';

export async function runSetup(flags) {
  const opts = await resolveOptions(flags);

  step('1', 'Identity', async () => {
    await writeIdentity({ email: opts.email, hostname: opts.hostname });
  });

  step('2', 'Transport', async () => {
    opts.transport = await probeTransport();
    if (opts.transport === 'compat') {
      log('  UDP appears blocked. Falling back to compat mode (TCP/443 via WSS).');
    }
  });

  step('3', 'Daemon', async () => {
    await installDaemon({ transport: opts.transport, autoStart: true });
  });

  let detected = [];
  step('4', 'Detect harnesses', async () => {
    detected = await detectHarnesses();
    if (opts.all) opts.harnesses = detected.map((h) => h.id);
    if (!opts.harnesses?.length) opts.harnesses = detected.map((h) => h.id);
    log(`  Detected: ${detected.map((h) => h.id).join(', ') || '(none)'}`);
  });

  const configured = [];
  const skipped = [];
  step('5', 'Configure harnesses', async () => {
    for (const h of detected) {
      if (!opts.harnesses.includes(h.id)) {
        skipped.push(h.id);
        continue;
      }
      const writer = harnesses[h.id];
      if (!writer) {
        skipped.push(`${h.id} (no writer)`);
        continue;
      }
      try {
        await writer.configure({ ...h, transport: opts.transport });
        configured.push(h.id);
      } catch (err) {
        log(`  ${h.id}: failed — ${err.message}`);
        skipped.push(`${h.id} (${err.message})`);
      }
    }
  });

  // Print summary.
  log('');
  log('============================================');
  log('Pilot is installed and running.');
  log('');
  log(`  Address:   ${opts.address ?? '(fetching…)'}`);
  log(`  Hostname:  ${opts.hostname}`);
  log(`  Transport: ${opts.transport}`);
  log(`  Configured: ${configured.join(', ') || '(none)'}`);
  if (skipped.length) log(`  Skipped:    ${skipped.join(', ')}`);
  log('');
  log('Next steps:');
  log('  pilot-mcp tour      — try one specialist query');
  log('  pilot-mcp doctor    — diagnose if anything looks wrong');
  log('  pilot-mcp peers     — see who you are connected to');
  log('============================================');
}

async function resolveOptions(flags) {
  // TODO: interactive prompts via @inquirer/prompts when TTY; env-var fallback otherwise.
  const opts = {
    email: flags.email ?? process.env.PILOT_EMAIL ?? null,
    hostname: flags.hostname ?? process.env.PILOT_HOSTNAME ?? null,
    all: flags.all ?? false,
    harnesses: [],
  };
  // Build harnesses list from flags like --claude --cursor --cline.
  for (const id of ['claude', 'cursor', 'cline', 'continue', 'openclaw', 'hermes', 'picoclaw', 'openhands', 'codex', 'junie', 'copilot']) {
    if (flags[id]) opts.harnesses.push(id);
  }
  return opts;
}

function step(n, label, fn) {
  return (async () => {
    log(`[${n}] ${label}…`);
    await fn();
  })();
}

function log(s) {
  // setup output goes to stderr so it's safe for setup to also pipe-friendly
  // contexts. The summary at the end goes to stdout.
  process.stderr.write(s + '\n');
}
