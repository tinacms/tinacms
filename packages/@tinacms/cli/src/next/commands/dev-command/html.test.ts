import { devHTML } from './html';

describe('devHTML', () => {
  it('serves Vite dev endpoints under the configured base', () => {
    // Vite 6 serves @vite/client, @react-refresh and the SPA entry under the
    // configured `base`; a root-served URL 404s and the admin never mounts.
    const html = devHTML('4001', '/admin/');

    expect(html).toContain('http://localhost:4001/admin/@vite/client');
    expect(html).toContain('http://localhost:4001/admin/@react-refresh');
    expect(html).toContain('http://localhost:4001/admin/src/main.tsx');
  });

  it('does not emit the root-served endpoints that regress on Vite 6', () => {
    const html = devHTML('4001', '/admin/');

    expect(html).not.toContain('http://localhost:4001/@vite/client');
    expect(html).not.toContain('http://localhost:4001/@react-refresh');
    expect(html).not.toContain('http://localhost:4001/src/main.tsx');
  });

  it('honours a nested basePath', () => {
    const html = devHTML('4001', '/foo/admin/');

    expect(html).toContain('http://localhost:4001/foo/admin/@vite/client');
  });
});
