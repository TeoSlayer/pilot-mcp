import { pilotctlJSON } from '../daemon-bridge.js';

export const find = {
  name: 'pilot_find',
  description:
    'Look up a peer by hostname. Returns the pilot address if found. Note: this is DNS-like lookup — you must already know the hostname. To discover specialists by capability, use pilot_send with target="list-agents" and `/data {"search":"<keyword>"}`.',
  inputSchema: {
    type: 'object',
    properties: {
      hostname: { type: 'string' },
    },
    required: ['hostname'],
  },
  handler: async ({ hostname }) => {
    return await pilotctlJSON(['find', hostname]);
  },
};
