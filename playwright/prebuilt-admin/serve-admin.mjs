// Minimal static file server for the PRODUCTION `tinacms build` output.
//
// The fixture sets `build.basePath: 'my-site'`, so the built admin references
// its assets at absolute `/my-site/admin/...` URLs and expects to be served
// under that prefix. This server:
//   - serves files from ./public/admin under /my-site/admin/
//   - returns index.html for BOTH /my-site/admin/ and the bare /my-site/admin
//     (the trailing-slash bug the spike hit: document.baseURI drops a segment)
//   - falls back to index.html for unknown sub-paths (SPA hash routing)
//
// It never touches the GraphQL/media API — that is served cross-origin by the
// `tinacms build --local` dev server on :4001, which this process keeps alive.

import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADMIN_ROOT = join(__dirname, 'public', 'admin');
const BASE_PREFIX = '/my-site/admin';
const PORT = Number(process.env.PORT || 3000);

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

async function serveFile(res, absPath, fallbackToIndex) {
  try {
    const info = await stat(absPath);
    if (info.isFile()) {
      const body = await readFile(absPath);
      res.writeHead(200, {
        'Content-Type':
          CONTENT_TYPES[extname(absPath)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(body);
      return true;
    }
  } catch {
    // fall through
  }
  if (fallbackToIndex) {
    const index = await readFile(join(ADMIN_ROOT, 'index.html'));
    res.writeHead(200, {
      'Content-Type': CONTENT_TYPES['.html'],
      'Cache-Control': 'no-store',
    });
    res.end(index);
    return true;
  }
  return false;
}

const server = createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);

    // Bare form (no trailing slash) and the root both boot the SPA.
    if (url === BASE_PREFIX || url === `${BASE_PREFIX}/`) {
      await serveFile(res, join(ADMIN_ROOT, 'index.html'), true);
      return;
    }

    if (url.startsWith(`${BASE_PREFIX}/`)) {
      const rel = url.slice(`${BASE_PREFIX}/`.length);
      // Prevent path traversal outside the admin root.
      const abs = normalize(join(ADMIN_ROOT, rel));
      if (!(abs === ADMIN_ROOT || abs.startsWith(ADMIN_ROOT + sep))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      await serveFile(res, abs, /* fallbackToIndex */ true);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`Not found. Admin is served under ${BASE_PREFIX}/`);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Server error: ${err}`);
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `prebuilt-admin static server: http://localhost:${PORT}${BASE_PREFIX}/`
  );
});
