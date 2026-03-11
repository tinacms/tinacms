import * as React from 'react';

interface ResizeOverlayProps {
  isResizing: boolean;
}

/**
 * An invisible overlay that captures mouse events during sidebar resize.
 * This prevents the "laggy" feeling when dragging across the iframe,
 * without using pointer-events-none which causes focus issues.
 */
export const ResizeOverlay: React.FC<ResizeOverlayProps> = ({ isResizing }) => {
  if (!isResizing) return null;

  return (
    <div
      className='fixed inset-0 z-overlay cursor-ew-resize'
      style={{
        // Invisible but captures all mouse events
        background: 'transparent',
      }}
      data-testid='resize-overlay'
    />
  );
};
