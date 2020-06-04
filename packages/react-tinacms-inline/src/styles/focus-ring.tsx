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
import styled, { css } from 'styled-components'

interface FocusRingProps {
  active: boolean
  offset?: number
  borderRadius?: number
  disableHover?: boolean
}

export const FocusRing = styled.div<FocusRingProps>(
  p => css`
    position: relative;
    width: 100%;

    ${!p.disableHover &&
      css`
        &:hover {
          &:after {
            opacity: 0.3;
          }
        }
      `}

    &:after {
      content: '';
      box-sizing: border-box;
      display: block;
      position: absolute;
      left: calc(-1 * ${p.offset !== undefined ? p.offset : '16'}px);
      top: calc(-1 * ${p.offset !== undefined ? p.offset : '16'}px);
      width: calc(100% + ${p.offset !== undefined ? p.offset * 2 : '32'}px);
      height: calc(100% + ${p.offset !== undefined ? p.offset * 2 : '32'}px);
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
)
