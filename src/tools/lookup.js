// tools/lookup.js — registry lookup for a node by id.
//
// More detailed than pilot_find (which is hostname → address). lookup returns
// the registry record: public key, listen address, hostname, last seen, tags.

import { pilotctlJSON } from '../daemon-bridge.js';

export const lookup = {
  name: 'pilot_lookup',
  description:
    'Registry lookup for a node — returns public key, listen address, hostname, last-seen timestamp, tags. More detailed than pilot_find. Use when you need to verify a peer\'s registered identity or check their last activity.',
  inputSchema: {
    type: 'object',
    properties: {
      target: { type: 'string', description: 'Node id (e.g. "230204"), hostname, or pilot address.' },
    },
    required: ['target'],
  },
  handler: async ({ target }) => {
    return await pilotctlJSON(['lookup', target]);
  },
};
