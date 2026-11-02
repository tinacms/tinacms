import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
// Warm the Plate editor chain at module scope, as the render test does.
import './rich-text-field.client';
import {
  richTextFieldState,
  richTextFieldStates,
} from './rich-text-field.states';
import {
  RichTextFieldView,
  type RichTextFieldViewProps,
} from './rich-text-field.view';

const states: { name: string; props: RichTextFieldViewProps }[] =
  richTextFieldStates;

const isInert = ({ props }: { props: RichTextFieldViewProps }) =>
  !!props.disabled || !!props.readOnly;

// Slate drops `role=textbox` when it is read-only, so find it by its label.
const findEditor = () => screen.findByLabelText(/^Body\b/);

describe('rich text field states', () => {
  it.each(states)('renders $name', async ({ props }) => {
    const { container } = render(<RichTextFieldView {...props} />);
    const editor = await findEditor();
    expect(screen.queryByText(/unsaved/i)).toBeNull();
    expect(screen.queryByText('*') !== null).toBe(
      !!props.required && !props.body
    );
    expect(screen.queryByRole('alert') !== null).toBe(!!props.errors?.length);
    expect(screen.queryByRole('status') !== null).toBe(
      !!props.warnings?.length
    );
    expect(
      screen.queryByRole('toolbar') !== null,
      'toolbar shows unless read-only'
    ).toBe(!props.readOnly);
    expect(editor.getAttribute('contenteditable')).toBe(
      isInert({ props }) ? 'false' : 'true'
    );
    expect(container.querySelector('[aria-disabled="true"]') !== null).toBe(
      !!props.disabled
    );
  });

  it('shows the placeholder in an empty field', async () => {
    render(<RichTextFieldView {...richTextFieldState('empty')} />);
    await findEditor();
    expect(await screen.findByText('Start writing…')).toBeVisible();
  });

  it('keeps the toolbar outside the text box and gives the text box its scroll classes', async () => {
    const { container } = render(
      <RichTextFieldView {...richTextFieldState('too long for the box')} />
    );
    const editor = await findEditor();
    const toolbar = screen.getByRole('toolbar');
    expect(editor.contains(toolbar)).toBe(false);
    expect(editor.className).toContain('overflow-y-auto');
    expect(editor.className).toContain('max-h-60');
    expect(editor.className).toContain('break-words');
    expect(
      container.querySelector('[data-slot=rich-text-frame]')?.className
    ).toContain('border');
  });

  it('draws the body with no frame border and a hidden but named label', async () => {
    const { container } = render(
      <RichTextFieldView {...richTextFieldState('body')} />
    );
    const editor = await findEditor();
    const frame = container.querySelector('[data-slot=rich-text-frame]');
    expect(frame?.className).not.toMatch(/\bborder\b/);
    expect(editor.className).toContain('min-h-56');
    const label = screen.getByText('Body', { selector: 'span' });
    expect(label).toHaveClass('sr-only');
    expect(label.id).toBe(editor.getAttribute('aria-labelledby'));
  });

  it('puts body errors above the editor', async () => {
    render(<RichTextFieldView {...richTextFieldState('body invalid')} />);
    const editor = await findEditor();
    const alert = screen.getByRole('alert');
    expect(
      alert.compareDocumentPosition(editor) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('marks an invalid frame red and a required label with the asterisk', async () => {
    const { container } = render(
      <RichTextFieldView {...richTextFieldState('invalid')} />
    );
    expect(await findEditor()).toHaveAttribute('aria-invalid', 'true');
    expect(
      container.querySelector('[data-slot=rich-text-frame]')?.className
    ).toContain('border-destructive');
    expect(screen.getByText('(required)')).toBeInTheDocument();
  });

  it.each(states.filter(isInert))(
    'ignores typing when $name',
    async ({ props }) => {
      const onChange = vi.fn();
      render(<RichTextFieldView {...props} onChange={onChange} />);
      const editor = await findEditor();
      await userEvent.keyboard('typed');
      expect(editor).not.toHaveTextContent('typed');
      expect(onChange).not.toHaveBeenCalled();
    }
  );

  it('wraps a disabled toolbar in inert and drops hover on the frame', async () => {
    const { container } = render(
      <RichTextFieldView {...richTextFieldState('disabled')} />
    );
    await findEditor();
    const inert = container.querySelector('[inert]');
    expect(inert).not.toBeNull();
    expect(inert?.contains(screen.getByRole('toolbar'))).toBe(true);
    expect(
      container.querySelector('[data-slot=rich-text-frame]')?.className
    ).toContain('hover:border-input');
  });

  it('links help text to the editor', async () => {
    render(
      <RichTextFieldView
        {...richTextFieldState('filled')}
        help='Markdown is supported'
        helpId='body-help'
      />
    );
    expect(await findEditor()).toHaveAttribute('aria-describedby', 'body-help');
  });

  it('shows an embed with a menu, and no menu when read-only', async () => {
    const live = render(
      <RichTextFieldView {...richTextFieldState('with an embed')} />
    );
    await findEditor();
    expect(await screen.findByText('Callout')).toBeInTheDocument();
    expect(document.querySelector('[aria-expanded]')).not.toBeNull();
    live.unmount();

    render(
      <RichTextFieldView {...richTextFieldState('read-only with an embed')} />
    );
    await findEditor();
    expect(await screen.findByText('Callout')).toBeInTheDocument();
    expect(document.querySelector('[aria-expanded]')).toBeNull();
    expect(screen.queryByText('Remove')).toBeNull();
  });

  it('opens an embed from its label only when editable', async () => {
    const onActivateEmbed = vi.fn();
    const live = render(
      <RichTextFieldView
        {...richTextFieldState('with an embed')}
        onActivateEmbed={onActivateEmbed}
      />
    );
    fireEvent.mouseDown(await screen.findByText('Callout'));
    expect(onActivateEmbed).toHaveBeenCalledTimes(1);
    live.unmount();

    onActivateEmbed.mockClear();
    render(
      <RichTextFieldView
        {...richTextFieldState('read-only with an embed')}
        onActivateEmbed={onActivateEmbed}
      />
    );
    fireEvent.mouseDown(await screen.findByText('Callout'));
    expect(onActivateEmbed).not.toHaveBeenCalled();
  });
});
