import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PKG = path.join(ROOT, 'packages/tinacms-authjs');
const NODE_ENTRY = path.join(PKG, 'dist/index.js');

// Runs against the build, and shells out to a real node process, because Vite
// resolves what Node's ESM loader will not and would mask both regressions (#7434).
describe('tinacms-authjs node entry', () => {
  it('imports only next-auth', () => {
    const built = fs.readFileSync(NODE_ENTRY, 'utf-8');
    const specifiers = [
      ...built.matchAll(/^import\s[^'"]*['"]([^'"]+)['"]/gm),
    ].map((m) => m[1]);

    expect(specifiers.length).toBeGreaterThan(0);
    expect(
      specifiers.filter((s) => s !== 'next-auth' && !s.startsWith('next-auth/'))
    ).toEqual([]);
  });

  it('builds a credentials provider under plain node ESM', () => {
    const script = `
      const { TinaCredentialsProvider } = await import(${JSON.stringify(
        NODE_ENTRY
      )})
      process.stdout.write(TinaCredentialsProvider({ databaseClient: {} }).type)
    `;

    const type = execFileSync(
      process.execPath,
      ['--input-type=module', '-e', script],
      {
        encoding: 'utf-8',
      }
    );

    expect(type).toBe('credentials');
  });

  // The NextAuth binding is unwrapped separately from the credentials one and is
  // only reached inside the auth route, so it needs its own call to guard it.
  it('serves an auth route under plain node ESM', () => {
    const script = `
      const { TinaAuthJSOptions, AuthJsBackendAuthProvider } = await import(${JSON.stringify(
        NODE_ENTRY
      )})
      const databaseClient = { authenticate: async () => ({ data: {} }) }
      const authOptions = TinaAuthJSOptions({ databaseClient, secret: 'test-secret' })
      const { extraRoutes } = AuthJsBackendAuthProvider({ authOptions })

      const req = {
        url: '/api/tina/auth/session',
        method: 'GET',
        headers: { host: 'localhost' },
        query: {},
        cookies: {},
        body: {},
      }
      let body
      const res = {
        statusCode: 200,
        setHeader: () => res,
        getHeader: () => undefined,
        appendHeader: () => res,
        status: (code) => { res.statusCode = code; return res },
        json: (value) => { body = value; return res },
        send: (value) => { body = value; return res },
        end: (value) => { body = body ?? value; return res },
        redirect: () => res,
      }

      await extraRoutes.auth.handler(req, res, { basePath: '/api/tina/' })
      process.stdout.write(JSON.stringify({ status: res.statusCode, body }))
    `;

    const out = execFileSync(
      process.execPath,
      ['--input-type=module', '-e', script],
      {
        encoding: 'utf-8',
        env: {
          ...process.env,
          NEXTAUTH_URL: 'http://localhost/api/tina/auth',
          NEXTAUTH_SECRET: 'test-secret',
        },
      }
    );

    expect(JSON.parse(out)).toEqual({ status: 200, body: {} });
  });
});
