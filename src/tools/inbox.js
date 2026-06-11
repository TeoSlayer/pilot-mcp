import { pilotctlJSON } from '../daemon-bridge.js';

export const inbox = {
  name: 'pilot_inbox',
  description: 'List recent messages received from peers and specialists. Use this to read async A2A replies.',
  inputSchema: {
    type: 'object',
    properties: {
      limit: { type: 'number', default: 10, description: 'Max messages to return. Default 10.' },
    },
  },
  handler: async ({ limit = 10 }) => {
    return await pilotctlJSON(['inbox', `--limit=${limit}`]);
  },
};
