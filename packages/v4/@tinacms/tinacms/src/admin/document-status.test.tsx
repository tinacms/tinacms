import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toFieldAddress } from '../core/field/address';
import { type FormId, toFormId, useFormStore } from '../form/form-store';
import { FormStatusBadge, SAVED_CONFIRMATION_MS } from './document-status';

const title = toFieldAddress('title');

let sequence = 0;
const freshForm = () => {
  const formId = toFormId(`posts/status-${sequence++}.mdx`);
  act(() => useFormStore.getState().registerForm(formId, { [title]: 'Hi' }));
  return formId;
};

const edit = (formId: FormId, value: string) =>
  act(() => useFormStore.getState().setFieldValue(formId, title, value));

const save = (formId: FormId) =>
  act(() => useFormStore.getState().markSaved(formId));

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('FormStatusBadge', () => {
  it('shows nothing for a document with no edits', () => {
    const { container } = render(<FormStatusBadge formId={freshForm()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows Unsaved while an edit differs from the saved content', () => {
    const formId = freshForm();
    render(<FormStatusBadge formId={formId} />);
    edit(formId, 'Hello');
    expect(screen.getByText('Unsaved')).toBeInTheDocument();
  });

  it('shows nothing when an edit returns to the saved content without a save', () => {
    const formId = freshForm();
    const { container } = render(<FormStatusBadge formId={formId} />);
    edit(formId, 'Hello');
    edit(formId, 'Hi');
    expect(container).toBeEmptyDOMElement();
  });

  it('confirms a save, then clears in the sidebar', () => {
    const formId = freshForm();
    const { container } = render(<FormStatusBadge formId={formId} />);
    edit(formId, 'Hello');
    save(formId);
    expect(container).toHaveTextContent(/^Saved$/);

    act(() => vi.advanceTimersByTime(SAVED_CONFIRMATION_MS));
    expect(container).toBeEmptyDOMElement();
  });

  it('confirms a save, then settles on the save time in the header', () => {
    vi.setSystemTime(new Date(2026, 9, 7, 12, 14));
    const formId = freshForm();
    const { container } = render(<FormStatusBadge formId={formId} showTime />);
    edit(formId, 'Hello');
    save(formId);
    expect(container).toHaveTextContent(/^Saved$/);

    act(() => vi.advanceTimersByTime(SAVED_CONFIRMATION_MS));
    const time = new Date(2026, 9, 7, 12, 14).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
    expect(container).toHaveTextContent(`Saved ${time}`);
  });

  it('replaces the save confirmation with Unsaved on the next edit', () => {
    const formId = freshForm();
    render(<FormStatusBadge formId={formId} showTime />);
    edit(formId, 'Hello');
    save(formId);
    edit(formId, 'Hello again');
    expect(screen.getByText('Unsaved')).toBeInTheDocument();
    expect(screen.queryByText(/Saved/)).not.toBeInTheDocument();
  });
});
