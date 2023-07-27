import * as React from 'react'

interface ContainerPropse {
  size?: 'medium' | 'large'
  children?: any
}

export const Container = ({
  children,
  size = 'medium',
  ...props
}: ContainerPropse) => {
  const sizeClasses = {
    medium: 'max-w-prose',
    large: 'max-w-screen-xl',
  }

  return (
    <div className={`w-full mx-auto ${sizeClasses[size]}`} {...props}>
      {children}
    </div>
  )
}
