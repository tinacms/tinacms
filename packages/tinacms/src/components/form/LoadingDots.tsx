/**

Copyright 2019 Forestry.io Inc

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
import styled, { keyframes, css } from 'styled-components'

interface LoadingDotsProps {
  dotSize?: number
  color?: string
}
interface SingleDotProps {
  dotSize: number
  color: string
}

export const LoadingDots = ({
  dotSize = 8,
  color = 'white',
}: LoadingDotsProps) => {
  return (
    <div>
      <SingleDot dotSize={dotSize} color={color} />
      <SingleDot dotSize={dotSize} color={color} />
      <SingleDot dotSize={dotSize} color={color} />
    </div>
  )
}
const scaleUpAndDown = keyframes`
  0% { transform: scale(0.1); }
  50% { transform: scale(1); }
  90% { transform: scale(0.1); }
  100% { transform: scale(0.1); }
`

const SingleDot = styled.span<SingleDotProps>`
  animation: ${scaleUpAndDown} 2s linear infinite;
  display: inline-block;
  margin-right: 4px;
  :nth-child(2) {
    animation-delay: 0.3s;
  }
  :nth-child(3) {
    animation-delay: 0.5s;
  }
  ${({ color, dotSize }) =>
    css`
      background: ${color};
      width: ${dotSize}px;
      height: ${dotSize}px;
      border-radius: ${dotSize}px;
    `}
`
