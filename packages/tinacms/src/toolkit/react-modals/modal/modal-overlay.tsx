import * as React from 'react'

export const ModalOverlay = ({ children }) => {
  return (
    <div className="fixed inset-0 z-modal w-screen h-screen overflow-y-auto">
      {children}
      <div className="fixed -z-1 inset-0 opacity-80 bg-gradient-to-br from-gray-800 via-gray-900 to-black"></div>
    </div>
  )
}
