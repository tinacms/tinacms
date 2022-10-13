/* eslint-disable @typescript-eslint/ban-ts-ignore */
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
// @ts-ignore importing css is not recognized
import keyframes from './LoadingDots.css'

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
      <style>{keyframes}</style>
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
