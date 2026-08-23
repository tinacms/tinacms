import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button, IconButton } from './button';

const buttonEl = () => screen.getByRole('button') as HTMLButtonElement;

describe('Button', () => {
  it('renders its children when not busy', () => {
    render(<Button>Save draft</Button>);
    expect(screen.getByText('Save draft')).toBeTruthy();
  });

  it('replaces its children with loading dots when busy', () => {
    const { container } = render(<Button busy>Save draft</Button>);
    // The label is hidden and the shared loading-dots indicator is shown, so
    // every `busy` button gets a consistent spinner without the caller wiring
    // one up.
    expect(screen.queryByText('Save draft')).toBeNull();
    expect(container.querySelector('[style*="loading-dots"]')).toBeTruthy();
  });

  it('disables the underlying button element', () => {
    render(<Button disabled>Save draft</Button>);
    expect(buttonEl().disabled).toBe(true);
  });

  it('does not activate its handler when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save draft
      </Button>
    );
    buttonEl().click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not activate its handler while busy', () => {
    const onClick = vi.fn();
    render(
      <Button busy onClick={onClick}>
        Save draft
      </Button>
    );
    expect(buttonEl().disabled).toBe(true);
    buttonEl().click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('omits disabled when rendered as a tag that does not support it', () => {
    render(
      <Button as='a' href='https://tina.io' disabled>
        Read our docs
      </Button>
    );
    expect(screen.getByRole('link').hasAttribute('disabled')).toBe(false);
  });

  it('disables a link with aria-disabled and removes it from the tab order', () => {
    render(
      <Button as='a' href='https://tina.io' disabled>
        Read our docs
      </Button>
    );
    const link = screen.getByRole('link');
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.tabIndex).toBe(-1);
  });

  it('leaves an enabled link untouched', () => {
    render(
      <Button as='a' href='https://tina.io'>
        Read our docs
      </Button>
    );
    const link = screen.getByRole('link');
    expect(link.hasAttribute('aria-disabled')).toBe(false);
    expect(link.hasAttribute('tabindex')).toBe(false);
  });

  it('forwards disabled to a component passed via as', () => {
    const Custom = (props: React.ComponentProps<'button'>) => (
      <button type='button' {...props} />
    );
    render(
      <Button as={Custom} disabled>
        Save draft
      </Button>
    );
    expect(buttonEl().disabled).toBe(true);
  });

  it('stays disabled when both disabled and busy are set', () => {
    const onClick = vi.fn();
    render(
      <Button disabled busy onClick={onClick}>
        Save draft
      </Button>
    );
    expect(buttonEl().disabled).toBe(true);
    buttonEl().click();
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('IconButton', () => {
  it('disables the underlying button element', () => {
    render(<IconButton disabled aria-label='Delete' />);
    expect(buttonEl().disabled).toBe(true);
  });

  it('does not activate its handler when disabled', () => {
    const onClick = vi.fn();
    render(<IconButton disabled aria-label='Delete' onClick={onClick} />);
    buttonEl().click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not activate its handler while busy', () => {
    const onClick = vi.fn();
    render(<IconButton busy aria-label='Delete' onClick={onClick} />);
    expect(buttonEl().disabled).toBe(true);
    buttonEl().click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
