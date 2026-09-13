import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import { definePlugin } from '../core/plugin';
import { TinaAdmin } from './admin';

const BOOT_FAILURE = 'test:broken could not load its client bundle';

const brokenPlugin = definePlugin({
  name: 'test:broken',
  client: async () => {
    throw new Error(BOOT_FAILURE);
  },
});

const config = asResolvedConfig({
  plugins: [brokenPlugin],
  schema: { collections: [] },
});

describe('TinaAdmin when a plugin fails to boot', () => {
  it('names the failure and keeps the page rendered', async () => {
    const { container } = render(
      <TinaAdmin
        config={config}
        queryClient={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      />
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(BOOT_FAILURE);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});
