import * as React from 'react'
import { CloseIcon } from '@toolkit/icons'

export interface ModalHeaderProps {
  children: React.ReactChild | React.ReactChild[]
  close?(): void
}

export const ModalHeader = ({ children, close }: ModalHeaderProps) => {
  return (
    <div className="h-14 flex items-center justify-between px-5 border-b border-gray-200 m-0">
      <ModalTitle>{children}</ModalTitle>
      {close && (
        <div
          onClick={close}
          className="flex items-center fill-gray-400 cursor-pointer transition-colors duration-100 ease-out hover:fill-gray-700"
        >
          <CloseIcon className="w-6 h-auto" />
        </div>
      )}
    </div>
  )
}

const ModalTitle = ({ children }) => {
  return (
    <h2 className="text-gray-600 font-sans font-medium text-base leading-none m-0 block truncate flex items-center">
      {children}
    </h2>
  )
}
