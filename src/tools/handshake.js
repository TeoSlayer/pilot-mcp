// tools/handshake.js — initiate trust handshake.
//
// CRITICAL: trust propagates through the registry, NOT directly peer-to-peer.
// After both sides approve, there's a seconds-to-a-minute propagation delay
// before the local daemon sees the trust as live. send-message attempts
// during this window may fail; the LLM should wait briefly and retry rather
// than concluding the handshake failed.
//
// Service agents on Network 9 are in the trustedagents allowlist — they
// auto-approve. Human-run peers must explicitly `pilotctl approve <your_id>`.

import { pilotctlJSON } from '../daemon-bridge.js';

export const handshake = {
  name: 'pilot_handshake',
  description:
    'Initiate bilateral trust with a peer or specialist. Specialists on Network 9 (the data-exchange network — what pilot_search returns) auto-approve. Human-operated peers require explicit approval on their side. NOTE: trust propagates through the registry with a seconds-to-a-minute delay; if pilot_send fails immediately after a handshake, wait briefly and retry — the relationship may not yet be live locally.',
  inputSchema: {
    type: 'object',
    properties: {
      target: { type: 'string', description: 'Hostname, node_id, or pilot address.' },
      reason: { type: 'string', description: 'Optional human-readable reason shown to the recipient on approval.' },
    },
    required: ['target'],
  },
  handler: async ({ target, reason }) => {
    const args = ['handshake', target];
    if (reason) args.push(reason);
    const result = await pilotctlJSON(args);
    result._propagation_note = 'Trust propagates via registry with up to ~60s delay. If first send-message fails, retry once after a short wait.';
    return result;
  },
};
