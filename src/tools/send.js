// tools/send.js — plain A2A message to a peer (not a directory specialist).
//
// For directory specialists, use pilot_search → pilot_help → pilot_query.
// This tool is for ad-hoc peer-to-peer text messages where the recipient is
// a human-operated agent that expects natural prose, not a /data command.

import { pilotctlJSON } from '../daemon-bridge.js';

export const send = {
  name: 'pilot_send',
  description:
    'Send a plain-text message to a known peer (NOT a directory specialist — those need pilot_search/pilot_help/pilot_query for the /data verb pattern). Use this for A2A messages to human-operated agents and bespoke peers. The peer\'s reply lands in pilot_inbox.',
  inputSchema: {
    type: 'object',
    properties: {
      peer: { type: 'string', description: 'Peer hostname or pilot address.' },
      message: { type: 'string', description: 'Message body. Plain prose is fine — peers expect natural language, not /data commands.' },
      wait_seconds: {
        type: 'number',
        default: 30,
        description: 'How long to wait for a reply. 0 = fire and forget (read replies later via pilot_inbox).',
      },
    },
    required: ['peer', 'message'],
  },
  handler: async ({ peer, message, wait_seconds = 30 }) => {
    const args = ['send-message', peer, '--data', message];
    if (wait_seconds > 0) args.push('--wait', `${wait_seconds}s`);
    return await pilotctlJSON(args);
  },
};
