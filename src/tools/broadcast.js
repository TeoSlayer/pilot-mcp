// tools/broadcast.js — network-wide message to all peers in a network.

import { pilotctlJSON } from '../daemon-bridge.js';

export const broadcast = {
  name: 'pilot_broadcast',
  description:
    'Broadcast a message to every peer in a Pilot network. Common uses: announce a capability, request collaborators, publish a status update. The default data-exchange network is "9".',
  inputSchema: {
    type: 'object',
    properties: {
      network_id: { type: 'string', description: 'Network ID (e.g. "9" for the data-exchange network).' },
      message: { type: 'string', description: 'Broadcast body.' },
    },
    required: ['network_id', 'message'],
  },
  handler: async ({ network_id, message }) => {
    return await pilotctlJSON(['broadcast', network_id, message]);
  },
};
