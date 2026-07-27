import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
});
