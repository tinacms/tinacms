import * as React from 'react';
import { SidebarContext, minSidebarWidth, sidebarEdgeGap } from './sidebar';

export const ResizeHandle = () => {
  const { resizingSidebar, setResizingSidebar, setSidebarWidth, displayState } =
    React.useContext(SidebarContext);

  const startResizing = (e: React.PointerEvent<HTMLDivElement>) => {
    // Capture the pointer so move/up keep targeting the handle even over the
    // iframe. Losing capture for any reason — release, cancel, or focus loss —
    // ends the resize via onLostPointerCapture, so the state can't get stuck.
    e.currentTarget.setPointerCapture(e.pointerId);
    setResizingSidebar(true);
  };

  const stopResizing = () => setResizingSidebar(false);

  React.useEffect(() => {
    if (!resizingSidebar) return;

    const handlePointerMove = (e: PointerEvent) => {
      setSidebarWidth((sidebarWidth: number) => {
        const newWidth = sidebarWidth + e.movementX;
        const maxWidth = window.innerWidth - sidebarEdgeGap;
        return Math.max(minSidebarWidth, Math.min(maxWidth, newWidth));
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    document.body.classList.add('select-none');

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.body.classList.remove('select-none');
    };
  }, [resizingSidebar, setSidebarWidth]);

  if (displayState === 'fullscreen') {
    return null;
  }

  return (
    <div
      onPointerDown={startResizing}
      onLostPointerCapture={stopResizing}
      className={`z-100 absolute top-1/2 right-px w-2 h-32 bg-white rounded-r border border-gray-150 shadow-sm hover:shadow-md origin-left transition-all duration-150 ease-out transform translate-x-full -translate-y-1/2 group hover:bg-gray-50 ${
        displayState !== 'closed' ? `opacity-100` : `opacity-0`
      } ${resizingSidebar ? `scale-110` : `scale-90 hover:scale-100`}`}
      style={{ cursor: 'ew-resize', touchAction: 'none' }}
    >
      <span className='absolute top-1/2 left-1/2 h-4/6 w-px bg-gray-200 transform -translate-y-1/2 -translate-x-1/2 opacity-30 transition-opacity duration-150 ease-out group-hover:opacity-100'></span>
    </div>
  );
};
