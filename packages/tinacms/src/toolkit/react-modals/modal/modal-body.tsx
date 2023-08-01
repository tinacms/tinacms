import React from 'react'

export const ModalBody = ({ className = '', padded = false, ...props }) => (
  <div
    className={`${
      padded ? 'p-5' : 'p-0'
    } m-0 overflow-hidden flex flex-col min-h-[160px] [&:last-child]:rounded-[0_0_5px_5px] ${className}`}
    {...props}
  />
)
