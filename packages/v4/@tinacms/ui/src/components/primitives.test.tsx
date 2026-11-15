import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Avatar } from '@tinacms/ui/components/avatar';
import { Badge } from '@tinacms/ui/components/badge';
import { DiffStat } from '@tinacms/ui/components/diff-stat';
import { Icon } from '@tinacms/ui/components/icon';
import { KbdShortcut, keyShortcuts } from '@tinacms/ui/components/kbd';
import { Separator } from '@tinacms/ui/components/separator';

describe('Badge', () => {
  it('renders nothing for a count of 0', () => {
    const { container } = render(
      <Badge kind='count' count={0} srLabel='No changes' />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    ['errors', 3, ', 3 errors'],
    ['errors', 1, ', 1 error'],
    ['changes', 2, ', 2 changes'],
  ] as const)('words a count of %s for screen readers', (of, count, words) => {
    render(<Badge kind='count' of={of} count={count} />);
    expect(screen.getByText(words)).toBeInTheDocument();
  });

  it('gives a status its word', () => {
    render(<Badge kind='status' status='failed' />);
    expect(screen.getByText('Failed')).toBeVisible();
  });

  it('announces a count in words, not as a bare number', () => {
    render(<Badge kind='count' tone='error' count={3} srLabel=', 3 errors' />);
    expect(screen.getByText(', 3 errors')).toBeInTheDocument();
    expect(screen.getByText('3')).toHaveAttribute('aria-hidden', 'true');
  });

  it('caps a count at 99+', () => {
    const { rerender } = render(
      <Badge kind='count' count={99} srLabel=', 99 changes' />
    );
    expect(screen.getByText('99')).toBeInTheDocument();
    rerender(<Badge kind='count' count={100} srLabel=', 100 changes' />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('colours a count by tone', () => {
    const { rerender } = render(
      <Badge kind='count' tone='error' count={2} srLabel=', 2 errors' />
    );
    const errorClasses = screen.getByText('2').parentElement?.className;
    rerender(
      <Badge kind='count' tone='change' count={2} srLabel=', 2 changes' />
    );
    expect(screen.getByText('2').parentElement?.className).not.toBe(
      errorClasses
    );
  });

  it('rejects props that do nothing for a kind', () => {
    // @ts-expect-error a status badge picks its own colour
    void (<Badge kind='status' status='failed' tone='danger' />);
    // @ts-expect-error an inline count needs words for screen readers
    void (<Badge kind='count' count={3} />);
    // @ts-expect-error the number and errors kinds are one count badge now
    void (<Badge kind='errors' count={3} />);
    // @ts-expect-error only tags take the code font
    void (<Badge kind='label' mono children='Draft' />);
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

describe('Icon sizes', () => {
  it('accepts only 14, 16 and 20', () => {
    // @ts-expect-error 18 is not a design-system size
    void (<Icon glyph='doc' size={18} />);
    // @ts-expect-error 12 is not a design-system size
    void (<Icon glyph='doc' size={12} />);
    render(<Icon glyph='doc' size={14} data-testid='icon' />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

describe('KbdShortcut', () => {
  it('speaks a labelled shortcut', () => {
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Macintosh');
    render(<KbdShortcut keys='⌘K' label='Search' />);
    expect(
      screen.getByRole('img', { name: 'Search: Command K' })
    ).toBeVisible();
  });

  it('maps one press to aria-keyshortcuts and skips sequences', () => {
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Macintosh');
    expect(keyShortcuts('⌘⇧P')).toBe('Meta+Shift+P');
    expect(keyShortcuts('⎋')).toBe('Escape');
    expect(keyShortcuts('G H')).toBeUndefined();
  });
});

describe('Separator', () => {
  it('sizes itself from the orientation attribute that Base UI renders', () => {
    const { container } = render(<Separator />);
    const line = container.querySelector('[data-slot=separator]');
    expect(line).toHaveAttribute('data-orientation', 'horizontal');
    expect(line).toHaveClass('data-[orientation=horizontal]:h-px');
  });
});
