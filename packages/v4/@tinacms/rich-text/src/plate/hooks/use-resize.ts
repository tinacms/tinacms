import React from 'react';

export const useResize = (
  ref: React.RefObject<HTMLElement | null>,
  callback: (entry: ResizeObserverEntry) => void
) => {
  /**
   * The callback closes over render values — the toolbar's caller rebuilds its item
   * list every render — so it is read at each resize rather than captured when the
   * observer is created. `ref.current` was the previous dependency, which a ref never
   * makes reactive: the effect saw null on the first render and the node on the second,
   * then never re-ran, leaving the observer holding the second render's closure.
   */
  const onResize = React.useEffectEvent(callback);

  React.useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        onResize(entry);
      }
    });
    resizeObserver.observe(ref.current);

    return () => resizeObserver.disconnect();
  }, [ref]);
};
