import { devHTML } from './html';

describe('devHTML', () => {
  it('uses the provided dev server URL for assets', () => {
    const html = devHTML('https://my-codespace-4001.github.dev');

    expect(html).toContain(
      "import RefreshRuntime from 'https://my-codespace-4001.github.dev/@react-refresh'"
    );
    expect(html).toContain(
      'src="https://my-codespace-4001.github.dev/@vite/client"'
    );
    expect(html).toContain(
      'src="https://my-codespace-4001.github.dev/src/main.tsx"'
    );
  });
});
