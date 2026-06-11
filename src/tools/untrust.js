// tools/untrust.js — revoke an existing trust relationship.

import { pilotctlJSON } from '../daemon-bridge.js';

export const untrust = {
  name: 'pilot_untrust',
  description:
    'Revoke an existing trust relationship with a peer. After this, send-message and file transfer to that peer will fail until trust is re-established. Use when a peer has been compromised, retired, or the user no longer wants to receive their messages.',
  inputSchema: {
    type: 'object',
    properties: {
      target: { type: 'string', description: 'Node id, hostname, or address.' },
    },
    required: ['target'],
  },
  handler: async ({ target }) => {
    return await pilotctlJSON(['untrust', target]);
  },
};
