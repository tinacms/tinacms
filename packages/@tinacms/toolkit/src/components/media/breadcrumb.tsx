/**



*/

import React from 'react'
import { LeftArrowIcon } from '../../packages/icons'

// Fixed issue where dirname was being used in the frontend
function dirname(path) {
  return path.match(/.*\//)
}

interface BreadcrumbProps {
  directory?: string
  setDirectory: (_directory: string) => void
}

const BreadcrumbButton = ({ className = '', ...props }) => (
  <button
    className={
      "capitalize transition-colors duration-200 border-0 bg-transparent hover:text-gray-900 md:text-[15px] after:pl-2 after:content-['/'] " +
      className
    }
    {...props}
  />
)

export function Breadcrumb({ directory = '', setDirectory }: BreadcrumbProps) {
  directory = directory.replace(/^\/|\/$/g, '')

  let prevDir = dirname(directory) || ''
  if (prevDir === '.') {
    prevDir = ''
  }

  return (
    <div className="w-full flex items-center text-[16px] text-gray-300">
      {directory !== '' && (
        <span className="flex" onClick={() => setDirectory(prevDir)}>
          <LeftArrowIcon
            className={`w-8 h-auto fill-gray-300 self-center cursor-pointer hover:fill-gray-900 md:-ml-2 ${
              directory === ''
                ? 'opacity-0 translate-x-1.5'
                : 'opacity-100 md:-translate-x-1'
            }`}
            style={{
              transition:
                directory === ''
                  ? 'opacity 200ms ease, transform 300ms ease-out'
                  : 'opacity 180ms ease, transform 300ms ease-in',
            }}
          />
        </span>
      )}
      <BreadcrumbButton
        onClick={() => setDirectory('')}
        className={directory === '' ? '' : 'hidden md:flex'}
      >
        Media
      </BreadcrumbButton>
      {directory &&
        directory.split('/').map((part, index, parts) => {
          const currentDir = parts.slice(0, index + 1).join('/')
          return (
            <BreadcrumbButton
              className={
                'pl-2 ' +
                (index + 1 === parts.length ? 'flex' : 'hidden md:flex')
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
