import styled, { keyframes } from 'styled-components'
import * as React from 'react'

export const NoFormsPlaceholder = () => (
  <EmptyState>
    <Emoji>👋</Emoji>
    <h3>
      Welcome to <b>Tina</b>!
    </h3>
    <p>
      Let's get a form set up
      <br />
      so you can start editing.
    </p>
    <p>
      <LinkButton
        href="https://tinacms.org/docs/getting-started/introduction/#get-started"
        target="_blank"
      >
        <Emoji>📖</Emoji> Form Setup Guide
      </LinkButton>
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
  > ${Emoji} {
    display: block;
  }
  h3 {
    font-size: var(--tina-font-size-5);
    font-weight: normal;
    color: inherit;
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

const LinkButton = styled.a`
  text-align: center;
  border: 0;
  border-radius: var(--tina-radius-big);
  border: 1px solid var(--tina-color-grey-2);
  box-shadow: var(--tina-shadow-small);
  font-weight: var(--tina-font-weight-regular);
  cursor: pointer;
  font-size: var(--tina-font-size-0);
  transition: all var(--tina-timing-short) ease-out;
  background-color: white;
  color: var(--tina-color-grey-8);
  padding: var(--tina-padding-small) var(--tina-padding-big)
    var(--tina-padding-small) 56px;
  position: relative;
  text-decoration: none;
  display: inline-block;
  ${Emoji} {
    font-size: 24px;
    position: absolute;
    left: var(--tina-padding-big);
    top: 50%;
    transform-origin: 50% 50%;
    transform: translate3d(0, -50%, 0);
    transition: all var(--tina-timing-short) ease-out;
  }
  &:hover {
    color: var(--tina-color-primary);
    ${Emoji} {
      transform: translate3d(0, -50%, 0);
    }
  }
`
