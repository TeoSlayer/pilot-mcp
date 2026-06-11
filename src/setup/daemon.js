// setup/daemon.js — install + start pilot-daemon + join Network 9 + smoke test.
//
// Today's pilot-daemon install writes launchd plist / systemd unit but never
// loads it — user has to manually `brew services start` or
// `sudo systemctl enable --now`. This module closes that gap, plus does:
//   - Network 9 join (required to reach list-agents — the directory specialist)
//   - Smoke test: send a 1-item search to list-agents to confirm the overlay
//     is actually reachable before claiming success in the summary

import { spawnSync } from 'node:child_process';
import { execPilotctl, pilotctlJSON } from '../daemon-bridge.js';

export async function installDaemon({ transport, autoStart }) {
  // TODO: extract pilot-daemon + pilotctl binaries from the resolved platform
  // subpackage to ~/.pilot/bin/. Write ~/.pilot/config.json. Write launchd
  // plist (macOS) / systemd unit (Linux). Load + start it.
  //
  // For now: shell out to `pilotctl daemon start` which does an in-process
  // start. The service-unit-write-and-load is the v0.2 milestone.

  if (autoStart) {
    await execPilotctl(['daemon', 'start']);
  }

  // Network 9 = "data-exchange" network. list-agents and the public specialists
  // live here. Without this join, pilot_search returns nothing.
  try {
    await execPilotctl(['network', 'join', '9']);
  } catch {
    // Already joined or network module unavailable — non-fatal.
  }

  // Trust gate: setup is not "complete" until we can verify trust is actually
  // working — daemon registered, Network 9 reachable, and at least one
  // auto-approve specialist responding. Without this verification, today's
  // install silently leaves the user to discover trust-propagation races,
  // UDP-blocked transports, and stale daemons themselves.
  try {
    const result = await pilotctlJSON([
      'send-message', 'list-agents',
      '--data', '/data {"limit":1}',
      '--wait', '10s',
    ]);
    if (!result?.ok && !result?.data) {
      return {
        reachable: false,
        trust_verified: false,
        hint: 'Daemon is up but trust handshake with list-agents did not complete. Most common cause: UDP blocked (try compat mode) or first-run registry propagation. Run `pilot-mcp doctor` and retry in 60s.',
      };
    }
    return {
      reachable: true,
      trust_verified: true,
      catalog_sample: result?.data,
    };
  } catch (err) {
    return {
      reachable: false,
      trust_verified: false,
      error: err.message,
      hint: 'Daemon is running but trust handshake with list-agents failed. Run `pilot-mcp doctor` for diagnostics.',
    };
  }
}
