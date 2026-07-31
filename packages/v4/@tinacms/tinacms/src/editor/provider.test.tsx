import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { definePlugin } from '../core/plugin';
import { corePlugins } from '../index';
import { useFieldRegistry, useTinaStore } from './hooks';
import { TinaProvider } from './provider';

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
  it('provides the resolved field registry and the composed boot store', async () => {
    render(
      <TinaProvider plugins={corePlugins}>
        <BootProbe />
      </TinaProvider>
    );
    expect(await screen.findByTestId('field-types')).toHaveTextContent(
      'boolean,number,string'
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
      <TinaProvider plugins={[...corePlugins, lifecycle]}>
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
