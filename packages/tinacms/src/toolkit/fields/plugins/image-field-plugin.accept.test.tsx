import { fireEvent, render, screen } from '@testing-library/react';
import type { Media } from '@toolkit/core/media';
import { CMSContext } from '@toolkit/react-core/use-cms';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ImageField } from './image-field-plugin';

const media = (filename: string): Media => ({
  type: 'file',
  id: filename,
  filename,
  directory: '',
  src: `/uploads/${filename}`,
});

const renderField = (accept?: string | string[]) => {
  const onChange = vi.fn();
  const open = vi.fn();
  const error = vi.fn();
  const cms = {
    media: { open, accept: '*', store: {} },
    alerts: { error },
    events: { subscribe: () => () => {}, dispatch: vi.fn() },
  };

  render(
    <CMSContext.Provider value={{ cms, dispatch: vi.fn(), state: {} } as any}>
      <ImageField
        // @ts-expect-error - a field literal is enough for this path
        field={{ name: 'brochure', label: 'Brochure', accept }}
        input={{ name: 'brochure', value: '', onChange } as any}
        meta={{} as any}
        form={{ getState: () => ({ values: {} }) } as any}
        tinaForm={{ id: 'page' } as any}
      />
    </CMSContext.Provider>
  );

  fireEvent.click(screen.getByText(/Drag 'n' drop a file here/));
  const onSelect = open.mock.calls[0][0].onSelect as (m: Media) => void;
  return { onSelect, onChange, error };
};

describe('image field accept guard', () => {
  it('writes a selection that matches the field', async () => {
    const { onSelect, onChange, error } = renderField('pdf');

    await onSelect(media('brochure.pdf'));

    expect(onChange).toHaveBeenCalledWith('/uploads/brochure.pdf');
    expect(error).not.toHaveBeenCalled();
  });

  it('refuses a selection outside the field, leaving the value alone', async () => {
    const { onSelect, onChange, error } = renderField('pdf');

    await onSelect(media('notes.txt'));

    expect(onChange).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(expect.stringContaining('notes.txt'));
  });

  it('takes either spelling of jpeg', async () => {
    const { onSelect, onChange } = renderField('jpeg');

    await onSelect(media('photo.jpg'));

    expect(onChange).toHaveBeenCalledWith('/uploads/photo.jpg');
  });

  it('writes anything when the field declares no accept', async () => {
    const { onSelect, onChange } = renderField();

    await onSelect(media('anything.zip'));

    expect(onChange).toHaveBeenCalledWith('/uploads/anything.zip');
  });

  it('reads the extension through a transformed asset URL', async () => {
    const { onSelect, onChange } = renderField('pdf');

    await onSelect({ ...media('brochure.pdf?v=2'), src: '/uploads/b.pdf' });

    expect(onChange).toHaveBeenCalledWith('/uploads/b.pdf');
  });
});
