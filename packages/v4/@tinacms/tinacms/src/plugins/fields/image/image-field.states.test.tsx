import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  imageFieldState,
  imageFieldStates,
  imageGalleryState,
  imageGalleryStates,
} from './image-field.states';
import { ImageFieldView, type ImageFieldViewProps } from './image-field.view';
import {
  ImageGalleryView,
  type ImageGalleryViewProps,
} from './image-gallery.view';

const singles: { name: string; props: ImageFieldViewProps }[] =
  imageFieldStates;
const galleries: { name: string; props: ImageGalleryViewProps }[] =
  imageGalleryStates;

const inert = ({
  props,
}: {
  props: { disabled?: boolean; readOnly?: boolean };
}) => !!props.disabled || !!props.readOnly;

const droppedFile = () => new File(['image'], 'new.png', { type: 'image/png' });

const draggedFiles = { dataTransfer: { types: ['Files'], files: [] } };

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
      warned || (!!props.holdReason && !props.holdQuiet)
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
    expect(choose !== null).toBe(editable && !hasValue && !props.busy);
    const retry = within(group).queryByRole('button', { name: /^Retry/ });
    expect(retry !== null).toBe(editable && !!props.onRetry && !props.busy);
    if (props.note) expect(within(group).getByText(props.note)).toBeVisible();
    if (!editable && !hasValue) {
      expect(within(group).getByText('No image.')).toBeVisible();
    }
  });

  it('shows a missing image as a status, not an alert', () => {
    render(<ImageFieldView {...imageFieldState('missing image')} />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'This image is no longer in Media'
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

  it('shows the percent on the picture while a file uploads, and no percent when none is reported', () => {
    const { rerender } = render(
      <ImageFieldView {...imageFieldState('uploading with a percent')} />
    );
    const group = screen.getByRole('group');
    expect(within(group).getByText('Uploading 40%')).toBeVisible();
    expect(within(group).getByText('new.png')).toBeVisible();
    rerender(<ImageFieldView {...imageFieldState('busy')} />);
    expect(within(group).getByText('Uploading')).toBeVisible();
    expect(within(group).queryByText(/%/)).toBeNull();
  });

  it('keeps the old picture and turns its buttons off while a replacement uploads', () => {
    render(<ImageFieldView {...imageFieldState('uploading over an image')} />);
    expect(screen.getByAltText('about.png')).toBeInTheDocument();
    expect(screen.getByText('Uploading 40%')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Replace about.png' })
    ).toBeDisabled();
  });

  it('names Retry with the failed file and runs it', async () => {
    const onRetry = vi.fn();
    render(
      <ImageFieldView
        {...imageFieldState('upload failed with Retry')}
        onRetry={onRetry}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      "new.png: Couldn't upload."
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Retry uploading new.png' })
    );
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('reads "Drop to replace" only while files are dragged over a filled field', () => {
    render(<ImageFieldView {...imageFieldState('filled')} />);
    const group = screen.getByRole('group');
    fireEvent.dragOver(group, { dataTransfer: { types: ['text/plain'] } });
    expect(screen.queryByText('Drop to replace')).toBeNull();
    fireEvent.dragOver(group, draggedFiles);
    expect(screen.getByText('Drop to replace')).toBeVisible();
    fireEvent.dragLeave(group);
    expect(screen.queryByText('Drop to replace')).toBeNull();
  });

  it('keeps the invalid look under the drag look', () => {
    const { unmount } = render(
      <ImageFieldView {...imageFieldState('invalid and filled')} />
    );
    fireEvent.dragOver(screen.getByRole('group'), draggedFiles);
    const tile =
      screen.getByText('Drop to replace').parentElement?.parentElement;
    expect(tile).toHaveClass('border-destructive');
    expect(tile).not.toHaveClass('border-primary');
    expect(screen.getByRole('alert')).toBeVisible();
    unmount();
    render(<ImageFieldView {...imageFieldState('invalid')} />);
    const group = screen.getByRole('group');
    fireEvent.dragOver(group, draggedFiles);
    const area = within(group).getByRole('button', {
      name: 'Choose from Media',
    }).parentElement?.parentElement;
    expect(area).toHaveClass('border-destructive', 'bg-selected');
    expect(area).not.toHaveClass('border-primary');
  });

  it('says a quiet hold reason only when a file is dragged over or dropped', () => {
    const onDropFile = vi.fn();
    render(
      <ImageFieldView
        {...imageFieldState('uploads on hold, said on a drop')}
        onDropFile={onDropFile}
      />
    );
    const group = screen.getByRole('group');
    expect(screen.queryByRole('status')).toBeNull();
    fireEvent.dragOver(group, draggedFiles);
    expect(screen.getByRole('status')).toHaveTextContent(
      'This storage is read-only.'
    );
    fireEvent.dragLeave(group);
    expect(screen.queryByRole('status')).toBeNull();
    fireEvent.drop(group, { dataTransfer: { files: [droppedFile()] } });
    expect(screen.getByRole('status')).toHaveTextContent(
      'This storage is read-only.'
    );
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
          onRetry={vi.fn()}
        />
      );
      const group = screen.getByRole('group');
      expect(screen.queryByRole('button', { name: /^Retry/ })).toBeNull();
      await userEvent.click(group);
      await userEvent.keyboard('{Tab}{Enter} ');
      fireEvent.dragOver(group, draggedFiles);
      expect(screen.queryByText('Drop to replace')).toBeNull();
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

describe('image gallery states', () => {
  it.each(galleries)('renders $name', ({ props }) => {
    render(<ImageGalleryView {...props} />);
    const group = screen.getByRole('group', {
      name: new RegExp(`^${props.label}`),
    });
    expect(screen.queryByText(/unsaved/i)).toBeNull();
    expect(screen.queryByRole('alert') !== null).toBe(!!props.errors?.length);
    const warned = props.items.some((item) => item.missing);
    expect(screen.queryByRole('status') !== null).toBe(warned);

    const editable = !props.disabled && !props.readOnly;
    const tools = within(group).queryAllByRole('button', {
      name: /^(Replace|Remove|Move Image)/,
    });
    expect(tools.length).toBe(editable ? props.items.length * 3 : 0);
    expect(
      within(group).queryByRole('button', { name: 'Add images' }) !== null
    ).toBe(editable);
    if (!editable && props.items.length === 0) {
      expect(within(group).getByText('No images.')).toBeVisible();
    }
  });

  it('names each move handle with its place and file', () => {
    render(
      <ImageGalleryView {...imageGalleryState('gallery same image twice')} />
    );
    expect(
      screen.getByRole('button', { name: 'Move Image 1: about.png' })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Move Image 2: about.png' })
    ).toBeVisible();
  });

  it('gives a stored value that is not a path a tile that can be removed', async () => {
    const onRemove = vi.fn();
    render(
      <ImageGalleryView
        {...imageGalleryState('gallery unreadable items')}
        onRemove={onRemove}
      />
    );
    expect(screen.getByText('Not a media path')).toBeVisible();
    expect(screen.getByText('Empty image')).toBeVisible();
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Image 2' })
    );
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('moves a tile with the arrow keys and announces it', async () => {
    const onMove = vi.fn();
    render(
      <ImageGalleryView
        {...imageGalleryState('gallery filled')}
        onMove={onMove}
      />
    );
    screen.getByRole('button', { name: 'Move Image 2: team.jpg' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(onMove).toHaveBeenLastCalledWith(1, 0);
    expect(
      screen.getByText('Moved team.jpg to position 1 of 4')
    ).toBeInTheDocument();
  });

  it('stops at the ends', async () => {
    const onMove = vi.fn();
    render(
      <ImageGalleryView
        {...imageGalleryState('gallery filled')}
        onMove={onMove}
      />
    );
    screen.getByRole('button', { name: 'Move Image 1: about.png' }).focus();
    await userEvent.keyboard('{ArrowUp}{ArrowLeft}');
    screen.getByRole('button', { name: 'Move Image 4: launch.png' }).focus();
    await userEvent.keyboard('{ArrowDown}{ArrowRight}');
    expect(onMove).not.toHaveBeenCalled();
  });

  it('ignores keys and clicks on a read-only gallery', async () => {
    const onMove = vi.fn();
    const onAdd = vi.fn();
    render(
      <ImageGalleryView
        {...imageGalleryState('gallery read-only')}
        onMove={onMove}
        onAdd={onAdd}
      />
    );
    await userEvent.keyboard('{Tab}{ArrowLeft}{Enter}');
    expect(onMove).not.toHaveBeenCalled();
    expect(onAdd).not.toHaveBeenCalled();
  });
});
