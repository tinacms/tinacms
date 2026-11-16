import { fireEvent, render, screen, within } from '@testing-library/react';
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
    expect(screen.queryByText('*') !== null).toBe(!!props.required);
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

  it('draws the body in the same frame as a field, with a visible label and a 224px minimum', async () => {
    const { container } = render(
      <RichTextFieldView {...richTextFieldState('body')} />
    );
    const editor = await findEditor();
    const frame = container.querySelector('[data-slot=rich-text-frame]');
    expect(frame?.className).toMatch(/\bborder\b/);
    expect(frame?.className).not.toContain('overflow-hidden');
    expect(editor.className).toContain('min-h-56');
    expect(editor.className).toContain('max-h-[min(70vh,640px)]');
    expect(editor.className).toContain('overflow-y-auto');
    expect(editor.className).not.toContain('max-h-60');
    expect(editor.className).not.toMatch(/overscroll-/);
    expect(editor.contains(screen.getByRole('toolbar'))).toBe(false);
    const label = screen.getByText('Body', { selector: 'label' });
    expect(label).not.toHaveClass('sr-only');
    expect(label.id).toBe(editor.getAttribute('aria-labelledby'));
  });

  it('keeps the framed field clipped and capped at 240px', async () => {
    const { container } = render(
      <RichTextFieldView {...richTextFieldState('filled')} />
    );
    const editor = await findEditor();
    expect(
      container.querySelector('[data-slot=rich-text-frame]')?.className
    ).toContain('overflow-hidden');
    expect(editor.className).toContain('max-h-60');
  });

  it('puts body errors under the editor', async () => {
    render(<RichTextFieldView {...richTextFieldState('body invalid')} />);
    const editor = await findEditor();
    const alert = screen.getByRole('alert');
    expect(
      editor.compareDocumentPosition(alert) & Node.DOCUMENT_POSITION_FOLLOWING
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
    const classes = container
      .querySelector('[data-slot=rich-text-frame]')
      ?.className.split(' ');
    expect(classes).toContain('hover:border-input');
    expect(classes).not.toContain('hover:border-input-hover');
  });

  const frameClasses = (container: HTMLElement) =>
    container
      .querySelector('[data-slot=rich-text-frame]')
      ?.className.split(' ');

  it('keeps the invalid border on hover and on keyboard focus', async () => {
    const { container } = render(
      <RichTextFieldView {...richTextFieldState('invalid')} />
    );
    await findEditor();
    expect(frameClasses(container)).toEqual(
      expect.arrayContaining([
        'border-destructive',
        'hover:border-destructive',
        'has-focus-visible:border-destructive',
      ])
    );
  });

  it.each([
    ['read-only', 'border-border-subtle', 'bg-muted'],
    ['disabled', 'border-input', 'hover:border-input'],
    ['body read-only', 'border-border-subtle', 'bg-muted'],
    ['body disabled', 'border-input', 'hover:border-input'],
  ] as const)(
    'shows the %s look over invalid and keeps the error under the box',
    async (name, ...looks) => {
      const { container } = render(
        <RichTextFieldView
          {...richTextFieldState(name)}
          errors={['Body is required']}
        />
      );
      const editor = await findEditor();
      const classes = frameClasses(container);
      expect(classes).toEqual(expect.arrayContaining([...looks]));
      expect(classes).not.toContain('border-destructive');
      expect(classes).not.toContain('hover:border-destructive');
      expect(
        editor.compareDocumentPosition(screen.getByRole('alert')) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    }
  );

  it('points the body editor at the help text under its label', async () => {
    render(
      <RichTextFieldView
        {...richTextFieldState('body')}
        help='Markdown is supported'
        helpId='body-help'
      />
    );
    const editor = await findEditor();
    expect(editor).toHaveAttribute('aria-describedby', 'body-help');
    expect(screen.getByText('Markdown is supported')).toHaveAttribute(
      'id',
      'body-help'
    );
  });

  it('shows only the allowed tools of a limited toolbar', async () => {
    render(<RichTextFieldView {...richTextFieldState('limited toolbar')} />);
    await findEditor();
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' });
    expect(within(toolbar).getByRole('button', { name: 'Bold' })).toBeVisible();
    expect(within(toolbar).queryByRole('button', { name: 'Quote' })).toBeNull();
    expect(
      within(toolbar).queryByRole('button', { name: 'Insert' })
    ).toBeNull();
  });

  it('shows a body with a long text, and a disabled body with its toolbar off', async () => {
    const long = render(
      <RichTextFieldView {...richTextFieldState('body long')} />
    );
    await findEditor();
    expect(await screen.findByText(/Paragraph 40 /)).toBeVisible();
    long.unmount();

    render(<RichTextFieldView {...richTextFieldState('body disabled')} />);
    await findEditor();
    for (const button of within(screen.getByRole('toolbar')).getAllByRole(
      'button'
    )) {
      expect(button).toBeDisabled();
    }
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
