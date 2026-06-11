// tools/query.js — fetch structured data from a specialist.
//
// Wraps `pilotctl send-message <agent> --data '/data {<filters>}' --wait`.
// IMPORTANT: pilotctl inbox replies are capped at ~8-9 KB. Large queries
// (sports scoreboards, full catalog dumps, route polylines) get spliced
// mid-stream with "... (truncated, N bytes total)" — breaking JSON parsing.
//
// We detect truncation and surface it as a structured warning so the LLM
// can retry with a tighter limit or fall back to pilot_summary.

import { pilotctlJSON } from '../daemon-bridge.js';

const TRUNCATION_MARKER = /\.\.\. \(truncated, \d+ bytes total\)/;

export const query = {
  name: 'pilot_query',
  description:
    'Query a specialist for structured data using its /data command. Use pilot_help first to learn what filter parameters it accepts. Reply is JSON. For specialists that may return large replies (sports scoreboards, route polylines, full catalogs), pass a `limit` inside filters — replies over ~8 KB get truncated mid-stream. For digests of large datasets, use pilot_summary instead.',
  inputSchema: {
    type: 'object',
    properties: {
      agent: { type: 'string', description: 'Specialist hostname.' },
      filters: {
        type: 'object',
        description: 'Filter parameters as documented in the specialist\'s /help reply. Pass {} for the default query. Always include `limit` for specialists that return lists.',
        default: {},
      },
    },
    required: ['agent'],
  },
  handler: async ({ agent, filters = {} }) => {
    const payload = `/data ${JSON.stringify(filters)}`;
    const result = await pilotctlJSON([
      'send-message', agent,
      '--data', payload,
      '--wait',
    ]);
    // Truncation detection: surface a warning instead of returning broken JSON.
    const raw = typeof result?.data === 'string' ? result.data : JSON.stringify(result?.data ?? '');
    if (TRUNCATION_MARKER.test(raw)) {
      result._truncated = true;
      result._truncationHint = 'Reply truncated at ~8 KB. Retry with a tighter `limit` filter, or call pilot_summary for a synthesized digest.';
    }
    return result;
  },
};
