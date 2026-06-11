// tools/reject.js — reject a pending inbound handshake.

import { pilotctlJSON } from '../daemon-bridge.js';

export const reject = {
  name: 'pilot_reject',
  description:
    'Reject a pending inbound handshake. The peer is notified with the reason (if provided). Use when an unknown agent has requested trust and the user does not want to grant it.',
  inputSchema: {
    type: 'object',
    properties: {
      target: { type: 'string', description: 'Node id, hostname, or address of the pending peer.' },
      reason: { type: 'string', description: 'Optional human-readable reason sent to the peer.' },
    },
    required: ['target'],
  },
  handler: async ({ target, reason }) => {
    const args = ['reject', target];
    if (reason) args.push(reason);
    return await pilotctlJSON(args);
  },
};
