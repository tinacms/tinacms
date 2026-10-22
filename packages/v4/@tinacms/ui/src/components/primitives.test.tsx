import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar } from '@tinacms/ui/components/avatar';
import { Badge } from '@tinacms/ui/components/badge';
import { DiffStat } from '@tinacms/ui/components/diff-stat';
import { Icon } from '@tinacms/ui/components/icon';
import { KbdShortcut, keyShortcuts } from '@tinacms/ui/components/kbd';

describe('Badge', () => {
  it('renders nothing for a count of 0', () => {
    const { container } = render(<Badge kind='count' count={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('gives a status its word', () => {
    render(<Badge kind='status' status='failed' />);
    expect(screen.getByText('Failed')).toBeVisible();
  });

  it('announces an error count only through its srLabel', () => {
    render(<Badge kind='errors' count={3} srLabel='3 errors' />);
    expect(screen.getByText('3 errors')).toBeInTheDocument();
  });

  it('defaults an unsaved badge to "Unsaved"', () => {
    render(<Badge />);
    expect(screen.getByText('Unsaved')).toBeVisible();
  });
});

describe('Avatar', () => {
  it('shows initials from the name', () => {
    render(<Avatar name='Josh Berman' label='Josh Berman' />);
    expect(screen.getByRole('img', { name: 'Josh Berman' })).toHaveTextContent(
      'JB'
    );
  });

  it('opens the account menu as a button', () => {
    render(<Avatar name='Josh Berman' onClick={() => {}} />);
    const button = screen.getByRole('button', { name: 'Account, Josh Berman' });
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('DiffStat', () => {
  it('tells screen readers the line counts, clamping bad input to 0', () => {
    render(<DiffStat added={1} removed={-4} />);
    expect(
      screen.getByText('1 line added, 0 lines removed')
    ).toBeInTheDocument();
  });
});

describe('Icon', () => {
  it('is hidden unless labelled', () => {
    render(
      <>
        <Icon glyph='doc' data-testid='plain' />
        <Icon glyph='warning' aria-label='Warning' />
      </>
    );
    expect(screen.getByTestId('plain')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('img', { name: 'Warning' })).toBeVisible();
  });
});

describe('KbdShortcut', () => {
  it('speaks a labelled shortcut', () => {
    render(<KbdShortcut keys='⌘K' label='Search' />);
    expect(
      screen.getByRole('img', { name: 'Search: Command K' })
    ).toBeVisible();
  });

  it('maps one press to aria-keyshortcuts and skips sequences', () => {
    expect(keyShortcuts('⌘⇧P')).toBe('Meta+Shift+P');
    expect(keyShortcuts('⎋')).toBe('Escape');
    expect(keyShortcuts('G H')).toBeUndefined();
  });
});
