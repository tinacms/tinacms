/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as React from 'react'

interface LoadingDotsProps {
  dotSize?: number
  color?: string
}
interface SingleDotProps {
  dotSize: number
  color: string
  delay?: number
}

export const LoadingDots = ({
  dotSize = 8,
  color = 'white',
}: LoadingDotsProps) => {
  return (
    <div>
      <SingleDot dotSize={dotSize} color={color} />
      <SingleDot dotSize={dotSize} color={color} delay={0.3} />
      <SingleDot dotSize={dotSize} color={color} delay={0.5} />
    </div>
  )
}

const SingleDot = ({ delay = 0, color, dotSize }: SingleDotProps) => (
  <span
    className="inline-block mr-1"
    style={{
      animation: 'loading-dots-scale-up-and-down 2s linear infinite',
      animationDelay: `${delay}s`,
      background: color,
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize,
    }}
  />
)
