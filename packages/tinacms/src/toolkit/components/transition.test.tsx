import { act, render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { Transition, TransitionChild } from './transition';

const CLASSES = {
  enter: 'c-enter',
  enterFrom: 'c-enter-from',
  enterTo: 'c-enter-to',
  entered: 'c-entered',
  leave: 'c-leave',
  leaveFrom: 'c-leave-from',
  leaveTo: 'c-leave-to',
};

const classesOf = (el: HTMLElement | null) =>
  (el?.getAttribute('class') || '').split(/\s+/).filter(Boolean);

describe('Transition', () => {
  afterEach(() => {
    delete (Element.prototype as any).getAnimations;
  });

  it('renders nothing while hidden', () => {
    const { queryByTestId } = render(
      <Transition show={false} data-testid='t' {...CLASSES}>
        body
      </Transition>
    );
    expect(queryByTestId('t')).toBeNull();
  });

  it('drops enter/enterTo once the enter transition settles, keeping only entered', async () => {
    const { getByTestId } = render(
      <Transition show={true} data-testid='t' {...CLASSES}>
        body
      </Transition>
    );

    await waitFor(() => {
      expect(classesOf(getByTestId('t'))).toContain(CLASSES.entered);
    });

    const settled = classesOf(getByTestId('t'));
    expect(settled).not.toContain(CLASSES.enter);
    expect(settled).not.toContain(CLASSES.enterFrom);
    expect(settled).not.toContain(CLASSES.enterTo);
  });

  it('applies leave classes and drops entered when hiding', async () => {
    const { getByTestId, queryByTestId, rerender } = render(
      <Transition show={true} data-testid='t' {...CLASSES}>
        body
      </Transition>
    );
    await waitFor(() =>
      expect(classesOf(getByTestId('t'))).toContain(CLASSES.entered)
    );

    rerender(
      <Transition show={false} data-testid='t' {...CLASSES}>
        body
      </Transition>
    );

    const leaving = classesOf(getByTestId('t'));
    expect(leaving).toContain(CLASSES.leave);
    expect(leaving).not.toContain(CLASSES.entered);

    await waitFor(() => expect(queryByTestId('t')).toBeNull());
  });

  it('keeps the user className across every phase', async () => {
    const { getByTestId, rerender } = render(
      <Transition show={true} data-testid='t' className='mine' {...CLASSES}>
        body
      </Transition>
    );
    expect(classesOf(getByTestId('t'))).toContain('mine');

    rerender(
      <Transition show={false} data-testid='t' className='mine' {...CLASSES}>
        body
      </Transition>
    );
    expect(classesOf(getByTestId('t'))).toContain('mine');
  });

  it('passes style and arbitrary props through to the node', () => {
    const { getByTestId } = render(
      <Transition
        show={true}
        data-testid='t'
        style={{ zIndex: 1234 }}
        {...CLASSES}
      >
        body
      </Transition>
    );
    expect(getByTestId('t').style.zIndex).toBe('1234');
  });
});

describe('TransitionChild', () => {
  afterEach(() => {
    delete (Element.prototype as any).getAnimations;
  });

  it('mirrors the parent phase', async () => {
    const { getByTestId } = render(
      <Transition show={true} data-testid='parent'>
        <TransitionChild data-testid='child' {...CLASSES}>
          body
        </TransitionChild>
      </Transition>
    );

    await waitFor(() =>
      expect(classesOf(getByTestId('child'))).toContain(CLASSES.entered)
    );
    expect(classesOf(getByTestId('child'))).not.toContain(CLASSES.enterTo);
  });

  it('renders without phase classes when used outside a Transition', () => {
    const { getByTestId } = render(
      <TransitionChild data-testid='child' className='mine' {...CLASSES}>
        body
      </TransitionChild>
    );
    const cls = classesOf(getByTestId('child'));
    expect(cls).toContain('mine');
    for (const c of Object.values(CLASSES)) {
      expect(cls).not.toContain(c);
    }
  });

  it('keeps the parent mounted until the child finishes leaving', async () => {
    let resolveChild: () => void = () => {};
    const childFinished = new Promise<void>((r) => {
      resolveChild = r;
    });
    (Element.prototype as any).getAnimations = () => [
      {
        effect: { getComputedTiming: () => ({ iterations: 1 }) },
        finished: childFinished,
      },
    ];

    const { queryByTestId, rerender } = render(
      <Transition show={true} data-testid='parent'>
        <TransitionChild data-testid='child' {...CLASSES}>
          body
        </TransitionChild>
      </Transition>
    );

    rerender(
      <Transition show={false} data-testid='parent'>
        <TransitionChild data-testid='child' {...CLASSES}>
          body
        </TransitionChild>
      </Transition>
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(queryByTestId('parent')).not.toBeNull();

    await act(async () => {
      resolveChild();
    });
    await waitFor(() => expect(queryByTestId('parent')).toBeNull());
  });
});

describe('waitForAnimations', () => {
  afterEach(() => {
    delete (Element.prototype as any).getAnimations;
  });

  it('ignores infinite animations so a spinner cannot stall the leave gate', async () => {
    (Element.prototype as any).getAnimations = () => [
      {
        effect: {
          getComputedTiming: () => ({ iterations: Number.POSITIVE_INFINITY }),
        },
        finished: new Promise(() => {}),
      },
      {
        effect: { getComputedTiming: () => ({ iterations: 1 }) },
        finished: Promise.resolve(),
      },
    ];

    const { queryByTestId, rerender } = render(
      <Transition show={true} data-testid='t' {...CLASSES}>
        body
      </Transition>
    );
    rerender(
      <Transition show={false} data-testid='t' {...CLASSES}>
        body
      </Transition>
    );

    await waitFor(() => expect(queryByTestId('t')).toBeNull());
  });
});
