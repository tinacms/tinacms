// Boots a real Vite dev server with the given allowedHosts and reports how it
// answers a request carrying the given Host header. Spawned by hostCheck.test.ts
// rather than imported: Vite 6's entry does a dynamic import, which jest cannot
// evaluate without --experimental-vm-modules.
//
// Usage: node host-check-probe.mjs '<allowedHosts JSON>' '<host header>'
// Prints one line of JSON: {"status":number,"body":string}
import http from 'node:http';
import { createServer } from 'vite';

const [allowedHostsJson, hostHeader] = process.argv.slice(2);

const server = await createServer({
  configFile: false,
  logLevel: 'silent',
  server: {
    host: '127.0.0.1',
    strictPort: false,
    allowedHosts: JSON.parse(allowedHostsJson),
  },
});
await server.listen();

const address = server.httpServer.address();

// fetch() refuses to send Host (a forbidden header name), so go through
// node:http to reproduce what a reverse proxy forwards.
const result = await new Promise((resolve, reject) => {
  const req = http.request(
    {
      host: '127.0.0.1',
      port: address.port,
      path: '/',
      method: 'GET',
      headers: { Host: hostHeader },
    },
    (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }
  );
  req.on('error', reject);
  req.end();
});

await server.close();
process.stdout.write(JSON.stringify(result));
