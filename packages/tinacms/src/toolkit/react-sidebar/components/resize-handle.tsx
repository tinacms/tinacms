import * as React from 'react';
import { SidebarContext, minSidebarWidth } from './sidebar';

export const ResizeHandle = () => {
  const {
    resizingSidebar,
    setResizingSidebar,
    fullscreen,
    setSidebarWidth,
    displayState,
  } = React.useContext(SidebarContext);

  const handleRef = React.useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Pointer capture guarantees pointerup fires on this element even if
    // the pointer moves over the iframe or outside the window.
    e.currentTarget.setPointerCapture(e.pointerId);
    setResizingSidebar(true);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setResizingSidebar(false);
  };

  // Update sidebar width while resizing
  React.useEffect(() => {
    if (!resizingSidebar) return;

    const handlePointerMove = (e: PointerEvent) => {
      setSidebarWidth((sidebarWidth: number) => {
        const newWidth = sidebarWidth + e.movementX;
        const maxWidth = window.innerWidth - 8;
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

  if (fullscreen) {
    return null;
  }

  return (
    <div
      ref={handleRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={`z-100 absolute top-1/2 right-px w-2 h-32 bg-white rounded-r border border-gray-150 shadow-sm hover:shadow-md origin-left transition-all duration-150 ease-out transform translate-x-full -translate-y-1/2 group hover:bg-gray-50 ${
        displayState !== 'closed' ? `opacity-100` : `opacity-0`
      } ${resizingSidebar ? `scale-110` : `scale-90 hover:scale-100`}`}
      style={{ cursor: 'ew-resize', touchAction: 'none' }}
    >
      <span className='absolute top-1/2 left-1/2 h-4/6 w-px bg-gray-200 transform -translate-y-1/2 -translate-x-1/2 opacity-30 transition-opacity duration-150 ease-out group-hover:opacity-100'></span>
    </div>
  );
};
