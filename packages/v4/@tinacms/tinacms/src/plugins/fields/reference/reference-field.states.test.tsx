import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  referenceFieldState,
  referenceFieldStates,
} from './reference-field.states';
import {
  ReferenceFieldView,
  type ReferenceFieldViewProps,
} from './reference-field.view';

const states: { name: string; props: ReferenceFieldViewProps }[] =
  referenceFieldStates;

const isInert = ({ props }: { props: ReferenceFieldViewProps }) =>
  !!props.disabled || !!props.readOnly;

describe('reference field states', () => {
  it.each(states)('renders $name', ({ props }) => {
    render(<ReferenceFieldView {...props} />);
    const input = screen.getByRole('combobox', {
      name: new RegExp(`^${props.label as string}\\b`),
    });
    expect(screen.queryByText(/unsaved/i)).toBeNull();
    expect(screen.queryByText('*') !== null).toBe(!!props.required);
    expect(screen.queryByRole('alert') !== null).toBe(!!props.errors?.length);
    expect(screen.queryByRole('status') !== null).toBe(
      !!props.warnings?.length
    );
    expect(input.getAttribute('aria-invalid') === 'true').toBe(
      !!props.errors?.length
    );
    expect(input.hasAttribute('disabled')).toBe(!!props.disabled);
    if (props.readOnly) expect(input).toHaveAttribute('aria-readonly', 'true');
    if (props.value) expect(input).toHaveValue(props.value);
  });

  it.each(states.filter(isInert))(
    'never opens or changes when $name',
    async ({ props }) => {
      const onChange = vi.fn();
      render(<ReferenceFieldView {...props} onChange={onChange} />);
      const input = screen.getByRole('combobox');
      await userEvent.click(input);
      input.focus();
      await userEvent.keyboard('{ArrowDown}{Enter}x');
      expect(screen.queryByRole('listbox')).toBeNull();
      expect(onChange).not.toHaveBeenCalled();
    }
  );

  it('narrows the list to a typed path and says so when nothing matches', async () => {
    render(<ReferenceFieldView {...referenceFieldState('empty')} />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'grace');
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('matches the path only, not the collection label', async () => {
    const props = referenceFieldState('empty');
    render(
      <ReferenceFieldView
        {...props}
        documents={props.documents.map((document) => ({
          ...document,
          meta: `Writers · ${document.value}`,
        }))}
      />
    );
    await userEvent.type(screen.getByRole('combobox'), 'Writers');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(await screen.findByText('No documents match.')).toBeVisible();
  });

  it('closes on Escape without changing the value', async () => {
    const onChange = vi.fn();
    render(
      <ReferenceFieldView
        {...referenceFieldState('filled')}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the collection under each path', async () => {
    render(<ReferenceFieldView {...referenceFieldState('empty')} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(
      await screen.findByRole('option', {
        name: /content\/authors\/ada\.md\s*Authors · content\/authors\/ada\.md/,
      })
    ).toBeVisible();
  });

  it('groups by collection only when there are several', async () => {
    const several = render(
      <ReferenceFieldView {...referenceFieldState('several collections')} />
    );
    await userEvent.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    expect(
      screen
        .getAllByRole('group')
        .filter((g) => g.dataset.slot === 'combobox-group')
        .map((g) => g.textContent)
    ).toEqual([
      expect.stringMatching(/^Authors/),
      expect.stringMatching(/^Posts/),
    ]);
    several.unmount();

    render(<ReferenceFieldView {...referenceFieldState('empty')} />);
    await userEvent.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    expect(
      screen
        .queryAllByRole('group')
        .filter((g) => g.dataset.slot === 'combobox-group')
    ).toHaveLength(0);
  });

  it('clears only when optional, or when the document is missing', async () => {
    const onChange = vi.fn();
    const optional = render(
      <ReferenceFieldView
        {...referenceFieldState('filled')}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onChange).toHaveBeenCalledWith(null);
    optional.unmount();

    const required = render(
      <ReferenceFieldView {...referenceFieldState('required')} />
    );
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
    required.unmount();

    render(
      <ReferenceFieldView
        {...referenceFieldState('missing document')}
        required
      />
    );
    expect(screen.getByRole('button', { name: 'Clear' })).toBeVisible();
  });

  it('opens the chosen document, and hides Open when empty, missing or unwired', async () => {
    const onOpen = vi.fn();
    const filled = render(
      <ReferenceFieldView {...referenceFieldState('filled')} onOpen={onOpen} />
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Open content/authors/ada.md' })
    );
    expect(onOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 'content/authors/ada.md',
        collection: 'author',
      })
    );
    filled.unmount();

    for (const props of [
      referenceFieldState('empty'),
      referenceFieldState('missing document'),
      { ...referenceFieldState('filled'), onOpen: undefined },
    ]) {
      const { unmount } = render(<ReferenceFieldView {...props} />);
      expect(screen.queryByRole('button', { name: /^Open/ })).toBeNull();
      unmount();
    }
  });

  it('hides Open while the field is disabled, even for a listed document', () => {
    render(
      <ReferenceFieldView
        {...referenceFieldState('loading with a document already listed')}
      />
    );
    expect(screen.queryByRole('button', { name: /^Open/ })).toBeNull();
  });

  it('keeps collections with equal labels in separate groups, in order', async () => {
    const doc = (collection: string, group: string) => ({
      value: `content/${collection}/one.md`,
      label: `content/${collection}/one.md`,
      meta: `${group} · content/${collection}/one.md`,
      group,
      collection,
    });
    render(
      <ReferenceFieldView
        {...referenceFieldState('empty')}
        documents={[
          doc('a', 'Articles'),
          doc('b', 'Other'),
          doc('c', 'Articles'),
        ]}
      />
    );
    await userEvent.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    expect(
      screen
        .getAllByRole('group')
        .filter((g) => g.dataset.slot === 'combobox-group')
        .map((g) => g.querySelector('[data-slot=combobox-label]')?.textContent)
    ).toEqual(['Articles', 'Other', 'Articles']);
  });

  it('draws no heading when only some documents name a group', async () => {
    const props = referenceFieldState('several collections');
    render(
      <ReferenceFieldView
        {...props}
        documents={props.documents.map((document, index) =>
          index === 0 ? document : { ...document, group: undefined }
        )}
      />
    );
    await userEvent.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    expect(
      document.querySelectorAll('[data-slot=combobox-label]')
    ).toHaveLength(0);
  });

  it('keeps Open usable on a read-only field', async () => {
    const onOpen = vi.fn();
    render(
      <ReferenceFieldView
        {...referenceFieldState('read-only with a chosen document')}
        onOpen={onOpen}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /^Open/ }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('tabs from the box to clear to Open, skipping the chevron', async () => {
    render(<ReferenceFieldView {...referenceFieldState('filled')} />);
    await userEvent.tab();
    expect(screen.getByRole('combobox')).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Clear' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: /^Open/ })).toHaveFocus();
  });
});
