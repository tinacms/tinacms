import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  TinaErrorEdgeTab,
  TinaErrorSuccessBubble,
  TinaErrorSummaryPane,
  tinaResolveLabel,
} from '@tinacms/ui/components/error-summary-pane';

const ERRORS = [
  { id: 'e1', label: 'Meta title', trail: ['SEO'], message: 'Enter a title.' },
  { id: 'e2', label: 'Heading', message: 'Enter a heading.' },
];

describe('tinaResolveLabel', () => {
  it('words one, many and 99+', () => {
    expect(tinaResolveLabel(1)).toBe('Resolve 1 error');
    expect(tinaResolveLabel(3)).toBe('Resolve 3 errors');
    expect(tinaResolveLabel(120)).toBe('Resolve 99+ errors');
  });
});

describe('TinaErrorSummaryPane', () => {
  it('names each row with its field, where it sits and what to fix', () => {
    render(<TinaErrorSummaryPane errors={ERRORS} wide />);
    const pane = screen.getByRole('complementary', { name: /^Errors/ });
    expect(
      within(pane).getByRole('button', {
        name: 'Meta title, in SEO. Enter a title.',
      })
    ).toBeVisible();
    expect(
      within(pane).getByRole('button', { name: 'Heading. Enter a heading.' })
    ).toBeVisible();
  });

  it('marks the selected row as Viewing and reports a pressed row', async () => {
    const onSelect = vi.fn();
    render(
      <TinaErrorSummaryPane
        errors={ERRORS}
        selectedId='e2'
        onSelect={onSelect}
        wide
      />
    );
    const row = screen.getByRole('button', { name: /^Heading/ });
    expect(row).toHaveAttribute('aria-current', 'true');
    await userEvent.click(screen.getByRole('button', { name: /^Meta title/ }));
    expect(onSelect).toHaveBeenCalledWith(ERRORS[0]);
  });

  it('closes on Esc inside the pane', async () => {
    const onClose = vi.fn();
    render(<TinaErrorSummaryPane errors={ERRORS} onClose={onClose} wide />);
    screen.getByRole('button', { name: /^Heading/ }).focus();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('pins and unpins, and says it floats when pinned on a narrow window', async () => {
    const onPin = vi.fn();
    const { rerender } = render(
      <TinaErrorSummaryPane errors={ERRORS} onPin={onPin} wide={false} />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Pin' }));
    expect(onPin).toHaveBeenCalledWith(true);
    rerender(
      <TinaErrorSummaryPane errors={ERRORS} onPin={onPin} pinned wide={false} />
    );
    expect(screen.getByRole('button', { name: 'Pinned' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(
      screen.getByText('Pinned. It docks beside the preview on a wider window.')
    ).toBeVisible();
  });

  it('docks only when pinned on a wide window', () => {
    const { rerender } = render(
      <TinaErrorSummaryPane errors={ERRORS} pinned wide />
    );
    expect(screen.getByRole('complementary')).toHaveAttribute(
      'data-layout',
      'docked'
    );
    rerender(<TinaErrorSummaryPane errors={ERRORS} wide />);
    expect(screen.getByRole('complementary')).toHaveAttribute(
      'data-layout',
      'floating'
    );
  });

  it('moves focus to the first row when told to on open', () => {
    render(<TinaErrorSummaryPane errors={ERRORS} autoFocusRow wide />);
    expect(screen.getByRole('button', { name: /^Meta title/ })).toHaveFocus();
  });
});

describe('the All fixed endings', () => {
  const originalAnimate = Element.prototype.animate;
  afterEach(() => {
    Element.prototype.animate = originalAnimate;
  });

  const finishAnimations = () => {
    const finish: (() => void)[] = [];
    Element.prototype.animate = (() => ({
      addEventListener: (_event: string, handler: () => void) =>
        finish.push(handler),
      cancel: () => {},
      pause: () => {},
      play: () => {},
    })) as unknown as typeof Element.prototype.animate;
    return () => runAll(finish);
  };
  const runAll = (handlers: (() => void)[]) => {
    for (const handler of handlers) handler();
  };

  it('calls onSuccessEnd when the pane timer bar empties', () => {
    const finish = finishAnimations();
    const onSuccessEnd = vi.fn();
    render(
      <TinaErrorSummaryPane
        errors={[]}
        status='success'
        onSuccessEnd={onSuccessEnd}
        wide
      />
    );
    expect(screen.getByText('All fixed.')).toBeVisible();
    finish();
    expect(onSuccessEnd).toHaveBeenCalled();
  });

  it('calls onDone when the bubble has faded away', () => {
    const finish = finishAnimations();
    const onDone = vi.fn();
    render(<TinaErrorSuccessBubble onDone={onDone} />);
    expect(
      screen.getByText(/All fixed\. You’re ready to save\./)
    ).toBeVisible();
    finish();
    expect(onDone).toHaveBeenCalled();
  });
});

describe('TinaErrorEdgeTab', () => {
  it('is named with the count and opens the pane', async () => {
    const onOpen = vi.fn();
    render(<TinaErrorEdgeTab count={3} onOpen={onOpen} still />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Show errors, 3' })
    );
    expect(onOpen).toHaveBeenCalledOnce();
  });
});
