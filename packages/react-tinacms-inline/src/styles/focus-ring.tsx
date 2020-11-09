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
import styled, { css } from 'styled-components'
import { BlocksEmptyState } from '../blocks/inline-field-blocks'
import { useInlineForm } from '..'

export interface FocusRingOptions {
  offset?: number | { x: number; y: number }
  borderRadius?: number
  nestedFocus?: boolean
}

export interface StyledFocusRingProps
  extends Omit<FocusRingOptions, 'nestedFocus'> {
  active: boolean
  disableHover?: boolean
  disableChildren?: boolean
}

export interface FocusRingProps {
  name?: string
  children:
    | React.ReactChild
    | React.ReactChild[]
    | ((active: boolean) => React.ReactChildren)
  options?: boolean | FocusRingOptions
}

export const FocusRing = ({ name, options, children }: FocusRingProps) => {
  const [active, setActive] = React.useState(false)
  const [childActive, setChildActive] = React.useState(false)
  const { focussedField, setFocussedField } = useInlineForm()
  const focusRingRef = React.useRef<HTMLDivElement>(null)
  const borderRadius =
    typeof options === 'object' ? options.borderRadius : undefined
  const offset = typeof options === 'object' ? options.offset : undefined
  const nestedFocus = typeof options === 'object' ? options.nestedFocus : false

  React.useEffect(() => {
    if (!options || !name) return
    setActive(name === focussedField)
    setChildActive(focussedField.startsWith(name!))
  }, [name, options, focussedField])

  const updateFocusedField = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    event.preventDefault()
    if (active || !name) return
    setFocussedField(name)
  }

  return (
    <StyledFocusRing
      ref={focusRingRef}
      active={active}
      onClick={updateFocusedField}
      offset={offset}
      borderRadius={borderRadius}
      disableHover={!options || childActive}
      disableChildren={nestedFocus && !active && !childActive}
    >
      {typeof children === 'function' ? children(active) : children}
    </StyledFocusRing>
  )
}

export const StyledFocusRing = styled.div<StyledFocusRingProps>(p => {
  const offset = getOffset(p.offset)

  return css`
    position: relative;
    width: 100%;
    height: 100%;

    ${!p.disableHover &&
      css`
        &:hover {
          &:after {
            opacity: 0.3;
          }
        }
      `}

    ${p.disableChildren &&
      css`
        > * {
          pointer-events: none;
        }

        ${BlocksEmptyState} {
          opacity: 0;
          pointer-events: none;
        }
      `}

    &:after {
      content: '';
      box-sizing: border-box;
      display: block;
      position: absolute;
      left: calc(-1 * ${getOffsetX(offset)}px);
      top: calc(-1 * ${getOffsetY(offset)}px);
      width: calc(100% + ${getOffsetX(offset) * 2}px);
      height: calc(100% + ${getOffsetY(offset) * 2}px);
      border: 1px solid var(--tina-color-primary);
      border-radius: ${p.borderRadius !== undefined ? p.borderRadius : `10`}px;
      opacity: 0;
      pointer-events: none;
      transition: all var(--tina-timing-medium) ease-out;
      box-shadow: var(--tina-shadow-big);
    }

    ${p.active &&
      css`
        &:hover:after,
        &:after {
          opacity: 1;
        }
      `};
  `
})

export function getOffset(
  offset: number | undefined | { x: number; y: number }
): number | { x: number; y: number } {
  const DEFAULT_OFFSET: number = 16
  let result: number | { x: number; y: number } = DEFAULT_OFFSET
  const axis = { x: DEFAULT_OFFSET, y: DEFAULT_OFFSET }

  if (typeof offset === 'number') {
    result = offset
  } else if (typeof offset === 'object') {
    axis.x = offset.x
    axis.y = offset.y
    result = axis
  }

  return result
}

export const getOffsetX = (offset: number | { x: number; y: number }): number =>
  typeof offset === 'object' ? offset.x : offset

export const getOffsetY = (offset: number | { x: number; y: number }): number =>
  typeof offset === 'object' ? offset.y : offset
