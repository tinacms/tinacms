import { render, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import { defineConfig } from '../config';
import { definePlugin } from '../core/plugin';
import { corePlugins } from '../plugins/fields';
import { warmPluginClients } from '../test/warm-plugins';
import { useFieldRegistry, useTinaStore } from './hooks';
import { TinaProvider } from './provider';

beforeAll(() => warmPluginClients(corePlugins));

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
      'boolean,datetime,number,string'
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

  it('holds an unmounting provider onDestroy until a peer provider onInit finishes', async () => {
    const lifecycle: string[] = [];
    let secondInitStarted: () => void = () => {};
    let releaseSecondInit: () => void = () => {};
    const started = new Promise<void>((resolve) => {
      secondInitStarted = resolve;
    });
    const released = new Promise<void>((resolve) => {
      releaseSecondInit = resolve;
    });
    let inits = 0;
    const shared = definePlugin({
      name: 'shared-lifecycle',
      onInit: async () => {
        inits += 1;
        lifecycle.push('init:start');
        if (inits === 2) {
          secondInitStarted();
          await released;
        }
        lifecycle.push('init:end');
      },
      onDestroy: async () => {
        lifecycle.push('destroy:start');
        lifecycle.push('destroy:end');
      },
    });
    const config = asResolvedConfig({
      plugins: [shared],
      schema: NO_COLLECTIONS,
    });
    const first = render(
      <TinaProvider config={config}>
        <BootProbe />
      </TinaProvider>
    );
    await first.findByTestId('field-types');
    const second = render(
      <TinaProvider config={config}>
        <BootProbe />
      </TinaProvider>
    );
    await started;
    first.unmount();
    await new Promise((resolve) => setTimeout(resolve, 20));
    releaseSecondInit();
    await second.findByTestId('field-types');
    await waitFor(() => expect(lifecycle).toContain('destroy:end'));
    expect(lifecycle).toEqual([
      'init:start',
      'init:end',
      'init:start',
      'init:end',
      'destroy:start',
      'destroy:end',
    ]);
    second.unmount();
  });
});
