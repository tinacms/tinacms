import React from 'react'
import { BiInfoCircle, BiCheckCircle, BiError } from 'react-icons/bi'
import { BsArrowRightShort } from 'react-icons/bs'

const MessageIcon = ({
  type = 'success',
  className = '',
}: {
  type?: 'success' | 'warning' | 'error' | 'info'
  className?: string
}) => {
  const icons = {
    success: BiCheckCircle,
    warning: BiError,
    error: BiError,
    info: BiInfoCircle,
  }

  const Icon = icons[type]

  return <Icon className={className} />
}

export const Message = ({
  children,
  type = 'success',
  size = 'medium',
  className = '',
  link,
  linkLabel = 'Learn More',
}: {
  children?: React.ReactNode | React.ReactNode[]
  type?: 'success' | 'warning' | 'error' | 'info'
  size?: 'small' | 'medium'
  className?: string
  link?: string
  linkLabel?: string
}) => {
  const containerClasses = {
    success: 'bg-gradient-to-r from-green-50 to-green-100 border-green-200',
    warning: 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200',
    error: 'bg-gradient-to-r from-red-50 to-red-100 border-red-200',
    info: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-100',
  }

  const textClasses = {
    success: 'text-green-700',
    warning: 'text-yellow-700',
    error: 'text-red-700',
    info: 'text-blue-700',
  }

  const iconClasses = {
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  }

  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-4 py-2.5 text-sm',
  }

  return (
    <div
      className={`rounded-lg border shadow-sm ${sizeClasses[size]} ${containerClasses[type]} ${className}`}
    >
      <div className="flex items-center gap-2">
        <MessageIcon
          type={type}
          className={`${
            size === 'small' ? 'w-5' : 'w-6'
          } h-auto flex-shrink-0 ${iconClasses[type]}`}
        />
        <div className={`flex-1 ${textClasses[type]}`}>{children}</div>
        {link && (
          <a
            href={link}
            target="_blank"
            className="flex-shrink-0 flex items-center gap-1 text-blue-600 underline decoration-blue-200 hover:text-blue-500 hover:decoration-blue-500 transition-all ease-out duration-150"
          >
            {linkLabel} <BsArrowRightShort className="w-4 h-auto" />
          </a>
        )}
      </div>
    </div>
  )
}
