import React from 'react'
import { LeftArrowIcon } from '@toolkit/icons'
import { IconButton } from '@toolkit/styles'

// Fixed issue where dirname was being used in the frontend
function dirname(path): string | undefined {
  const pattern = new RegExp('(?<prevDir>.*)/')
  return path.match(pattern)?.groups?.prevDir
}

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
  directory = directory.replace(/^\/|\/$/g, '')

  let prevDir: string = dirname(directory) || ''
  if (prevDir === '.') {
    prevDir = ''
  }

  return (
    <div className="flex items-center text-[16px] text-gray-300">
      {directory !== '' && (
        <IconButton
          variant="ghost"
          className="mr-2"
          onClick={() => setDirectory(prevDir)}
        >
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
      {directory &&
        directory.split('/').map((part, index, parts) => {
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
