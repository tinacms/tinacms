import { render, screen, waitFor } from '@testing-library/react';
import { CMSContext } from '@toolkit/react-core/use-cms';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Reference } from './index';

const renderReference = (experimental_focusIntent: boolean) => {
  const cms = {
    enabled: true,
    events: { subscribe: () => () => {} },
    api: {
      tina: {
        request: vi
          .fn()
          .mockResolvedValue({ collection: { documents: { edges: [] } } }),
      },
    },
    flags: { get: () => undefined },
    state: { editingMode: 'visual' },
    dispatch: vi.fn(),
  };

  render(
    <CMSContext.Provider value={{ cms, dispatch: vi.fn(), state: {} } as any}>
      <Reference
        field={{
          name: 'author',
          label: 'Author',
          component: 'reference',
          collections: ['author'],
          options: [],
          experimental_focusIntent,
        }}
        input={{ name: 'author', value: '', onChange: vi.fn() }}
      />
    </CMSContext.Provider>
  );
};

describe('Reference field', () => {
  it('focuses the combobox when the field is the focus target', async () => {
    renderReference(true);
    const combobox = await screen.findByRole('combobox');

    await waitFor(() => expect(document.activeElement).toBe(combobox));
  });

  it('leaves focus alone otherwise', async () => {
    renderReference(false);
    const combobox = await screen.findByRole('combobox');

    expect(document.activeElement).not.toBe(combobox);
  });
});
