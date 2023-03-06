/**



*/

import React from 'react'
import { LeftArrowIcon } from '../../packages/icons'
import { IconButton } from '../../packages/styles'

interface BreadcrumbProps {
  directory?: string
  setDirectory: (_directory: string) => void
}

const BreadcrumbButton = ({ className = '', ...props }) => (
  <button
    className={
      'capitalize transition-colors duration-150 border-0 bg-transparent hover:text-blue-500 ' +
      className
    }
    {...props}
  />
)

export function Breadcrumb({ directory = '', setDirectory }: BreadcrumbProps) {
  const displayDirectory = directory.replace(/^\/|\/$/g, '')

  const goBack = () => {
    const folders = directory.split('/')
    let prevDir = ''
    if (folders.length > 1) {
      prevDir = folders.slice(0, folders.length - 1).join('/')
    }
    setDirectory(prevDir)
  }

  return (
    <div className="w-full flex items-center text-[16px] text-gray-300">
      {directory !== '' && (
        <IconButton variant="ghost" className="mr-2" onClick={goBack}>
          <LeftArrowIcon
            className={`w-7 h-auto fill-gray-300 hover:fill-gray-900 transition duration-150 ease-out`}
          />
        </IconButton>
      )}
      <BreadcrumbButton
        onClick={() => setDirectory('')}
        className={
          directory === ''
            ? 'text-gray-500 font-bold'
            : "text-gray-300 font-medium after:pl-1.5 after:content-['/']"
        }
      >
        Media
      </BreadcrumbButton>
      {displayDirectory &&
        displayDirectory.split('/').map((part, index, parts) => {
          const currentDir = parts.slice(0, index + 1).join('/')
          return (
            <BreadcrumbButton
              className={
                'pl-1.5 ' +
                (index + 1 === parts.length
                  ? 'text-gray-500 font-bold'
                  : "text-gray-300 font-medium after:pl-1.5 after:content-['/']")
              }
              key={currentDir}
              onClick={() => {
                setDirectory(currentDir)
              }}
            >
              {part}
            </BreadcrumbButton>
          )
        })}
    </div>
  )
}
