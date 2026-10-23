import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Input } from '@tinacms/ui/components/input';
import { Label } from '@tinacms/ui/components/label';
import { SearchBox } from '@tinacms/ui/components/search-box';
import { Segmented } from '@tinacms/ui/components/segmented';
import { Switch } from '@tinacms/ui/components/switch';

describe('Label', () => {
  it('shows a required asterisk that screen readers skip', () => {
    render(
      <>
        <Label htmlFor='title' required>
          Title
        </Label>
        <Input id='title' required />
      </>
    );
    expect(screen.getByRole('textbox', { name: 'Title' })).toBeRequired();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Input', () => {
  it('marks a read-only box for its muted look', () => {
    render(<Input aria-label='Slug' readOnly />);
    expect(screen.getByRole('textbox', { name: 'Slug' })).toHaveAttribute(
      'data-readonly'
    );
  });
});

describe('Switch', () => {
  it('takes its name from its words and flips on a click on them or Space', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Switch onCheckedChange={onCheckedChange}>Show hidden fields</Switch>
    );
    const toggle = screen.getByRole('switch', { name: 'Show hidden fields' });
    expect(toggle).not.toBeChecked();

    await user.click(screen.getByText('Show hidden fields'));
    expect(toggle).toBeChecked();

    await user.keyboard(' ');
    expect(toggle).not.toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledTimes(2);
  });

  it('does not flip while disabled', async () => {
    const user = userEvent.setup();
    render(<Switch disabled aria-label='Autosave' />);
    await user.click(screen.getByRole('switch', { name: 'Autosave' }));
    expect(screen.getByRole('switch', { name: 'Autosave' })).not.toBeChecked();
  });
});

const VIEWS = [
  { value: 'all', label: 'All' },
  { value: 'drafts', label: 'Drafts' },
  { value: 'published', label: 'Published' },
] as const;

function ControlledSegmented() {
  const [view, setView] = useState<(typeof VIEWS)[number]['value']>('all');
  return (
    <>
      <Segmented
        aria-label='Show'
        options={VIEWS}
        value={view}
        onValueChange={setView}
      />
      <output>{view}</output>
    </>
  );
}

describe('Segmented', () => {
  it('picks the first option by default', () => {
    render(<Segmented aria-label='Show' options={VIEWS} />);
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('keeps one choice picked when the picked one is pressed again', async () => {
    const user = userEvent.setup();
    render(<ControlledSegmented />);
    await user.click(screen.getByRole('button', { name: 'Drafts' }));
    await user.click(screen.getByRole('button', { name: 'Drafts' }));
    expect(screen.getByRole('status')).toHaveTextContent('drafts');
    expect(screen.getByRole('button', { name: 'Drafts' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('moves with the arrow keys and picks with Enter', async () => {
    const user = userEvent.setup();
    render(<ControlledSegmented />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'All' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Drafts' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('drafts');
  });

  it('only accepts its own option values', () => {
    // @ts-expect-error 'archived' is not one of the options
    void (<Segmented options={VIEWS} value='archived' />);
  });
});

describe('SearchBox', () => {
  it('is a searchbox named by its label, with the shortcut announced', () => {
    render(<SearchBox label='Search titles' shortcut='⌘K' />);
    const box = screen.getByRole('searchbox', { name: 'Search titles' });
    expect(box).toHaveAttribute('placeholder', 'Search titles');
    expect(box).toHaveAttribute('aria-keyshortcuts', 'Meta+K');
  });

  it('shows Clear only while it has a value', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const { rerender } = render(
      <SearchBox
        label='Search'
        value=''
        onChange={() => {}}
        onClear={onClear}
      />
    );
    expect(
      screen.queryByRole('button', { name: 'Clear search' })
    ).not.toBeInTheDocument();

    rerender(
      <SearchBox
        label='Search'
        value='logo'
        onChange={() => {}}
        onClear={onClear}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
