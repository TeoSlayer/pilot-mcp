// prompts/index.js — MCP prompts (user-controlled idioms surfaced to the LLM).

const PROMPTS = [
  {
    name: 'pilot-3-command-pattern',
    description: 'The canonical search → help → data pattern for querying any directory specialist.',
    arguments: [{ name: 'keyword', description: 'What you are looking for (single literal token, not a phrase).', required: true }],
    render: ({ keyword }) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text: [
            `Query the Pilot directory for "${keyword}" using the 3-command pattern.`,
            '',
            '1. Call pilot_send with target="list-agents" and data=`/data {"search":"' + keyword + '","limit":10}`. Inspect the matches.',
            '2. For the most relevant match, call pilot_send with target="<that-agent>" and data=`/help`. Read the returned schema.',
            '3. Call pilot_send with target="<that-agent>" and data=`/data {<the filters you learned>}`. Cite the specialist hostname in your reply.',
          ].join('\n'),
        },
      },
    ],
  },
  {
    name: 'pilot-a2a-message',
    description: 'Send a plain A2A message to a peer (not a directory specialist).',
    arguments: [
      { name: 'peer', description: 'Peer hostname or pilot address.', required: true },
      { name: 'content', description: 'Message body.', required: true },
    ],
    render: ({ peer, content }) => [
      { role: 'user', content: { type: 'text', text: `Call pilot_send with target="${peer}" and data="${content}". If the peer requires trust first, call pilot_handshake first. Then call pilot_inbox to read the reply.` } },
    ],
  },
  {
    name: 'pilot-handshake-first-contact',
    description: 'Establish trust with a peer you have not communicated with before.',
    arguments: [
      { name: 'peer', description: 'Peer hostname or pilot address.', required: true },
      { name: 'reason', description: 'Why you want to talk to them (shown to the recipient on approval).', required: false },
    ],
    render: ({ peer, reason }) => [
      { role: 'user', content: { type: 'text', text: `Initiate a handshake with ${peer}${reason ? ` for the reason: ${reason}` : ''}. Call pilot_handshake. Most specialists auto-approve; for human-operated peers, the request will appear in their pilotctl pending queue until they accept.` } },
    ],
  },
];

export function registerPrompts(server) {
  server.setRequestHandler({ method: 'prompts/list' }, async () => ({
    prompts: PROMPTS.map(({ render, ...meta }) => meta),
  }));

  server.setRequestHandler({ method: 'prompts/get' }, async (req) => {
    const p = PROMPTS.find((x) => x.name === req.params.name);
    if (!p) throw new Error(`unknown prompt: ${req.params.name}`);
    return { messages: p.render(req.params.arguments ?? {}) };
  });
}
