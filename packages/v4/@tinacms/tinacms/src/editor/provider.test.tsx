import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import { defineConfig } from '../config';
import { definePlugin } from '../core/plugin';
import { useFieldRegistry, useTinaStore } from './hooks';
import { TinaProvider } from './provider';

// These tests render a runtime directly, and not a configured app. They therefore pass
// TinaProvider the resolved shape, and do not call defineConfig.
const NO_COLLECTIONS = { collections: [] };

function BootProbe() {
  const registry = useFieldRegistry();
  const namespaces = useTinaStore((state) =>
    Object.keys(state).sort().join(',')
  );
  return (
    <div>
      <span data-testid='field-types'>
        {[...registry.keys()].sort().join(',')}
      </span>
      <span data-testid='namespaces'>{namespaces}</span>
    </div>
  );
}

describe('TinaProvider boot', () => {
  // This goes through defineConfig, so it covers the whole path of a real app. The
  // built-ins that defineConfig adds must reach the registry and the store, and not
  // the plugin list alone.
  it('mounts the built-in fields a bare config installs: resolved registry, composed boot store', async () => {
    const config = defineConfig({
      plugins: [definePlugin({ name: 'test:content', provides: ['content'] })],
      schema: NO_COLLECTIONS,
    });
    render(
      <TinaProvider config={config}>
        <BootProbe />
      </TinaProvider>
    );
    expect(await screen.findByTestId('field-types')).toHaveTextContent(
      'boolean,datetime,number,rich-text,string'
    );
    expect(screen.getByTestId('namespaces')).toHaveTextContent(
      'branch,documents,ui'
    );
  });

  it('runs plugin onInit before exposing the runtime, onDestroy on unmount', async () => {
    const onInit = vi.fn();
    const onDestroy = vi.fn();
    const lifecycle = definePlugin({ name: 'lifecycle', onInit, onDestroy });
    const { unmount } = render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [lifecycle],
          schema: NO_COLLECTIONS,
        })}
      >
        <BootProbe />
      </TinaProvider>
    );
    await screen.findByTestId('field-types');
    expect(onInit).toHaveBeenCalledTimes(1);
    expect(onDestroy).not.toHaveBeenCalled();
    unmount();
    await waitFor(() => expect(onDestroy).toHaveBeenCalledTimes(1));
  });
});
