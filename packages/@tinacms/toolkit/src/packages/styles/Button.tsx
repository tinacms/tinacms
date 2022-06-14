/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
import * as React from 'react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'white' | 'ghost' | 'danger'
  as?: React.ElementType
  href?: string
  target?: string
  size?: 'small' | 'medium' | 'custom'
  busy?: boolean
  rounded?: 'full' | 'left' | 'right'
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export const Button = ({
  variant = 'secondary',
  as: Tag = 'button',
  size = 'medium',
  busy,
  disabled,
  rounded = 'full',
  children,
  className,
  ...props
}: ButtonProps) => {
  const baseClasses =
    'icon-parent border-0 inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center inline-flex justify-center transition-all duration-150 ease-out '
  const variantClasses = {
    primary: `shadow text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500`,
    secondary: `shadow text-gray-500 hover:text-blue-500 bg-gray-50 hover:bg-white border border-gray-200`,
    white: `shadow text-gray-500 hover:text-blue-500 bg-white hover:bg-gray-50 border border-gray-200`,
    ghost: `text-gray-500 hover:text-blue-500 hover:shadow border border-transparent hover:border-gray-200 bg-transparent`,
    danger: `shadow text-white bg-red-500 hover:bg-red-600 focus:ring-red-500`,
  }
  const state = busy ? `busy` : disabled ? `disabled` : `default`
  const stateClasses = {
    disabled: `pointer-events-none	opacity-30 cursor-not-allowed`,
    busy: `pointer-events-none opacity-70 cursor-wait`,
    default: ``,
  }
  const roundedClasses = {
    full: `rounded-full`,
    left: `rounded-l-full`,
    right: `rounded-r-full`,
  }
  const sizeClasses = {
    small: `text-xs h-8 px-3`,
    medium: `text-sm h-10 px-4`,
    custom: ``,
  }

  return (
    <Tag
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${stateClasses[state]} ${roundedClasses[rounded]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}

export const IconButton = ({
  variant = 'secondary',
  size = 'medium',
  busy,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) => {
  const baseClasses =
    'icon-parent inline-flex items-center border border-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center inline-flex justify-center transition-all duration-150 ease-out rounded-full '
  const variantClasses = {
    primary: `shadow text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500`,
    secondary: `shadow text-gray-500 hover:text-blue-500 bg-gray-50 hover:bg-white border border-gray-200`,
    white: `shadow text-gray-500 hover:text-blue-500 bg-white hover:bg-gray-50 border border-gray-200`,
    ghost: `text-gray-500 hover:text-blue-500 hover:shadow border border-transparent hover:border-gray-200 bg-transparent`,
  }
  const state = busy ? `busy` : disabled ? `disabled` : `default`
  const stateClasses = {
    disabled: `pointer-events-none	opacity-30 cursor-not-allowed`,
    busy: `pointer-events-none opacity-70 cursor-wait`,
    default: ``,
  }
  const sizeClasses = {
    small: `h-7 w-7`,
    medium: `h-9 w-9`,
    custom: ``,
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${stateClasses[state]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
