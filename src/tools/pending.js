// tools/pending.js — list inbound handshakes waiting on your approval.

import { pilotctlJSON } from '../daemon-bridge.js';

export const pending = {
  name: 'pilot_pending',
  description:
    'List inbound handshakes waiting on your approval. Pair with pilot_approve (accept) or pilot_reject (decline). Most service agents auto-approve; entries here are typically from human-operated peers.',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    return await pilotctlJSON(['pending']);
  },
};
