import React from 'react';

/** How far an on-screen keyboard covers the bottom of the layout viewport, in pixels. */
export function useKeyboardInset(on = true) {
  const [inset, setInset] = React.useState(0);
  React.useEffect(() => {
    const viewport = window.visualViewport;
    if (!on || !viewport) return;
    const update = () =>
      setInset(
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      );
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, [on]);
  return on ? inset : 0;
}
