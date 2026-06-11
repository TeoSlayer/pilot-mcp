// tools/ping.js — round-trip reachability check.

import { pilotctlJSON } from '../daemon-bridge.js';

export const ping = {
  name: 'pilot_ping',
  description:
    'Round-trip ping a peer to confirm the tunnel is up. Returns RTT. Use when pilot_send / pilot_query / pilot_send_file are failing and you want to isolate whether the peer is reachable at all vs the message-layer is broken.',
  inputSchema: {
    type: 'object',
    properties: {
      target: { type: 'string', description: 'Hostname or pilot address.' },
      count: { type: 'number', default: 1, description: 'Number of pings.' },
      timeout_seconds: { type: 'number', default: 10 },
    },
    required: ['target'],
  },
  handler: async ({ target, count = 1, timeout_seconds = 10 }) => {
    return await pilotctlJSON([
      'ping', target,
      '--count', String(count),
      '--timeout', `${timeout_seconds}s`,
    ]);
  },
};
