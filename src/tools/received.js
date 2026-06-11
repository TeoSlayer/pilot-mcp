// tools/received.js — list files received from peers (paired with pilot_send_file).

import { pilotctlJSON } from '../daemon-bridge.js';

export const received = {
  name: 'pilot_received',
  description:
    'List files received from peers (~/.pilot/received/). Pair with pilot_send_file. Pass clear=true to purge after processing.',
  inputSchema: {
    type: 'object',
    properties: {
      clear: { type: 'boolean', description: 'Purge after listing.', default: false },
    },
  },
  handler: async ({ clear = false }) => {
    const args = ['received'];
    if (clear) args.push('--clear');
    return await pilotctlJSON(args);
  },
};
