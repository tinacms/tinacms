import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FieldTrail, foldTrail } from '@tinacms/ui/components/field-trail';
import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { FormLevel } from '@tinacms/ui/components/form-level';
import { Input } from '@tinacms/ui/components/input';

describe('FieldWrapper', () => {
  it('names the control, marks it required for screen readers and points help at it', () => {
    render(
      <FieldWrapper
        label='Title'
        htmlFor='title'
        required
        help='Shown in search results.'
        helpId='title-help'
      >
        <Input id='title' required aria-describedby='title-help' />
      </FieldWrapper>
    );
    const box = screen.getByRole('textbox', { name: /Title/ });
    expect(box).toBeRequired();
    expect(screen.getByText('(required)')).toHaveClass('sr-only');
    expect(box).toHaveAccessibleDescription('Shown in search results.');
  });

  it('shows one red alert per broken rule and amber warnings as status', () => {
    render(
      <FieldWrapper
        label='Slug'
        htmlFor='slug'
        errors={['Too short', 'Use lowercase']}
        warnings={['Looks like a duplicate']}
      >
        <Input id='slug' aria-invalid />
      </FieldWrapper>
    );
    expect(
      screen.getAllByRole('alert').map((alert) => alert.textContent)
    ).toEqual(['Too short', 'Use lowercase']);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Looks like a duplicate'
    );
  });

  it('fades the whole field when disabled', () => {
    const { container } = render(
      <FieldWrapper label='Slug' htmlFor='slug' disabled>
        <Input id='slug' disabled />
      </FieldWrapper>
    );
    expect(container.firstElementChild).toHaveAttribute('data-disabled');
    expect(container.firstElementChild).toHaveClass('opacity-60');
  });
});

describe('foldTrail', () => {
  const steps = (count: number) =>
    Array.from({ length: count }, (_, index) => `L${index + 1}`);

  it('keeps every step up to the limit', () => {
    expect(foldTrail(steps(4))).toEqual({ shown: steps(4), hidden: [] });
  });

  it('keeps the first and the last two past the limit', () => {
    expect(foldTrail(steps(6))).toEqual({
      shown: ['L1', null, 'L5', 'L6'],
      hidden: ['L2', 'L3', 'L4'],
    });
  });

  it('never folds fewer than three steps', () => {
    expect(foldTrail(steps(3), 1).hidden).toEqual([]);
  });
});

describe('FieldTrail', () => {
  const trail = (count: number) =>
    Array.from({ length: count }, (_, index) => ({
      label: `Level ${index + 1}`,
      onClick: vi.fn(),
      invalid: index === 1,
    }));

  it('goes up from the arrow and marks the current step', async () => {
    const onUp = vi.fn();
    const steps = [
      { label: 'Home', onClick: vi.fn() },
      { label: 'Hero', onClick: vi.fn() },
    ];
    render(<FieldTrail steps={steps} onUp={onUp} />);
    await userEvent.click(screen.getByRole('button', { name: 'Up to Home' }));
    expect(onUp).toHaveBeenCalledOnce();
    expect(screen.getByText('Hero').closest('[aria-current]')).not.toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Home' }));
    expect(steps[0].onClick).toHaveBeenCalledOnce();
  });

  it('flags a step that holds an error with a dot and words for screen readers', () => {
    render(
      <FieldTrail
        steps={[
          { label: 'Home' },
          { label: 'Hero', invalid: true },
          { label: 'Cta' },
        ]}
      />
    );
    const hero = screen.getByRole('button', { name: /Hero.*has errors/ });
    expect(within(hero).queryByText(/\d/)).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Home' })
    ).not.toHaveAccessibleName(/errors/);
  });

  it('folds the middle into a menu that opens on the arrow keys and closes on Escape', async () => {
    const user = userEvent.setup();
    const steps = trail(6);
    render(<FieldTrail steps={steps} />);
    expect(screen.queryByRole('button', { name: 'Level 3' })).toBeNull();

    await user.click(
      screen.getByRole('button', { name: 'Show 3 more levels' })
    );
    const items = await screen.findAllByRole('menuitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'Level 2, has errors',
      'Level 3',
      'Level 4',
    ]);

    await user.keyboard('{ArrowDown}{Enter}');
    expect(steps[1].onClick).toHaveBeenCalledOnce();

    await user.click(
      screen.getByRole('button', { name: 'Show 3 more levels' })
    );
    await screen.findAllByRole('menuitem');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menuitem')).toBeNull();
  });
});

describe('FormLevel', () => {
  it('draws no trail at the top level and a trail below it', () => {
    const { rerender } = render(
      <FormLevel steps={[{ label: 'Home' }]}>
        <p>fields</p>
      </FormLevel>
    );
    expect(screen.queryByRole('navigation')).toBeNull();
    rerender(
      <FormLevel steps={[{ label: 'Home' }, { label: 'Hero' }]}>
        <p>fields</p>
      </FormLevel>
    );
    expect(
      screen.getByRole('navigation', { name: 'Field path' })
    ).toBeInTheDocument();
  });
});
