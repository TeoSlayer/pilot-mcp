// tools/summary.js — LLM-synthesized digest from a specialist.
//
// Wraps `pilotctl send-message <agent> --data '/summary' --wait`. Used when
// /data would return >8 KB (the inbox truncation threshold). The specialist
// runs an LLM synth pass server-side and returns prose instead of JSON.
//
// Caveats: synth-backed, expect 10-30s latency, occasional upstream timeouts.

import { pilotctlJSON } from '../daemon-bridge.js';

export const summary = {
  name: 'pilot_summary',
  description:
    'Get an LLM-synthesized digest from a specialist instead of raw /data. Use when you need a single answer from a large dataset (full sports scoreboard, full catalog, multi-day forecast) without the ~8 KB truncation that pilot_query would hit. Returns prose; expect 10-30s latency; retry once on upstream timeout.',
  inputSchema: {
    type: 'object',
    properties: {
      agent: { type: 'string', description: 'Specialist hostname.' },
      question: {
        type: 'string',
        description: 'Optional natural-language question to guide the synthesis (specialist-dependent).',
      },
    },
    required: ['agent'],
  },
  handler: async ({ agent, question }) => {
    const payload = question ? `/summary ${question}` : '/summary';
    return await pilotctlJSON([
      'send-message', agent,
      '--data', payload,
      '--wait', '60s',  // wider window for synth-backed responses
    ]);
  },
};
