import React from 'react'

export const FullscreenModal = ({ className = '', style = {}, ...props }) => (
  <div
    className={`flex flex-col z-0 overflow-visible bg-white rounded-none absolute top-0 left-0 w-full max-w-[1500px] h-full ${className} md:w-[calc(100%-170px)]`}
    style={{
      animation: 'popup-right 150ms ease-out 1',
      ...style,
    }}
    {...props}
  />
)

/**
 * @alias [FullscreenModal]
 * @deprecated
 */
export const ModalFullscreen = FullscreenModal
