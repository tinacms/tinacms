import { render, screen } from '@testing-library/react';
import { CMSContext } from '@toolkit/react-core/use-cms';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ListFieldMeta } from './list-field-meta';

describe('ListFieldMeta', () => {
  it('lets a long description wrap instead of clipping it to one line', () => {
    const description =
      'Redirects from old URLs to new ones, applied in order before any page is matched';
    const cms = { events: { subscribe: () => () => {}, dispatch: vi.fn() } };
    render(
      <CMSContext.Provider value={{ cms, dispatch: vi.fn(), state: {} } as any}>
        <ListFieldMeta
          name='redirects'
          label='Redirects'
          description={description}
          tinaForm={{ id: 'page' } as any}
        >
          <div />
        </ListFieldMeta>
      </CMSContext.Provider>
    );

    expect(
      screen.getByText(description).closest('.truncate, .whitespace-nowrap')
    ).toBeNull();
  });
});
