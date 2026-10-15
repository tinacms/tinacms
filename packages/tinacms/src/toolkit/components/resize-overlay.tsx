import * as React from 'react';

interface ResizeOverlayProps {
  isResizing: boolean;
}

/**
 * Pointer capture on the handle is what keeps the drag alive over the iframe.
 * This only wins hit-testing, so the resize cursor holds across the whole window.
 */
export const ResizeOverlay: React.FC<ResizeOverlayProps> = ({ isResizing }) => {
  if (!isResizing) return null;

  return (
    <div
      className='fixed inset-0 z-overlay cursor-ew-resize bg-transparent'
      data-testid='resize-overlay'
    />
  );
};
