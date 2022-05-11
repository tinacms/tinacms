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

import styled, { keyframes } from 'styled-components'
import * as React from 'react'
import { Button } from '../../styles'

export const NoFormsPlaceholder = () => (
  <EmptyState>
    <Emoji>🔎</Emoji>
    <p className="mb-4">
      Tina didn't find <br />
      any queries to <br />
      generate forms for.
    </p>
    <p>
      <Button
        href="https://tina.io/docs/tinacms-context/"
        target="_blank"
        as="a"
      >
        <Emoji>📖</Emoji> Contextual Editing
      </Button>
    </p>
  </EmptyState>
)

const Emoji = styled.span`
  font-size: 40px;
  line-height: 1;
  display: inline-block;
`

const EmptyStateAnimation = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`

const EmptyState = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--tina-padding-big) var(--tina-padding-big) 64px
    var(--tina-padding-big);
  width: 100%;
  height: 100%;
  overflow-y: auto;
  animation-name: ${EmptyStateAnimation};
  animation-delay: 300ms;
  animation-timing-function: ease-out;
  animation-iteration-count: 1;
  animation-fill-mode: both;
  animation-duration: 150ms;
  > *:first-child {
    margin: 0 0 var(--tina-padding-big) 0;
  }
  ${Emoji} {
    display: block;
    font-size: 24px;
  }
  a {
    ${Emoji} {
      margin-right: 0.25em;
    }
  }
  h3 {
    font-size: var(--tina-font-size-5);
    font-weight: normal;
    display: block;
    margin: 0 0 var(--tina-padding-big) 0;
    ${Emoji} {
      font-size: 1em;
    }
  }
  p {
    display: block;
    margin: 0 0 var(--tina-padding-big) 0;
  }
`
