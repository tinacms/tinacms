import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DropdownMenuItem } from '@tinacms/ui/components/dropdown-menu';
import { PanelHeader } from '@tinacms/ui/components/panel-header';

const trail = [
  { label: 'Collections', onClick: () => {} },
  { label: 'Posts', onClick: () => {} },
];

describe('PanelHeader with a trail', () => {
  it('is the 64px head: a Location trail over the heading, no back button', () => {
    render(
      <PanelHeader
        heading='Hello world'
        trail={trail}
        backLabel='Return'
        menu={<DropdownMenuItem>Rename</DropdownMenuItem>}
        menuLabel='Form actions'
      />
    );
    const head = document.querySelector('[data-slot=panel-header]');
    expect(head).toHaveClass('h-16');
    expect(head).not.toHaveClass('h-11');
    const nav = screen.getByRole('navigation', { name: 'Location' });
    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Hello world',
    });
    expect(
      nav.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(heading).toHaveClass('truncate');
    expect(screen.queryByRole('button', { name: 'Return' })).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Form actions' })
    ).toBeInTheDocument();
    expect(nav.querySelector('[aria-current]')).toBeNull();
  });

  it('goes to a step when pressed, and folds five steps', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const five = ['A', 'B', 'C', 'D', 'E'].map((label) => ({
      label,
      onClick: () => onClick(label),
    }));
    render(<PanelHeader heading='Title' trail={five} />);
    const nav = screen.getByRole('navigation', { name: 'Location' });
    await user.click(within(nav).getByRole('button', { name: 'E' }));
    expect(onClick).toHaveBeenCalledWith('E');
    expect(
      within(nav).getByRole('button', { name: 'Show 2 more levels' })
    ).toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: 'B' })).toBeNull();
  });

  it('keeps the 44px bar and no Location trail without one', () => {
    render(<PanelHeader heading='Media' closeLabel='Close' />);
    expect(document.querySelector('[data-slot=panel-header]')).toHaveClass(
      'h-11'
    );
    expect(screen.queryByRole('navigation')).toBeNull();
  });
});

describe('PanelHeader tools', () => {
  it('shows a Document tools group of pressed-state icon buttons', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <PanelHeader
        heading='Title'
        trail={trail}
        tools={[
          { label: 'History', icon: 'changes', onClick, selected: true },
          { label: 'References', icon: 'branch' },
        ]}
      />
    );
    const group = screen.getByRole('group', { name: 'Document tools' });
    const history = within(group).getByRole('button', { name: 'History' });
    expect(history).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(group).getByRole('button', { name: 'References' })
    ).toHaveAttribute('aria-pressed', 'false');
    await user.click(history);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders no group when empty', () => {
    render(<PanelHeader heading='Title' trail={trail} tools={[]} />);
    expect(screen.queryByRole('group')).toBeNull();
  });
});
