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

import React from 'react'
import styled, { css } from 'styled-components'
import { LeftArrowIcon } from '@tinacms/icons'

interface BreadcrumbProps {
  directory?: string
  setDirectory: (directory: string) => void
}

export function Breadcrumb({ directory = '', setDirectory }: BreadcrumbProps) {
  const dirArr = directory.split('/')
  dirArr.pop()
  const prevDir = dirArr.join('/')

  return (
    <BreadcrumbWrapper showArrow={directory !== ''}>
      <span onClick={() => setDirectory(prevDir)}>
        <LeftArrowIcon />
      </span>
      <button onClick={() => setDirectory('')}>Media</button>
      {directory &&
        directory
          .replace(/^\//, '')
          .split('/')
          .map((part, index, parts) => (
            <>
              <button
                onClick={() => {
                  setDirectory(parts.slice(0, index + 1).join('/'))
                }}
              >
                {part}
              </button>
            </>
          ))}
    </BreadcrumbWrapper>
  )
}

interface BreadcrumbWrapperProps {
  showArrow: boolean
}

const BreadcrumbWrapper = styled.div<BreadcrumbWrapperProps>`
  width: 100%;
  display: flex;
  align-items: center;
  color: var(--tina-color-grey-4);
  font-size: var(--tina-font-size-2);
  margin-left: -12px;

  button {
    text-transform: capitalize;
    transition: color 180ms ease;
  }

  svg {
    width: 20px;
    height: 20px;
    fill: var(--tina-color-grey-4);
    margin-left: -8px;
    transform: translateX(6px);
    opacity: 0;
    transition: opacity 200ms ease, transform 300ms ease-out;
  }

  ${p =>
    p.showArrow &&
    css`
      svg {
        opacity: 1;
        transform: translateX(-4px);
        transition: opacity 180ms ease, transform 300ms ease-in;
      }
    `}

  svg:hover {
    cursor: pointer;
    fill: var(--tina-color-grey-9);
  }

  button:hover {
    color: var(--tina-color-grey-9);
  }

  *:not(span)::after {
    content: '/';
    padding-left: 8px;
  }

  > *:not(:first-of-type) {
    padding-left: 8px;
  }
`
