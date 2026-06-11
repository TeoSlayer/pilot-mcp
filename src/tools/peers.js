import { pilotctlJSON } from '../daemon-bridge.js';

export const peers = {
  name: 'pilot_peers',
  description: 'List currently connected peers with their tags and last-seen timestamps.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    return await pilotctlJSON(['peers']);
  },
};
