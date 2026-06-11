// tools/help.js — fetch a specialist's command schema.
//
// Wraps `pilotctl send-message <agent> --data '/help' --wait`.
// Returns the specialist's documented /data filter shape. ALWAYS call this
// before pilot_query against a specialist you've never used — the filter
// names vary per specialist and guessing wastes turns.

import { pilotctlJSON } from '../daemon-bridge.js';

export const help = {
  name: 'pilot_help',
  description:
    'Fetch the /help schema for a specialist or peer. Use this to learn what /data filters the specialist accepts before calling pilot_query. The reply describes the supported commands and filter parameters.',
  inputSchema: {
    type: 'object',
    properties: {
      agent: { type: 'string', description: 'Specialist hostname (e.g. "bitstamp", "noaa", "openalex") or peer hostname.' },
    },
    required: ['agent'],
  },
  handler: async ({ agent }) => {
    return await pilotctlJSON([
      'send-message', agent,
      '--data', '/help',
      '--wait',
    ]);
  },
};
