// tools/subscribe.js — subscribe to a topic on a peer's pub/sub channel.
//
// Blocking call by default — pass `count` to limit messages received before
// returning, or `timeout_seconds` to bound wait time.

import { pilotctlJSON } from '../daemon-bridge.js';

export const subscribe = {
  name: 'pilot_subscribe',
  description:
    'Subscribe to a topic on a peer\'s pub/sub channel and collect N published messages (or until timeout). Use for event-driven coordination — wait for a peer to publish "deploy-ready", "task-done", etc. Blocks until count is satisfied or timeout elapses.',
  inputSchema: {
    type: 'object',
    properties: {
      peer: { type: 'string', description: 'Peer hostname or address hosting the topic.' },
      topic: { type: 'string', description: 'Topic name.' },
      count: { type: 'number', default: 1, description: 'How many messages to collect before returning.' },
      timeout_seconds: { type: 'number', default: 60, description: 'Max wait time.' },
    },
    required: ['peer', 'topic'],
  },
  handler: async ({ peer, topic, count = 1, timeout_seconds = 60 }) => {
    return await pilotctlJSON([
      'subscribe', peer, topic,
      '--count', String(count),
      '--timeout', `${timeout_seconds}s`,
    ]);
  },
};
