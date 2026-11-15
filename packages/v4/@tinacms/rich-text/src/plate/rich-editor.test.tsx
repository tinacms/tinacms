import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RichTextValue } from '../value';
import { RichEditor, type RichEditorProps } from './index';

const value: RichTextValue = {
  type: 'root',
  children: [{ type: 'p', children: [{ type: 'text', text: 'Hello' }] }],
};

const mount = (props: Partial<RichEditorProps> = {}) =>
  render(
    <RichEditor
      input={{ value, onChange: vi.fn() }}
      field={{ templates: [] }}
      ariaLabelledBy='body-label'
      {...props}
    />
  );

const editor = () =>
  screen.findByLabelText('', { selector: '[aria-labelledby]' });

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe('RichEditor frame props', () => {
  it('shows the toolbar and an editable text box by default', async () => {
    const { container } = mount();
    await editor();
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    expect(container.querySelector('[contenteditable=true]')).not.toBeNull();
    expect(container.querySelector('[inert]')).toBeNull();
  });

  it('hides the toolbar and locks the text when read-only', async () => {
    const { container } = mount({ readOnly: true });
    await editor();
    expect(screen.queryByRole('toolbar')).toBeNull();
    expect(container.querySelector('[contenteditable=false]')).not.toBeNull();
  });

  it('keeps the toolbar but makes everything inert when disabled', async () => {
    const { container } = mount({ disabled: true });
    await editor();
    const inert = container.querySelector('[inert][aria-disabled=true]');
    expect(inert?.contains(screen.getByRole('toolbar'))).toBe(true);
    expect(container.querySelector('[contenteditable=false]')).not.toBeNull();
  });

  it('passes the invalid and described-by state to the text box', async () => {
    mount({ ariaInvalid: true, ariaDescribedBy: 'help-id' });
    const box = await editor();
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAttribute('aria-describedby', 'help-id');
  });

  it('omits aria-invalid when valid', async () => {
    mount();
    expect(await editor()).not.toHaveAttribute('aria-invalid');
  });

  it('sizes the text box by layout', async () => {
    const framed = mount();
    expect((await editor()).className).toContain('max-h-60');
    framed.unmount();
    mount({ layout: 'body' });
    expect((await editor()).className).toContain('min-h-56');
  });
});

describe('RichEditor toolbar tooltips', () => {
  it('opens after the half second the rest of the admin uses, not Radix’s 700ms default', async () => {
    mount();
    await editor();
    vi.useFakeTimers();
    const button = screen.getByRole('radio', { name: 'Bold (⌘+B)' });
    const tip = () => document.querySelector('[role="tooltip"]');
    act(() => {
      fireEvent.pointerEnter(button);
      fireEvent.pointerMove(button);
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);
    });
    await act(() => vi.advanceTimersByTimeAsync(499));
    expect(tip()).toBeNull();
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(tip()).not.toBeNull();
  });
});
