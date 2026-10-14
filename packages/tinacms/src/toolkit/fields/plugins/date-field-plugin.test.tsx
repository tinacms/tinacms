import { fireEvent, render, screen } from '@testing-library/react';
import { CMSContext } from '@toolkit/react-core/use-cms';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DateField } from './date-field-plugin';

const openPicker = (timeFormat: string | boolean) => {
  const cms = { events: { subscribe: () => () => {}, dispatch: vi.fn() } };
  const value = new Date(2026, 9, 9, 14, 30).toISOString();
  render(
    <CMSContext.Provider value={{ cms, dispatch: vi.fn(), state: {} } as any}>
      <DateField
        field={{
          name: 'publishedAt',
          label: 'Published At',
          component: 'date',
          timeFormat,
        }}
        input={{ name: 'publishedAt', value, onChange: vi.fn() } as any}
        meta={{} as any}
        form={{} as any}
        tinaForm={{ id: 'page' } as any}
      />
    </CMSContext.Provider>
  );
  fireEvent.click(screen.getByText(/Oct 09, 2026/));
  return {
    hour: document.getElementById(
      'datetime-picker-hour-input'
    ) as HTMLInputElement,
    period: screen.queryByText('PM'),
  };
};

describe('DateField', () => {
  it('uses a 24-hour picker for a 24-hour timeFormat', () => {
    const { hour, period } = openPicker('HH:mm');
    expect(hour.value).toBe('14');
    expect(period).toBeNull();
  });

  it('uses a 12-hour picker for a 12-hour timeFormat', () => {
    const { hour, period } = openPicker('hh:mm A');
    expect(hour.value).toBe('02');
    expect(period).not.toBeNull();
  });

  it('uses a 12-hour picker for the default timeFormat', () => {
    const { hour, period } = openPicker(true);
    expect(hour.value).toBe('02');
    expect(period).not.toBeNull();
  });
});
