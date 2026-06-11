import { pilotctlJSON } from '../daemon-bridge.js';

export const approve = {
  name: 'pilot_approve',
  description:
    'Approve a pending inbound handshake. Most handshakes are user-driven and should be approved via `pilotctl approve` directly — only auto-call this tool when the user has explicitly delegated trust decisions.',
  inputSchema: {
    type: 'object',
    properties: {
      target: { type: 'string', description: 'Pending peer hostname, node_id, or address.' },
    },
    required: ['target'],
  },
  handler: async ({ target }) => {
    return await pilotctlJSON(['approve', target]);
  },
};
