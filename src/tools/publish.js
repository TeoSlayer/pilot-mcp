// tools/publish.js — publish to a topic on a peer's pub/sub channel.

import { pilotctlJSON } from '../daemon-bridge.js';

export const publish = {
  name: 'pilot_publish',
  description:
    'Publish a message to a topic on a peer\'s pub/sub channel. Subscribers (pilot_subscribe) receive it asynchronously. Use for event-driven agent coordination — e.g. publish "build-complete" to a topic that peers monitor.',
  inputSchema: {
    type: 'object',
    properties: {
      peer: { type: 'string', description: 'Peer hostname or address hosting the topic.' },
      topic: { type: 'string', description: 'Topic name.' },
      message: { type: 'string', description: 'Published payload.' },
    },
    required: ['peer', 'topic', 'message'],
  },
  handler: async ({ peer, topic, message }) => {
    return await pilotctlJSON(['publish', peer, topic, '--data', message]);
  },
};
