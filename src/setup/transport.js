// setup/transport.js — probe whether UDP to the beacon is reachable.
//
// If UDP is blocked (corporate firewall, restrictive NAT), we fall back to
// compat mode (WSS over TCP/443). Today this fallback is manual: the user has
// to discover UDP is blocked themselves and restart the daemon with
// `-transport=compat`. We do it automatically.

import { createSocket } from 'node:dgram';

export async function probeTransport(beacon = '34.71.57.205', port = 9001) {
  return new Promise((resolve) => {
    const sock = createSocket('udp4');
    const timer = setTimeout(() => { sock.close(); resolve('compat'); }, 1500);
    sock.send(Buffer.from('PILOT_PROBE'), port, beacon, (err) => {
      if (err) { clearTimeout(timer); sock.close(); resolve('compat'); }
    });
    sock.on('message', () => { clearTimeout(timer); sock.close(); resolve('udp'); });
    sock.on('error', () => { clearTimeout(timer); sock.close(); resolve('compat'); });
  });
}
