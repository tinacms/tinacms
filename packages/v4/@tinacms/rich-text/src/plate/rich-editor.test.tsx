import { cleanup, render, screen } from '@testing-library/react';
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

afterEach(cleanup);

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
