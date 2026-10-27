import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { stringFieldStates } from './string-field.states';
import { StringFieldView } from './string-field.view';

describe('String field states', () => {
  it.each(stringFieldStates)(
    'renders $name as a named textbox',
    ({ props }) => {
      const { container } = render(<StringFieldView {...props} />);
      const box = screen.getByRole('textbox', { name: /^Title\b/ });
      expect(box).toBeInstanceOf(
        props.multiline ? HTMLTextAreaElement : HTMLInputElement
      );
      expect(container.textContent).not.toMatch(/unsaved/i);
      if (props.errors?.length) {
        expect(screen.getByRole('alert')).toHaveTextContent(props.errors[0]);
        expect(box).toHaveAttribute('aria-invalid', 'true');
      } else {
        expect(box).not.toHaveAttribute('aria-invalid');
      }
    }
  );

  it.each(
    stringFieldStates.filter(({ props }) => props.disabled || props.readOnly)
  )('cannot type into $name', async ({ props }) => {
    render(<StringFieldView {...props} />);
    const box = screen.getByRole('textbox') as HTMLInputElement;
    await userEvent.type(box, 'x');
    expect(box.value).toBe(props.value);
  });

  it('reads required once', () => {
    render(<StringFieldView {...stringFieldStates[2].props} />);
    const box = screen.getByRole('textbox', { name: 'Title (required)' });
    expect(box).toBeRequired();
  });

  it('applies the code font to both boxes', () => {
    for (const multiline of [false, true]) {
      const { unmount } = render(
        <StringFieldView
          {...stringFieldStates[9].props}
          multiline={multiline}
        />
      );
      expect(screen.getByRole('textbox')).toHaveClass('font-mono');
      unmount();
    }
  });

  it('drops newlines when multiline is turned off on a stored value', () => {
    render(
      <StringFieldView {...stringFieldStates[7].props} multiline={false} />
    );
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe(
      'First lineSecond line'
    );
  });
});
