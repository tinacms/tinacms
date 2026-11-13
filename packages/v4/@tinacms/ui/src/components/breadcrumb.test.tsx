import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Breadcrumb } from '@tinacms/ui/components/breadcrumb';

describe('Breadcrumb invalid steps', () => {
  it('names an invalid shown step as having errors', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Posts', onClick: () => {}, invalid: true },
          { label: 'Hello', onClick: () => {} },
        ]}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Posts , has errors' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hello' })).toBeInTheDocument();
  });

  it('marks the current step too', () => {
    render(
      <Breadcrumb
        items={[{ label: 'Posts' }, { label: 'Hello', invalid: true }]}
      />
    );
    expect(
      screen.getByText('Hello').closest('[aria-current]')
    ).toHaveTextContent('Hello, has errors');
  });

  it('marks an invalid folded step in the fold menu', async () => {
    const user = userEvent.setup();
    const items = ['A', 'B', 'C', 'D', 'E'].map((label) => ({
      label,
      onClick: () => {},
      invalid: label === 'B',
    }));
    render(<Breadcrumb items={items} max={4} />);
    await user.click(
      screen.getByRole('button', { name: 'Show 2 more levels' })
    );
    expect(
      await screen.findByRole('menuitem', { name: 'B , has errors' })
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'C' })).toBeInTheDocument();
  });
});
