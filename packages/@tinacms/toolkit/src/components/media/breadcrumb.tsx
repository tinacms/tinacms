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

import React from 'react'
import styled, { css } from 'styled-components'
import { LeftArrowIcon } from '../../packages/icons'

// Fixed issue where dirname was being used in the frontend
function dirname(path) {
  return path.match(/.*\//)
}

interface BreadcrumbProps {
  directory?: string
  setDirectory: (directory: string) => void
}

export function Breadcrumb({ directory = '', setDirectory }: BreadcrumbProps) {
  directory = directory.replace(/^\/|\/$/g, '')

  let prevDir = dirname(directory)
  if (prevDir === '.') {
    prevDir = ''
  }

  return (
    <BreadcrumbWrapper showArrow={directory !== ''}>
      {directory !== '' && (
        <span onClick={() => setDirectory(prevDir)}>
          <LeftArrowIcon className="w-8 h-auto" />
        </span>
      )}
      <button onClick={() => setDirectory('')}>Media</button>
      {directory &&
        directory.split('/').map((part, index, parts) => {
          const currentDir = parts.slice(0, index + 1).join('/')
          return (
            <button
              key={currentDir}
              onClick={() => {
                setDirectory(currentDir)
              }}
            >
              {part}
            </button>
          )
        })}
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
  font-size: var(--tina-font-size-3);

  button {
    text-transform: capitalize;
    transition: color 180ms ease;
    border: 0;
    background-color: transparent;
    font-size: inherit;
  }

  > span {
    display: flex;
  }

  svg {
    width: 20px;
    height: 20px;
    fill: var(--tina-color-grey-4);
    transform: translateX(6px);
    opacity: 0;
    transition: opacity 200ms ease, transform 300ms ease-out;
    align-self: center;
  }

  ${(p) =>
    p.showArrow &&
    css`
      svg {
        opacity: 1;
        transform: translateX(0px);
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

  > :not(:last-child) {
    display: none;
  }

  > :first-child {
    display: inline;
  }

  *:not(span)::after {
    content: '/';
    padding-left: 8px;
  }

  > *:not(:first-of-type) {
    padding-left: 8px;
  }

  @media (min-width: 720px) {
    font-size: var(--tina-font-size-2);

    svg {
      margin-left: -8px;
    }

    ${(p) =>
      p.showArrow &&
      css`
        svg {
          transform: translateX(-4px);
        }
      `}

    > :not(:last-child) {
      display: flex;
    }

    > *:not(:first-of-type) {
      padding-left: 8px;
    }
  }
`
