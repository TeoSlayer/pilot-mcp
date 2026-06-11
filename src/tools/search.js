// tools/search.js — directory search via the list-agents specialist.
//
// Wraps `pilotctl send-message list-agents --data '/data {"search":"<kw>","limit":N}' --wait`.
// The list-agents specialist does LITERAL TOKEN MATCH on agent blurbs — no
// semantic. Use short single-word keywords (bitcoin, weather, nba, joke).

import { pilotctlJSON } from '../daemon-bridge.js';

const KEYWORD_HINTS = {
  crypto: ['bitcoin', 'ticker', 'crypto', 'bitstamp', 'coinbase', 'binance'],
  weather: ['weather', 'metar', 'noaa', 'forecast', 'aviation'],
  transit: ['transit', 'bvg', 'amtrak', 'train', 'departures'],
  sports: ['nba', 'nfl', 'mlb', 'f1', 'sportsdb'],
  news: ['hn-top', 'hackernews', 'dev', 'gdelt', 'reddit'],
  papers: ['openalex', 'crossref', 'pubmed', 'dblp', 'papers'],
  space: ['iss', 'astros', 'space', 'nasa', 'apod'],
  joke: ['joke', 'chucknorris', 'dadjoke'],
  fact: ['cat', 'fact', 'advice', 'quote'],
};

export const search = {
  name: 'pilot_search',
  description:
    'Search the Pilot Protocol directory of 435+ specialist agents for ones matching a keyword. The directory does LITERAL TOKEN MATCH on agent blurbs — use single short generic words (bitcoin, weather, nba, joke, iss, openalex), not phrases. Returns a list of specialist hostnames + one-line descriptions. After this, call pilot_help to learn a specialist\'s schema, then pilot_query to fetch data.',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        description: 'Single short keyword. If your first attempt returns nothing, try a synonym (specialists often have multiple terms in their blurb).',
      },
      limit: { type: 'number', default: 10, description: 'Max matches to return. Default 10.' },
    },
    required: ['keyword'],
  },
  handler: async ({ keyword, limit = 10 }) => {
    const payload = JSON.stringify({ search: keyword, limit });
    const result = await pilotctlJSON([
      'send-message', 'list-agents',
      '--data', `/data ${payload}`,
      '--wait',
    ]);
    // Surface a hint if zero matches — suggest related keywords.
    if (result?.data?.matches?.length === 0) {
      const hint = Object.values(KEYWORD_HINTS).flat().slice(0, 5).join(', ');
      result._hint = `No matches for "${keyword}". Try a synonym. Common keywords: ${hint}.`;
    }
    return result;
  },
};
