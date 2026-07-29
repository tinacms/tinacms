import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

// The one query. The seed and the listener both answer from it, so they cannot disagree
// about the viewport that is exactly the breakpoint wide.
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

// Seeded from matchMedia rather than from `undefined`. Starting undefined reports
// desktop on the first render, so on a narrow viewport the Sidebar rendered its desktop
// branch and then swapped to the Sheet branch, remounting the whole subtree. The
// initializer runs once, and guards `window` for the server render.
const matchesMobile = () =>
  typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(matchesMobile);

  React.useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => {
      setIsMobile(mql.matches);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
