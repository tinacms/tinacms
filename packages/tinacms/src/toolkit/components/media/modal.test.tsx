import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MediaRenameError } from '@toolkit/core/media';
import { ModalProvider } from '@toolkit/react-modals';
import React from 'react';
import { RenameModal } from './modal';

const renderModal = (
  props: Partial<React.ComponentProps<typeof RenameModal>> = {}
) => {
  const renameFunc = props.renameFunc ?? vi.fn().mockResolvedValue(undefined);
  const close = props.close ?? vi.fn();
  render(
    <ModalProvider>
      <RenameModal
        filename={props.filename ?? 'photo.jpg'}
        renameFunc={renameFunc}
        close={close}
      />
    </ModalProvider>
  );
  return {
    renameFunc,
    close,
    input: () => screen.getByPlaceholderText('File name') as HTMLInputElement,
    // `Button` renders `disabled` as pointer-events-none styling rather than
    // the DOM attribute, so "is it disabled" is asserted through the class and
    // through the handler refusing to run.
    submit: () => screen.getByText('Rename').closest('button'),
    submitBlocked: () =>
      screen
        .getByText('Rename')
        .closest('button')
        .className.includes('pointer-events-none'),
  };
};

describe('RenameModal', () => {
  it('edits only the basename and keeps the extension visible', () => {
    const { input } = renderModal({ filename: 'photo.jpg' });
    expect(input().value).toBe('photo');
    expect(screen.getByText('.jpg')).toBeDefined();
  });

  it('warns that content references are not updated', () => {
    renderModal();
    expect(screen.getByText(/will not update existing content/i)).toBeDefined();
  });

  it('blocks submit while the name is unchanged', () => {
    const { submit, submitBlocked, renameFunc } = renderModal({
      filename: 'photo.jpg',
    });
    expect(submitBlocked()).toBe(true);
    fireEvent.click(submit());
    expect(renameFunc).not.toHaveBeenCalled();
  });

  it('blocks submit when the name is emptied', () => {
    const { input, submit, submitBlocked, renameFunc } = renderModal();
    fireEvent.change(input(), { target: { value: '   ' } });
    expect(submitBlocked()).toBe(true);
    fireEvent.click(submit());
    expect(renameFunc).not.toHaveBeenCalled();
  });

  it('previews the sanitised name and submits it', async () => {
    const { input, submit, renameFunc } = renderModal({
      filename: 'photo.jpg',
    });

    fireEvent.change(input(), { target: { value: 'my new photo' } });
    expect(screen.getByText('my-new-photo.jpg')).toBeDefined();

    fireEvent.click(submit());
    await waitFor(() =>
      expect(renameFunc).toHaveBeenCalledWith('my-new-photo.jpg')
    );
  });

  it('preserves the extension even when the base contains dots', async () => {
    const { input, submit, renameFunc } = renderModal({
      filename: 'photo.jpg',
    });

    fireEvent.change(input(), { target: { value: 'v1.2.final' } });
    fireEvent.click(submit());

    await waitFor(() =>
      expect(renameFunc).toHaveBeenCalledWith('v1.2.final.jpg')
    );
  });

  it('blocks a name that sanitises away entirely', () => {
    const { input, submit, submitBlocked, renameFunc } = renderModal();
    fireEvent.change(input(), { target: { value: '///' } });
    expect(submitBlocked()).toBe(true);
    expect(screen.getByText(/isn't valid/i)).toBeDefined();
    fireEvent.click(submit());
    expect(renameFunc).not.toHaveBeenCalled();
  });

  it('closes after a successful rename', async () => {
    const { input, submit, close } = renderModal();
    fireEvent.change(input(), { target: { value: 'renamed' } });
    fireEvent.click(submit());
    await waitFor(() => expect(close).toHaveBeenCalled());
  });

  it('stays open and shows a specific message on collision', async () => {
    const renameFunc = vi
      .fn()
      .mockRejectedValue(
        new MediaRenameError({ code: 'NAME_COLLISION', message: 'taken' })
      );
    const { input, submit, close } = renderModal({ renameFunc });

    fireEvent.change(input(), { target: { value: 'taken' } });
    fireEvent.click(submit());

    await screen.findByRole('alert');
    expect(screen.getByRole('alert').textContent).toContain(
      'A file named "taken.jpg" already exists'
    );
    expect(close).not.toHaveBeenCalled();
  });

  it('reports a missing source without closing', async () => {
    const renameFunc = vi
      .fn()
      .mockRejectedValue(
        new MediaRenameError({ code: 'NOT_FOUND', message: 'gone' })
      );
    const { input, submit, close } = renderModal({ renameFunc });

    fireEvent.change(input(), { target: { value: 'renamed' } });
    fireEvent.click(submit());

    await screen.findByRole('alert');
    expect(screen.getByRole('alert').textContent).toContain('no longer exists');
    expect(close).not.toHaveBeenCalled();
  });

  it('shows the backend message when a rename is unsupported', async () => {
    const renameFunc = vi.fn().mockRejectedValue(
      new MediaRenameError({
        code: 'UNSUPPORTED',
        message:
          "Renaming media on the protected branch 'main' requires the editorial workflow.",
      })
    );
    const { input, submit, close } = renderModal({ renameFunc });

    fireEvent.change(input(), { target: { value: 'renamed' } });
    fireEvent.click(submit());

    await screen.findByRole('alert');
    expect(screen.getByRole('alert').textContent).toContain(
      "protected branch 'main' requires the editorial workflow"
    );
    expect(close).not.toHaveBeenCalled();
  });

  it('reports an invalid path without closing', async () => {
    const renameFunc = vi
      .fn()
      .mockRejectedValue(
        new MediaRenameError({ code: 'INVALID_PATH', message: 'nope' })
      );
    const { input, submit, close } = renderModal({ renameFunc });

    fireEvent.change(input(), { target: { value: 'renamed' } });
    fireEvent.click(submit());

    await screen.findByRole('alert');
    expect(screen.getByRole('alert').textContent).toContain(
      "That name isn't valid"
    );
    expect(close).not.toHaveBeenCalled();
  });

  it('closes without an error when the editor cancels the branch prompt', async () => {
    const cancelled = Object.assign(new Error('Media rename cancelled.'), {
      ERR_TYPE: 'MediaRenameCancelled',
    });
    const renameFunc = vi.fn().mockRejectedValue(cancelled);
    const { input, submit, close } = renderModal({ renameFunc });

    fireEvent.change(input(), { target: { value: 'renamed' } });
    fireEvent.click(submit());

    await waitFor(() => expect(close).toHaveBeenCalled());
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('disables the inputs while the rename is in flight', async () => {
    let release: () => void;
    const renameFunc = vi.fn().mockReturnValue(
      new Promise<void>((resolve) => {
        release = resolve;
      })
    );
    const { input, submit, submitBlocked } = renderModal({ renameFunc });

    fireEvent.change(input(), { target: { value: 'renamed' } });
    fireEvent.click(submit());

    await waitFor(() => expect(submitBlocked()).toBe(true));
    expect(input().disabled).toBe(true);

    // a second click must not fire another request
    fireEvent.click(submit());
    expect(renameFunc).toHaveBeenCalledTimes(1);

    release();
  });
});
