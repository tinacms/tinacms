import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { imageFieldState, imageFieldStates } from './image-field.states';
import { ImageFieldView, type ImageFieldViewProps } from './image-field.view';

const singles: { name: string; props: ImageFieldViewProps }[] =
  imageFieldStates;

const inert = ({
  props,
}: {
  props: { disabled?: boolean; readOnly?: boolean };
}) => !!props.disabled || !!props.readOnly;

const droppedFile = () => new File(['image'], 'new.png', { type: 'image/png' });

describe('image field states', () => {
  it.each(singles)('renders $name', ({ props }) => {
    render(<ImageFieldView {...props} />);
    const group = screen.getByRole('group', {
      name: new RegExp(`^${props.label}`),
    });
    expect(screen.queryByText(/unsaved/i)).toBeNull();
    expect(screen.queryByRole('alert') !== null).toBe(!!props.errors?.length);
    const warned = !!props.warnings?.length || !!props.missing;
    expect(screen.queryByRole('status') !== null).toBe(
      warned || !!props.holdReason
    );
    expect(screen.queryByRole('alert')).toBe(
      props.errors?.length ? screen.getByRole('alert') : null
    );

    const editable = !props.disabled && !props.readOnly;
    const hasValue = props.path !== null || props.notAPath;
    const replace = within(group).queryByRole('button', { name: /^Replace/ });
    const remove = within(group).queryByRole('button', { name: /^Remove/ });
    expect(replace !== null).toBe(editable && !!hasValue);
    expect(remove !== null).toBe(editable && !!hasValue && !!props.onRemove);
    if (props.path && replace) {
      const file = props.path.split('/').at(-1);
      expect(replace).toHaveAccessibleName(`Replace ${file}`);
      if (remove) expect(remove).toHaveAccessibleName(`Remove ${file}`);
    }
    const choose = within(group).queryByRole('button', {
      name: 'Choose from Media',
    });
    expect(choose !== null).toBe(editable && !hasValue);
    if (!editable && !hasValue) {
      expect(within(group).getByText('No image.')).toBeVisible();
    }
  });

  it('shows a missing image as a status, not an alert', () => {
    render(<ImageFieldView {...imageFieldState('missing image')} />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'deleted.png is missing from Media'
    );
    expect(screen.queryByRole('alert')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Replace deleted.png' })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Remove deleted.png' })
    ).toBeVisible();
  });

  it('puts the hold reason in a status and refuses a dropped file', () => {
    const onDropFile = vi.fn();
    render(
      <ImageFieldView
        {...imageFieldState('uploads on hold')}
        onDropFile={onDropFile}
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Uploads are paused while the document saves.'
    );
    fireEvent.drop(screen.getByRole('group'), {
      dataTransfer: { files: [droppedFile()] },
    });
    expect(onDropFile).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Choose from Media' })
    ).toBeEnabled();
  });

  it('ignores a second drop while an upload runs', () => {
    const onDropFile = vi.fn();
    render(
      <ImageFieldView {...imageFieldState('busy')} onDropFile={onDropFile} />
    );
    fireEvent.drop(screen.getByRole('group'), {
      dataTransfer: { files: [droppedFile()] },
    });
    expect(onDropFile).not.toHaveBeenCalled();
  });

  it.each(singles.filter(inert))(
    'ignores clicks, keys and drops when $name',
    async ({ props }) => {
      const onChoose = vi.fn();
      const onReplace = vi.fn();
      const onRemove = vi.fn();
      const onDropFile = vi.fn();
      render(
        <ImageFieldView
          {...props}
          onChoose={onChoose}
          onReplace={onReplace}
          onRemove={onRemove}
          onDropFile={onDropFile}
        />
      );
      const group = screen.getByRole('group');
      await userEvent.click(group);
      await userEvent.keyboard('{Tab}{Enter} ');
      fireEvent.drop(group, { dataTransfer: { files: [droppedFile()] } });
      expect(onChoose).not.toHaveBeenCalled();
      expect(onReplace).not.toHaveBeenCalled();
      expect(onRemove).not.toHaveBeenCalled();
      expect(onDropFile).not.toHaveBeenCalled();
    }
  );

  it('hands a dropped file to onDropFile', () => {
    const onDropFile = vi.fn();
    render(
      <ImageFieldView {...imageFieldState('empty')} onDropFile={onDropFile} />
    );
    const file = droppedFile();
    fireEvent.drop(screen.getByRole('group'), {
      dataTransfer: { files: [file] },
    });
    expect(onDropFile).toHaveBeenCalledWith(file);
  });

  it('offers no drop prompt when the provider takes no uploads', () => {
    render(<ImageFieldView {...imageFieldState('no uploads')} />);
    expect(screen.queryByText(/Drop an image/)).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Choose from Media' })
    ).toBeVisible();
  });
});
