import React from 'react'

type TextProps = {
  children: React.ReactNode
  classNames?: string
  variant?: 'light' | 'dark'
  size?: string
}

export const SubTitleText = ({ children, classNames, variant }: TextProps) => {
  const headingColor = {
    light: 'text-white',
    dark: 'text-gray-800',
  }
  return (
    <h1
      className={`text-base font-semibold tracking-wide uppercase ${classNames} ${
        headingColor[variant] || headingColor.light
      }`}
    >
      {children}
    </h1>
  )
}

export const DisplayText = ({
  tinaField,
  children,
  classNames,
  variant,
  size,
}: TextProps & { tinaField?: string }) => {
  const headingColor = {
    light: 'text-white',
    dark: 'text-gray-800',
  }
  const fontSize = size || 'text-4xl sm:text-5xl lg:text-6xl'
  return (
    <h1
      data-tinafield={tinaField}
      className={`${fontSize} font-display tracking-wider ${classNames} ${
        headingColor[variant] || headingColor.light
      }`}
    >
      {children}
    </h1>
  )
}

export const Text = ({ children, classNames, variant }: TextProps) => {
  const bodyColor = {
    light: 'text-indigo-50',
    dark: 'text-gray-700',
  }
  return (
    <p
      className={`mt-6 text-xl ${classNames} ${
        bodyColor[variant] || bodyColor.light
      }`}
    >
      {children}
    </p>
  )
}
