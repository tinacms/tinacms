import * as React from 'react'

export const ModalActions = ({ children }) => {
  return (
    <div className="w-full flex justify-between gap-4 items-center px-5 pb-5 rounded-b-md">
      {children}
    </div>
  )
}
