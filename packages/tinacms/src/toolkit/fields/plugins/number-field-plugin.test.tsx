import { render, screen } from '@testing-library/react';
import { CMSContext } from '@toolkit/react-core/use-cms';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NumberField } from './number-field-plugin';

const renderField = (experimental_focusIntent: boolean) => {
  const cms = { events: { subscribe: () => () => {}, dispatch: vi.fn() } };
  render(
    <CMSContext.Provider value={{ cms, dispatch: vi.fn(), state: {} } as any}>
      <NumberField
        field={{
          name: 'rating',
          label: 'Rating',
          component: 'number',
          experimental_focusIntent,
        }}
        input={{ name: 'rating', value: 3, onChange: vi.fn() } as any}
        meta={{} as any}
        form={{} as any}
        tinaForm={{ id: 'page' } as any}
      />
    </CMSContext.Provider>
  );
  return screen.getByRole('spinbutton');
};

describe('NumberField', () => {
  it('focuses its input when the field is the focus target', () => {
    const input = renderField(true);
    expect(document.activeElement).toBe(input);
  });

  it('leaves focus alone otherwise', () => {
    const input = renderField(false);
    expect(document.activeElement).not.toBe(input);
  });

  it('passes the field name to the input', () => {
    expect(renderField(false).getAttribute('name')).toBe('rating');
  });
});
