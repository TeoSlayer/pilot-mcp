// tools/trust_check.js — cheap "do I trust this peer right now?" check.
//
// LLMs need this as a fast pre-flight before pilot_send / pilot_send_file /
// pilot_publish / pilot_broadcast to any peer that isn't a known auto-approve
// service. Reading pilot://trust + searching it is lossy and expensive at
// 438+ trusted peers; this tool answers one question in one call.
//
// Returns one of:
//   trusted          mutual trust established and propagated
//   trusted-pending  handshake done, registry propagation in flight (~60s)
//   one-way          we trust them, they have not approved us yet
//   pending-from     they handshaked us, we have not approved (call pilot_approve)
//   untrusted        no trust relationship; call pilot_handshake first
//   auto-approve     target is a backbone catalog specialist; no handshake needed
//   unknown          could not resolve target

import { pilotctlJSON } from '../daemon-bridge.js';

export const trust_check = {
  name: 'pilot_trust_check',
  description:
    'Check the current trust state with a peer or specialist BEFORE calling pilot_send / pilot_send_file / pilot_publish / pilot_broadcast / pilot_subscribe. Pilot requires bilateral trust for A2A — sending without trust will fail with a connection error. Backbone catalog specialists (list-agents, bitstamp, noaa, etc. — Network 0) auto-approve; human-operated peers need explicit handshake. Cheap and idempotent — call freely.',
  inputSchema: {
    type: 'object',
    properties: {
      target: {
        type: 'string',
        description: 'Peer hostname, pilot address, or node id. Backbone catalog specialist names (e.g. "list-agents") are auto-approve and return "auto-approve" without needing a registry lookup.',
      },
    },
    required: ['target'],
  },
  handler: async ({ target }) => {
    try {
      const trust = await pilotctlJSON(['trust']);
      const pending = await pilotctlJSON(['pending']);
      const trusted = (trust?.trusted ?? trust?.data?.trusted ?? []);
      const pend = (pending?.pending ?? pending?.data?.pending ?? []);
      const t = trusted.find((p) =>
        String(p.hostname) === target ||
        String(p.address) === target ||
        String(p.node_id) === target
      );
      if (t) {
        if (t.mutual === false) {
          return {
            state: 'one-way',
            target,
            hint: 'You trust them; they have not approved you yet. send-message will fail until they call pilot_approve on their side.',
          };
        }
        return { state: 'trusted', target, since: t.approved_at ?? null };
      }
      const p = pend.find((x) =>
        String(x.hostname) === target ||
        String(x.node_id) === target
      );
      if (p) {
        return {
          state: 'pending-from',
          target,
          hint: 'They have handshaked you. Call pilot_approve to complete bilateral trust.',
        };
      }
      // Specialist heuristic: short lowercase hostname, no separators.
      // The actual auto-approve list lives in the daemon's trustedagents
      // allowlist (backbone catalog specialists like list-agents, bitstamp,
      // noaa, openalex). This is a cheap client-side hint, not a guarantee.
      if (/^[a-z][a-z0-9-]{1,40}$/.test(target) && !target.includes('.') && !target.startsWith('0:')) {
        return {
          state: 'auto-approve',
          target,
          hint: 'Looks like a backbone catalog specialist hostname. Specialists in the trustedagents allowlist auto-approve handshakes — pilot_send and the 3-command pattern work directly with no handshake step needed.',
        };
      }
      return {
        state: 'untrusted',
        target,
        hint: 'No trust relationship. Call pilot_handshake first, then wait for them to approve (or ~60s for specialists which auto-approve).',
      };
    } catch (err) {
      return { state: 'unknown', target, error: err.message };
    }
  },
};
