// tools/send_file.js — transfer a file to a peer.
//
// Recipient finds it in their `pilot_received` list (~/.pilot/received/).
// Note: receiver must have an active trust relationship with you.

import { pilotctlJSON } from '../daemon-bridge.js';

export const send_file = {
  name: 'pilot_send_file',
  description:
    'Send a local file to a trusted peer over the Pilot overlay. Recipient finds it via pilot_received. Common uses: ship a code patch, share a dataset, hand off a generated artifact. The peer must trust you first (pilot_handshake then their pilot_approve).',
  inputSchema: {
    type: 'object',
    properties: {
      peer: { type: 'string', description: 'Peer hostname or pilot address.' },
      path: { type: 'string', description: 'Absolute local path to the file.' },
    },
    required: ['peer', 'path'],
  },
  handler: async ({ peer, path }) => {
    return await pilotctlJSON(['send-file', peer, path]);
  },
};
